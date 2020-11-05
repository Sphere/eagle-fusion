import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { NotificationEventComponent } from './notification-event.component'

describe('NotificationEventComponent', () => {
  let component: NotificationEventComponent
  let fixture: ComponentFixture<NotificationEventComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationEventComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationEventComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
