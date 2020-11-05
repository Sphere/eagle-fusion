import { TestBed } from '@angular/core/testing'

import { BtnContentLikeService } from './btn-content-like.service'

describe('BtnContentLikeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: BtnContentLikeService = TestBed.get(BtnContentLikeService)
    expect(service).toBeTruthy()
  })
})
