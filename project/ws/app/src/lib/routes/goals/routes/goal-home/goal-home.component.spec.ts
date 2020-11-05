import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GoalHomeComponent } from './goal-home.component'

describe('GoalHomeComponent', () => {
  let component: GoalHomeComponent
  let fixture: ComponentFixture<GoalHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoalHomeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
