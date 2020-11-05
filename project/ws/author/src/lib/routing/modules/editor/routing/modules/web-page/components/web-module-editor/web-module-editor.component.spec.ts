import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WebModuleEditor } from './web-module-editor.component'

describe('WebModuleEditor', () => {
  let component: WebModuleEditor
  let fixture: ComponentFixture<WebModuleEditor>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WebModuleEditor],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WebModuleEditor)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
