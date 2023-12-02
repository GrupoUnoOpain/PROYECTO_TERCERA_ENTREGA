import { Flight } from "./flight.model";
import { FlightPredictionResultClass } from "./result.model";
import { DiaSemanaPredictionResult } from "./diaSemana/diaSemana.model";
import { HoraPredictionResult } from "./hora/hora.model";
import { SemanaPredictionResult } from "./semana/semana.model";
import { MesesPredictionResult } from "./mes/meses.model";
import { DiasMesPredictionResult } from "./diaMes/diasMes.model";
import { SalaPredictionResult } from "./sala/sala.model";

type ChartData = { data: number[]; label: string; backgroundColor: string | CanvasGradient; borderColor: string; borderWidth: number };

export class Utils {

    static getUniqueRows(rows: Flight[]): Flight[] {
        const uniqueRows: Flight[] = [];
        const seenRows: Record<string, boolean> = {};

        for (const row of rows) {
            const rowString = JSON.stringify(row);

            if (!seenRows[rowString]) {
                uniqueRows.push(row);
                seenRows[rowString] = true;
            }
        }

        return uniqueRows;
    }

    // Función para normalizar el valor de acuerdo al nombre de la columna
    static normalizeValue(columnName: string, value: any): any {
        // Normaliza el campo 'STD' a un objeto Date
        if (columnName.toUpperCase() === 'STD') {
            return this.dateToString(this.convertExcelSerialDateToJSDate(value));
        }
        return value;
    }

    static dateToString(date: Date): string {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'UTC'
        };

        const formatter = new Intl.DateTimeFormat('en-US', options);
        const formattedDate = formatter.format(date);

