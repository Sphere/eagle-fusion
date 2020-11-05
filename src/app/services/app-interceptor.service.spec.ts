import { TestBed } from '@angular/core/testing'

import { AppInterceptorService } from './app-interceptor.service'

describe('AppInterceptorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: AppInterceptorService = TestBed.get(AppInterceptorService)
    expect(service).toBeTruthy()
  })
})
