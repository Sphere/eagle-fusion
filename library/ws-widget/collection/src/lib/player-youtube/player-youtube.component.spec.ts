import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PlayerYoutubeComponent } from './player-youtube.component'

describe('PlayerYoutubeComponent', () => {
  let component: PlayerYoutubeComponent
  let fixture: ComponentFixture<PlayerYoutubeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerYoutubeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerYoutubeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
