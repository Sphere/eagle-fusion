import { TestBed } from '@angular/core/testing'

import { MyFeedbackService } from './my-feedback.service'

describe('MyFeedbackService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: MyFeedbackService = TestBed.get(MyFeedbackService)
    expect(service).toBeTruthy()
  })
})
