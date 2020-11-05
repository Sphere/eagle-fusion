import { TestBed } from '@angular/core/testing'

import { FeedbackApiService } from './feedback-api.service'

describe('FeedbackApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: FeedbackApiService = TestBed.get(FeedbackApiService)
    expect(service).toBeTruthy()
  })
})
