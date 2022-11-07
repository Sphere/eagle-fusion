import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProficiencyLandingComponent } from './proficiency-landing.component';

describe('ProficiencyLandingComponent', () => {
  let component: ProficiencyLandingComponent;
  let fixture: ComponentFixture<ProficiencyLandingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProficiencyLandingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProficiencyLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
