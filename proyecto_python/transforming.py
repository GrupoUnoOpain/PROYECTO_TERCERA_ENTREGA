"""Transforms clean data to model inputs"""
from copy import deepcopy
import pandas as pd
import numpy as np


def transform_numerical_features(num_config: dict, df_data: pd.DataFrame) -> list:
    """Extracts numerical features and transforms them"""
    columns = num_config["columns"]
    transformer = num_config["transformer"]
    trans_columns = num_config["trans_columns"]
    num_values = transformer.transform(df_data[columns])
    return num_values, trans_columns

def transform_categorical_features(cat_config: dict, df_data: pd.DataFrame) -> list:
    """Extracts categorical features and transforms them"""
    columns = cat_config["columns"]
    transformer = cat_config["transformer"]
    trans_columns = cat_config["trans_columns"]
    if isinstance(transformer, list):
        cat_values = []
        for ix, col in enumerate(columns):
            col_transformer = transformer[ix]
            col_cat_values = col_transformer.transform(
                df_data[col].values.reshape(-1, 1)
            ).todense()
            cat_values.append(col_cat_values)
        cat_values = np.concatenate(cat_values, axis=1)
    else:
        cat_values = transformer.transform(df_data[columns])
    return cat_values, trans_columns


def transform_to_model_input(model_config: dict, df_data: pd.DataFrame) -> pd.DataFrame:
    """Based on model transformation configuration transform data to adequate values
    to work as regressor input"""
    num_config = deepcopy(
        model_config["preprocessing"]["num_config"]
    )
    scat_config = deepcopy(
        model_config["preprocessing"]["scat_config"]
    )
    lcat_config = deepcopy(
        model_config["preprocessing"]["lcat_config"]
    )
    best_columns = model_config["preprocessing"]["best_columns"]

    num_values, num_columns = transform_numerical_features(
        num_config,
        df_data
    )

    scat_values, scat_columns = transform_categorical_features(
        scat_config,
        df_data
    )

    lcat_values, lcat_columns = transform_categorical_features(
        lcat_config,
        df_data
    )

    X_test = np.array(np.concatenate(
        (
            num_values,
            scat_values,
            lcat_values
        ),
        axis=1
    ))
    columns = (
        num_columns
        + scat_columns
        + lcat_columns
    )
    df_test = pd.DataFrame(X_test, columns=columns)
    df_test = df_test[best_columns].copy(deep=True)
    return df_test

def transform(model_configs: dict, df_data: pd.DataFrame) -> dict:
    """For each dataset (marca), it generates an input dataset"""
    return {
        dataset: transform_to_model_input(
            dataset_config,
            df_data
        )
        for dataset, dataset_config in model_configs.items()
    }
