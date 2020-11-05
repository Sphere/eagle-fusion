import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AuthTableOfContentsComponent } from './auth-table-of-contents.component'

describe('AuthTableOfContentsComponent', () => {
  let component: AuthTableOfContentsComponent
  let fixture: ComponentFixture<AuthTableOfContentsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuthTableOfContentsComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthTableOfContentsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
