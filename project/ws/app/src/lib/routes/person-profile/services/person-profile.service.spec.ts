import { TestBed } from '@angular/core/testing'

import { PersonProfileService } from './person-profile.service'

describe('PersonProfileService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: PersonProfileService = TestBed.get(PersonProfileService)
    expect(service).toBeTruthy()
  })
})
