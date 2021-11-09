import { TestBed } from '@angular/core/testing'

import { AwsAnalyticsService } from './aws-analytics.service'

describe('AwsAnalyticsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: AwsAnalyticsService = TestBed.get(AwsAnalyticsService)
    expect(service).toBeTruthy()
  })
})
