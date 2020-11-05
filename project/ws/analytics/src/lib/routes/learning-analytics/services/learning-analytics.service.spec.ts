import { TestBed } from '@angular/core/testing'

import { LearningAnalyticsService } from './learning-analytics.service'

describe('LearningAnalyticsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: LearningAnalyticsService = TestBed.get(LearningAnalyticsService)
    expect(service).toBeTruthy()
  })
})
