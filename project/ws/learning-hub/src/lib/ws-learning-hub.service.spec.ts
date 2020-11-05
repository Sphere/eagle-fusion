import { TestBed } from '@angular/core/testing'

import { WsLearningHubService } from './ws-learning-hub.service'

describe('WsLearningHubService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: WsLearningHubService = TestBed.get(WsLearningHubService)
    expect(service).toBeTruthy()
  })
})
