import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { AuthEditorOptionsComponent } from './auth-editor-options.component'

describe('AuthEditorOptionsComponent', () => {
  let component: AuthEditorOptionsComponent
  let fixture: ComponentFixture<AuthEditorOptionsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuthEditorOptionsComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthEditorOptionsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
