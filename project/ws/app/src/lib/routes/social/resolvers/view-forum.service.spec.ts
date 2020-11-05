import { TestBed } from '@angular/core/testing'

import { ViewForumService } from './view-forum.service'

describe('ViewForumService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: ViewForumService = TestBed.get(ViewForumService)
    expect(service).toBeTruthy()
  })
})
