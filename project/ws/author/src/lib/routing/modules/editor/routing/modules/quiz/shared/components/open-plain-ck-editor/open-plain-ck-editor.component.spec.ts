import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { OpenPlainCkEditorComponent } from './open-plain-ck-editor.component'

describe('OpenPlainCkEditorComponent', () => {
  let component: OpenPlainCkEditorComponent
  let fixture: ComponentFixture<OpenPlainCkEditorComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OpenPlainCkEditorComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenPlainCkEditorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
