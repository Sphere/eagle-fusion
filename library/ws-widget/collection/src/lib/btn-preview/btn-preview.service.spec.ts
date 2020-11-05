import { TestBed } from '@angular/core/testing'

import { BtnPreviewService } from './btn-preview.service'

describe('BtnPreviewService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: BtnPreviewService = TestBed.get(BtnPreviewService)
    expect(service).toBeTruthy()
  })
})
