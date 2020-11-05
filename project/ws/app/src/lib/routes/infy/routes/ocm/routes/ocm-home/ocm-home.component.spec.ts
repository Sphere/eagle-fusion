import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { OcmHomeComponent } from './ocm-home.component'

describe('OcmHomeComponent', () => {
  let component: OcmHomeComponent
  let fixture: ComponentFixture<OcmHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OcmHomeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(OcmHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
