import { TestBed } from '@angular/core/testing'

import { SystemRolesManagementService } from './system-roles-management.service'

describe('SystemRolesManagementService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: SystemRolesManagementService = TestBed.get(SystemRolesManagementService)
    expect(service).toBeTruthy()
  })
})
