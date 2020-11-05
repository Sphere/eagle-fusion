import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GoalSharedDeleteDialogComponent } from './goal-shared-delete-dialog.component'

describe('GoalSharedDeleteDialogComponent', () => {
  let component: GoalSharedDeleteDialogComponent
  let fixture: ComponentFixture<GoalSharedDeleteDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoalSharedDeleteDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalSharedDeleteDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
