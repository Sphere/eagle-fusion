import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { EditMetaV2Component } from './edit-meta-v2.component'

describe('EditMetaV2Component', () => {
  let component: EditMetaV2Component
  let fixture: ComponentFixture<EditMetaV2Component>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditMetaV2Component],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMetaV2Component)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
