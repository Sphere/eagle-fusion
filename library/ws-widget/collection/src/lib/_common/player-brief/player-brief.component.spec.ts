import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PlayerBriefComponent } from './player-brief.component'

describe('PlayerBriefComponent', () => {
  let component: PlayerBriefComponent
  let fixture: ComponentFixture<PlayerBriefComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerBriefComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerBriefComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
