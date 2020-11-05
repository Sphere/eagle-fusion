import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DialogUserRoleSelectComponent } from './dialog-user-role-select.component'

describe('DialogUserRoleSelectComponent', () => {
  let component: DialogUserRoleSelectComponent
  let fixture: ComponentFixture<DialogUserRoleSelectComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DialogUserRoleSelectComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogUserRoleSelectComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
