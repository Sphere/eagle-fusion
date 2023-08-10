import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AppTocCertificateModalComponent } from './app-toc-certificate-modal.component'

describe('AppTocCertificateModalComponent', () => {
  let component: AppTocCertificateModalComponent
  let fixture: ComponentFixture<AppTocCertificateModalComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppTocCertificateModalComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTocCertificateModalComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
