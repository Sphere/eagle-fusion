import { TestBed } from '@angular/core/testing'

import { WidgetContentService } from './widget-content.service'

describe('WidgetContentService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: WidgetContentService = TestBed.get(WidgetContentService)
    expect(service).toBeTruthy()
  })
})
