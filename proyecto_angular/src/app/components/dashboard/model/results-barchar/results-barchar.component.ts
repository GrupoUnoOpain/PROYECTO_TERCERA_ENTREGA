import { Component } from '@angular/core';
import { StateService } from 'src/app/services/state.service';

@Component({
  selector: 'app-results-barchar',
  templateUrl: './results-barchar.component.html',
  styleUrls: ['./results-barchar.component.css']
})
export class ResultsBarcharComponent {
  public barChartData: any[] = []
  public barChartLabels: string[] = [];
  public barChartType: string = 'bar';
  public barChartLegend: boolean = true;

  barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
  };
  
  constructor(public stateService: StateService) {}

  reloadData(): void {
    this.barChartData = this.stateService.barChartData;
    this.barChartLabels = this.stateService.barChartLabels;    
  }

}
