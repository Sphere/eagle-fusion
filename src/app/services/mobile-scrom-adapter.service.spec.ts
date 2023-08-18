import { TestBed } from '@angular/core/testing'

import { MobileScromAdapterService } from './mobile-scrom-adapter.service'

describe('MobileScromAdapterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: MobileScromAdapterService = TestBed.get(MobileScromAdapterService)
    expect(service).toBeTruthy()
  })
})
