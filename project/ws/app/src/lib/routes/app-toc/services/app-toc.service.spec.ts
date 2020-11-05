import { TestBed } from '@angular/core/testing'

import { AppTocService } from './app-toc.service'

describe('AppTocService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: AppTocService = TestBed.get(AppTocService)
    expect(service).toBeTruthy()
  })
})
