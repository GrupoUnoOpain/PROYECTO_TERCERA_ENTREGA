## Notebooks de entregables
En la carpeta raiz los notebooks se ejecutan en orden secuencial de la siguiente manera:

- **1_Limpieza_datos_comerciales.ipynb**: Limpia datos comerciales (ventas) con base en las dimensiones de calidad.
- **2_limpieza_datos_operativos.ipynb**: Limpia datos operativos (vuelos) con base en las dimensiones de calidad.
- **3_Union_datos_operativos_y_comerciales_por_muelle.ipynb**: Une los datos operativos y comerciales agrupados por hora y muelle para generar datos de regresion por vuelo con base en las ventas del muelle.
- **4_Union_de_datos_operativos_y_comerciales_por_marca**: Este notebook une informacion de vuelos y ventas y genera un dataframe por marca seleccionada.
- **5_Baselined_de_modelo_de_regresion.ipynb**: Entrenamiento de modelo base de regresión lineal y evaluacion de metricas.
- **6_Extension_de_datos_de_pais**: Lee los datasets generados para cada muelle y marca, y les anade informacion de PIB y region, proveniente de otras fuentes.
- **7_Exploracion_de_hparams**: Se realiza la exploración de hiperparametros de los modelos generados.
- **8_estadisticos_de_venta_por_marca**: se generan estadisticos de ventas por cada marca.
- **9_Seleccion_de_mejores_modelos**: Se realiza la selección de los mejores modelos, sin colinealidad entre atributos.
- **10_Seleccion_de_mejores_modelos_con_colinealidad**: Se realiza la selección de los mejores modelos conservando la colinealidad.



## Archivos utils

- Archivo **univariate_utils.py**: utils para realizar el análisis univariado.
- Archivo **multivariate_utils.py**: utils para realizar el análisis multivariado.
- Archivo **avance_de_regression.ipynb**: notebook con el avance del modelo de regresión.
- Archivos **utils.py, utils_functions.py**: utils para realizar análisis de datos.
- Archivos **config.py, config_extended_columns, exploration.py, model_pruning.py** archivos para realizar configuraciones y transformaciones requeridas para los modelos.


## Carpetas


### - raw_data
Por temas de privacidad de los datos del cliente, esta carpeta no contiene los conjuntos de datos entregados por la empresa, en el link de entrega se proporciona un enlace para la descarga de los archivos en una carpeta a la cual tiene acceso el docente. Los archivos de datos que se deben guardar en la carpeta **raw_data** para poder ejecutar el notebook son:
- información Bases de datos Comercial Marca 1.xlsx
- información Bases de datos Comercial Marca 2 - 10.xlsx
- Seguimiento PAX.xlsx

Adicionalmente esta carpeta contiene los siguientes archivos:
- **Aeropuertos.csv, hdi.csv y pib.csv**: Archivos de fuentes externas que integran informacion de **País, Continente, HDI y PIB** respectivamente.
</br>

### - data 
Esta carpeta contiene los archivos generados (datasets) en los procesos de limpieza y que son utilizados para el desarrollo de los modelos.

**Archivos** 

- **clean_flights.parquet y clean_sales.parquet**: Archivos limpios de vuelos y ventas partiendo de los Exceles originales enviados por OPAIN, atendiendo a las dimensiones de calidad aprendidas en la clase.
- **muelle.parquet**: Archivo de datos para regresion agrupados por vuelo, cuyo valor de ventas esta representado por una porcion de las ventas del muelle.
- **marca{1, 2, 3, 5, 6, 7, 9, 10}.parquet**: Archivos de datos para regresion agrupados por vuelo, cuyo valor de ventas esta representado por una porcion de ventas de la marca respectiva.
- **ols_report.txt**: Reporte de resultados del modelo base, al aplicar OLS a los datos de muelle, luego de aplicar transformaciones y supuestos de regresion. 
</br>

### - extended_data
Esta carpeta contiene los mismos archivos de la **data**, a los cuales se les agregaron las columnas: **País Destino, Continente Destino, GdpPerCapitaUN y Hdi2021**.

**Archivos**

   - **muelle.parquet**: Archivo de datos para regresion agrupados por vuelo, cuyo valor de ventas esta representado por una porcion de las ventas del muelle.
   - **marca{1, 2, 3, 5, 6, 7, 9, 10}.parquet**: Archivos de datos para regresion agrupados por vuelo, cuyo valor de ventas esta representado por una porcion de ventas de la marca respectiva.
</br>

### - results

**Archivos**

- **summary.csv**: Archivo que contiene los resultados de las métricas del modelo.
</br>

### - extended_data_results

**Archivos**

- **summary.csv**: Archivo que contiene los resultados de las métricas del modelo extendido.
</br>

### - final_models

**Archivos**

- **finalModels.md**: Archivo que contiene el link a los modelos finales con y sin eliminacion de variables por linealidad.
</br>