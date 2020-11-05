import { TestBed } from '@angular/core/testing'

import { TrainingContentService } from './training-content.service'

describe('TrainingContentService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: TrainingContentService = TestBed.get(TrainingContentService)
    expect(service).toBeTruthy()
  })
})
