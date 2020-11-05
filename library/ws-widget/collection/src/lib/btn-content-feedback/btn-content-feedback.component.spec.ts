import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnContentFeedbackComponent } from './btn-content-feedback.component'

describe('BtnContentFeedbackComponent', () => {
  let component: BtnContentFeedbackComponent
  let fixture: ComponentFixture<BtnContentFeedbackComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnContentFeedbackComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnContentFeedbackComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
