import numpy as np
from sklearnex import patch_sklearn
patch_sklearn()

from sklearn.preprocessing import (
    StandardScaler,
    RobustScaler,
    MinMaxScaler,
    PowerTransformer,
    OneHotEncoder,
    PolynomialFeatures
)
from sklearn.feature_extraction import FeatureHasher

from sklearn.metrics import (
    mean_squared_error,
    mean_absolute_error,
    r2_score,
    mean_absolute_percentage_error
)

from sklearn.ensemble import RandomForestRegressor

from sklearn.linear_model import LinearRegression

from lightgbm import LGBMRegressor

# Random seed to make it repeatable
RANDOM_STATE = 42

# Dataframes to train from
DATA_FILES = [
    "extended_data/muelle.parquet",
    "extended_data/marca 1.parquet",
    "extended_data/marca 2.parquet",
    "extended_data/marca 3.parquet",
    "extended_data/marca 5.parquet",
    "extended_data/marca 6.parquet",
    "extended_data/marca 7.parquet",
    "extended_data/marca 9.parquet",
    "extended_data/marca 10.parquet"
]

# Output folder
OUTPUT_FOLDER = "extended_data_results"

# Target column
TARGET_COLUMN = "valor_venta"

# Numerical columns
NUMERICAL_COLUMNS = [
    "Hora entera",
    "Pasajeros saliendo",
    "Semana",
    "Mes",
    "Día",
    "Hdi2021",
    "Minuto entero",
    "sin_Semana",
    "cos_Semana",
    "sin_Mes",
    "cos_Mes",
    "sin_Día",
    "cos_Día",
    "sin_Hora entera",
    "cos_Hora entera"
]

# High cardinality columns
LARGE_CATEGORICAL_COLUMNS = [
    "Destino",
    "Sala",
    "AEROLÍNEA",
    "País Destino"
]

# Low cardinality columns
SMALL_CATEGORICAL_COLUMNS = [
    "Tipo de vuelo",
    "Tipo aerolínea",
    "FECHA DIA",
    "Continente Destino"
]

# Test size for train test split
TEST_SIZE = 0.2

# Numerical transformations
NUMERICAL_TRANSFORMS = {
    "standardScaler": StandardScaler,
    "robustScaler": RobustScaler,
    "minMaxScaler": MinMaxScaler,
    "powerTransformer": PowerTransformer,
    "polynomialFeatures": PolynomialFeatures
}

# Highly cardinality transformations
LARGE_CATEGORICAL_TRANSFORMS = {
    "featureHasher": FeatureHasher,
    "oneHotEncoder": OneHotEncoder
}

# Low cardinality transformations
SMALL_CATEGORICAL_TRANSFORMS = {
    "oneHotEncoder": OneHotEncoder
}

# Min freqs one_hot
MIN_FREQS_ONE_HOT = [
    0.0,
    0.05
]

# Hash dimension logarithms
HASH_DIM_LOG_BASES = [
    2,
    10
]

# Models and params grid
MODELS = {
    "lgbmregressor": {  # SLOW AS FUCK
        "class": LGBMRegressor,
        "params": {
            'n_estimators': [int(x) for x in np.linspace(start = 200, stop = 1000, num = 10)],
            'learning_rate': np.random.uniform(0, 1, size=5),
            'boosting_type': ['gbdt', 'dart', 'goss'],
            'objective': ['regression'],
            'metric': ['rmse'],
            'sub_feature': np.random.uniform(0, 1, size=5),
            'num_leaves': np.random.randint(20, 300, size=5),
            'min_data': np.random.randint(10, 100, size=5),
            'max_depth': np.random.randint(10, 50, size=5),
            'n_jobs': [-1],
            'verbose': [-1]
        }
    },
    "randomForest": {
        "class": RandomForestRegressor,
        "params": {
            'n_estimators': [int(x) for x in np.linspace(start = 200, stop = 1000, num = 10)],
            'max_features': ['log2', 'sqrt', None],
            'max_depth': [None] + [int(x) for x in np.linspace(10, 50, num = 5)],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4],
            'bootstrap': [True, False],
            'n_jobs': [-1]
        }
    },
    "linearRegression": {
        "class": LinearRegression,
        "params": {
            "fit_intercept": [True],
            "n_jobs": [-1]
        }
    }
}

# Regression metrics
METRICS = {
    "MSE": mean_squared_error,
    "MAE": mean_absolute_error,
    "R2": r2_score,
    "MAPE": mean_absolute_percentage_error
}

# Number of tested models in random search
N_ITERS = 20

# Cross validation folds
CV = 3

# Number of dataset configurations to test
N_DATASET_CONFIGS = 20

# Config columns
CONFIG_COLUMNS = ["num_config", "scat_config", "lcat_config", "model"]
