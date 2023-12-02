import os
import math
import random
import numpy as np

import pandas as pd
from sklearnex import patch_sklearn
patch_sklearn()

from sklearn.model_selection import train_test_split
from copy import deepcopy
from itertools import product

from sklearn.model_selection import RandomizedSearchCV

from utils import make_folder
from joblib import dump
from tqdm import tqdm

# Change this file por another script with same shape for other experiment
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
    N_DATASET_CONFIGS
)

def load_datasets() -> dict[str, pd.DataFrame]:
    """Loads datasets used to train and evaluate as dict"""
    return {
        filename.split("/")[1].split(".")[0]:
            pd.read_parquet(filename)
        for filename in DATA_FILES 
    }

def split_data(df: pd.DataFrame):
    """Splits data into train and test"""
    y = df[TARGET_COLUMN]
    X = df[
        NUMERICAL_COLUMNS
        + SMALL_CATEGORICAL_COLUMNS
        + LARGE_CATEGORICAL_COLUMNS
    ]
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE
    )

    return {
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test
    }

def hash_column(base: int, df: pd.DataFrame, col: str, is_train: bool, col_hasher: any) -> tuple[np.array, list[str]]:
    """Creates hashes for categorical col"""

    if  is_train:
        dimensions = int(math.log(df[col].nunique(), base))
        col_hasher = col_hasher(
            dimensions,
            input_type="string"
        )
        hashed_values = col_hasher.fit_transform(
            df[col].values.reshape(-1, 1)
        ).todense()

        return hashed_values, col_hasher
    else:
        hashed_values = col_hasher.transform(
            df[col].values.reshape(-1, 1)
        ).todense()
        return hashed_values

