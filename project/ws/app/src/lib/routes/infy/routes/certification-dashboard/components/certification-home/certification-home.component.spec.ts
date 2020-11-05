import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CertificationHomeComponent } from './certification-home.component'

describe('CertificationHomeComponent', () => {
  let component: CertificationHomeComponent
  let fixture: ComponentFixture<CertificationHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CertificationHomeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificationHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
