import { TestBed } from '@angular/core/testing'

import { KnowledgeHubApiService } from './knowledge-hub-api.service'

describe('KnowledgeHubApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: KnowledgeHubApiService = TestBed.get(KnowledgeHubApiService)
    expect(service).toBeTruthy()
  })
})
