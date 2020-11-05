import { TestBed, inject } from '@angular/core/testing'

import { ChannelsGuard } from './channels.guard'

describe('ChannelsGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChannelsGuard],
    })
  })

  it('should ...', inject([ChannelsGuard], (guard: ChannelsGuard) => {
    expect(guard).toBeTruthy()
  }))
})
