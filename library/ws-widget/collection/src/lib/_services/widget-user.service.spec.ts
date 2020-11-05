import { TestBed } from '@angular/core/testing'

import { WidgetUserService } from './widget-user.service'

describe('WidgetUserService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: WidgetUserService = TestBed.get(WidgetUserService)
    expect(service).toBeTruthy()
  })
})
