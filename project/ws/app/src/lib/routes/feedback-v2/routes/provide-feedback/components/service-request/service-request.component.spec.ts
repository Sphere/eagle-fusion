import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ServiceRequestComponent } from './service-request.component'

describe('ServiceRequestComponent', () => {
  let component: ServiceRequestComponent
  let fixture: ComponentFixture<ServiceRequestComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServiceRequestComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceRequestComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
