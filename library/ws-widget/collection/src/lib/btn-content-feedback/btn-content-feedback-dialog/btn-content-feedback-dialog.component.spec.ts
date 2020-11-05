import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnContentFeedbackDialogComponent } from './btn-content-feedback-dialog.component'

describe('BtnContentFeedbackDialogComponent', () => {
  let component: BtnContentFeedbackDialogComponent
  let fixture: ComponentFixture<BtnContentFeedbackDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnContentFeedbackDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnContentFeedbackDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
