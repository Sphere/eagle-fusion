import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { UserGoalsComponent } from './user-goals.component'

describe('UserGoalsComponent', () => {
  let component: UserGoalsComponent
  let fixture: ComponentFixture<UserGoalsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserGoalsComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserGoalsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
