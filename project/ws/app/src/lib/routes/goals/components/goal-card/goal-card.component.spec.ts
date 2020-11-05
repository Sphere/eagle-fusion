import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GoalCardComponent } from './goal-card.component'

describe('GoalCardComponent', () => {
  let component: GoalCardComponent
  let fixture: ComponentFixture<GoalCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoalCardComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
