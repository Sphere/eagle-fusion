import { AshaLearningCompletedComponent } from './asha-learning-completed.component'

describe('AshaLearningCompletedComponent', () => {
  let comp: AshaLearningCompletedComponent
  let mockRouter: any

  beforeEach(() => {
    mockRouter = { navigate: jest.fn() }
    comp = new AshaLearningCompletedComponent(mockRouter)
  })

  it('should create with defaults', () => {
    expect(comp).toBeTruthy()
    expect(comp.completedCount).toBe(0)
    expect(() => comp.ngOnInit()).not.toThrow()
  })

  it('viewCourses navigates to search with the five level queries', () => {
    comp.viewCourses({ competencyID: '7' })
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/search'], {
      queryParams: {
        q: ['7-1', '7-2', '7-3', '7-4', '7-5'],
        competency: true,
        redirect: 'page/home',
      },
      queryParamsHandling: 'merge',
    })
  })

  it('viewCourses does nothing without a competencyID', () => {
    comp.viewCourses({})
    expect(mockRouter.navigate).not.toHaveBeenCalled()
  })
})
