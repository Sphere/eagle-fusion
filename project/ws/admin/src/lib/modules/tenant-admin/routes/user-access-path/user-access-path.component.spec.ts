import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { UserAccessPathComponent } from './user-access-path.component'

describe('UserAccessPathComponent', () => {
  let component: UserAccessPathComponent
  let fixture: ComponentFixture<UserAccessPathComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserAccessPathComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAccessPathComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
