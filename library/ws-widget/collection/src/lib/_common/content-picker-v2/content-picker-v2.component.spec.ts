import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ContentPickerV2Component } from './content-picker-v2.component'

describe('ContentPickerV2Component', () => {
  let component: ContentPickerV2Component
  let fixture: ComponentFixture<ContentPickerV2Component>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContentPickerV2Component],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentPickerV2Component)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
