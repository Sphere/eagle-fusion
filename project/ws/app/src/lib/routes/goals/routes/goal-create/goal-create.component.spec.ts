import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GoalCreateComponent } from './goal-create.component'

describe('GoalCreateComponent', () => {
  let component: GoalCreateComponent
  let fixture: ComponentFixture<GoalCreateComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoalCreateComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalCreateComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
