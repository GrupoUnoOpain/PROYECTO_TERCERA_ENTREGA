import { Component } from '@angular/core';
import { FlightPredictionResultClass } from 'src/app/models/result.model';
import { Utils } from 'src/app/models/utils';
import { StateService } from 'src/app/services/state.service';

@Component({
  selector: 'app-results-predict',
  templateUrl: './results-predict.component.html',
  styleUrls: ['./results-predict.component.css']
})
export class ResultsPredictComponent {

  result: FlightPredictionResultClass | null = null;
  barChartData: any[] = []

  barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
  };
  
  public barChartLabels: string[] = ['Marca 1', 'Marca 2', 'Marca 3', 'Marca 5', 'Marca 6', 'Marca 7', 'Marca 9', 'Marca 10'];
  public barChartType: string = 'bar';
  public barChartLegend: boolean = true;
  
  constructor(public stateService: StateService) {}

  refrescarDatos(): void {
    this.result = this.stateService.getElementSelected();
    
    this.barChartData = [
      { data: [
        this.result?.valorVentaMarca1, 
        this.result?.valorVentaMarca2, 
        this.result?.valorVentaMarca3, 
        this.result?.valorVentaMarca5, 
        this.result?.valorVentaMarca6, 
        this.result?.valorVentaMarca7, 
        this.result?.valorVentaMarca9, 
        this.result?.valorVentaMarca10, 
      ], 
        label: 'Marcas',
        backgroundColor: Utils.createGradient('#F0F8FF', '#00BFFF'),
        borderColor: '#00BFFF', 
        borderWidth: 1
      }
    ];
  }

}

