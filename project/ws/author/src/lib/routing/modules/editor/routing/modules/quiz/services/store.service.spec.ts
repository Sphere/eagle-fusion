import { TestBed } from '@angular/core/testing'
import { QuizStoreService } from './store.service'

describe('QuizStoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: QuizStoreService = TestBed.get(QuizStoreService)
    expect(service).toBeTruthy()
  })
})
