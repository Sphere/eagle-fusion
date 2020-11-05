import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GoalCommonCardComponent } from './goal-common-card.component'

describe('GoalCommonCardComponent', () => {
  let component: GoalCommonCardComponent
  let fixture: ComponentFixture<GoalCommonCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoalCommonCardComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalCommonCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
