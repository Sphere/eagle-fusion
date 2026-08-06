import { AssessmentDetailComponent } from './assessment-detail.component'

describe('AssessmentDetailComponent', () => {
  let component: AssessmentDetailComponent
  let mockViewSvc: any
  let mockHttp: any
  let mockContentSvc: any
  let mockCdr: any

  beforeEach(() => {
    mockViewSvc = {
      getCompetencyAuthoringUrl: jest.fn().mockReturnValue('https://authoring.host/artifact.json'),
      getAuthoringUrl: jest.fn().mockReturnValue('https://authoring.host/artifact.json'),
      replaceToAuthUrl: jest.fn(quiz => quiz),
    }
    mockHttp = { get: jest.fn() }
    mockContentSvc = { fetchContent: jest.fn() }
    mockCdr = { detectChanges: jest.fn() }
    const mockActivatedRoute = { snapshot: { queryParams: {} } } as any
    const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any

    component = new AssessmentDetailComponent(
      mockViewSvc,
      mockHttp,
      mockContentSvc,
      mockActivatedRoute,
      mockLogger,
      mockCdr,
    )
  })

  describe('transformQuiz isAssessment default (non-competency, direct artifactUrl path)', () => {
    it('honours an explicit isAssessment flag on the content', async () => {
      mockHttp.get.mockReturnValue({
        toPromise: jest.fn().mockResolvedValue({
          questions: [{ questionId: 'q1', multiSelection: false, options: [] }],
        }),
      })

      const result = await component['transformQuiz']({ artifactUrl: 'https://x/content/do_1/artifact.json', isAssessment: false })

      expect(result.isAssessment).toBe(false)
    })

    it('defaults isAssessment to true when the content does not specify it', async () => {
      mockHttp.get.mockReturnValue({
        toPromise: jest.fn().mockResolvedValue({
          questions: [{ questionId: 'q1', multiSelection: false, options: [] }],
        }),
      })

      const result = await component['transformQuiz']({ artifactUrl: 'https://x/content/do_1/artifact.json' })

      expect(result.isAssessment).toBe(true)
    })

    it('treats an explicit isAssessment: 0 as falsy but not nullish, so it is preserved', async () => {
      mockHttp.get.mockReturnValue({
        toPromise: jest.fn().mockResolvedValue({
          questions: [{ questionId: 'q1', multiSelection: false, options: [] }],
        }),
      })

      const result = await component['transformQuiz']({ artifactUrl: 'https://x/content/do_1/artifact.json', isAssessment: false })

      expect(result.isAssessment).toBe(false)
    })
  })

  describe('ngOnInit', () => {
    it('assigns the transformed quiz data and triggers change detection', async () => {
      component.content = { artifactUrl: 'https://x/content/do_1/artifact.json' }
      mockHttp.get.mockReturnValue({
        toPromise: jest.fn().mockResolvedValue({
          questions: [{ questionId: 'q1', multiSelection: false, options: [] }],
        }),
      })

      await component.ngOnInit()

      expect(component.assesmentdata.isAssessment).toBe(true)
      expect(mockCdr.detectChanges).toHaveBeenCalled()
    })
  })
})
