import { TestBed } from '@angular/core/testing'

import { AppTocOverviewService } from './app-toc-overview.service'

describe('AppTocOverviewService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: AppTocOverviewService = TestBed.get(AppTocOverviewService)
    expect(service).toBeTruthy()
  })
})
