import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CompleteProfileComponent } from './complete-profile.component'

describe('CompleteProfileComponent', () => {
  let component: CompleteProfileComponent
  let fixture: ComponentFixture<CompleteProfileComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CompleteProfileComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CompleteProfileComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
