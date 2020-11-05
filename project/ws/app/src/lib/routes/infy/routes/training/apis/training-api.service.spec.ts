import { TestBed } from '@angular/core/testing'

import { TrainingApiService } from './training-api.service'

describe('TrainingApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: TrainingApiService = TestBed.get(TrainingApiService)
    expect(service).toBeTruthy()
  })
})
