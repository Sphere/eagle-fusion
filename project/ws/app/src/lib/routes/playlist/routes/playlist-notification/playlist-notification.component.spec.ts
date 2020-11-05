import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PlaylistNotificationComponent } from './playlist-notification.component'

describe('PlaylistNotificationComponent', () => {
  let component: PlaylistNotificationComponent
  let fixture: ComponentFixture<PlaylistNotificationComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PlaylistNotificationComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistNotificationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
