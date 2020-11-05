import { TestBed } from '@angular/core/testing'

import { MyLearningService } from './my-learning.service'

describe('MyLearningService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: MyLearningService = TestBed.get(MyLearningService)
    expect(service).toBeTruthy()
  })
})
