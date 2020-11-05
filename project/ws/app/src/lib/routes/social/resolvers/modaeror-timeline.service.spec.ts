import { TestBed } from '@angular/core/testing'

import { ModeratorTimelineService } from './moderator-timeline.service'

describe('ModaerorTimelineService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: ModeratorTimelineService = TestBed.get(ModeratorTimelineService)
    expect(service).toBeTruthy()
  })
})
