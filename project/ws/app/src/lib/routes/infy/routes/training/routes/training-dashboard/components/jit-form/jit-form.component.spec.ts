import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { JitFormComponent } from './jit-form.component'

describe('JitFormComponent', () => {
  let component: JitFormComponent
  let fixture: ComponentFixture<JitFormComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [JitFormComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(JitFormComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
