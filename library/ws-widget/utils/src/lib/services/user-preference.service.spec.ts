import { TestBed } from '@angular/core/testing'

import { UserPreferenceService } from './user-preference.service'

describe('UserPreferenceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: UserPreferenceService = TestBed.get(UserPreferenceService)
    expect(service).toBeTruthy()
  })
})
