import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LeaderboardHomeComponent } from './leaderboard-home.component'

describe('LeaderboardHomeComponent', () => {
  let component: LeaderboardHomeComponent
  let fixture: ComponentFixture<LeaderboardHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LeaderboardHomeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaderboardHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
