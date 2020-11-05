import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GoalTrackComponent } from './goal-track.component'

describe('GoalTrackComponent', () => {
  let component: GoalTrackComponent
  let fixture: ComponentFixture<GoalTrackComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoalTrackComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalTrackComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
