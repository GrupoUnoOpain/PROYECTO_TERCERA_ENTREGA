import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsPredictComponent } from './results-predict.component';

describe('ResultsPredictComponent', () => {
  let component: ResultsPredictComponent;
  let fixture: ComponentFixture<ResultsPredictComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResultsPredictComponent]
    });
    fixture = TestBed.createComponent(ResultsPredictComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
