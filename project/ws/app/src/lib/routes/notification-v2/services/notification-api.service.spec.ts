import { TestBed } from '@angular/core/testing'

import { NotificationApiService } from './notification-api.service'

describe('NotificationApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: NotificationApiService = TestBed.get(NotificationApiService)
    expect(service).toBeTruthy()
  })
})
