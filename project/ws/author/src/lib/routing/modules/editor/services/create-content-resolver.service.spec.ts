import { TestBed } from '@angular/core/testing'

import { CreateContentResolverService } from './create-content-resolver.service'

describe('CreateContentResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: CreateContentResolverService = TestBed.get(CreateContentResolverService)
    expect(service).toBeTruthy()
  })
})
