import { TestBed } from '@angular/core/testing'

import { BtnContentFeedbackService } from './btn-content-feedback.service'

describe('BtnContentFeedbackService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: BtnContentFeedbackService = TestBed.get(BtnContentFeedbackService)
    expect(service).toBeTruthy()
  })
})
