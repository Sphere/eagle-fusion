import { TestBed } from '@angular/core/testing'

import { BtnContentDownloadService } from './btn-content-download.service'

describe('BtnContentDownloadService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: BtnContentDownloadService = TestBed.get(BtnContentDownloadService)
    expect(service).toBeTruthy()
  })
})
