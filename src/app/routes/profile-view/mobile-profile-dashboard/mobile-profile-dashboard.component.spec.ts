import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileProfileDashboardComponent } from './mobile-profile-dashboard.component';

describe('MobileProfileDashboardComponent', () => {
  let component: MobileProfileDashboardComponent;
  let fixture: ComponentFixture<MobileProfileDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileProfileDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileProfileDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
