import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AuthNavigationComponent } from './auth-navigation.component'

describe('AuthNavigationComponent', () => {
  let component: AuthNavigationComponent
  let fixture: ComponentFixture<AuthNavigationComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuthNavigationComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthNavigationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
