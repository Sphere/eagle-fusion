import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ErrorAccessForbiddenComponent } from './error-access-forbidden.component'

describe('ErrorAccessForbiddenComponent', () => {
  let component: ErrorAccessForbiddenComponent
  let fixture: ComponentFixture<ErrorAccessForbiddenComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorAccessForbiddenComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorAccessForbiddenComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
