import { TestBed, async, inject } from '@angular/core/testing'

import { CertificationsGuard } from './certifications.guard'

describe('CertificationsGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CertificationsGuard],
    })
  })

  it('should ...', inject([CertificationsGuard], (guard: CertificationsGuard) => {
    expect(guard).toBeTruthy()
  }))
})
