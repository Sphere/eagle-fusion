import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { VideoPopupComponent } from './how-does-it-works-popup.component'

describe('VideoPopupComponent', () => {
  let component: VideoPopupComponent
  let fixture: ComponentFixture<VideoPopupComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VideoPopupComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoPopupComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
