import { TestBed, async, inject } from '@angular/core/testing'

import { EmptyRouteGuard } from './empty-route.guard'

describe('EmptyRouteGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EmptyRouteGuard],
    })
  })

  it('should ...', inject([EmptyRouteGuard], (guard: EmptyRouteGuard) => {
    expect(guard).toBeTruthy()
  }))
})
