import { Component, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as xls from 'xlsx';
import { Flight } from '../../../models/flight.model';
import { StateService } from 'src/app/services/state.service';
import { ModelService } from 'src/app/services/model.service';
import { FlightPredictionResultClass } from 'src/app/models/result.model';
import { ResultsPredictComponent } from './results-predict/results-predict.component';
import { Utils } from 'src/app/models/utils';
import { DiaSemanaPredictionResult } from 'src/app/models/diaSemana/diaSemana.model';
import { HoraPredictionResult } from 'src/app/models/hora/hora.model';
import { SemanaPredictionResult } from 'src/app/models/semana/semana.model';
import { MesesPredictionResult } from 'src/app/models/mes/meses.model';
import { DiasMesPredictionResult } from 'src/app/models/diaMes/diasMes.model';
import { SalaPredictionResult } from 'src/app/models/sala/sala.model';
import { ResultsBarcharComponent } from './results-barchar/results-barchar.component';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.css'],
  providers: [DatePipe]
})
export class ModelComponent {
  flights: Array<Flight> = [];

  selectedPrediction: string = '';
  selectedMuelleMarca: string = '';

  elementSelected: FlightPredictionResultClass | null = null;
  salaElementSelected: SalaPredictionResult | null = null;
  horaElementSelected: HoraPredictionResult | null = null;
  diaSemanaElementSelected: DiaSemanaPredictionResult | null = null;
  semanaElementSelected: SemanaPredictionResult | null = null;
  mesElementSelected: MesesPredictionResult | null = null;
  diaMesElementSelected: DiasMesPredictionResult | null = null;

  flightsPredictionResult: Map<string, FlightPredictionResultClass> | null = null;
  salasPredictionResult: Map<string, Map<string, SalaPredictionResult>> | null = null;
  horasPredictionResult: Map<string, Map<string, HoraPredictionResult>> | null = null;
  diasSemanaPredictionResult: Map<string, Map<string, DiaSemanaPredictionResult>> | null = null;
  semanasPredictionResult: Map<string, Map<string, SemanaPredictionResult>> | null = null;
  mesesPredictionResult: Map<string, Map<string, MesesPredictionResult>> | null = null;
  diasMesPredictionResult: Map<string, Map<string, DiasMesPredictionResult>> | null = null;

  @ViewChild('appResultsPredict') appResultsPredict: ResultsPredictComponent | undefined;
  @ViewChild('appResultsBarchar') appResultsBarchar: ResultsBarcharComponent | undefined;

  isLoading: boolean = false;

  constructor(public stateService: StateService, private datePipe: DatePipe, private model: ModelService) {
    this.flights = stateService.getFlights();
    this.selectedPrediction = stateService.getSelectedPrediction();
    this.selectedMuelleMarca = stateService.getSelectedMuelleMarca();

    this.elementSelected = stateService.getElementSelected();
    this.salaElementSelected = stateService.getSalaElementSelected();
    this.horaElementSelected = stateService.getHoraElementSelected();
    this.diaSemanaElementSelected = stateService.getDiaSemanaElementSelected();
    this.semanaElementSelected = stateService.getSemanaElementSelected();
    this.mesElementSelected = stateService.getMesElementSelected();
    this.diaMesElementSelected = stateService.getDiaMesElementSelected();

    this.flightsPredictionResult = stateService.getFlightsPredictionResult();
    this.salasPredictionResult = stateService.getSalasPredictionResult();
    this.horasPredictionResult = stateService.getHorasPredictionResult();
    this.diasSemanaPredictionResult = stateService.getDiasSemanaPredictionResult();
    this.semanasPredictionResult = stateService.getSemanasPredictionResult();
    this.mesesPredictionResult = stateService.getMesesPredictionResult();
    this.diasMesPredictionResult = stateService.getDiasMesPredictionResult();

    this.isLoading = stateService.getIsLoading();
  }

  readExcelFile(event: any) {
    this.cleanData();

    const file = event.target.files[0];
    let fileReader = new FileReader();

    fileReader.readAsArrayBuffer(file);

    fileReader.onload = () => {
      let data = fileReader.result;
      let workbook = xls.read(data, { type: 'array' });

      const sheetname = workbook.SheetNames[0];
      const sheet1 = workbook.Sheets[sheetname];

      const rawData: Flight[] = xls.utils.sheet_to_json(sheet1, { raw: true }) as Flight[];

      const uniqueRows: Flight[] = Utils.getUniqueRows(rawData);

      const filteredUniqueRows = uniqueRows.filter(flight => {
        const attributesWithValues = Object.values(flight).filter(value => value !== null && value !== undefined);
        return attributesWithValues.length >= 15;
      });
      
      const flightsWithId: Flight[] = filteredUniqueRows.map((flight, index) => {
        return { ...flight, id: index };
      });

      const normalizedData: Flight[] = flightsWithId.map((row: Flight) => {
        const normalizedRow: any = {};
        Object.keys(row).forEach(key => {
          let normalizedValue = row[key];
          normalizedRow[key] = Utils.normalizeValue(key, normalizedValue);
        });

        return normalizedRow as Flight;
      });

      this.stateService.setFlights(normalizedData);
      this.flights = this.stateService.getFlights();
    };
  }

