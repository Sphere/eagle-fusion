import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DialogDeregisterUserComponent } from './dialog-deregister-user.component'

describe('DialogDeregisterUserComponent', () => {
  let component: DialogDeregisterUserComponent
  let fixture: ComponentFixture<DialogDeregisterUserComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DialogDeregisterUserComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDeregisterUserComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
