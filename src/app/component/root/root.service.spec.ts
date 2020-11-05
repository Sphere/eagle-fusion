import { TestBed } from '@angular/core/testing'

import { RootService } from './root.service'

describe('RootService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: RootService = TestBed.get(RootService)
    expect(service).toBeTruthy()
  })
})
