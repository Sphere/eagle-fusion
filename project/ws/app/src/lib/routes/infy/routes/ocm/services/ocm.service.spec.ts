import { TestBed } from '@angular/core/testing'

import { OcmService } from './ocm.service'

describe('OcmService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: OcmService = TestBed.get(OcmService)
    expect(service).toBeTruthy()
  })
})
