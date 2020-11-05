import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AudioStripsComponent } from './audio-strips.component'

describe('AudioStripsComponent', () => {
  let component: AudioStripsComponent
  let fixture: ComponentFixture<AudioStripsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AudioStripsComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioStripsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
