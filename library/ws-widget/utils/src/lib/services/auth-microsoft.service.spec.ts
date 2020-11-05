import { TestBed } from '@angular/core/testing'

import { AuthMicrosoftService } from './auth-microsoft.service'

describe('AuthMicrosoftService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: AuthMicrosoftService = TestBed.get(AuthMicrosoftService)
    expect(service).toBeTruthy()
  })
})
