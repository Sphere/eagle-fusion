import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicLoginComponent } from './public-login.component';

describe('PublicLoginComponent', () => {
  let component: PublicLoginComponent;
  let fixture: ComponentFixture<PublicLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