        return formattedDate.replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+) (AM|PM)/, '$3-$1-$2 $4:$5:$6');
    }

    // Función para convertir el número de serie de fecha de Excel a un objeto Date
    static convertExcelSerialDateToJSDate(serialDate: number): Date {
        const unixTimestamp = (serialDate - 25569) * 86400 * 1000;
        const date = new Date(unixTimestamp);

        // Ajusta la fecha a la zona horaria local
        date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

        return date;
    }

    static areAllAttributesFilled(flight: Flight): boolean {
        const values = Object.values(flight);
        return values.every(value => value !== null && value !== undefined);
    }

    static convertirJsonAFlightClass(registro: Flight): FlightPredictionResultClass {
        const flightPrediction = new FlightPredictionResultClass();
        flightPrediction.iataCode = registro["IATA CODE"];
        flightPrediction.destino = registro["Destino"];
        flightPrediction.tipoVuelo = registro["Tipo de vuelo"];
        flightPrediction.sala = registro["Sala"];
        flightPrediction.muelle = registro["Muelle"];
        flightPrediction.aerolinea = registro["AEROLÍNEA"];
        flightPrediction.tipoAerolinea = registro["Tipo aerolínea"];
        flightPrediction.std = registro["STD"];
        flightPrediction.horaEntera = registro["Hora entera"];
        flightPrediction.fechaDia = registro["FECHA DIA"];
        flightPrediction.pasajerosSaliendo = registro["Pasajeros saliendo"];
        flightPrediction.semana = registro["Semana"];
        flightPrediction.mes = registro["Mes"];
        flightPrediction.dia = registro["Día"];
        flightPrediction.anio = registro["Año"];
        return flightPrediction;
    }

    static convertirJsonAFlightPrediction(response: any): Map<string, FlightPredictionResultClass> {
        const flightsPredictionResultMap = new Map<string, FlightPredictionResultClass>();

        // Itera sobre las claves del objeto respuesta y crea objetos FlightPredictionResultClass
        Object.keys(response).forEach((key) => {
            const id = key; // Usa la clave original como id
            const jsonData = response[key];

            const flightPrediction = new FlightPredictionResultClass();
            flightPrediction.iataCode = jsonData["IATA CODE"];
            flightPrediction.destino = jsonData["Destino"];
            flightPrediction.tipoVuelo = jsonData["Tipo de vuelo"];
            flightPrediction.sala = jsonData["Sala"];
            flightPrediction.muelle = jsonData["Muelle"];
            flightPrediction.aerolinea = jsonData["AEROLÍNEA"];
            flightPrediction.tipoAerolinea = jsonData["Tipo aerolínea"];
            flightPrediction.std = jsonData["STD"];
            flightPrediction.horaEntera = jsonData["Hora entera"];
            flightPrediction.fechaDia = jsonData["FECHA DIA"];
            flightPrediction.pasajerosSaliendo = jsonData["Pasajeros saliendo"];
            flightPrediction.semana = jsonData["Semana"];
            flightPrediction.mes = jsonData["Mes"];
            flightPrediction.dia = jsonData["Día"];
            flightPrediction.anio = jsonData["Año"];
            flightPrediction.valorVentaMuelle = jsonData["valor_venta__muelle"];
            flightPrediction.valorVentaMarca1 = jsonData["valor_venta__marca 1"];
            flightPrediction.valorVentaMarca2 = jsonData["valor_venta__marca 2"];
            flightPrediction.valorVentaMarca3 = jsonData["valor_venta__marca 3"];
            flightPrediction.valorVentaMarca5 = jsonData["valor_venta__marca 5"];
            flightPrediction.valorVentaMarca6 = jsonData["valor_venta__marca 6"];
            flightPrediction.valorVentaMarca7 = jsonData["valor_venta__marca 7"];
            flightPrediction.valorVentaMarca9 = jsonData["valor_venta__marca 9"];
            flightPrediction.valorVentaMarca10 = jsonData["valor_venta__marca 10"];

            flightsPredictionResultMap.set(id, flightPrediction);

        });

        return flightsPredictionResultMap;
    }


    static procesarRespuestaHora(response: Record<string, Record<string, Record<string, number>>>): Map<string, Map<string, HoraPredictionResult>> {
        let horasDiaPredictionResultMap = new Map<string, Map<string, HoraPredictionResult>>();
        for (const claveExterna in response) {
            if (response.hasOwnProperty(claveExterna)) {
                const mapaInterno = response[claveExterna];
                const nuevoMapaInterno = new Map<string, HoraPredictionResult>();

                for (const claveInterna in mapaInterno) {
                    if (mapaInterno.hasOwnProperty(claveInterna)) {
                        const objeto = mapaInterno[claveInterna];
                        const horasDia = new HoraPredictionResult();
                        horasDia.h0 = objeto['0'] || 0;
                        horasDia.h1 = objeto['1'] || 0;
                        horasDia.h2 = objeto['2'] || 0;
                        horasDia.h3 = objeto['3'] || 0;
                        horasDia.h4 = objeto['4'] || 0;
                        horasDia.h5 = objeto['5'] || 0;
                        horasDia.h6 = objeto['6'] || 0;
                        horasDia.h7 = objeto['7'] || 0;
                        horasDia.h8 = objeto['8'] || 0;
                        horasDia.h9 = objeto['9'] || 0;
                        horasDia.h10 = objeto['10'] || 0;
                        horasDia.h11 = objeto['11'] || 0;
                        horasDia.h12 = objeto['12'] || 0;
                        horasDia.h13 = objeto['13'] || 0;
                        horasDia.h14 = objeto['14'] || 0;
                        horasDia.h15 = objeto['15'] || 0;
                        horasDia.h16 = objeto['16'] || 0;
                        horasDia.h17 = objeto['17'] || 0;
                        horasDia.h18 = objeto['18'] || 0;
                        horasDia.h19 = objeto['19'] || 0;
                        horasDia.h20 = objeto['20'] || 0;
                        horasDia.h21 = objeto['21'] || 0;
                        horasDia.h22 = objeto['22'] || 0;
                        horasDia.h23 = objeto['23'] || 0;

                        nuevoMapaInterno.set(claveInterna, horasDia);
                    }
                }

                horasDiaPredictionResultMap.set(claveExterna, nuevoMapaInterno);
            }
        }

        return horasDiaPredictionResultMap;
    }


    static procesarRespuestaDiaSemana(response: Record<string, Record<string, Record<string, number>>>): Map<string, Map<string, DiaSemanaPredictionResult>> {
        let diasSemanaPredictionResultMap = new Map<string, Map<string, DiaSemanaPredictionResult>>();
        for (const claveExterna in response) {
            if (response.hasOwnProperty(claveExterna)) {
                const mapaInterno = response[claveExterna];
                const nuevoMapaInterno = new Map<string, DiaSemanaPredictionResult>();

                for (const claveInterna in mapaInterno) {
                    if (mapaInterno.hasOwnProperty(claveInterna)) {
                        const objeto = mapaInterno[claveInterna];
                        const diasSemana = new DiaSemanaPredictionResult();
                        diasSemana.lunes = objeto['lunes'] || 0;
                        diasSemana.martes = objeto['martes'] || 0;
                        diasSemana.miercoles = objeto['miercoles'] || 0;
                        diasSemana.jueves = objeto['jueves'] || 0;
                        diasSemana.viernes = objeto['viernes'] || 0;
                        diasSemana.sabado = objeto['sabado'] || 0;
                        diasSemana.domingo = objeto['domingo'] || 0;

                        nuevoMapaInterno.set(claveInterna, diasSemana);
                    }
                }

                diasSemanaPredictionResultMap.set(claveExterna, nuevoMapaInterno);
            }
        }

        return diasSemanaPredictionResultMap;
    }


    static procesarRespuestaSemana(response: Record<string, Record<string, Record<string, number>>>): Map<string, Map<string, SemanaPredictionResult>> {
        let semanasPredictionResultMap = new Map<string, Map<string, SemanaPredictionResult>>();
        for (const claveExterna in response) {
            if (response.hasOwnProperty(claveExterna)) {
                const mapaInterno = response[claveExterna];
                const nuevoMapaInterno = new Map<string, SemanaPredictionResult>();

                for (const claveInterna in mapaInterno) {
                    if (mapaInterno.hasOwnProperty(claveInterna)) {
                        const objeto = mapaInterno[claveInterna];
                        const semanas = new SemanaPredictionResult();
                        semanas.s1 = objeto['1'] || 0;
                        semanas.s2 = objeto['2'] || 0;
                        semanas.s3 = objeto['3'] || 0;
                        semanas.s4 = objeto['4'] || 0;
                        semanas.s5 = objeto['5'] || 0;
                        semanas.s6 = objeto['6'] || 0;
                        semanas.s7 = objeto['7'] || 0;
                        semanas.s8 = objeto['8'] || 0;
                        semanas.s9 = objeto['9'] || 0;
                        semanas.s10 = objeto['10'] || 0;
                        semanas.s11 = objeto['11'] || 0;
                        semanas.s12 = objeto['12'] || 0;
                        semanas.s13 = objeto['13'] || 0;
                        semanas.s14 = objeto['14'] || 0;
                        semanas.s15 = objeto['15'] || 0;
                        semanas.s16 = objeto['16'] || 0;
                        semanas.s17 = objeto['17'] || 0;
                        semanas.s18 = objeto['18'] || 0;
                        semanas.s19 = objeto['19'] || 0;
                        semanas.s20 = objeto['20'] || 0;
                        semanas.s21 = objeto['21'] || 0;
                        semanas.s22 = objeto['22'] || 0;
                        semanas.s23 = objeto['23'] || 0;
                        semanas.s24 = objeto['24'] || 0;
                        semanas.s25 = objeto['25'] || 0;
                        semanas.s26 = objeto['26'] || 0;
                        semanas.s27 = objeto['27'] || 0;
                        semanas.s28 = objeto['28'] || 0;
                        semanas.s29 = objeto['29'] || 0;
                        semanas.s30 = objeto['30'] || 0;
                        semanas.s31 = objeto['31'] || 0;
                        semanas.s32 = objeto['32'] || 0;
                        semanas.s33 = objeto['33'] || 0;
                        semanas.s34 = objeto['34'] || 0;
                        semanas.s35 = objeto['35'] || 0;
                        semanas.s36 = objeto['36'] || 0;
                        semanas.s37 = objeto['37'] || 0;
                        semanas.s38 = objeto['38'] || 0;
                        semanas.s39 = objeto['29'] || 0;
                        semanas.s40 = objeto['40'] || 0;
                        semanas.s41 = objeto['41'] || 0;
                        semanas.s42 = objeto['42'] || 0;
                        semanas.s43 = objeto['43'] || 0;
                        semanas.s44 = objeto['44'] || 0;
                        semanas.s45 = objeto['45'] || 0;
                        semanas.s46 = objeto['46'] || 0;
                        semanas.s47 = objeto['47'] || 0;
                        semanas.s48 = objeto['48'] || 0;
                        semanas.s49 = objeto['49'] || 0;
                        semanas.s50 = objeto['50'] || 0;
                        semanas.s51 = objeto['51'] || 0;
                        semanas.s52 = objeto['52'] || 0;

                        nuevoMapaInterno.set(claveInterna, semanas);
                    }
                }

                semanasPredictionResultMap.set(claveExterna, nuevoMapaInterno);
            }
        }

        return semanasPredictionResultMap;
    }


    static procesarRespuestaMes(response: Record<string, Record<string, Record<string, number>>>): Map<string, Map<string, MesesPredictionResult>> {
        let mesesPredictionResultMap = new Map<string, Map<string, MesesPredictionResult>>();
        for (const claveExterna in response) {
            if (response.hasOwnProperty(claveExterna)) {
                const mapaInterno = response[claveExterna];
                const nuevoMapaInterno = new Map<string, MesesPredictionResult>();

                for (const claveInterna in mapaInterno) {
                    if (mapaInterno.hasOwnProperty(claveInterna)) {
                        const objeto = mapaInterno[claveInterna];
                        const meses = new MesesPredictionResult();
                        meses.enero = objeto['1'] || 0;
                        meses.febrero = objeto['2'] || 0;
                        meses.marzo = objeto['3'] || 0;
                        meses.abril = objeto['4'] || 0;
                        meses.mayo = objeto['5'] || 0;
                        meses.junio = objeto['6'] || 0;
                        meses.julio = objeto['7'] || 0;
                        meses.agosto = objeto['8'] || 0;
                        meses.septiembre = objeto['9'] || 0;
                        meses.octubre = objeto['10'] || 0;
                        meses.noviembre = objeto['11'] || 0;
                        meses.diciembre = objeto['12'] || 0;

                        nuevoMapaInterno.set(claveInterna, meses);
                    }
                }

                mesesPredictionResultMap.set(claveExterna, nuevoMapaInterno);
            }
        }

        return mesesPredictionResultMap;
    }


    static procesarRespuestaDiaMes(response: Record<string, Record<string, Record<string, number>>>): Map<string, Map<string, DiasMesPredictionResult>> {
        let diasMesPredictionResultMap = new Map<string, Map<string, DiasMesPredictionResult>>();
        for (const claveExterna in response) {
            if (response.hasOwnProperty(claveExterna)) {
                const mapaInterno = response[claveExterna];
                const nuevoMapaInterno = new Map<string, DiasMesPredictionResult>();

                for (const claveInterna in mapaInterno) {
                    if (mapaInterno.hasOwnProperty(claveInterna)) {
                        const objeto = mapaInterno[claveInterna];
                        const dias = new DiasMesPredictionResult();
                        dias.d1 = objeto['1'] || 0;
                        dias.d2 = objeto['2'] || 0;
                        dias.d3 = objeto['3'] || 0;
                        dias.d4 = objeto['4'] || 0;
                        dias.d5 = objeto['5'] || 0;
                        dias.d6 = objeto['6'] || 0;
                        dias.d7 = objeto['7'] || 0;
                        dias.d8 = objeto['8'] || 0;
                        dias.d9 = objeto['9'] || 0;
                        dias.d10 = objeto['10'] || 0;
                        dias.d11 = objeto['11'] || 0;
                        dias.d12 = objeto['12'] || 0;
                        dias.d13 = objeto['13'] || 0;
                        dias.d14 = objeto['14'] || 0;
                        dias.d15 = objeto['15'] || 0;
                        dias.d16 = objeto['16'] || 0;
                        dias.d17 = objeto['17'] || 0;
                        dias.d18 = objeto['18'] || 0;
                        dias.d19 = objeto['19'] || 0;
                        dias.d20 = objeto['20'] || 0;
                        dias.d21 = objeto['21'] || 0;
                        dias.d22 = objeto['22'] || 0;
                        dias.d23 = objeto['23'] || 0;
                        dias.d24 = objeto['24'] || 0;
                        dias.d25 = objeto['25'] || 0;
                        dias.d26 = objeto['26'] || 0;
                        dias.d27 = objeto['27'] || 0;
                        dias.d28 = objeto['28'] || 0;
                        dias.d29 = objeto['29'] || 0;
                        dias.d30 = objeto['30'] || 0;
                        dias.d31 = objeto['31'] || 0;

                        nuevoMapaInterno.set(claveInterna, dias);
                    }
                }

                diasMesPredictionResultMap.set(claveExterna, nuevoMapaInterno);
            }
        }

        return diasMesPredictionResultMap;
    }


    static procesarRespuestaSala(response: Record<string, Record<string, Record<string, number>>>): Map<string, Map<string, SalaPredictionResult>> {
        let salasPredictionResultMap = new Map<string, Map<string, SalaPredictionResult>>();
        for (const claveExterna in response) {
            if (response.hasOwnProperty(claveExterna)) {
                const mapaInterno = response[claveExterna];
                const nuevoMapaInterno = new Map<string, SalaPredictionResult>();

                for (const claveInterna in mapaInterno) {
                    if (mapaInterno.hasOwnProperty(claveInterna)) {
                        const objeto = mapaInterno[claveInterna];
                        const salas = new SalaPredictionResult();
                        salas.a1 = objeto['a1'] || 0;
                        salas.a2 = objeto['a2'] || 0;
                        salas.a3 = objeto['a3'] || 0;
                        salas.a4 = objeto['a4'] || 0;
                        salas.a5 = objeto['a5'] || 0;
                        salas.a6 = objeto['a6'] || 0;
                        salas.a8 = objeto['a8'] || 0;
                        salas.a10 = objeto['a10'] || 0;
                        salas.a11 = objeto['a11'] || 0;
                        salas.a12 = objeto['a12'] || 0;
                        salas.a13 = objeto['a13'] || 0;
                        salas.a14 = objeto['a14'] || 0;
                        salas.a7a = objeto['a7a'] || 0;
                        salas.a7b = objeto['a7b'] || 0;
                        salas.a7c = objeto['a7c'] || 0;
                        salas.a9a = objeto['a9a'] || 0;
                        salas.a9b = objeto['a9b'] || 0;
                        salas.rori = objeto['rori'] || 0;
                        salas.en = objeto['en'] || 0;

                        nuevoMapaInterno.set(claveInterna, salas);
                    }
                }

                salasPredictionResultMap.set(claveExterna, nuevoMapaInterno);
            }
        }

        return salasPredictionResultMap;
    }


    static createGradient(startColor: string, endColor: string): CanvasGradient | string {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (ctx) {
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, startColor);
            gradient.addColorStop(1, endColor);

            return gradient;
        }

        return startColor;
    }

    static createGradient2(startColor: string, endColor: string): CanvasGradient | string {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (ctx) {
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, startColor);
            gradient.addColorStop(1, endColor);

            return gradient;
        }

        return startColor;
    }

    static loadSalaData(resultSalaData: SalaPredictionResult): [string[], ChartData[]] {
        const barChartLabels: string[] = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a8', 'a10', 'a11', 'a12', 'a13', 'a14', 'a7a', 'a7b', 'a7c', 'a9a', 'a9b', 'rori', 'en'];
        const barChartData: ChartData[] = [
            {
                data: [
                    resultSalaData?.a1,
                    resultSalaData?.a2,
                    resultSalaData?.a3,
                    resultSalaData?.a4,
                    resultSalaData?.a5,
                    resultSalaData?.a6,
                    resultSalaData?.a8,
                    resultSalaData?.a10,
                    resultSalaData?.a11,
                    resultSalaData?.a12,
                    resultSalaData?.a13,
                    resultSalaData?.a14,
                    resultSalaData?.a7a,
                    resultSalaData?.a7b,
                    resultSalaData?.a7c,
                    resultSalaData?.a9a,
                    resultSalaData?.a9b,
                    resultSalaData?.rori,
                    resultSalaData?.en,
                ],
                label: 'Salas del Muelle',
                backgroundColor: Utils.createGradient2('#E6E6FA', '#7B68EE'),
                borderColor: '#7B68EE',
                borderWidth: 1,
            },
        ];

        return [barChartLabels, barChartData];
    }

    static loadHoraData(resultHoraData: HoraPredictionResult): [string[], ChartData[]] {
        let barChartLabels: string[] = [];
        for (let i = 0; i <= 23; i++) {
            barChartLabels.push(i.toString());
        }

        const barChartData = [
            {
                data: [
                    resultHoraData?.h0,
                    resultHoraData?.h1,
                    resultHoraData?.h2,
                    resultHoraData?.h3,
                    resultHoraData?.h4,
                    resultHoraData?.h5,
                    resultHoraData?.h6,
                    resultHoraData?.h7,
                    resultHoraData?.h8,
                    resultHoraData?.h9,
                    resultHoraData?.h10,
                    resultHoraData?.h11,
                    resultHoraData?.h12,
                    resultHoraData?.h13,
                    resultHoraData?.h14,
                    resultHoraData?.h15,
                    resultHoraData?.h16,
                    resultHoraData?.h17,
                    resultHoraData?.h18,
                    resultHoraData?.h19,
                    resultHoraData?.h20,
                    resultHoraData?.h21,
                    resultHoraData?.h22,
                    resultHoraData?.h23
                ],
                label: 'Horas del Día',
                backgroundColor: Utils.createGradient('#FFE4FF', '#FFAEFD'),
                borderColor: '#FFAEFD',
                borderWidth: 1
            }
        ];
        return [barChartLabels, barChartData];
    }


    static loadDiaSemanaData(resultDiaSemanaData: DiaSemanaPredictionResult): [string[], ChartData[]] {
        let barChartLabels: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const barChartData = [
            {
                data: [
                    resultDiaSemanaData?.lunes,
                    resultDiaSemanaData?.martes,
                    resultDiaSemanaData?.miercoles,
                    resultDiaSemanaData?.jueves,
                    resultDiaSemanaData?.viernes,
                    resultDiaSemanaData?.sabado,
                    resultDiaSemanaData?.domingo,
                ],
                label: 'Días de la semana',
                backgroundColor: Utils.createGradient('#E6E6FA', '#7B68EE'),
                borderColor: '#7B68EE',
                borderWidth: 1
            }
        ];
        return [barChartLabels, barChartData];
    }


    static loadSemanaData(resultSemanaData: SemanaPredictionResult): [string[], ChartData[]] {
        let barChartLabels: string[] = [];
        for (let i = 1; i <= 52; i++) {
            barChartLabels.push(i.toString());
        }

        const barChartData = [
            {
                data: [
                    resultSemanaData?.s1,
                    resultSemanaData?.s2,
                    resultSemanaData?.s3,
                    resultSemanaData?.s4,
                    resultSemanaData?.s5,
                    resultSemanaData?.s6,
                    resultSemanaData?.s7,
                    resultSemanaData?.s8,
                    resultSemanaData?.s9,
                    resultSemanaData?.s10,
                    resultSemanaData?.s11,
                    resultSemanaData?.s12,
                    resultSemanaData?.s13,
                    resultSemanaData?.s14,
                    resultSemanaData?.s15,
                    resultSemanaData?.s16,
                    resultSemanaData?.s17,
                    resultSemanaData?.s18,
                    resultSemanaData?.s19,
                    resultSemanaData?.s20,
                    resultSemanaData?.s21,
                    resultSemanaData?.s22,
                    resultSemanaData?.s23,
                    resultSemanaData?.s24,
                    resultSemanaData?.s25,
                    resultSemanaData?.s26,
                    resultSemanaData?.s27,
                    resultSemanaData?.s28,
                    resultSemanaData?.s29,
                    resultSemanaData?.s30,
                    resultSemanaData?.s31,
                    resultSemanaData?.s32,
                    resultSemanaData?.s33,
                    resultSemanaData?.s34,
                    resultSemanaData?.s35,
                    resultSemanaData?.s36,
                    resultSemanaData?.s37,
                    resultSemanaData?.s38,
                    resultSemanaData?.s39,
                    resultSemanaData?.s40,
                    resultSemanaData?.s41,
                    resultSemanaData?.s42,
                    resultSemanaData?.s43,
                    resultSemanaData?.s44,
                    resultSemanaData?.s45,
                    resultSemanaData?.s46,
                    resultSemanaData?.s47,
                    resultSemanaData?.s48,
                    resultSemanaData?.s49,
                    resultSemanaData?.s50,
                    resultSemanaData?.s51,
                    resultSemanaData?.s52
                ],
                label: 'Semanas del Año',
                backgroundColor: Utils.createGradient('#F0F8FF', '#00BFFF'),
                borderColor: '#00BFFF',
                borderWidth: 1
            }
        ];
        return [barChartLabels, barChartData];
    }


    static loadMesData(resultMesesData: MesesPredictionResult): [string[], ChartData[]] {
        let barChartLabels: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const barChartData = [
            {
                data: [
                    resultMesesData?.enero,
                    resultMesesData?.febrero,
                    resultMesesData?.marzo,
                    resultMesesData?.abril,
                    resultMesesData?.mayo,
                    resultMesesData?.junio,
                    resultMesesData?.julio,
                    resultMesesData?.agosto,
                    resultMesesData?.septiembre,
                    resultMesesData?.octubre,
                    resultMesesData?.noviembre,
                    resultMesesData?.diciembre
                ],
                label: 'Meses del Año',
                backgroundColor: Utils.createGradient('#FFE4FF', '#FFAEFD'),
                borderColor: '#FFAEFD',
                borderWidth: 1
            }
        ];
        return [barChartLabels, barChartData];
    }


    static loadDiaMesData(resultDiaMesData: DiasMesPredictionResult): [string[], ChartData[]] {
        let barChartLabels: string[] = [];
        for (let i = 1; i <= 31; i++) {
            barChartLabels.push(i.toString());
        }

        const barChartData = [
            {
                data: [
                    resultDiaMesData?.d1,
                    resultDiaMesData?.d2,
                    resultDiaMesData?.d3,
                    resultDiaMesData?.d4,
                    resultDiaMesData?.d5,
                    resultDiaMesData?.d6,
                    resultDiaMesData?.d7,
                    resultDiaMesData?.d8,
                    resultDiaMesData?.d9,
                    resultDiaMesData?.d10,
                    resultDiaMesData?.d11,
                    resultDiaMesData?.d12,
                    resultDiaMesData?.d13,
                    resultDiaMesData?.d14,
                    resultDiaMesData?.d15,
                    resultDiaMesData?.d16,
                    resultDiaMesData?.d17,
                    resultDiaMesData?.d18,
                    resultDiaMesData?.d19,
                    resultDiaMesData?.d20,
                    resultDiaMesData?.d21,
                    resultDiaMesData?.d22,
                    resultDiaMesData?.d23,
                    resultDiaMesData?.d24,
                    resultDiaMesData?.d25,
                    resultDiaMesData?.d26,
                    resultDiaMesData?.d27,
                    resultDiaMesData?.d28,
                    resultDiaMesData?.d29,
                    resultDiaMesData?.d30,
                    resultDiaMesData?.d31,
                ],
                label: 'Días del Mes',
                backgroundColor: Utils.createGradient('#E6E6FA', '#7B68EE'),
                borderColor: '#7B68EE',
                borderWidth: 1
            }
        ];
        return [barChartLabels, barChartData];
    }

}