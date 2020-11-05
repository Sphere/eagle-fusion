import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GoalCreateCustomComponent } from './goal-create-custom.component'

describe('GoalCreateCustomComponent', () => {
  let component: GoalCreateCustomComponent
  let fixture: ComponentFixture<GoalCreateCustomComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoalCreateCustomComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalCreateCustomComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
