import { TestBed } from '@angular/core/testing'

import { BadgesService } from './badges.service'

describe('BadgesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: BadgesService = TestBed.get(BadgesService)
    expect(service).toBeTruthy()
  })
})
