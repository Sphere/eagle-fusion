import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CertificationEligibilityComponent } from './certification-eligibility.component'

describe('CertificationEligibilityComponent', () => {
  let component: CertificationEligibilityComponent
  let fixture: ComponentFixture<CertificationEligibilityComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CertificationEligibilityComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificationEligibilityComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
