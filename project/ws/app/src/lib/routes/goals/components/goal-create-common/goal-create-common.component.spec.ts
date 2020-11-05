import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GoalCreateCommonComponent } from './goal-create-common.component'

describe('GoalCreateCommonComponent', () => {
  let component: GoalCreateCommonComponent
  let fixture: ComponentFixture<GoalCreateCommonComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoalCreateCommonComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalCreateCommonComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
