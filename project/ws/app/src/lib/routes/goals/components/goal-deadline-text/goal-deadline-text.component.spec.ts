import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GoalDeadlineTextComponent } from './goal-deadline-text.component'

describe('GoalDeadlineTextComponent', () => {
  let component: GoalDeadlineTextComponent
  let fixture: ComponentFixture<GoalDeadlineTextComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoalDeadlineTextComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalDeadlineTextComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
