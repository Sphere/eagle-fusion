import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PastCertificationsComponent } from './past-certifications.component'

describe('PastCertificationsComponent', () => {
  let component: PastCertificationsComponent
  let fixture: ComponentFixture<PastCertificationsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PastCertificationsComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PastCertificationsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
