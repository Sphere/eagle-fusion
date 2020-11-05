import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ErrorContentUnavailableComponent } from './error-content-unavailable.component'

describe('ErrorContentUnavailableComponent', () => {
  let component: ErrorContentUnavailableComponent
  let fixture: ComponentFixture<ErrorContentUnavailableComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorContentUnavailableComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorContentUnavailableComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
