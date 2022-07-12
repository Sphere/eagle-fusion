import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicLicenseComponent } from './public-license.component';

describe('PublicLicenseComponent', () => {
  let component: PublicLicenseComponent;
  let fixture: ComponentFixture<PublicLicenseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicLicenseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicLicenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
