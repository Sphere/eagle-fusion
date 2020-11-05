import { TestBed } from '@angular/core/testing'
import { SubapplicationRespondService } from './subapplication-respond.service'

describe('SubapplicationRespondService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: SubapplicationRespondService = TestBed.get(SubapplicationRespondService)
    expect(service).toBeTruthy()
  })
})
