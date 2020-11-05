import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { UserFilterDisplayComponent } from './user-filter-display.component'

describe('UserFilterDisplayComponent', () => {
  let component: UserFilterDisplayComponent
  let fixture: ComponentFixture<UserFilterDisplayComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserFilterDisplayComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UserFilterDisplayComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
