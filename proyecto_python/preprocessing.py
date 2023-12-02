"""Preprocessing module"""
import re

import pandas as pd
import numpy as np
from unidecode import unidecode

from pycountry_convert import country_alpha2_to_continent_code, country_name_to_country_alpha2

from config_preprocessing import (
    MAX_PASSENGERS,
    PASSENGER_COLUMN,
    NUMERICAL_COLUMNS,
    LARGE_CATEGORICAL_COLUMNS,
    SMALL_CATEGORICAL_COLUMNS,
    LOAD_IATA_FILE,
    LOAD_PIB_FILE,
    LOAD_HDI_FILE
)

def safe_standardize_text(text: str) -> str:
    """Standardizes text to lower and deaccented form"""
    try:
        try:
            is_nan = np.isnan(text)
        except:
            is_nan = text is None
        if is_nan:
            return np.nan
        else:
            return re.sub(
                r"\s+",
                " ",
                re.sub(
                    r'\W+',
                    " ",
                    unidecode(str(text)).lower().strip()
                )
            ).strip()
    except Exception as e:
        print(e)
        return np.nan

def safe_standardize_float(value: any) -> float:
    """Safely converts value to float"""
    try:
        return np.float64(value)
    except:
        return np.nan

def clip_passengers(df_data: pd.DataFrame) -> None:
    """Clips passenger number to the maximum allowed"""
    has_too_many_passengers = df_data[PASSENGER_COLUMN] > MAX_PASSENGERS
    df_data.loc[has_too_many_passengers, PASSENGER_COLUMN] = MAX_PASSENGERS

def standardize_data(df_data: pd.DataFrame) -> None:
    """Standardizes numerical and categorical columns"""
    for col in df_data.columns:
        standardization = (
            safe_standardize_float if col in NUMERICAL_COLUMNS
            else safe_standardize_text
        )
        df_data[col] = df_data[col].apply(standardization)

def add_column_cyclical_features(df, col_name_time, period, start_num=0):
    """Given a period size, transforms numerical time column into sin/cos columns"""
    values = 2 * np.pi * (df[col_name_time] - start_num) / period
    kwargs = {f'sin_{col_name_time}': lambda x: np.sin(values),
              f'cos_{col_name_time}': lambda x: np.cos(values)}
    return df.assign(**kwargs)

def add_cyclical_features(df_data: pd.DataFrame) -> None:
    """Adds cyclical features for Week, month, day and hour"""
    df_data = add_column_cyclical_features(
        df_data,
        "Semana",
        52,
        start_num=1
    )
    df_data = add_column_cyclical_features(
        df_data,
        "Mes",
        12,
        start_num=1
    )
    df_data = add_column_cyclical_features(
        df_data,
        "Día",
        31,
        start_num=1
    )
    df_data = add_column_cyclical_features(
        df_data,
        "Hora entera",
        23,
        start_num=0
    )
    return df_data

def load_iata_codes() -> pd.DataFrame:
    """Loads IATA code dataframe"""
    df_iata_code = pd.read_csv(LOAD_IATA_FILE)
    df_iata_code = df_iata_code.map(lambda x: x.strip() if isinstance(x, str) else x)
    df_iata_code['Country'] = df_iata_code['Country'].replace('USA', 'United States')
    return df_iata_code.drop_duplicates()

def load_pib() -> pd.DataFrame:
    """Loads country PIB dataframe"""
    df_pib = pd.read_csv(LOAD_PIB_FILE)
    df_pib = df_pib.map(lambda x: x.strip() if isinstance(x, str) else x)
    return df_pib.drop_duplicates()

def load_hdi() -> pd.DataFrame:
    """Loads country HDI dataframe"""
    df_hdi = pd.read_csv(LOAD_HDI_FILE)
    df_hdi = df_hdi.map(lambda x: x.strip() if isinstance(x, str) else x)
    return df_hdi.drop_duplicates()


def identify_continent(country):
    """function to identify the continent base in its country 
    
    Args:
        country (str)

    Returns:
        string 
    """
    try:
        country_code = country_name_to_country_alpha2(country)       
        
        if country_code:
            continent_code = country_alpha2_to_continent_code(country_code)
            if continent_code:
                continente = {
                    'AF': 'Africa',
                    'AS': 'Asia',
                    'EU': 'Europe',
                    'NA': 'North America',
                    'SA': 'South America',
                    'OC': 'Oceania',
                    'AN': 'Antarctica'
                }.get(continent_code, 'Unknown')

                return continente
            else:
                return "Unknown"
        else:
            return "Unknown"
    except LookupError:
        return "Unknown"

def include_external_data(
    df_data: pd.DataFrame,
    df_iata_code: pd.DataFrame,
    df_pib: pd.DataFrame,
    df_hdi: pd.DataFrame
) -> pd.DataFrame:
    """Adds Region, PIB and HDI data to dataframe"""
    df_extended_data = df_data.merge(
        df_iata_code[['IATA CODE', 'Country']],
        on='IATA CODE',
        how='left',
        indicator=True
    ).drop_duplicates()

    df_extended_data.rename(
        columns={'Country': 'País Destino'},
        inplace=True
    )

    df_extended_data['Continente Destino'] = df_extended_data['País Destino'].apply(
        identify_continent
    )
    df_extended_data.loc[
        df_extended_data['Destino'] == 'curacao willemstad', 'Continente Destino'
    ] = 'North America'
    
    df_extended_data = df_extended_data.merge(
        df_pib[['country', 'GdpPerCapitaUN']],
        left_on='País Destino',
        right_on='country',
        how='left'
    ).drop(columns="country")
    df_extended_data = df_extended_data.merge(
        df_hdi[['country', 'Hdi2021']],
        left_on='País Destino',
        right_on='country',
        how='left'
    ).drop(columns="country")

    has_no_hdi = df_extended_data["Hdi2021"].isnull()
    has_no_pib = df_extended_data["GdpPerCapitaUN"].isnull()
    df_extended_data.loc[
        has_no_hdi, "Hdi2021"
    ] = 0.0

    df_extended_data.loc[
        has_no_pib, "GdpPerCapitaUN"
    ] = 0.0

    return df_extended_data

def calculate_minute(df_data: pd.DataFrame) -> None:
    """Calculates minute of flight as number"""
    df_data['STD'] = pd.to_datetime(df_data['STD'])
    df_data['Minuto entero'] = df_data['STD'].apply(lambda x: x.minute)


from datetime import datetime

def preprocess(inputs: list[dict]):
    """Executes preprocessing pipeline"""
    df_data = pd.DataFrame(inputs)

    df_iata_code = load_iata_codes()
    df_pib = load_pib()
    df_hdi = load_hdi()

    df_data = include_external_data(
        df_data,
        df_iata_code,
        df_pib,
        df_hdi
    )

    calculate_minute(df_data)

    standardize_data(df_data)
    clip_passengers(df_data)
    df_data = add_cyclical_features(df_data)
    return df_data
