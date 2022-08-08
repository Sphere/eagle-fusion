import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentDetailComponent } from './assessment-detail.component';

describe('AssessmentDetailComponent', () => {
  let component: AssessmentDetailComponent;
  let fixture: ComponentFixture<AssessmentDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
