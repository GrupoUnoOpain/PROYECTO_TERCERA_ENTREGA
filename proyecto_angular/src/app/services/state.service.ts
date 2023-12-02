import { Injectable } from '@angular/core';
import { Flight } from '../models/flight.model';
import { FlightPredictionResultClass } from '../models/result.model';
import { DiaSemanaPredictionResult } from '../models/diaSemana/diaSemana.model';
import { HoraPredictionResult } from '../models/hora/hora.model';
import { SemanaPredictionResult } from '../models/semana/semana.model';
import { MesesPredictionResult } from '../models/mes/meses.model';
import { DiasMesPredictionResult } from '../models/diaMes/diasMes.model';
import { SalaPredictionResult } from '../models/sala/sala.model';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private flights: Array<Flight> = [];
  private selectedPrediction: string = '';
  private selectedMuelleMarca: string = '';

  private general: string = 'predict';
  private sala: string = 'analyze_sala';
  private hora: string = 'analyze_hour';
  private diaSemana: string = 'analyze_week_day';
  private semana: string = 'analyze_week';
  private mes: string = 'analyze_month';
  private diaMes: string = 'analyze_month_day';

  private predictions = [
    { name: 'General', value: this.general },
    { name: 'Sala', value: this.sala },
    { name: 'Hora', value: this.hora },
    { name: 'Día de la semana', value: this.diaSemana },
    { name: 'Semana del año', value: this.semana },
    { name: 'Mes', value: this.mes },
    { name: 'Día del Mes', value: this.diaMes }
  ];

  private muelleMarca = [
    { value: 'muelle', name: 'Muelle' },
    { value: 'marca 1', name: 'Marca 1' },
    { value: 'marca 2', name: 'Marca 2' },
    { value: 'marca 3', name: 'Marca 3' },
    { value: 'marca 5', name: 'Marca 5' },
    { value: 'marca 6', name: 'Marca 6' },
    { value: 'marca 7', name: 'Marca 7' },
    { value: 'marca 9', name: 'Marca 9' },
    { value: 'marca 10', name: 'Marca 10' },
  ];

  private registerSelected: FlightPredictionResultClass | null = null;
  private elementSelected: FlightPredictionResultClass | null = null;
  private salaElementSelected: SalaPredictionResult | null = null;
  private horaElementSelected: HoraPredictionResult | null = null;
  private diaSemanaElementSelected: DiaSemanaPredictionResult | null = null;
  private semanaElementSelected: SemanaPredictionResult | null = null;
  private mesElementSelected: MesesPredictionResult | null = null;
  private diaMesElementSelected: DiasMesPredictionResult | null = null;

  private flightsPredictionResult: Map<string, FlightPredictionResultClass> | null = null;
  private salasPredictionResult: Map<string, Map<string, SalaPredictionResult>> | null = null;
  private horasPredictionResult:  Map<string, Map<string, HoraPredictionResult>> | null = null;
  private diasSemanaPredictionResult: Map<string, Map<string, DiaSemanaPredictionResult>> | null = null;
  private semanasPredictionResult: Map<string, Map<string, SemanaPredictionResult>> | null = null;
  private mesesPredictionResult: Map<string, Map<string, MesesPredictionResult>> | null = null;
  private diasMesPredictionResult: Map<string, Map<string, DiasMesPredictionResult>> | null = null;

  private isLoading: boolean = false;

  private _barChartData: any[] = [];
  private _barChartLabels: string[] = [];

  getFlights(): Array<Flight> {
    return this.flights;
  }

  setFlights(value: Array<Flight>): void {
    this.flights = value;
  }

  getSelectedPrediction(): string {
    return this.selectedPrediction;
  }

  setSelectedPrediction(value: string): void {
    this.selectedPrediction = value;
  }

  getSelectedMuelleMarca(): string {
    return this.selectedMuelleMarca;
  }

  setSelectedMuelleMarca(value: string): void {
    this.selectedMuelleMarca = value;
  }

  getRegisterSelected(): FlightPredictionResultClass | null {
    return this.registerSelected;
  }

  setRegisterSelected(value: FlightPredictionResultClass | null): void {
    this.registerSelected = value;
  }

  getElementSelected(): FlightPredictionResultClass | null {
    return this.elementSelected;
  }

  setElementSelected(value: FlightPredictionResultClass | null): void {
    this.elementSelected = value;
  }

  getDiaSemanaElementSelected(): DiaSemanaPredictionResult | null {
    return this.diaSemanaElementSelected;
  }

  setDiaSemanaElementSelected(value: DiaSemanaPredictionResult | null): void {
    this.diaSemanaElementSelected = value;
  }

  getGeneral(): string {
    return this.general;
  }

  setGeneral(value: string): void {
    this.general = value;
  }

  getSala(): string {
    return this.sala;
  }

  setSala(value: string): void {
    this.sala = this.sala;
  }

  getHora(): string {
    return this.hora;
  }

  setHora(value: string): void {
    this.hora = value;
  }

  getDiaSemana(): string {
    return this.diaSemana;
  }

  setDiaSemana(value: string): void {
    this.diaSemana = value;
  }

  getSemana(): string {
    return this.semana;
  }

  setSemana(value: string): void {
    this.semana = value;
  }

  getMes(): string {
    return this.mes;
  }

  setMes(value: string): void {
    this.mes = value;
  }

  getDiaMes(): string {
    return this.diaMes;
  }

  setDiaMes(value: string): void {
    this.diaMes = value;
  }

  getPredictions(): any[] {
    return this.predictions;
  }

  setPredictions(value: any[]): void {
    this.predictions = value;
  }

  getMuelleMarca(): any[] {
    return this.muelleMarca;
  }

  setMuelleMarca(value: any[]): void {
    this.muelleMarca = value;
  }

  getSalaElementSelected(): SalaPredictionResult | null {
    return this.salaElementSelected;
  }

  setSalaElementSelected(value: SalaPredictionResult | null) {
    this.salaElementSelected = value;
  }

  getHoraElementSelected(): HoraPredictionResult | null {
    return this.horaElementSelected;
  }

  setHoraElementSelected(value: HoraPredictionResult | null) {
      this.horaElementSelected = value;
  }

  getSemanaElementSelected(): SemanaPredictionResult | null {
    return this.semanaElementSelected;
  }

  setSemanaElementSelected(value: SemanaPredictionResult | null) {
      this.semanaElementSelected = value;
  }

  getMesElementSelected(): MesesPredictionResult | null {
    return this.mesElementSelected;
  }

  setMesElementSelected(value: MesesPredictionResult | null) {
    this.mesElementSelected = value;
  }

  getDiaMesElementSelected(): DiasMesPredictionResult | null {
    return this.diaMesElementSelected;
  }

  setDiaMesElementSelected(value: DiasMesPredictionResult | null) {
    this.diaMesElementSelected = value;
  }

  getFlightsPredictionResult(): Map<string, FlightPredictionResultClass> | null {
    return this.flightsPredictionResult;
  }

  setFlightsPredictionResult(values: Map<string, FlightPredictionResultClass> | null): void {
    this.flightsPredictionResult = values;
  }

  getSalasPredictionResult(): Map<string, Map<string, SalaPredictionResult>> | null {
    return this.salasPredictionResult;
  }

  setSalasPredictionResult(value: Map<string, Map<string, SalaPredictionResult>> | null) {
    this.salasPredictionResult = value;
  }

  getHorasPredictionResult(): Map<string, Map<string, HoraPredictionResult>> | null {
    return this.horasPredictionResult;
  }

  setHorasPredictionResult(value: Map<string, Map<string, HoraPredictionResult>> | null) {
    this.horasPredictionResult = value;
  }

  getDiasSemanaPredictionResult(): Map<string, Map<string, DiaSemanaPredictionResult>> | null {
    return this.diasSemanaPredictionResult;
  }

  setDiasSemanaPredictionResult(value: Map<string, Map<string, DiaSemanaPredictionResult>> | null) {
    this.diasSemanaPredictionResult = value;
  }
  
  getSemanasPredictionResult(): Map<string, Map<string, SemanaPredictionResult>> | null {
    return this.semanasPredictionResult;
  }

  setSemanasPredictionResult(value: Map<string, Map<string, SemanaPredictionResult>> | null) {
    this.semanasPredictionResult = value;
  }

  getMesesPredictionResult(): Map<string, Map<string, MesesPredictionResult>> | null {
    return this.mesesPredictionResult;
  }

  setMesesPredictionResult(value: Map<string, Map<string, MesesPredictionResult>> | null) {
    this.mesesPredictionResult = value;
  }

  getDiasMesPredictionResult(): Map<string, Map<string, DiasMesPredictionResult>> | null {
    return this.diasMesPredictionResult;
  }

  setDiasMesPredictionResult(value: Map<string, Map<string, DiasMesPredictionResult>> | null) {
    this.diasMesPredictionResult = value;
  }

  getIsLoading(): boolean {
    return this.isLoading;
  }

  setIsLoading(value: boolean) {
    this.isLoading = value;
  }

  get barChartData(): any[] {
    return this._barChartData;
  }

  set barChartData(value: any[]) {
    this._barChartData = value;
  }

  get barChartLabels(): string[] {
    return this._barChartLabels;
  }

  set barChartLabels(value: string[]) {
    this._barChartLabels = value;
  }

}
