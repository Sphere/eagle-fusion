import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeycloakCallbackComponent } from './keycloak-callback.component';

describe('KeycloakCallbackComponent', () => {
  let component: KeycloakCallbackComponent;
  let fixture: ComponentFixture<KeycloakCallbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeycloakCallbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeycloakCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
