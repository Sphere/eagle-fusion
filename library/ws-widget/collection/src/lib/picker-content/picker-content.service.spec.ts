import { TestBed } from '@angular/core/testing'

import { PickerContentService } from './picker-content.service'

describe('PickerContentService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: PickerContentService = TestBed.get(PickerContentService)
    expect(service).toBeTruthy()
  })
})
