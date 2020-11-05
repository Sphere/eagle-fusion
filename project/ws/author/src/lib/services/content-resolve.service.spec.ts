import { TestBed } from '@angular/core/testing'

import { ContentTOCResolver } from './content-resolve.service'

describe('ContentTOCResolver', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: ContentTOCResolver = TestBed.get(ContentTOCResolver)
    expect(service).toBeTruthy()
  })
})
