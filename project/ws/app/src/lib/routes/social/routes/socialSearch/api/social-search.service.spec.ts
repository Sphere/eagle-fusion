import { TestBed } from '@angular/core/testing'

import { SocialSearchService } from './social-search.service'

describe('SocialSearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: SocialSearchService = TestBed.get(SocialSearchService)
    expect(service).toBeTruthy()
  })
})
