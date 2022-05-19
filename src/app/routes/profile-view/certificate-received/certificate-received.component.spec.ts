import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CertificateReceivedComponent } from './certificate-received.component'

describe('CertificateReceivedComponent', () => {
  let component: CertificateReceivedComponent
  let fixture: ComponentFixture<CertificateReceivedComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CertificateReceivedComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificateReceivedComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
