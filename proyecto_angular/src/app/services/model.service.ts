import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Flight } from '../models/flight.model';
import { API_URL_MODEL } from '../app.constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModelService {

  constructor(private http: HttpClient) { }

  predict(flights: Array<Flight>, predictionType: string): Observable<any> {
    let ruta: string = API_URL_MODEL + predictionType
    return this.http.post<any>(ruta, flights, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

}
