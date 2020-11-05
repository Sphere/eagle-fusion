import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DialogBoxAdminComponent } from './dialog-box-admin.component'

describe('DialogBoxAdminComponent', () => {
  let component: DialogBoxAdminComponent
  let fixture: ComponentFixture<DialogBoxAdminComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DialogBoxAdminComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogBoxAdminComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
