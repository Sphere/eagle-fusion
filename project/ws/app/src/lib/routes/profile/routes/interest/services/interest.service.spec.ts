import { TestBed } from '@angular/core/testing'

import { InterestService } from './interest.service'

describe('InterestService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: InterestService = TestBed.get(InterestService)
    expect(service).toBeTruthy()
  })
})
