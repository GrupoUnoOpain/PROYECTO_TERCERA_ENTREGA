"""Prediction module"""
import pandas as pd

def model_predict(model_configs: dict, df_data: pd.DataFrame) -> dict:
    """Predicts sales for each dataset (marca) where muelle is all in one"""
    predictions = {}
    for dataset, dataset_config in model_configs.items():
        X_test = df_data[dataset]
        y_test = dataset_config["model"].predict(
            X_test
        )
        predictions[dataset] = y_test
    return predictions
