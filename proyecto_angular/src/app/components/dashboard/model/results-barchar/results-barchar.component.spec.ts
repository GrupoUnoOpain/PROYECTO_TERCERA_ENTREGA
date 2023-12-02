import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsBarcharComponent } from './results-barchar.component';

describe('ResultsBarcharComponent', () => {
  let component: ResultsBarcharComponent;
  let fixture: ComponentFixture<ResultsBarcharComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResultsBarcharComponent]
    });
    fixture = TestBed.createComponent(ResultsBarcharComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
