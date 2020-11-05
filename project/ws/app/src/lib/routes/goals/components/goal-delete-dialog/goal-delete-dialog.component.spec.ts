import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GoalDeleteDialogComponent } from './goal-delete-dialog.component'

describe('GoalDeleteDialogComponent', () => {
  let component: GoalDeleteDialogComponent
  let fixture: ComponentFixture<GoalDeleteDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoalDeleteDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalDeleteDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
