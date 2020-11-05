import { TestBed } from '@angular/core/testing'

import { WorkFlowService } from './work-flow.service'

describe('WorkFlowService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: WorkFlowService = TestBed.get(WorkFlowService)
    expect(service).toBeTruthy()
  })
})
