import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PlayerSlidesComponent } from './player-slides.component'

describe('PlayerSlidesComponent', () => {
  let component: PlayerSlidesComponent
  let fixture: ComponentFixture<PlayerSlidesComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerSlidesComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerSlidesComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
