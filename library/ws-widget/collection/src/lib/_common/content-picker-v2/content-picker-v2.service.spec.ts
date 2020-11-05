import { TestBed } from '@angular/core/testing'

import { ContentPickerV2Service } from './content-picker-v2.service'

describe('ContentPickerV2Service', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: ContentPickerV2Service = TestBed.get(ContentPickerV2Service)
    expect(service).toBeTruthy()
  })
})
