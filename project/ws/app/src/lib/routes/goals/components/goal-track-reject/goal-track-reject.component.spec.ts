import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GoalTrackRejectComponent } from './goal-track-reject.component'

describe('GoalTrackRejectComponent', () => {
  let component: GoalTrackRejectComponent
  let fixture: ComponentFixture<GoalTrackRejectComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoalTrackRejectComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalTrackRejectComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
