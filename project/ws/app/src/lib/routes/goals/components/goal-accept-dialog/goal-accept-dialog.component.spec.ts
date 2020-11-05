import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GoalAcceptDialogComponent } from './goal-accept-dialog.component'

describe('GoalAcceptDialogComponent', () => {
  let component: GoalAcceptDialogComponent
  let fixture: ComponentFixture<GoalAcceptDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoalAcceptDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalAcceptDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
