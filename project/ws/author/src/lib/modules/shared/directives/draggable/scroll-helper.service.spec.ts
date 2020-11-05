import { TestBed } from '@angular/core/testing'

import { ScrollHelperService } from './scroll-helper.service'

describe('ScrollHelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: ScrollHelperService = TestBed.get(ScrollHelperService)
    expect(service).toBeTruthy()
  })
})
