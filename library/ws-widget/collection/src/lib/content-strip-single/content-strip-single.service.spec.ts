import { TestBed } from '@angular/core/testing'

import { ContentStripSingleService } from './content-strip-single.service'

describe('ContentStripSingleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: ContentStripSingleService = TestBed.get(ContentStripSingleService)
    expect(service).toBeTruthy()
  })
})
