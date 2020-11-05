import { TestBed } from '@angular/core/testing'

import { BtnAdminService } from './btn-admin.service'

describe('BtnAdminService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: BtnAdminService = TestBed.get(BtnAdminService)
    expect(service).toBeTruthy()
  })
})
