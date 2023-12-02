"""Configurations to evaluate multiple configurations"""


# Unique sala values
ANALYZED_ROOMS = ['a1', 'a10', 'a11', 'a12', 'a13', 'a14', 'a3', 'a4', 'a5', 'a6',
       'a7a', 'a7b', 'a7c', 'a8', 'a9a', 'a2', 'a9b', 'rori', 'en']

# Unique hour values
ANALYZED_HOURS = [0,
 1,
 2,
 3,
 4,
 5,
 6,
 7,
 8,
 9,
 10,
 11,
 12,
 13,
 14,
 15,
 16,
 17,
 18,
 19,
 20,
 21,
 22,
 23
]

# Unique week days
ANALYZED_WEEK_DAYS = ['domingo', 'jueves', 'lunes', 'martes', 'miercoles', 'sabado', 'viernes']

# Unique week number in year
ANALYZED_WEEKS = [1,
 2,
 3,
 4,
 5,
 6,
 7,
 8,
 9,
 10,
 11,
 12,
 13,
 14,
 15,
 16,
 17,
 18,
 19,
 20,
 21,
 22,
 23,
 24,
 25,
 26,
 27,
 28,
 29,
 30,
 31,
 32,
 33,
 34,
 35,
 36,
 37,
 38,
 39,
 40,
 41,
 42,
 43,
 44,
 45,
 46,
 47,
 48,
 49,
 50,
 51,
 52]

# Unique month number
ANALYZED_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

# Unique day number in month
ANALYZED_MONTH_DAYS = [1,
 2,
 3,
 4,
 5,
 6,
 7,
 8,
 9,
 10,
 11,
 12,
 13,
 14,
 15,
 16,
 17,
 18,
 19,
 20,
 21,
 22,
 23,
 24,
 25,
 26,
 27,
 28,
 29,
 30,
 31]

# Config for analytics evaluation
# Pairs of column, unique values to evaluate
COLUMN_ANALYSIS = {
    "Sala": ANALYZED_ROOMS,
    "Hora entera": ANALYZED_HOURS,
    "FECHA DIA": ANALYZED_WEEK_DAYS,
    "Semana": ANALYZED_WEEKS,
    "Mes": ANALYZED_MONTHS,
    "Día": ANALYZED_MONTH_DAYS
}