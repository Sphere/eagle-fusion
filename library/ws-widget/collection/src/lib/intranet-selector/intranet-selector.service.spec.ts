import { TestBed } from '@angular/core/testing'

import { IntranetSelectorService } from './intranet-selector.service'

describe('IntranetSelectorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: IntranetSelectorService = TestBed.get(IntranetSelectorService)
    expect(service).toBeTruthy()
  })
})
