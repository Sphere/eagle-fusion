import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { UserActionConfirmDialogComponent } from './user-action-confirm-dialog.component'

describe('UserActionConfirmDialogComponent', () => {
  let component: UserActionConfirmDialogComponent
  let fixture: ComponentFixture<UserActionConfirmDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserActionConfirmDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserActionConfirmDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
