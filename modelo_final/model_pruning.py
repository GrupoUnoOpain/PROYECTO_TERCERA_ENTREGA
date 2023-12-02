from copy import deepcopy
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from tqdm import tqdm

# Change this line for the correct config files
from config_extended_columns import (
    DATA_FILES,
    OUTPUT_FOLDER,
    TARGET_COLUMN,
    NUMERICAL_COLUMNS,
    SMALL_CATEGORICAL_COLUMNS,
    LARGE_CATEGORICAL_COLUMNS,
    TEST_SIZE,
    RANDOM_STATE,

    NUMERICAL_TRANSFORMS,
    LARGE_CATEGORICAL_TRANSFORMS,
    SMALL_CATEGORICAL_TRANSFORMS,

    MIN_FREQS_ONE_HOT,
    HASH_DIM_LOG_BASES,

    MODELS,
    N_ITERS,
    CV,

    METRICS,
    N_DATASET_CONFIGS,
    
    CONFIG_COLUMNS
)
from exploration import load_datasets, split_data, hash_column, setup_random_search_model, evaluate_metrics

def assign_dataset_configs(df_configs: pd.DataFrame):
    """Given a dataset of configurations by marca assigns transformation
    plans for each marca"""
    
    configs = df_configs.to_dict(orient="records")
    datasets = load_datasets()
    for marca, df_dataset in tqdm(datasets.items()):
        datasets[marca] = split_data(
            df_dataset
        )
        for config in configs:
            if config["dataset"] == marca:
                datasets[marca]["config"] = {
                    col_config: (
                        config_params.split("__")
                        if "__" in config_params
                        else config_params
                    )
                    for col_config, config_params in config.items()
                    if col_config in CONFIG_COLUMNS
                }
    return datasets

def transform_cat_columns(dataset_splits, scat_trans_name, num_param, cols):
    X_scat_train = deepcopy(dataset_splits["X_train"][cols])
    X_scat_test = deepcopy(dataset_splits["X_test"][cols])
    
    num_param = float(num_param)

    if scat_trans_name == "featureHasher":
        X_scat_train_hash = []
        X_scat_test_hash = []
        cat_columns = []
        scat_trans = LARGE_CATEGORICAL_TRANSFORMS[scat_trans_name]
        scat_transformer = []
        for col in cols:
            X_scat_train_col_hash, hasher = hash_column(
                num_param,
                X_scat_train,
                col,
                True,
                scat_trans
            )
            X_scat_test_col_hash = hash_column(
                num_param,
                X_scat_test,
                col,
                False,
                hasher
            )
            X_scat_train_hash.append(X_scat_train_col_hash)
            X_scat_test_hash.append(X_scat_test_col_hash)
            cat_columns.extend([
                f"{col}__{i}" for i in range(X_scat_train_col_hash.shape[1])
            ])
            scat_transformer.append(hasher)
        X_scat_train_trans = np.concatenate(X_scat_train_hash, axis=1)
        X_scat_test_trans = np.concatenate(X_scat_test_hash, axis=1)

    elif scat_trans_name == "oneHotEncoder":
        scat_transformer = LARGE_CATEGORICAL_TRANSFORMS[scat_trans_name](
            sparse=False, handle_unknown='ignore'
        )
        X_scat_train_trans = scat_transformer.fit_transform(X_scat_train)
        X_scat_test_trans = scat_transformer.transform(X_scat_test)
        cat_columns = [
            col 
            for category in scat_transformer.categories_
            for col in category
        ]
    return X_scat_train_trans, X_scat_test_trans, cat_columns, scat_transformer


def transform_datasets(dataset_configs: dict):
    """Transforms datasets by their given configurations"""
    for marca, dataset_config in tqdm(dataset_configs.items()):
        dataset_config["preprocessing"] = {}
        
        # Numerical transform
        num_config_key = dataset_config["config"]["num_config"]
        num_transformer = NUMERICAL_TRANSFORMS[num_config_key]()

        X_num_train = deepcopy(dataset_config["X_train"][NUMERICAL_COLUMNS])
        X_num_test = deepcopy(dataset_config["X_test"][NUMERICAL_COLUMNS])
        
        X_num_train_trans = num_transformer.fit_transform(X_num_train)
        X_num_test_trans = num_transformer.transform(X_num_test)
        
        if num_config_key in ["polynomialFeatures", "powerTransformer"]:
            num_columns = [f"num_dim_{i}" for i in range(X_num_train_trans.shape[1])]
        else:
            num_columns = NUMERICAL_COLUMNS

        dataset_config["preprocessing"]["num_config"] = {
            "transformer_type": num_config_key,
            "columns": NUMERICAL_COLUMNS,
            "transformer": num_transformer,
            "trans_columns": num_columns
        }
        
        # Small cardinality transform
        scat_trans_name, num_param = dataset_config["config"]["scat_config"]
        X_scat_train_trans, X_scat_test_trans, scat_columns, scat_transformer = transform_cat_columns(
            dataset_config,
            scat_trans_name,
            num_param,
            SMALL_CATEGORICAL_COLUMNS
        )

        dataset_config["preprocessing"]["scat_config"] = {
            "transformer_type": scat_trans_name,
            "columns": SMALL_CATEGORICAL_COLUMNS,
            "transformer": scat_transformer,
            "trans_columns": scat_columns
        }
        
        # Large cardinality transform
        lcat_trans_name, num_param = dataset_config["config"]["lcat_config"]
        X_lcat_train_trans, X_lcat_test_trans, lcat_columns, lcat_transformer = transform_cat_columns(
            dataset_config,
            lcat_trans_name,
            num_param,
            LARGE_CATEGORICAL_COLUMNS
        )

        dataset_config["preprocessing"]["lcat_config"] = {
            "transformer_type": lcat_trans_name,
            "columns": LARGE_CATEGORICAL_COLUMNS,
            "transformer": lcat_transformer,
            "trans_columns": lcat_columns
        }


        X_train = np.array(np.concatenate(
            (
                X_num_train_trans,
                X_scat_train_trans,
                X_lcat_train_trans
            ),
            axis=1
        ))
        X_test = np.array(np.concatenate(
            (
                X_num_test_trans,
                X_scat_test_trans,
                X_lcat_test_trans
            ),
            axis=1
        ))
        columns = (
            num_columns
            + scat_columns
            + lcat_columns
        )
        
        dataset_config["X_train"] = X_train
        dataset_config["X_test"] = X_test
        dataset_config["columns"] = columns

        dataset_config["preprocessing"]["non_colineal_columns"] = columns

    return dataset_configs
                

