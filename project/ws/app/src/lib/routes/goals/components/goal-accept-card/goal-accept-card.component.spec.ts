import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GoalAcceptCardComponent } from './goal-accept-card.component'

describe('GoalAcceptCardComponent', () => {
  let component: GoalAcceptCardComponent
  let fixture: ComponentFixture<GoalAcceptCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoalAcceptCardComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalAcceptCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
