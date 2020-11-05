import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { UserKbComponent } from './user-kb.component'

describe('UserKbComponent', () => {
  let component: UserKbComponent
  let fixture: ComponentFixture<UserKbComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserKbComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserKbComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
