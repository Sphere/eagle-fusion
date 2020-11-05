import { TestBed } from '@angular/core/testing'

import { BtnSettingsService } from './btn-settings.service'

describe('BtnSettingsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: BtnSettingsService = TestBed.get(BtnSettingsService)
    expect(service).toBeTruthy()
  })
})