def remove_high_colineality_columns(dataset_configs: dict, max_colineality: float):
    """Removes columns with high colineality with other columns"""
    for marca, dataset_config in dataset_configs.items():
        while True:
            # Removing features that have a high colineality with other features
            # until no features are highly correlated
            df_features = pd.DataFrame(
                dataset_configs[marca]["X_train"],
                columns=dataset_configs[marca]["columns"]
            )
            df_corr = df_features.corr()
            df_corr_bin = df_corr > max_colineality
            df_colineality_count = df_corr_bin.sum(axis=1)
            
            max_relations = df_colineality_count.max()
            
            if max_relations == 1:
                # Removal of non variable columns
                df_corr_nulity = df_corr.isnull().sum()
                null_columns = df_corr_nulity[df_corr_nulity == len(df_corr)].index
                
                variant_column_marker = [
                    col not in null_columns
                    for col in dataset_configs[marca]["columns"]
                ]
                
                dataset_configs[marca]["columns"] = [
                    col
                    for col in dataset_configs[marca]["columns"]
                    if col not in null_columns
                ]
                
                dataset_configs[marca]["X_train"] = dataset_configs[marca]["X_train"][
                    :, variant_column_marker
                ]

                dataset_configs[marca]["X_test"] = dataset_configs[marca]["X_test"][
                    :, variant_column_marker
                ]
                
                df_features = pd.DataFrame(
                    dataset_configs[marca]["X_train"],
                    columns=dataset_configs[marca]["columns"]
                )
                df_corr = df_features.corr()
                
                plt.figure(figsize=(13,10))
                plt.title(f"Colineality for marca: {marca}")
                sns.heatmap(df_corr, cmap="mako")
                plt.show()
                plt.close()
                break
            
            colineal_columns = df_colineality_count[
                df_colineality_count == max_relations
            ].index.tolist()
            
            independent_column_marker = [
                col not in colineal_columns
                for col in dataset_configs[marca]["columns"]
            ]
            
            dataset_configs[marca]["columns"] = [
                col
                for col in dataset_configs[marca]["columns"]
                if col not in colineal_columns
            ]
            
            dataset_configs[marca]["X_train"] = dataset_configs[marca]["X_train"][
                :, independent_column_marker
            ]
            
            dataset_configs[marca]["X_test"] = dataset_configs[marca]["X_test"][
                :, independent_column_marker
            ]
            dataset_config["preprocessing"]["non_colineal_columns"] = \
                deepcopy(dataset_configs[marca]["columns"])

def train_base_dataset_models(dataset_configs: dict):
    for marca, dataset_config in tqdm(dataset_configs.items()):
        
        model_type = dataset_config["config"]["model"]        
        model_class = MODELS[model_type]["class"]
        model_params = MODELS[model_type]["params"]

        model_searcher = setup_random_search_model(
            model_class,
            model_params
        )

        X_train = dataset_config["X_train"]
        X_test = dataset_config["X_test"]

        y_train = dataset_config["y_train"]
        y_test = dataset_config["y_test"]
        model_searcher.fit(
            X_train,
            y_train
        )
        best_model = model_searcher.best_estimator_
        train_metrics = evaluate_metrics(
            best_model,
            X_train,
            y_train,
            "train"
        )
        test_metrics = evaluate_metrics(
            best_model,
            X_test,
            y_test,
            "test"
        )
        df_metrics = pd.concat([
            train_metrics,
            test_metrics
        ])
        df_metrics["marca"] = marca
        
        dataset_config["model"] = best_model
        dataset_config["metrics"] = df_metrics
        
def train_best_features_models(dataset_configs: dict, dataset_n_features: dict):
    best_features_dataset_configs = deepcopy(dataset_configs)
    for marca, dataset_config in tqdm(best_features_dataset_configs.items()):
        
        n_features_selected = dataset_n_features[marca]

        feature_importances = dataset_config["model"].feature_importances_
        
        df_feature_importances = pd.DataFrame({
            "importance": feature_importances,
            "feature": dataset_config["columns"]
        })
        

        df_feature_importances["importance"] = df_feature_importances["importance"].abs()
        
        df_feature_importances.sort_values(
            "importance",
            ascending=False,
            inplace=True
        )
        
        best_features = df_feature_importances["feature"].tolist()[:n_features_selected]
        best_features_indexes = [dataset_config["columns"].index(col) for col in best_features]
        
        dataset_config["X_train"] = dataset_config["X_train"][
            :, best_features_indexes
        ]
        
        dataset_config["X_test"] = dataset_config["X_test"][
            :, best_features_indexes
        ]
        dataset_config["columns"] = best_features
        dataset_config["feature_importances"] = df_feature_importances

        dataset_config["preprocessing"]["best_columns"] = \
            deepcopy(dataset_config["columns"])

    return best_features_dataset_configs
