import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GoalTrackAcceptComponent } from './goal-track-accept.component'

describe('GoalTrackAcceptComponent', () => {
  let component: GoalTrackAcceptComponent
  let fixture: ComponentFixture<GoalTrackAcceptComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoalTrackAcceptComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalTrackAcceptComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
