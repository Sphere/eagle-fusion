import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProficiencyLevelComponent } from './proficiency-level.component';

describe('ProficiencyLevelComponent', () => {
  let component: ProficiencyLevelComponent;
  let fixture: ComponentFixture<ProficiencyLevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProficiencyLevelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProficiencyLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
