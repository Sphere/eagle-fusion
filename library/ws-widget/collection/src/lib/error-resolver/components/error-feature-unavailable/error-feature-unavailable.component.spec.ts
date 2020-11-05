import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ErrorFeatureUnavailableComponent } from './error-feature-unavailable.component'

describe('ErrorFeatureUnavailableComponent', () => {
  let component: ErrorFeatureUnavailableComponent
  let fixture: ComponentFixture<ErrorFeatureUnavailableComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorFeatureUnavailableComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorFeatureUnavailableComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
