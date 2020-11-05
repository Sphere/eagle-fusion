import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnContentFeedbackV2Component } from './btn-content-feedback-v2.component'

describe('BtnContentFeedbackV2Component', () => {
  let component: BtnContentFeedbackV2Component
  let fixture: ComponentFixture<BtnContentFeedbackV2Component>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnContentFeedbackV2Component],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnContentFeedbackV2Component)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