def transforms_datasets(datasets: dict[str, pd.DataFrame]) -> tuple[dict[str, dict[str, list[list[float]]]]]:
    """Transforms datasets into dictionaries of transformed features for each possible trasnformation"""
    num_trans_results = {}
    scat_trans_results = {}
    lcat_trans_results = {}
    y_train = None
    y_test = None
    # Split into train and test
    for dataset, df_dataset in datasets.items():
        datasets[dataset] = split_data(
            df_dataset
        )

        num_trans_results[dataset] = {}
        scat_trans_results[dataset] = {}
        lcat_trans_results[dataset] = {}

        # Numerical columnas transformations
        X_num_train = deepcopy(datasets[dataset]["X_train"][NUMERICAL_COLUMNS])
        X_num_test = deepcopy(datasets[dataset]["X_test"][NUMERICAL_COLUMNS])
        
        for num_trans_name, num_trans in NUMERICAL_TRANSFORMS.items():
            num_transformer = num_trans()


            X_num_train_trans = num_transformer.fit_transform(X_num_train)
            X_num_test_trains = num_transformer.transform(X_num_test)
            num_trans_results[dataset][num_trans_name] = {
                "X_train": X_num_train_trans,
                "X_test": X_num_test_trains,
                "columns": NUMERICAL_COLUMNS
            }

        # Low cardinality transformations
        X_scat_train = deepcopy(datasets[dataset]["X_train"][SMALL_CATEGORICAL_COLUMNS])
        X_scat_test = deepcopy(datasets[dataset]["X_test"][SMALL_CATEGORICAL_COLUMNS])
        for scat_trans_name, scat_trans in SMALL_CATEGORICAL_TRANSFORMS.items():
            if scat_trans_name == "oneHotEncoder":
                for min_freq in MIN_FREQS_ONE_HOT:
                    scat_trans_dim_name = f"{scat_trans_name}__{min_freq}"
                    scat_transformer = scat_trans(sparse=False, handle_unknown='ignore')
                    X_scat_train_trans = scat_transformer.fit_transform(X_scat_train)
                    X_scat_test_trans = scat_transformer.transform(X_scat_test)
                    scat_trans_results[dataset][scat_trans_dim_name] = {
                        "X_train": X_scat_train_trans,
                        "X_test": X_scat_test_trans,
                        "columns": [
                            col 
                            for category in scat_transformer.categories_
                            for col in category
                        ]
                    }
            if scat_trans_name == "featureHasher":
                for log_base in HASH_DIM_LOG_BASES:
                    scat_trans_dim_name = f"{scat_trans_name}__{log_base}"
                    X_scat_train_hash = []
                    X_scat_test_hash = []
                    hash_columns = []
                    for col in SMALL_CATEGORICAL_COLUMNS:
                        X_scat_train_col_hash, hasher = hash_column(
                            log_base,
                            X_scat_train,
                            col,
                            True,
                            scat_trans
                        )
                        X_scat_test_col_hash = hash_column(
                            log_base,
                            X_scat_test,
                            col,
                            False,
                            hasher
                        )
                        X_scat_train_hash.append(X_scat_train_col_hash)
                        X_scat_test_hash.append(X_scat_test_col_hash)
                        hash_columns.extend([
                            f"{col}__{i}" for i in range(X_scat_train_col_hash.shape[1])
                        ])
                    X_scat_train_hash = np.concatenate(X_scat_train_hash, axis=1)
                    X_scat_test_hash = np.concatenate(X_scat_test_hash, axis=1)
                    scat_trans_results[dataset][scat_trans_dim_name] = {
                        "X_train": X_scat_train_hash,
                        "X_test": X_scat_test_hash,
                        "columns": hash_columns
                    }
        
        # High cardinality transformations
        X_lcat_train = deepcopy(datasets[dataset]["X_train"][LARGE_CATEGORICAL_COLUMNS])
        X_lcat_test = deepcopy(datasets[dataset]["X_test"][LARGE_CATEGORICAL_COLUMNS])
        for lcat_trans_name, lcat_trans in LARGE_CATEGORICAL_TRANSFORMS.items():
            if lcat_trans_name == "oneHotEncoder":
                for min_freq in MIN_FREQS_ONE_HOT:
                    lcat_trans_dim_name = f"{lcat_trans_name}__{min_freq}"
                    lcat_transformer = lcat_trans(sparse=False, handle_unknown='ignore')
                    X_lcat_train_trans = lcat_transformer.fit_transform(X_lcat_train)
                    X_lcat_test_trans = lcat_transformer.transform(X_lcat_test)
                    lcat_trans_results[dataset][lcat_trans_dim_name] = {
                        "X_train": X_lcat_train_trans,
                        "X_test": X_lcat_test_trans,
                        "columns": [
                            col 
                            for category in lcat_transformer.categories_
                            for col in category
                        ]
                    }
            if lcat_trans_name == "featureHasher":
                    for log_base in HASH_DIM_LOG_BASES:
                        lcat_trans_dim_name = f"{lcat_trans_name}__{log_base}"
                        X_lcat_train_hash = []
                        X_lcat_test_hash = []
                        hash_columns = []
                        for col in LARGE_CATEGORICAL_COLUMNS:
                            X_lcat_train_col_hash, hasher = hash_column(
                                log_base,
                                X_lcat_train,
                                col,
                                True,
                                lcat_trans
                            )
                            X_lcat_test_col_hash = hash_column(
                                log_base,
                                X_lcat_test,
                                col,
                                False,
                                hasher
                            )
                            X_lcat_train_hash.append(X_lcat_train_col_hash)
                            X_lcat_test_hash.append(X_lcat_test_col_hash)
                            hash_columns.extend([
                                f"{col}__{i}" for i in range(X_lcat_train_col_hash.shape[1])
                            ])
                        X_lcat_train_hash = np.concatenate(X_lcat_train_hash, axis=1)
                        X_lcat_test_hash = np.concatenate(X_lcat_test_hash, axis=1)
                        lcat_trans_results[dataset][lcat_trans_dim_name] = {
                            "X_train": X_lcat_train_hash,
                            "X_test": X_lcat_test_hash,
                            "columns": hash_columns
                        }

    return num_trans_results, scat_trans_results, lcat_trans_results

def generate_feature_permutations(num_trans_results, scat_trans_results, lcat_trans_results):
    """Calculates all the possible dataset configurations for hparam exploration"""
    num_configs = [
        config for config in num_trans_results
    ]
    scat_configs = [
        config for config in scat_trans_results
    ]
    lcat_configs = [
        config for config in lcat_trans_results
    ]
    return list(product(num_configs, scat_configs, lcat_configs))

