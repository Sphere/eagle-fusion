import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TrainingFeedbackComponent } from './training-feedback.component'

describe('TrainingFeedbackComponent', () => {
  let component: TrainingFeedbackComponent
  let fixture: ComponentFixture<TrainingFeedbackComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingFeedbackComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingFeedbackComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
