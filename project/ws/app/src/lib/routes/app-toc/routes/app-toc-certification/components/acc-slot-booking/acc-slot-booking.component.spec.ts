import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AccSlotBookingComponent } from './acc-slot-booking.component'

describe('AccSlotBookingComponent', () => {
  let component: AccSlotBookingComponent
  let fixture: ComponentFixture<AccSlotBookingComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccSlotBookingComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AccSlotBookingComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