def setup_random_search_model(model_class, model_params):
    """Sets up a cross validation experiment"""
    try:
        estimator = model_class(random_state=RANDOM_STATE)
    except:
        estimator = model_class()
    
    model_searcher = RandomizedSearchCV(
        estimator = estimator,
        param_distributions = model_params,
        n_iter=N_ITERS,
        cv=CV,
        verbose=2,
        random_state=RANDOM_STATE,
        n_jobs=1,
        scoring="neg_root_mean_squared_error"
    )

    return model_searcher

def evaluate_metrics(
    model,
    X_data,
    y_true,
    split
):
    """Evaluates model performance over a split"""
    y_pred = model.predict(X_data)
    split_metrics = {
        "split": split
    }
    for metric_name, metric in METRICS.items():
        split_metrics[metric_name] = metric(
            y_true,
            y_pred
        )
    
    return pd.DataFrame(split_metrics, index=[0])


def run():
    """Runs hparam exploration"""
    make_folder(OUTPUT_FOLDER)
    datasets = load_datasets()
    num_trans_results, scat_trans_results, lcat_trans_results = transforms_datasets(
        datasets
    )
    generic_dataset_key = list(datasets.keys())[0]
    dataset_configs = generate_feature_permutations(
         num_trans_results[generic_dataset_key],
         scat_trans_results[generic_dataset_key],
         lcat_trans_results[generic_dataset_key]
    )

    tested_configs = random.sample(
        dataset_configs,
        k=N_DATASET_CONFIGS
    )
    print(f"EVALUATING {len(tested_configs)} DATASET CONFIGURATIONS for {len(datasets)} DATASETS")
    for dataset, dataset_splits in tqdm(datasets.items()):
        y_train = dataset_splits["y_train"]
        y_test = dataset_splits["y_test"]
        for num_config, scat_config, lcat_config in list(tested_configs):
            for model_name, model_config in MODELS.items():
                try:
                    model_class = model_config["class"]
                    model_params = model_config["params"]
                    model_searcher = setup_random_search_model(
                        model_class,
                        model_params
                    )
                    columns = np.concatenate(
                        (
                            num_trans_results[dataset][num_config]["columns"],
                            scat_trans_results[dataset][scat_config]["columns"],
                            lcat_trans_results[dataset][lcat_config]["columns"],
                        ),
                        axis=0
                    ).tolist()
                    X_train = np.array(np.concatenate(
                        (
                            num_trans_results[dataset][num_config]["X_train"],
                            scat_trans_results[dataset][scat_config]["X_train"],
                            lcat_trans_results[dataset][lcat_config]["X_train"],
                        ),
                        axis=1
                    ))
                    X_test = np.array(np.concatenate(
                        (
                            num_trans_results[dataset][num_config]["X_test"],
                            scat_trans_results[dataset][scat_config]["X_test"],
                            lcat_trans_results[dataset][lcat_config]["X_test"],
                        ),
                        axis=1
                    ))
                    model_searcher.fit(X_train, y_train)

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
                    df_metrics["dataset"] = dataset
                    df_metrics["num_config"] = num_config
                    df_metrics["scat_config"] = scat_config
                    df_metrics["lcat_config"] = lcat_config
                    df_metrics["model"] = model_name
                    df_metrics["columns"] = str(columns)

                    str_config = "|".join([
                        dataset,
                        num_config,
                        scat_config,
                        lcat_config,
                        model_name
                    ])
                    df_metrics.to_csv(f"{OUTPUT_FOLDER}/{str_config}.csv", index=False)

                    #dump(best_model, f"{OUTPUT_FOLDER}/{str_config}.pkl")   # Was occupying most of my disk
                except Exception as e:
                    print("FAILED config", dataset, num_config, scat_config, lcat_config)
                    continue
    
    df_all_results = pd.concat([
        pd.read_csv(f"{OUTPUT_FOLDER}/{filename}")
        for filename in
        os.listdir(OUTPUT_FOLDER)
        if filename.endswith(".csv")
    ])
    df_all_results.to_csv(f"{OUTPUT_FOLDER}/summary.csv", index=False)
