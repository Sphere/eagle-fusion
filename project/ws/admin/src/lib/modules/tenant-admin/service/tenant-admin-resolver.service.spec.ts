import { TestBed } from '@angular/core/testing'

import { TenantAdminResolverService } from './tenant-admin-resolver.service'

describe('TenantAdminResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: TenantAdminResolverService = TestBed.get(TenantAdminResolverService)
    expect(service).toBeTruthy()
  })
})
