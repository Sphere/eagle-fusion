import { TestBed } from '@angular/core/testing'

import { WidgetContentShareService } from './widget-content-share.service'

describe('WidgetContentShareService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: WidgetContentShareService = TestBed.get(WidgetContentShareService)
    expect(service).toBeTruthy()
  })
})
