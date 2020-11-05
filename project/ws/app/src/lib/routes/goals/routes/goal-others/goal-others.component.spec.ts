import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GoalOthersComponent } from './goal-others.component'

describe('GoalOthersComponent', () => {
  let component: GoalOthersComponent
  let fixture: ComponentFixture<GoalOthersComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoalOthersComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalOthersComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
