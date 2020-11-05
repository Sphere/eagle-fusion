import { TestBed } from '@angular/core/testing'

import { CollectionResolverService } from './resolver.service'

describe('CollectionResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: CollectionResolverService = TestBed.get(CollectionResolverService)
    expect(service).toBeTruthy()
  })
})