  getColumnNames(): string[] {
    if (this.flights.length > 0) {
      return Object.keys(this.flights[0]);
    }
    return [];
  }

  public formatDate(value: any): string | Date {
    if (value instanceof Date) {
      return this.datePipe.transform(value, 'yyyy-MM-dd HH:mm:ss') || value;
    }
    return value;
  }

  seeDetail(registro: Flight) {
    if (this.isModelSelected()) {
      let nuevoRegistro = Utils.convertirJsonAFlightClass(registro);
      nuevoRegistro.muelleMarca = this.selectedMuelleMarca;
      this.stateService.setRegisterSelected(nuevoRegistro);

      switch (this.selectedPrediction) {
        case this.stateService.getGeneral():
          this.seeDetailPredict(registro);
          break;

        case this.stateService.getSala():
          this.seeDetailSala(registro);
          break;

        case this.stateService.getHora():
          this.seeDetailHora(registro);
          break;

        case this.stateService.getDiaSemana():
          this.seeDetailDiaSemana(registro);
          break;

        case this.stateService.getSemana():
          this.seeDetailSemana(registro);
          break;

        case this.stateService.getMes():
          this.seeDetailMes(registro);
          break;

        case this.stateService.getDiaMes():
          this.seeDetailDiaMes(registro);
          break;
      }
    }
  }

  seeDetailPredict(registro: Flight) {
    const resultado = this.flightsPredictionResult?.get(registro["id"].toString());
    this.elementSelected = resultado !== undefined ? resultado : null;
    this.stateService.setElementSelected(this.elementSelected !== null ? this.elementSelected : null);
  }

  seeDetailSala(registro: Flight) {
    const resultado = this.salasPredictionResult?.get(registro["id"].toString())?.get(this.selectedMuelleMarca);
    this.salaElementSelected = resultado !== undefined ? resultado : null;
    this.stateService.setSalaElementSelected(this.salaElementSelected !== null ? this.salaElementSelected : null);
  }

  seeDetailHora(registro: Flight) {
    const resultado = this.horasPredictionResult?.get(registro["id"].toString())?.get(this.selectedMuelleMarca);
    this.horaElementSelected = resultado !== undefined ? resultado : null;
    this.stateService.setHoraElementSelected(this.horaElementSelected !== null ? this.horaElementSelected : null);
  }

  seeDetailDiaSemana(registro: Flight) {
    const resultado = this.diasSemanaPredictionResult?.get(registro["id"].toString())?.get(this.selectedMuelleMarca);
    this.diaSemanaElementSelected = resultado !== undefined ? resultado : null;
    this.stateService.setDiaSemanaElementSelected(this.diaSemanaElementSelected !== null ? this.diaSemanaElementSelected : null);
  }

  seeDetailSemana(registro: Flight) {
    const resultado = this.semanasPredictionResult?.get(registro["id"].toString())?.get(this.selectedMuelleMarca);
    this.semanaElementSelected = resultado !== undefined ? resultado : null;
    this.stateService.setSemanaElementSelected(this.semanaElementSelected !== null ? this.semanaElementSelected : null);
  }

  seeDetailMes(registro: Flight) {
    const resultado = this.mesesPredictionResult?.get(registro["id"].toString())?.get(this.selectedMuelleMarca);
    this.mesElementSelected = resultado !== undefined ? resultado : null;
    this.stateService.setMesElementSelected(this.mesElementSelected !== null ? this.mesElementSelected : null);
  }

  seeDetailDiaMes(registro: Flight) {
    const resultado = this.diasMesPredictionResult?.get(registro["id"].toString())?.get(this.selectedMuelleMarca);
    this.diaMesElementSelected = resultado !== undefined ? resultado : null;
    this.stateService.setDiaMesElementSelected(this.diaMesElementSelected !== null ? this.diaMesElementSelected : null);
  }

  cleanData() {
    this.stateService.setSelectedPrediction('');
    this.selectedPrediction = this.stateService.getSelectedPrediction();
    this.changeModel();    
  }
  
