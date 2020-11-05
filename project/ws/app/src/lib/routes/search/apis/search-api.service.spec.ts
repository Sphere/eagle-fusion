import { TestBed } from '@angular/core/testing'

import { SearchApiService } from './search-api.service'

describe('SearchApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: SearchApiService = TestBed.get(SearchApiService)
    expect(service).toBeTruthy()
  })
})
