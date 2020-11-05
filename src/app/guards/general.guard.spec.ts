import { TestBed, async, inject } from '@angular/core/testing'

import { GeneralGuard } from './general.guard'

describe('GeneralGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GeneralGuard],
    })
  })

  it('should ...', inject([GeneralGuard], (guard: GeneralGuard) => {
    expect(guard).toBeTruthy()
  }))
})