  onModalShow(): void {
    if (this.isModelSelected()) {
      switch (this.selectedPrediction) {
        case this.stateService.getGeneral():
          if (this.appResultsPredict) {
            this.appResultsPredict.refrescarDatos();
          }
          break;

        case this.stateService.getSala():
          if (this.appResultsBarchar) {
            let resultSalaData = this.stateService.getSalaElementSelected();
            if (resultSalaData !== null) {
              const [etiquetas, datos] = Utils.loadSalaData(resultSalaData);
              this.stateService.barChartData = datos;
              this.stateService.barChartLabels = etiquetas;
              this.appResultsBarchar.reloadData();
            }
          }
          break;

        case this.stateService.getHora():
          if (this.appResultsBarchar) {
            let resultSalaData = this.stateService.getHoraElementSelected();
            if (resultSalaData !== null) {
              const [etiquetas, datos] = Utils.loadHoraData(resultSalaData);
              this.stateService.barChartData = datos;
              this.stateService.barChartLabels = etiquetas;
              this.appResultsBarchar.reloadData();
            }
          }
          break;

        case this.stateService.getDiaSemana():
          if (this.appResultsBarchar) {
            let resultDiaSemanaData = this.stateService.getDiaSemanaElementSelected();
            if (resultDiaSemanaData !== null) {
              const [etiquetas, datos] = Utils.loadDiaSemanaData(resultDiaSemanaData);
              this.stateService.barChartData = datos;
              this.stateService.barChartLabels = etiquetas;
              this.appResultsBarchar.reloadData();
            }
          }
          break;

        case this.stateService.getSemana():
          if (this.appResultsBarchar) {
            let resultSemanaData = this.stateService.getSemanaElementSelected();
            if (resultSemanaData !== null) {
              const [etiquetas, datos] = Utils.loadSemanaData(resultSemanaData);
              this.stateService.barChartData = datos;
              this.stateService.barChartLabels = etiquetas;
              this.appResultsBarchar.reloadData();
            }
          }
          break;

        case this.stateService.getMes():
          if (this.appResultsBarchar) {
            let resultMesesSemanaData = this.stateService.getMesElementSelected();
            if (resultMesesSemanaData !== null) {
              const [etiquetas, datos] = Utils.loadMesData(resultMesesSemanaData);
              this.stateService.barChartData = datos;
              this.stateService.barChartLabels = etiquetas;
              this.appResultsBarchar.reloadData();
            }
          }          
          break;

        case this.stateService.getDiaMes():
          if (this.appResultsBarchar) {
            let resultDiaMesData = this.stateService.getDiaMesElementSelected();
            if (resultDiaMesData !== null) {
              const [etiquetas, datos] = Utils.loadDiaMesData(resultDiaMesData);
              this.stateService.barChartData = datos;
              this.stateService.barChartLabels = etiquetas;
              this.appResultsBarchar.reloadData();
            }
          }   
          break;
      }
    }
  }

  isDataEmpty(): boolean {
    return !this.flights || this.flights.length === 0;
  }

  isDataLoaded(): boolean {
    return this.flights !== null && this.flights !== undefined && this.flights.length > 0;
  }

  isModelSelected(): boolean {
    return this.selectedPrediction !== null && this.selectedPrediction.trim() !== '';
  }

  isMuelleMarcaSelected(): boolean {
    return this.selectedMuelleMarca !== null && this.selectedMuelleMarca.trim() !== '';
  }

  isSublistVisible(): boolean {
    return this.isDataLoaded() && (this.isModelSelected() && this.selectedPrediction !== 'predict');
  }

  isRunVisible(): boolean {
    return this.isDataLoaded() && (this.isModelSelected() && (this.isMuelleMarcaSelected() || this.selectedPrediction == 'predict'));
  }

  isDetalleVisible(): boolean {
    if (this.isModelSelected()) {
      switch (this.selectedPrediction) {
        case this.stateService.getGeneral():
          return this.flightsPredictionResult !== null && this.flightsPredictionResult !== undefined && this.flightsPredictionResult.size > 0;
        
        case this.stateService.getSala():
          return this.salasPredictionResult !== null && this.salasPredictionResult !== undefined && this.salasPredictionResult.size > 0;

        case this.stateService.getHora():
          return this.horasPredictionResult !== null && this.horasPredictionResult !== undefined && this.horasPredictionResult.size > 0;
          
        case this.stateService.getDiaSemana():
          return this.diasSemanaPredictionResult !== null && this.diasSemanaPredictionResult !== undefined && this.diasSemanaPredictionResult.size > 0;
        
        case this.stateService.getSemana():
          return this.semanasPredictionResult !== null && this.semanasPredictionResult !== undefined && this.semanasPredictionResult.size > 0;
        
        case this.stateService.getMes():
          return this.mesesPredictionResult !== null && this.mesesPredictionResult !== undefined && this.mesesPredictionResult.size > 0;
        
        case this.stateService.getDiaMes():
          return this.diasMesPredictionResult !== null && this.diasMesPredictionResult !== undefined && this.diasMesPredictionResult.size > 0;
      }
    } 
    return false;
  }

