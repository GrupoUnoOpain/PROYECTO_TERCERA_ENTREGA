export class FlightPredictionResultClass {
    private _iataCode: string;
    private _destino: string;
    private _tipoVuelo: string;
    private _sala: string;
    private _muelle: string;
    private _aerolinea: string;
    private _tipoAerolinea: string;
    private _std: string;
    private _horaEntera: number;
    private _fechaDia: string;
    private _pasajerosSaliendo: number;
    private _semana: number;
    private _mes: number;
    private _dia: number;
    private _anio: number;
    private _valorVentaMuelle: number;
    private _valorVentaMarca1: number;
    private _valorVentaMarca2: number;
    private _valorVentaMarca3: number;
    private _valorVentaMarca5: number;
    private _valorVentaMarca6: number;
    private _valorVentaMarca7: number;
    private _valorVentaMarca9: number;
    private _valorVentaMarca10: number;
    private _muelleMarca: string;
  
    constructor() {
        this._iataCode = '';
        this._destino = '';
        this._tipoVuelo = '';
        this._sala = '';
        this._muelle = '';
        this._aerolinea = '';
        this._tipoAerolinea = '';
        this._std = '';
        this._horaEntera = 0;
        this._fechaDia = '';
        this._pasajerosSaliendo = 0;
        this._semana = 0;
        this._mes = 0;
        this._dia = 0;
        this._anio = 0;
        this._valorVentaMuelle = 0;
        this._valorVentaMarca1 = 0;
        this._valorVentaMarca2 = 0;
        this._valorVentaMarca3 = 0;
        this._valorVentaMarca5 = 0;
        this._valorVentaMarca6 = 0;
        this._valorVentaMarca7 = 0;
        this._valorVentaMarca9 = 0;
        this._valorVentaMarca10 = 0;
        this._muelleMarca = '';
      }
  
    get iataCode(): string {
      return this._iataCode;
    }
  
    set iataCode(value: string) {
      this._iataCode = value;
    }
  
    get destino(): string {
      return this._destino;
    }
  
    set destino(value: string) {
      this._destino = value;
    }
  
    get tipoVuelo(): string {
      return this._tipoVuelo;
    }
  
    set tipoVuelo(value: string) {
      this._tipoVuelo = value;
    }
  
    get sala(): string {
      return this._sala;
    }
  
    set sala(value: string) {
      this._sala = value;
    }
  
    get muelle(): string {
      return this._muelle;
    }
  
    set muelle(value: string) {
      this._muelle = value;
    }
  
    get aerolinea(): string {
      return this._aerolinea;
    }
  
    set aerolinea(value: string) {
      this._aerolinea = value;
    }
  
    get tipoAerolinea(): string {
      return this._tipoAerolinea;
    }
  
    set tipoAerolinea(value: string) {
      this._tipoAerolinea = value;
    }
  
    get std(): string {
      return this._std;
    }
  
    set std(value: string) {
      this._std = value;
    }
  
    get horaEntera(): number {
      return this._horaEntera;
    }
  
    set horaEntera(value: number) {
      this._horaEntera = value;
    }
  
    get fechaDia(): string {
      return this._fechaDia;
    }
  
    set fechaDia(value: string) {
      this._fechaDia = value;
    }
  
    get pasajerosSaliendo(): number {
      return this._pasajerosSaliendo;
    }
  
    set pasajerosSaliendo(value: number) {
      this._pasajerosSaliendo = value;
    }
  
    get semana(): number {
      return this._semana;
    }
  
    set semana(value: number) {
      this._semana = value;
    }
  
    get mes(): number {
      return this._mes;
    }
  
    set mes(value: number) {
      this._mes = value;
    }
  
    get dia(): number {
      return this._dia;
    }
  
    set dia(value: number) {
      this._dia = value;
    }
  
    get anio(): number {
      return this._anio;
    }
  
    set anio(value: number) {
      this._anio = value;
    }
  
    get valorVentaMuelle(): number {
      return this._valorVentaMuelle;
    }
  
    set valorVentaMuelle(value: number) {
      this._valorVentaMuelle = value;
    }
  
    get valorVentaMarca1(): number {
      return this._valorVentaMarca1;
    }
  
    set valorVentaMarca1(value: number) {
      this._valorVentaMarca1 = value;
    }
  
    get valorVentaMarca2(): number {
      return this._valorVentaMarca2;
    }
  
    set valorVentaMarca2(value: number) {
      this._valorVentaMarca2 = value;
    }
  
    get valorVentaMarca3(): number {
      return this._valorVentaMarca3;
    }
  
    set valorVentaMarca3(value: number) {
      this._valorVentaMarca3 = value;
    }
  
    get valorVentaMarca5(): number {
      return this._valorVentaMarca5;
    }
  
    set valorVentaMarca5(value: number) {
      this._valorVentaMarca5 = value;
    }
  
    get valorVentaMarca6(): number {
      return this._valorVentaMarca6;
    }
  
    set valorVentaMarca6(value: number) {
      this._valorVentaMarca6 = value;
    }
  
    get valorVentaMarca7(): number {
      return this._valorVentaMarca7;
    }
  
    set valorVentaMarca7(value: number) {
      this._valorVentaMarca7 = value;
    }
  
    get valorVentaMarca9(): number {
      return this._valorVentaMarca9;
    }
  
    set valorVentaMarca9(value: number) {
      this._valorVentaMarca9 = value;
    }
  
    get valorVentaMarca10(): number {
      return this._valorVentaMarca10;
    }
  
    set valorVentaMarca10(value: number) {
      this._valorVentaMarca10 = value;
    }

    get muelleMarca(): string {
      return this._muelleMarca;
    }
  
    set muelleMarca(value: string) {
      this._muelleMarca = value;
    }

  }
  