import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgHomeComponent } from './org-home.component';

describe('OrgHomeComponent', () => {
  let component: OrgHomeComponent;
  let fixture: ComponentFixture<OrgHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
