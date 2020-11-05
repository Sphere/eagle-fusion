import { TestBed } from '@angular/core/testing'

import { ConfigurationsService } from './configurations.service'

describe('ConfigurationsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: ConfigurationsService = TestBed.get(ConfigurationsService)
    expect(service).toBeTruthy()
  })
})
