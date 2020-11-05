import { TestBed } from '@angular/core/testing'

import { BtnGoalsService } from './btn-goals.service'

describe('BtnGoalsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: BtnGoalsService = TestBed.get(BtnGoalsService)
    expect(service).toBeTruthy()
  })
})
