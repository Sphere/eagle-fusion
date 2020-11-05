import { TestBed } from '@angular/core/testing'

import { CustomTourService } from './tour-guide.service'

describe('CustomTourService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: CustomTourService = TestBed.get(CustomTourService)
    expect(service).toBeTruthy()
  })
})
