import { TestBed } from '@angular/core/testing'

import { MarkAsCompleteService } from './mark-as-complete.service'

describe('MarkAsCompleteService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: MarkAsCompleteService = TestBed.get(MarkAsCompleteService)
    expect(service).toBeTruthy()
  })
})
