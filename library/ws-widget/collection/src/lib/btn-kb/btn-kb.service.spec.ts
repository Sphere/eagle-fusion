import { TestBed } from '@angular/core/testing'

import { BtnKbService } from './btn-kb.service'

describe('BtnKbService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: BtnKbService = TestBed.get(BtnKbService)
    expect(service).toBeTruthy()
  })
})
