import { TestBed } from '@angular/core/testing'

import { GlobalErrorHandlingService } from './global-error-handling.service'

describe('GlobalErrorHandlingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: GlobalErrorHandlingService = TestBed.get(GlobalErrorHandlingService)
    expect(service).toBeTruthy()
  })
})
