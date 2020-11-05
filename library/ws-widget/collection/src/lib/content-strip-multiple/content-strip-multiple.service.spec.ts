import { TestBed } from '@angular/core/testing'

import { ContentStripMultipleService } from './content-strip-multiple.service'

describe('ContentStripMultipleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: ContentStripMultipleService = TestBed.get(ContentStripMultipleService)
    expect(service).toBeTruthy()
  })
})
