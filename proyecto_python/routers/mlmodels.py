import pandas as pd
from tqdm import tqdm
from typing import List
from pydantic import BaseModel, Field

from fastapi import APIRouter, FastAPI, Depends
from contextlib import asynccontextmanager

from config_load import LOAD_MODEL_FILE
from config_analytics import COLUMN_ANALYSIS
from utils import load_pickle
from preprocessing import preprocess
from transforming import transform
from predicting import model_predict

from typing import Annotated
from .auth import get_current_user
from starlette import status


MODELS = None

@asynccontextmanager
async def lifespan(app: FastAPI) -> dict:
    """Loads model file as a dict"""
    global MODELS
    MODELS = load_pickle(LOAD_MODEL_FILE)
    yield
    del MODELS

router = APIRouter()


def predict_input(inputs: list[dict]) -> pd.DataFrame:
    """Generates predictions for each model"""
    df_results = pd.DataFrame(inputs).drop_duplicates()
    df_clean = preprocess(inputs)
    df_transform = transform(MODELS, df_clean)
    preds = model_predict(MODELS, df_transform)

    for dataset, pred in preds.items():
        sales_column = f"valor_venta__{dataset}"
        df_results[sales_column] = pred
        is_negative_sale = df_results[sales_column] < 0.0
        df_results.loc[is_negative_sale, sales_column] = 0.0

    return df_results


class Flight(BaseModel):
    id: int = Field(alias="id")
    iata_code: str = Field(alias="IATA CODE")
    destino: str = Field(alias="Destino")
    tipo_de_vuelo: str = Field(alias="Tipo de vuelo")
    sala: str = Field(alias="Sala")
    muelle: str = Field(alias="Muelle")
    aerolinea: str = Field(alias="AEROLÍNEA")
    tipo_aerolinea: str = Field(alias="Tipo aerolínea")
    std: str = Field(alias="STD")
    hora_entera: int = Field(alias="Hora entera")
    fecha_dia: str = Field(alias="FECHA DIA")
    pasajeros_saliendo: int = Field(alias="Pasajeros saliendo")
    semana: int = Field(alias="Semana")
    mes: int = Field(alias="Mes")
    dia: int = Field(alias="Día")
    anio: int = Field(alias="Año")
    

user_dependency = Annotated[dict, Depends(get_current_user)]


@router.post("/predict", status_code=status.HTTP_200_OK)
def predict(flights: List[Flight], user: dict = Depends(get_current_user)):
    """Predicts sales for input"""
    # Utiliza el método model_dump en lugar de dict
    result_flights = [flight.model_dump(by_alias=True) for flight in flights]
    predictions = predict_input(result_flights)
    sorted_predictions = {
        prediction["id"]: {
            field: value
            for field, value in prediction.items()
            if field != "id"
        }
        for prediction in predictions.to_dict(orient="records")
    }
    return sorted_predictions


def analyze_column_behavior(inputs: list[dict], column: str) -> pd.DataFrame:
    """Iterates over a column possible values and returns all the predicted values"""
    
    col_categories = COLUMN_ANALYSIS[column]

    analysis_results = {}

    for category in tqdm(col_categories):
        df_col_inputs = pd.DataFrame(inputs)
        df_col_inputs[column] = category
        col_inputs = df_col_inputs.to_dict(orient="records")
        col_preds = predict_input(col_inputs).to_dict(orient="records")
        dataset_columns = [
            col for col in col_preds[0].keys()
            if "valor_venta__" in col
        ]
        
        for pred in col_preds:
            id = pred["id"]
            category_value = pred[column]
            if id not in analysis_results.keys():
                analysis_results[id] = {} 
            for dataset_column in dataset_columns:
                dataset_name = dataset_column.replace("valor_venta__", "")
                dataset_amount = pred[dataset_column]
                if dataset_name not in analysis_results[id].keys():
                    analysis_results[id][dataset_name] = {}
                analysis_results[id][dataset_name][category_value] = dataset_amount
            
    return analysis_results


@router.post("/analyze_sala", status_code=status.HTTP_200_OK)
def analyze_sala(flights: List[Flight], user: dict = Depends(get_current_user)):
    """Analyzes if changing sala affects sales"""
    result_flights = [flight.model_dump(by_alias=True) for flight in flights]
    return analyze_column_behavior(result_flights, "Sala")


@router.post("/analyze_hour", status_code=status.HTTP_200_OK)
def analyze_hour(flights: List[Flight], user: dict = Depends(get_current_user)):
    """Analyzes if changing hour affects sales"""
    result_flights = [flight.model_dump(by_alias=True) for flight in flights]
    return analyze_column_behavior(result_flights, "Hora entera")


@router.post("/analyze_week_day", status_code=status.HTTP_200_OK)
def analyze_week_day(flights: List[Flight], user: dict = Depends(get_current_user)):
    """Analyzes if week day affects sales"""
    result_flights = [flight.model_dump(by_alias=True) for flight in flights]
    return analyze_column_behavior(result_flights, "FECHA DIA")


@router.post("/analyze_week", status_code=status.HTTP_200_OK)
def analyze_week(flights: List[Flight], user: dict = Depends(get_current_user)):
    """Analyzes if changing week number affects sales"""
    result_flights = [flight.model_dump(by_alias=True) for flight in flights]
    return analyze_column_behavior(result_flights, "Semana")


@router.post("/analyze_month", status_code=status.HTTP_200_OK)
def analyze_month(flights: List[Flight], user: dict = Depends(get_current_user)):
    """Analyzes if changing month number affects sales"""
    result_flights = [flight.model_dump(by_alias=True) for flight in flights]
    return analyze_column_behavior(result_flights, "Mes")


@router.post("/analyze_month_day", status_code=status.HTTP_200_OK)
def analyze_month_day(flights: List[Flight], user: dict = Depends(get_current_user)):
    """Analyzes if changing month day number affects sales"""
    result_flights = [flight.model_dump(by_alias=True) for flight in flights]
    return analyze_column_behavior(result_flights, "Día")


@router.get("/model_metrics", status_code=status.HTTP_200_OK)
def get_model_metrics(user: dict = Depends(get_current_user)) -> list[dict]:
    """Returns model metrics for train and test"""
    all_model_metrics = []
    for dataset, model in MODELS.items():
        df_model_metrics = model["metrics"]
        df_model_metrics["marca"] = dataset
        all_model_metrics.append(df_model_metrics)
    
    df_metrics = pd.concat(all_model_metrics)
    return df_metrics.to_dict(orient="records")


@router.get("/feature_importances", status_code=status.HTTP_200_OK)
def get_feature_importances(user: dict = Depends(get_current_user)) -> list[dict]:
    """Returns feature importances for train and test"""
    all_feature_importances = []
    for dataset, model in MODELS.items():
        n_features = len(model["columns"])
        df_model_feature_importances = model["feature_importances"].reset_index()[:n_features]
        df_model_feature_importances["marca"] = dataset
        all_feature_importances.append(df_model_feature_importances)
    df_feature_importances = pd.concat(all_feature_importances)
    return df_feature_importances.to_dict(orient="records")
