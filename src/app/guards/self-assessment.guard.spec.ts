import { TestBed, async, inject } from '@angular/core/testing'

import { SelfAssessmentGuard } from './self-assessment.guard'

describe('SelfAssessmentGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SelfAssessmentGuard],
    })
  })

  it('should ...', inject([SelfAssessmentGuard], (guard: SelfAssessmentGuard) => {
    expect(guard).toBeTruthy()
  }))
})
