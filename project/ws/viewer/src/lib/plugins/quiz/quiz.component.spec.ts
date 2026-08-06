import { QuizComponent } from './quiz.component'

describe('QuizComponent', () => {
  let component: QuizComponent
  let mockHttp: any
  let mockViewSvc: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
    }
    mockViewSvc = {
      getCompetencyAuthoringUrl: jest.fn().mockReturnValue('https://authoring.host/artifact.json'),
    }
    component = new QuizComponent(
      {} as any, // events
      {} as any, // dialog
      {} as any, // quizSvc
      {} as any, // viewerSvc
      { snapshot: { queryParams: {} } } as any, // route
      {} as any, // location
      {} as any, // viewerDataSvc
      {} as any, // playerStateService
      {} as any, // router
      {} as any, // contentSvc
      {} as any, // loggerSvc
      {} as any, // configSvc
      mockHttp,
      mockViewSvc,
    )
    component.artifactUrl = 'https://sphere.aastrika.org/content/do_123/artifact/quiz.json'
  })

  describe('transformQuiz', () => {
    it('derives the authoring artifact url from artifactUrl and fetches it', async () => {
      mockHttp.get.mockReturnValue({ toPromise: jest.fn().mockResolvedValue({ questions: [] }) })

      await component['transformQuiz'](component.artifactUrl)

      expect(mockViewSvc.getCompetencyAuthoringUrl).toHaveBeenCalledWith('/do_123/artifact/quiz.json')
      expect(mockHttp.get).toHaveBeenCalledWith('https://authoring.host/artifact.json')
    })

    it('defaults undefined questionType to mcq-mca for multiSelection questions', async () => {
      mockHttp.get.mockReturnValue({
        toPromise: jest.fn().mockResolvedValue({
          questions: [{ questionId: 'q1', multiSelection: true, options: [] }],
        }),
      })

      const result = await component['transformQuiz'](component.artifactUrl)

      expect(result.questions[0].questionType).toBe('mcq-mca')
    })

    it('defaults undefined questionType to mcq-sca for single-selection questions', async () => {
      mockHttp.get.mockReturnValue({
        toPromise: jest.fn().mockResolvedValue({
          questions: [{ questionId: 'q1', multiSelection: false, options: [] }],
        }),
      })

      const result = await component['transformQuiz'](component.artifactUrl)

      expect(result.questions[0].questionType).toBe('mcq-sca')
    })

    it('leaves an already-set questionType untouched', async () => {
      mockHttp.get.mockReturnValue({
        toPromise: jest.fn().mockResolvedValue({
          questions: [{ questionId: 'q1', multiSelection: false, questionType: 'fitb', options: [] }],
        }),
      })

      const result = await component['transformQuiz'](component.artifactUrl)

      expect(result.questions[0].questionType).toBe('fitb')
    })

    it('resolves to undefined when the fetch fails, without throwing', async () => {
      mockHttp.get.mockReturnValue({ toPromise: jest.fn().mockRejectedValue(new Error('network error')) })

      const result = await component['transformQuiz'](component.artifactUrl)

      expect(result).toBeUndefined()
    })
  })

  describe('openOverviewDialog restart flow', () => {
    it('re-fetches and applies the transformed questions before opening the assessment/quiz dialog', async () => {
      const transformedQuestions = [{ questionId: 'q1', multiSelection: false, questionType: 'mcq-sca', options: [] }]
      jest.spyOn(component as any, 'transformQuiz').mockResolvedValue({ questions: transformedQuestions })
      const openAssesmentDialogSpy = jest.spyOn(component, 'openAssesmentDialog').mockImplementation(() => undefined)
      const openQuizDialogSpy = jest.spyOn(component, 'openQuizDialog').mockImplementation(() => undefined)
      component.quizJson = { timeLimit: 0, questions: [], isAssessment: true, passPercentage: 60 } as any

      const dialogOverviewMock = {
        afterClosed: () => ({
          subscribe: (cb: (result: any) => Promise<void>) => cb({ event: 'restart' }),
        }),
      }
      component.dialog = { closeAll: jest.fn(), open: jest.fn().mockReturnValue(dialogOverviewMock) } as any

      component.openOverviewDialog()
      // allow the async afterClosed callback (which awaits transformQuiz) to settle
      await Promise.resolve()
      await Promise.resolve()

      expect(component['transformQuiz']).toHaveBeenCalledWith(component.artifactUrl)
      expect(component.quizJson.questions).toBe(transformedQuestions)
      expect(openAssesmentDialogSpy).toHaveBeenCalled()
      expect(openQuizDialogSpy).not.toHaveBeenCalled()
    })
  })
})
