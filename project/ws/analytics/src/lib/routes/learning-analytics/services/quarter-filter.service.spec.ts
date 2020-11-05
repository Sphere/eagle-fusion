import { TestBed } from '@angular/core/testing'

import { QuarterFilterService } from './quarter-filter.service'

describe('QuarterFilterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: QuarterFilterService = TestBed.get(QuarterFilterService)
    expect(service).toBeTruthy()
  })
})
