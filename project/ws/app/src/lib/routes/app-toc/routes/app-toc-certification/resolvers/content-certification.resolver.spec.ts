import { TestBed } from '@angular/core/testing'

describe('ContentResolver', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: ContentResolver = TestBed.get(ContentResolver)
    expect(service).toBeTruthy()
  })
})
