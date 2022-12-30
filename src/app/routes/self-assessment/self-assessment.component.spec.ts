import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfAssessmentComponent } from './self-assessment.component';

describe('SelfAssessmentComponent', () => {
  let component: SelfAssessmentComponent;
  let fixture: ComponentFixture<SelfAssessmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelfAssessmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
