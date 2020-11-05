import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ErrorFeatureDisabledComponent } from './error-feature-disabled.component'

describe('ErrorFeatureDisabledComponent', () => {
  let component: ErrorFeatureDisabledComponent
  let fixture: ComponentFixture<ErrorFeatureDisabledComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorFeatureDisabledComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorFeatureDisabledComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
