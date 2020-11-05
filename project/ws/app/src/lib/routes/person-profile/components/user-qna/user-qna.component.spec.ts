import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { UserQnaComponent } from './user-qna.component'

describe('UserQnaComponent', () => {
  let component: UserQnaComponent
  let fixture: ComponentFixture<UserQnaComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserQnaComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserQnaComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
