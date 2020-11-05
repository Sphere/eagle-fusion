import { TestBed } from '@angular/core/testing'

import { KnowledgeHubService } from './knowledge-hub.service'

describe('KnowledgeHubService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: KnowledgeHubService = TestBed.get(KnowledgeHubService)
    expect(service).toBeTruthy()
  })
})
