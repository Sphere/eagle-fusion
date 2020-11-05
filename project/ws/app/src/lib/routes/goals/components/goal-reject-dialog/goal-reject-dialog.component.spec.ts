import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GoalRejectDialogComponent } from './goal-reject-dialog.component'

describe('GoalRejectDialogComponent', () => {
  let component: GoalRejectDialogComponent
  let fixture: ComponentFixture<GoalRejectDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoalRejectDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalRejectDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
