import { TestBed } from '@angular/core/testing'

import { SearchServService } from './search-serv.service'

describe('SearchServService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: SearchServService = TestBed.get(SearchServService)
    expect(service).toBeTruthy()
  })
})
