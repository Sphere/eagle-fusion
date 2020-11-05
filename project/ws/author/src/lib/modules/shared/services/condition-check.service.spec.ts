import { TestBed } from '@angular/core/testing'

import { ConditionCheckService } from './condition-check.service'

describe('ConditionCheckService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: ConditionCheckService = TestBed.get(ConditionCheckService)
    expect(service).toBeTruthy()
  })
})
