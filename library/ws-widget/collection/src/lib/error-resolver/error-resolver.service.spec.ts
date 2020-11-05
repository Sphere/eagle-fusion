import { TestBed } from '@angular/core/testing'

import { ErrorResolverService } from './error-resolver.service'

describe('ErrorResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: ErrorResolverService = TestBed.get(ErrorResolverService)
    expect(service).toBeTruthy()
  })
})
