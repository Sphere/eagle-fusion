import { TestBed } from '@angular/core/testing'

import { ProfileResolverService } from './profile-resolver.service'

describe('ProfileResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: ProfileResolverService = TestBed.get(ProfileResolverService)
    expect(service).toBeTruthy()
  })
})
