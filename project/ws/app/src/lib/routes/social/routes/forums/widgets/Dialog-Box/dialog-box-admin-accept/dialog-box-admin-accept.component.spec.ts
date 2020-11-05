import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DialogBoxAdminAcceptComponent } from './dialog-box-admin-accept.component'

describe('DialogBoxAdminAcceptComponent', () => {
  let component: DialogBoxAdminAcceptComponent
  let fixture: ComponentFixture<DialogBoxAdminAcceptComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DialogBoxAdminAcceptComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogBoxAdminAcceptComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
