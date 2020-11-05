import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AtDeskSlotBookingComponent } from './at-desk-slot-booking.component'

describe('AtDeskSlotBookingComponent', () => {
  let component: AtDeskSlotBookingComponent
  let fixture: ComponentFixture<AtDeskSlotBookingComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AtDeskSlotBookingComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AtDeskSlotBookingComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
