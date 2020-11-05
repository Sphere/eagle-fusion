import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { RegisteredUsersComponent } from './registered-users.component'

describe('RegisteredUsersComponent', () => {
  let component: RegisteredUsersComponent
  let fixture: ComponentFixture<RegisteredUsersComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RegisteredUsersComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisteredUsersComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
