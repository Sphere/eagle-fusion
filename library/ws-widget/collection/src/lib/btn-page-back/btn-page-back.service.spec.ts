import { TestBed } from '@angular/core/testing'

import { BtnPageBackService } from './btn-page-back.service'

describe('BtnPageBackService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: BtnPageBackService = TestBed.get(BtnPageBackService)
    expect(service).toBeTruthy()
  })
})
