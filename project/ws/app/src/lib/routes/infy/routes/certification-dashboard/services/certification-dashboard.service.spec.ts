import { TestBed } from '@angular/core/testing'

import { CertificationDashboardService } from './certification-dashboard.service'

describe('CertificationDashboardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: CertificationDashboardService = TestBed.get(CertificationDashboardService)
    expect(service).toBeTruthy()
  })
})
