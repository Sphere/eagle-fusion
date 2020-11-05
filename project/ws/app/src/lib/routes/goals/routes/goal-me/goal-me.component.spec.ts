import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GoalMeComponent } from './goal-me.component'

describe('GoalMeComponent', () => {
  let component: GoalMeComponent
  let fixture: ComponentFixture<GoalMeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoalMeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalMeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
