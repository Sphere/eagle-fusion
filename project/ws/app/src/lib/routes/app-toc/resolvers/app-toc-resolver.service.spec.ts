import { TestBed } from '@angular/core/testing'

import { AppTocResolverService } from './app-toc-resolver.service'

describe('AppTocResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: AppTocResolverService = TestBed.get(AppTocResolverService)
    expect(service).toBeTruthy()
  })
})