  changeModel() {
    this.stateService.setSelectedMuelleMarca('');
    this.selectedMuelleMarca = this.stateService.getSelectedMuelleMarca();

    this.stateService.setSalasPredictionResult(null);
    this.salasPredictionResult = this.stateService.getSalasPredictionResult();

    this.stateService.setFlightsPredictionResult(null);
    this.flightsPredictionResult = this.stateService.getFlightsPredictionResult();

    this.stateService.setHorasPredictionResult(null);
    this.horasPredictionResult = this.stateService.getHorasPredictionResult();
    
    this.stateService.setDiasSemanaPredictionResult(null);
    this.diasSemanaPredictionResult = this.stateService.getDiasSemanaPredictionResult();

    this.stateService.setSemanasPredictionResult(null);
    this.semanasPredictionResult = this.stateService.getSemanasPredictionResult();

    this.stateService.setMesesPredictionResult(null);
    this.mesesPredictionResult = this.stateService.getMesesPredictionResult();

    this.stateService.setDiasMesPredictionResult(null);
    this.diasMesPredictionResult = this.stateService.getDiasMesPredictionResult();
  }

  callModel() {
    this.stateService.setIsLoading(true);
    this.isLoading = this.stateService.getIsLoading();

    this.model.predict(this.flights, this.selectedPrediction).subscribe(
      (response) => {
        this.handleModelResult(response, this.selectedPrediction);
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      },
      () => {
        this.stateService.setIsLoading(false);
        this.isLoading = this.stateService.getIsLoading();
      }
    );

  }

  handleModelResult(response: any, modelSelected: string): void {
    this.stateService.setSelectedPrediction(this.selectedPrediction);
    switch (modelSelected) {
      case this.stateService.getGeneral():
        this.predict(response);
        break;
      case this.stateService.getSala():
        this.sala(response);
        break;
      case this.stateService.getHora():
        this.hora(response);
        break;
      case this.stateService.getDiaSemana():
        this.diaSemana(response);
        break;
      case this.stateService.getSemana():
        this.semana(response);
        break;
      case this.stateService.getMes():
        this.mes(response);
        break;
      case this.stateService.getDiaMes():
        this.diaMes(response);
        break;
    }
  }

  predict(response: any) {
    const flightsPredictionResultMap = Utils.convertirJsonAFlightPrediction(response);
    this.stateService.setFlightsPredictionResult(flightsPredictionResultMap);
    this.flightsPredictionResult = this.stateService.getFlightsPredictionResult();
  }

  sala(response: any) {
    const salasPredictionResultMap = Utils.procesarRespuestaSala(response);
    this.stateService.setSalasPredictionResult(salasPredictionResultMap);
    this.salasPredictionResult = this.stateService.getSalasPredictionResult();
  }

  hora(response: any) {
    const horasPredictionResultMap = Utils.procesarRespuestaHora(response);
    this.stateService.setHorasPredictionResult(horasPredictionResultMap);
    this.horasPredictionResult = this.stateService.getHorasPredictionResult();
  }

  diaSemana(response: any) {
    const diasSemanaPredictionResultMap = Utils.procesarRespuestaDiaSemana(response);
    this.stateService.setDiasSemanaPredictionResult(diasSemanaPredictionResultMap);
    this.diasSemanaPredictionResult = this.stateService.getDiasSemanaPredictionResult();
  }

  semana(response: any) {
    const semanasPredictionResultMap = Utils.procesarRespuestaSemana(response);
    this.stateService.setSemanasPredictionResult(semanasPredictionResultMap);
    this.semanasPredictionResult = this.stateService.getSemanasPredictionResult();
  }

  mes(response: any) {
    const mesesPredictionResultMap = Utils.procesarRespuestaMes(response);
    this.stateService.setMesesPredictionResult(mesesPredictionResultMap);
    this.mesesPredictionResult = this.stateService.getMesesPredictionResult();
  }

  diaMes(response: any) {
    const diasMesPredictionResultMap = Utils.procesarRespuestaDiaMes(response);
    this.stateService.setDiasMesPredictionResult(diasMesPredictionResultMap);
    this.diasMesPredictionResult = this.stateService.getDiasMesPredictionResult();
  }

}
