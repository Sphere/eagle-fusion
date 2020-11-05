import { TestBed } from '@angular/core/testing'

import { AppTocHomeService } from './app-toc-home.service'

describe('AppTocHomeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: AppTocHomeService = TestBed.get(AppTocHomeService)
    expect(service).toBeTruthy()
  })
})
