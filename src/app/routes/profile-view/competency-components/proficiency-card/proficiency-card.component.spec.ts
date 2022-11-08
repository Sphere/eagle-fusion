import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProficiencyCardComponent } from './proficiency-card.component';

describe('ProficiencyCardComponent', () => {
  let component: ProficiencyCardComponent;
  let fixture: ComponentFixture<ProficiencyCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProficiencyCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProficiencyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
