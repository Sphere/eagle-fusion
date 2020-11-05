import { TestBed } from '@angular/core/testing'

import { TenantAdminService } from './tenant-admin.service'

describe('TenantAdminService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: TenantAdminService = TestBed.get(TenantAdminService)
    expect(service).toBeTruthy()
  })
})
