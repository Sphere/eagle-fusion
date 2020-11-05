import { TestBed } from '@angular/core/testing'

import { AuthNavBarToggleService } from './auth-nav-bar-toggle.service'

describe('AuthNavBarToggleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: AuthNavBarToggleService = TestBed.get(AuthNavBarToggleService)
    expect(service).toBeTruthy()
  })
})
