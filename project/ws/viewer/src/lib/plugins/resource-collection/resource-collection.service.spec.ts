import { TestBed } from '@angular/core/testing'

import { ResourceCollectionService } from './resource-collection.service'

describe('ResourceCollectionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: ResourceCollectionService = TestBed.get(ResourceCollectionService)
    expect(service).toBeTruthy()
  })
})
