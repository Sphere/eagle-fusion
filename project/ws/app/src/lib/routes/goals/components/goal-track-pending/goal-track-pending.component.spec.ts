import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GoalTrackPendingComponent } from './goal-track-pending.component'

describe('GoalTrackPendingComponent', () => {
  let component: GoalTrackPendingComponent
  let fixture: ComponentFixture<GoalTrackPendingComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoalTrackPendingComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalTrackPendingComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
