"""Configuration module for preprocessing data"""

# Clipped number of passengers
MAX_PASSENGERS = 265.1
# Passenger column
PASSENGER_COLUMN = "Pasajeros saliendo"

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

# IATA codes file
LOAD_IATA_FILE = "external_data/Aeropuertos.csv"

# PIB file
LOAD_PIB_FILE = "external_data/pib.csv"

# HDI file
LOAD_HDI_FILE = "external_data/hdi.csv"