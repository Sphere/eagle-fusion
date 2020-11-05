import { inject, TestBed } from '@angular/core/testing'
import { ContentAssignmentGuard } from './content-assignment.guard'

describe('ContentAssignmentGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContentAssignmentGuard],
    })
  })

  it('should ...', inject([ContentAssignmentGuard], (guard: ContentAssignmentGuard) => {
    expect(guard).toBeTruthy()
  }))
})
