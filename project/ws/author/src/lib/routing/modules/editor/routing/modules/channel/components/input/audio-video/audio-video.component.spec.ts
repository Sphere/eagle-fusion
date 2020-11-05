import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AudioVideoComponent } from './audio-video.component'

describe('AudioVideoComponent', () => {
  let component: AudioVideoComponent
  let fixture: ComponentFixture<AudioVideoComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AudioVideoComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioVideoComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
