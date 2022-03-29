import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { MobileLeaderboardComponent } from './mobile-leaderboard.component'

describe('MobileLeaderboardComponent', () => {
  let component: MobileLeaderboardComponent
  let fixture: ComponentFixture<MobileLeaderboardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MobileLeaderboardComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileLeaderboardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
