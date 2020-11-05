import { TestBed } from '@angular/core/testing'

import { BtnFlagService } from './btn-flag.service'

describe('BtnFlagService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: BtnFlagService = TestBed.get(BtnFlagService)
    expect(service).toBeTruthy()
  })
})
