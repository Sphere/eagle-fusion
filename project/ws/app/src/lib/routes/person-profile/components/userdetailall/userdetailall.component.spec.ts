import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { UserdetailallComponent } from './userdetailall.component'

describe('UserdetailallComponent', () => {
  let component: UserdetailallComponent
  let fixture: ComponentFixture<UserdetailallComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserdetailallComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserdetailallComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
