import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { EventsCardComponent } from './events-card.component'

describe('EventsCardComponent', () => {
  let component: EventsCardComponent
  let fixture: ComponentFixture<EventsCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EventsCardComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
