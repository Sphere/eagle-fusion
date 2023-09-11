import { TestBed } from '@angular/core/testing'

import { UserAgentResolverService } from './user-agent.service'

describe('UserAgentResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: UserAgentResolverService = TestBed.get(UserAgentResolverService)
    expect(service).toBeTruthy()
  })
})
