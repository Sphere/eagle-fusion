import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CertificationRequestsComponent } from './certification-requests.component'

describe('CertificationRequestsComponent', () => {
  let component: CertificationRequestsComponent
  let fixture: ComponentFixture<CertificationRequestsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CertificationRequestsComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificationRequestsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
