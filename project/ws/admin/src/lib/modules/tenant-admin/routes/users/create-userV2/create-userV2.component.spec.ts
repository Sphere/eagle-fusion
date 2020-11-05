import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CreateUserV2Component } from './create-userV2.component'

describe('CreateUserComponentV2', () => {
  let component: CreateUserV2Component
  let fixture: ComponentFixture<CreateUserV2Component>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateUserV2Component],
    })
      .compileComponents()
  }))
  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUserV2Component)
    component = fixture.componentInstance
    fixture.detectChanges()
  })
  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
