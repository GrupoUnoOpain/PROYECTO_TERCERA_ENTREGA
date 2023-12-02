# Data management Libraries
import pandas as pd
import numpy as np

# Data visualization Libraries
import matplotlib.pyplot as plt
import seaborn as sns

# Utils
from pycountry_convert import country_alpha2_to_continent_code, country_name_to_country_alpha2


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
        

def univariate_analysis_continuos_variables(df):
    """calculates the univariate analysis for continuos variables
  
    Args:
        df (pandas.dataframe)
    """    
    for attribute in df.columns:
        print("---------------------------------------------------------------------------------------------")
        print(f"--------------------------------------{attribute}--------------------------------------------")
        print("---------------------------------------------------------------------------------------------")
        print("\n")
        
        # Descriptive statistics
        print(f"Estadísticas descriptivas\n")
        print(df[attribute].describe(percentiles=[0.05, 0.25, 0.5, 0.75, 0.85, 0.90, 0.95]))
        print("\n")

        # mode
        mode = df[attribute].mode().iloc[0]
        print("\nValor más común (moda)\n")
        print(mode)
        print("\n")
        
        
        # Asimetría (skewness) para todas las columnas numéricas
        asimetria = df[attribute].skew()
        print("\nValor skewness\n")
        print(asimetria)
        print("\n")

        # Curtosis (kurtosis) para todas las columnas numéricas
        curtosis = df[attribute].kurtosis()
        print("\nValor kurtosis\n")
        print(curtosis)
        print("\n")        
        
        # Seen how many values are cero
        value_counts = df[attribute].value_counts()
        print("Número de registros con valor cero\n")
        print(value_counts.get(0, 0))
        print("\n")

        # Seen how many values are null
        null_values = df[attribute].isnull().sum()
        print("Número de registros nulos\n")
        print(null_values)
        print("\n")
        
        statistics = df[attribute].describe()
        numeric_column = attribute

        # Calculate the interquartile range (IQR)
        Q1 = statistics.loc['25%']
        Q3 = statistics.loc['75%']
        IQR = Q3 - Q1

        # Define the range to identify outliers
        min_value = Q1 - 1.5 * IQR
        max_value = Q3 + 1.5 * IQR

        # Filter the outliers
        outlier_values = df[(df[numeric_column] < min_value) | (df[numeric_column] > max_value)][numeric_column]
        print("outlier_values\n")
        print(outlier_values)
        print("\n")
        
        # Histograma
        plt.figure(figsize=(10, 5))
        plt.hist(df[attribute], bins=50, color='skyblue', edgecolor='black')
        plt.title("Histograma")
        plt.xlabel(attribute)
        plt.ylabel("Frequency")
        plt.show()

        # Density plot
        plt.figure(figsize=(10, 5))
        df[attribute].plot(kind='density', color='skyblue')
        plt.title("Gráfico de Densidad")
        plt.xlabel(attribute)
        plt.show()
                                
        # Histogram and density plot
        plt.figure(figsize=(10, 5))
        sns.histplot(df[attribute], bins=50, kde=True, color='orange', edgecolor='k')
        plt.title("Histograma y Gráfico de Densidad")
        plt.xlabel(attribute)
        plt.ylabel('Frequency')
        plt.show()
        print("\n\n")


def univariate_analysis_discrete_variables(df):
    """Calcula el análisis univariado para variables discretas.

    Args:
        df (pandas.DataFrame): El DataFrame que contiene las variables a analizar.
    """
    for attribute in df.columns:
        print("---------------------------------------------------------------------------------------------")
        print(f"--------------------------------------{attribute}--------------------------------------------")
        print("---------------------------------------------------------------------------------------------")
        print("\n")

        # Descriptive statistics
        print(f"Estadísticas descriptivas\n")
        print(df[attribute].describe(percentiles=[0.05, 0.25, 0.5, 0.75, 0.95]))
        print("\n")

        # Seen how many values are null
        null_values = df[attribute].isnull().sum()
        print(f"Número de registros nulos: {null_values}")
        print("\n")

        # Filter out null values
        df_filtered = df.dropna(subset=[attribute])

        # Seen how many values are zero
        value_counts = df_filtered[attribute].value_counts()
        print(f"Número de registros con valor cero: {value_counts.get(0, 0)}")
        print("\n")

        # Showing unique values
        unique_values = df_filtered[attribute].unique()
        print(f"Los valores únicos son\n")
        print(unique_values)
        print("\n")

        if len(unique_values) < 40:
            # Plotting a count plot for attribute
            plt.figure(figsize=(10, 4), dpi=200)
            sns.countplot(x=attribute, data=df_filtered)
            plt.title(f"Distribución de {attribute}")
            plt.xticks(rotation=90)
            plt.show()
            print("\n\n")


def univariate_analysis_categorical_variables(df):
    """calculates the univariate analysis for categorical variables
  
    Args:
        df (pandas.dataframe)
    """  
    for attribute in df.columns:
        print("---------------------------------------------------------------------------------------------")
        print(f"--------------------------------------{attribute}--------------------------------------------")
        print("---------------------------------------------------------------------------------------------")
        print("\n")
        
        # unique values
        unique_values = df[attribute].unique()

        # mode
        mode = df[attribute].mode().iloc[0]

        # absolute frecuency
        absolute_frecuency = df[attribute].value_counts(dropna=False, normalize=False)

        # relative frecuency
        relative_frecuency = df[attribute].value_counts(dropna=False, normalize=True)

        # null values
        null_values = df[attribute].isnull().sum()
                

        print("Valores diferentes (Categorias)\n")
        print(unique_values)
        print("\n")

        print("\nValor más común (moda)\n")
        print(mode)
        print("\n")

        print("\nFrecuencia absoluta\n")
        print(absolute_frecuency)
        print("\n")
        
        print("\nFrecuencia relativa\n")
        print(relative_frecuency)
        print("\n")
        
        print("\nNúmero de registros nulos\n")
        print(null_values)
        print("\n")

        # print just for categories with less or equal to 40
        if len(unique_values) <= 40:
            # countplot
            plt.figure(figsize=(10,4),dpi=200)
            sns.countplot(x=attribute, data=df)
            plt.title(f"Distribución de {attribute}")
            if len(unique_values) >= 10:
                plt.xticks(rotation=90)
            print("\n\n")
            
            
