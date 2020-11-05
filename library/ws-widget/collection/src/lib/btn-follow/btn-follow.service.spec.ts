import { TestBed } from '@angular/core/testing'

import { BtnFollowService } from './btn-follow.service'

describe('BtnFollowService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: BtnFollowService = TestBed.get(BtnFollowService)
    expect(service).toBeTruthy()
  })
})
