import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { UserRequestCardComponent } from './user-request-card.component'

describe('UserRequestCardComponent', () => {
  let component: UserRequestCardComponent
  let fixture: ComponentFixture<UserRequestCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserRequestCardComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRequestCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
