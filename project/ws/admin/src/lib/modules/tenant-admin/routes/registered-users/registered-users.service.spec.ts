import { TestBed } from '@angular/core/testing'

import { RegisteredUsersService } from './registered-users.service'

describe('RegisteredUsersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: RegisteredUsersService = TestBed.get(RegisteredUsersService)
    expect(service).toBeTruthy()
  })
})
