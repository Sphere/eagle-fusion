import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LeaderboardControlsComponent } from './leaderboard-controls.component'

describe('LeaderboardControlsComponent', () => {
  let component: LeaderboardControlsComponent
  let fixture: ComponentFixture<LeaderboardControlsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LeaderboardControlsComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaderboardControlsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
