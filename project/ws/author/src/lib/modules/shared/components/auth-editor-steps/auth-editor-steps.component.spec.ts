import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AuthEditorStepsComponent } from './auth-editor-steps.component'

describe('AuthEditorStepsComponent', () => {
  let component: AuthEditorStepsComponent
  let fixture: ComponentFixture<AuthEditorStepsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuthEditorStepsComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthEditorStepsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
