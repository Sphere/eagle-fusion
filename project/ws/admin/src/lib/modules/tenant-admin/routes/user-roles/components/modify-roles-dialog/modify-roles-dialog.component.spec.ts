import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ModifyRolesDialogComponent } from './modify-roles-dialog.component'

describe('ModifyRolesDialogComponent', () => {
  let component: ModifyRolesDialogComponent
  let fixture: ComponentFixture<ModifyRolesDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModifyRolesDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyRolesDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
