import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { FeedbackSnackbarComponent } from './feedback-snackbar.component'

describe('FeedbackSnackbarComponent', () => {
  let component: FeedbackSnackbarComponent
  let fixture: ComponentFixture<FeedbackSnackbarComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackSnackbarComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackSnackbarComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
