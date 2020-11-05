import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AuthHomeComponent } from './home.component'

describe('AuthHomeComponent', () => {
  let component: AuthHomeComponent
  let fixture: ComponentFixture<AuthHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuthHomeComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
