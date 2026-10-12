jest.mock('@ws-widget/collection', () => ({
  NsContent: {
    EMimeTypes: { QUIZ: 'application/vnd.sunbird.quiz' },
  },
}))
jest.mock('@ws-widget/utils', () => ({
  WsEvents: {
    EnumTelemetrySubType: { Loaded: 'Loaded', Unloaded: 'Unloaded' },
    WsEventType: { Telemetry: 'Telemetry' },
    WsEventLogLevel: { Info: 'Info' },
    WsTimeSpentType: { Player: 'Player' },
    WsTimeSpentMode: { Play: 'Play' },
  },
}))

import { Subject } from 'rxjs'
import { QuizComponent } from './quiz.component'

describe('QuizComponent (routes)', () => {
  let component: QuizComponent
  let mockActivatedRoute: any
  let mockHttp: any
  let mockContentSvc: any
  let mockEventSvc: any
  let mockViewSvc: any
  let mockCdr: any
  let routeDataSubject: Subject<any>

  const buildComponent = () => {
    routeDataSubject = new Subject()
    mockActivatedRoute = {
      snapshot: { queryParams: {} },
      data: routeDataSubject.asObservable(),
    }
    mockHttp = {
      get: jest.fn().mockReturnValue({
        toPromise: jest.fn().mockResolvedValue({ questions: [] }),
      }),
    }
    mockContentSvc = {
      setS3Cookie: jest.fn().mockReturnValue({
        toPromise: jest.fn().mockResolvedValue({}),
      }),
    }
    mockEventSvc = {
      dispatchEvent: jest.fn(),
    }
    mockViewSvc = {
      getCompetencyAuthoringUrl: jest.fn().mockReturnValue('competency-url'),
      getAuthoringUrl: jest.fn().mockReturnValue('author-url'),
      replaceToAuthUrl: jest.fn().mockImplementation(data => data),
      competencyAsessment: { next: jest.fn() },
    }
    mockCdr = { detectChanges: jest.fn() }
    return new QuizComponent(mockActivatedRoute, mockHttp, mockContentSvc, mockEventSvc, mockViewSvc, mockCdr)
  }

  beforeEach(() => {
    component = buildComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should load quiz data on route data emit and raise Loaded event', async () => {
    component.ngOnInit()
    routeDataSubject.next({ content: { data: { identifier: 'id1', artifactUrl: 'http://x/content/quiz.json' } } })
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    expect(component.isFetchingDataComplete).toBe(true)
    expect(component.quizData).toEqual({ identifier: 'id1', artifactUrl: 'http://x/content/quiz.json' })
    expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
    expect(component.alreadyRaised).toBe(true)
  })

  it('should raise Unloaded for old data when new data arrives after already raised', async () => {
    component.ngOnInit()
    routeDataSubject.next({ content: { data: { identifier: 'id1', artifactUrl: 'http://x/content/quiz.json' } } })
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    mockEventSvc.dispatchEvent.mockClear()
    routeDataSubject.next({ content: { data: { identifier: 'id2', artifactUrl: 'http://x/content/quiz2.json' } } })
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    const calledStates = mockEventSvc.dispatchEvent.mock.calls.map((c: any) => c[0].data.state)
    expect(calledStates).toContain('Unloaded')
    expect(calledStates).toContain('Loaded')
  })

  it('should call setS3Cookie when artifactUrl contains content-store', async () => {
    component.ngOnInit()
    routeDataSubject.next({ content: { data: { identifier: 'id1', artifactUrl: 'http://x/content-store/quiz.json' } } })
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    expect(mockContentSvc.setS3Cookie).toHaveBeenCalledWith('id1')
  })

  it('should swallow errors from transformQuiz and still mark fetching complete', async () => {
    mockHttp.get.mockReturnValue({
      toPromise: jest.fn().mockRejectedValue(new Error('boom')),
    })
    component.ngOnInit()
    routeDataSubject.next({ content: { data: { identifier: 'id1', artifactUrl: 'http://x/content/quiz.json' } } })
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    expect(component.isFetchingDataComplete).toBe(true)
  })

  it('should use competency authoring url when competency query param present', async () => {
    ;(window as any).env = { azureHost: 'https://azure-host' }
    mockActivatedRoute.snapshot.queryParams.competency = 'true'
    component.ngOnInit()
    routeDataSubject.next({ content: { data: { identifier: 'id1', artifactUrl: 'http://x/content/quiz.json' } } })
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    expect(mockViewSvc.getCompetencyAuthoringUrl).toHaveBeenCalled()
    expect(mockViewSvc.competencyAsessment.next).toHaveBeenCalledWith(true)
  })

  it('should set questionType mcq-mca / mcq-sca based on multiSelection', async () => {
    mockHttp.get.mockReturnValue({
      toPromise: jest.fn().mockResolvedValue({
        questions: [{ multiSelection: true }, { multiSelection: false }],
      }),
    })
    component.ngOnInit()
    routeDataSubject.next({ content: { data: { identifier: 'id1', artifactUrl: 'http://x/content/quiz.json' } } })
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    expect(component.quizJson.questions[0].questionType).toBe('mcq-mca')
    expect(component.quizJson.questions[1].questionType).toBe('mcq-sca')
  })

  it('should use authoring url when forPreview is true', async () => {
    (component as any).forPreview = true
    component.ngOnInit()
    routeDataSubject.next({ content: { data: { identifier: 'id1', artifactUrl: 'http://x/content/quiz.json' } } })
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    expect(mockViewSvc.getAuthoringUrl).toHaveBeenCalledWith('http://x/content/quiz.json')
    expect(mockViewSvc.replaceToAuthUrl).toHaveBeenCalled()
  })

  it('raiseEvent should be a no-op when forPreview is true', () => {
    ;(component as any).forPreview = true
    component.raiseEvent('Loaded' as any, { identifier: 'id1', artifactUrl: 'url', mimeType: 'x' } as any)
    expect(mockEventSvc.dispatchEvent).not.toHaveBeenCalled()
  })

  it('raiseEvent should dispatch an event when forPreview is false', () => {
    component.raiseEvent('Loaded' as any, { identifier: 'id1', artifactUrl: 'url', mimeType: 'x' } as any)
    expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
  })

  it('ngOnDestroy should raise Unloaded event and unsubscribe when quizData exists', async () => {
    component.ngOnInit()
    routeDataSubject.next({ content: { data: { identifier: 'id1', artifactUrl: 'http://x/content/quiz.json' } } })
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    mockEventSvc.dispatchEvent.mockClear()
    component.ngOnDestroy()
    expect(mockEventSvc.dispatchEvent).toHaveBeenCalled()
  })

  it('ngOnDestroy should not throw when quizData is null', () => {
    expect(() => component.ngOnDestroy()).not.toThrow()
  })

  it('should handle activatedRoute.data error callback without throwing', () => {
    expect(() => component.ngOnInit()).not.toThrow()
    routeDataSubject.error(new Error('route error'))
  })
})
