import { TestBed } from '@angular/core/testing'

import { EditForumService } from './edit-forum.service'

describe('EditForumService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: EditForumService = TestBed.get(EditForumService)
    expect(service).toBeTruthy()
  })
})
