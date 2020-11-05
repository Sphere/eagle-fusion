import { TestBed } from '@angular/core/testing'

import { MyContentService } from './my-content.service'

describe('MyContentService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: MyContentService = TestBed.get(MyContentService)
    expect(service).toBeTruthy()
  })
})
