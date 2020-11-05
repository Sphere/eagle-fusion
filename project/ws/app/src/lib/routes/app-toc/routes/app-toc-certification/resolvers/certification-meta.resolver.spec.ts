import { TestBed } from '@angular/core/testing'

import { CertificationMetaResolver } from './certification-meta.resolver'

describe('CertificationMetaResolver', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: CertificationMetaResolver = TestBed.get(CertificationMetaResolver)
    expect(service).toBeTruthy()
  })
})
