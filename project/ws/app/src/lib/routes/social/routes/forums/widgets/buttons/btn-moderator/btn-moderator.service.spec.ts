import { TestBed } from '@angular/core/testing'

import { BtnModeratorService } from './btn-moderator.service'

describe('BtnModeratorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: BtnModeratorService = TestBed.get(BtnModeratorService)
    expect(service).toBeTruthy()
  })
})
