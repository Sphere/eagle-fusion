import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GoalShareDialogComponent } from './goal-share-dialog.component'

describe('GoalShareDialogComponent', () => {
  let component: GoalShareDialogComponent
  let fixture: ComponentFixture<GoalShareDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoalShareDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalShareDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
