/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing'
import { BtnProfileService } from './btn-profile.service'

describe('Service: BtnProfile', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BtnProfileService],
    })
  })

  it('should ...', inject([BtnProfileService], (service: BtnProfileService) => {
    expect(service).toBeTruthy()
  }))
})
