import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AuthTocComponent } from './auth-toc.component'

describe('AuthTocComponent', () => {
  let component: AuthTocComponent
  let fixture: ComponentFixture<AuthTocComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuthTocComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthTocComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
