export class DiaSemanaPredictionResult {
    private _lunes: number;
    private _martes: number;
    private _miercoles: number;
    private _jueves: number;
    private _viernes: number;
    private _sabado: number;
    private _domingo: number;

    constructor() {
        this._lunes = 0;
        this._martes = 0;
        this._miercoles = 0;
        this._jueves = 0;
        this._viernes = 0;
        this._sabado = 0;
        this._domingo = 0;
    }

    get lunes(): number {
        return this._lunes;
    }

    set lunes(value: number) {
        this._lunes = value;
    }

    get martes(): number {
        return this._martes;
    }

    set martes(value: number) {
        this._martes = value;
    }

    get miercoles(): number {
        return this._miercoles;
    }

    set miercoles(value: number) {
        this._miercoles = value;
    }

    get jueves(): number {
        return this._jueves;
    }

    set jueves(value: number) {
        this._jueves = value;
    }

    get viernes(): number {
        return this._viernes;
    }

    set viernes(value: number) {
        this._viernes = value;
    }

    get sabado(): number {
        return this._sabado;
    }

    set sabado(value: number) {
        this._sabado = value;
    }

    get domingo(): number {
        return this._domingo;
    }

    set domingo(value: number) {
        this._domingo = value;
    }
}
