import { ChangeDetectorRef } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { ActivatedRoute } from '@angular/router'
import { of, throwError } from 'rxjs'

jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class MockWidgetContentService {},
}))

import { WidgetContentService } from '@ws-widget/collection'
import { ViewerUtilService } from '../../../../../../../viewer/src/lib/viewer-util.service'
import { LoggerService } from '../../../../../../../../../library/ws-widget/utils/src/public-api'
import { AssessmentDetailComponent } from './assessment-detail.component'

const mockViewSvc: Partial<ViewerUtilService> = {
  getCompetencyAuthoringUrl: jest.fn().mockImplementation((url: string) => url),
  getAuthoringUrl: jest.fn().mockImplementation((url: string) => url),
  replaceToAuthUrl: jest.fn().mockImplementation((quiz: any) => quiz),
}

const mockHttp: Partial<HttpClient> = {
  get: jest.fn(),
}

const mockContentSvc: Partial<WidgetContentService> = {
  fetchContent: jest.fn(),
}

const mockLogger: Partial<LoggerService> = {
  log: jest.fn(),
}

const mockCdr: Partial<ChangeDetectorRef> = {
  detectChanges: jest.fn(),
}

function mockRoute(queryParams: any): Partial<ActivatedRoute> {
  return { snapshot: { queryParams } as any }
}

function createComponent(route: Partial<ActivatedRoute>): AssessmentDetailComponent {
  return new AssessmentDetailComponent(
    mockViewSvc as ViewerUtilService,
    mockHttp as HttpClient,
    mockContentSvc as WidgetContentService,
    route as ActivatedRoute,
    mockLogger as LoggerService,
    mockCdr as ChangeDetectorRef,
  )
}

describe('AssessmentDetailComponent', () => {
  let component: AssessmentDetailComponent

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    component = createComponent(mockRoute({}))
    expect(component).toBeTruthy()
  })

  it('should fetch quiz via artifactUrl for a non-competency content on init', async () => {
    component = createComponent(mockRoute({}))
    component.content = { artifactUrl: 'http://x/content/artifact.json', identifier: 'id-1' }
    const quiz = { questions: [{ multiSelection: false, question: 'q1' }], hasOwnProperty: Object.prototype.hasOwnProperty }
    ;(mockHttp.get as jest.Mock).mockReturnValue(of(quiz))
    await component.ngOnInit()
    expect(component.assesmentdata.questions[0].questionType).toBe('mcq-sca')
    expect(component.assesmentdata.passPercentage).toBe(60)
    expect(mockCdr.detectChanges).toHaveBeenCalled()
  })

  it('should set questionType to mcq-mca for multiSelection questions', async () => {
    component = createComponent(mockRoute({}))
    component.content = { artifactUrl: 'http://x/content/artifact.json', identifier: 'id-1' }
    const quiz = { questions: [{ multiSelection: true, question: 'q1' }] }
    ;(mockHttp.get as jest.Mock).mockReturnValue(of(quiz))
    await component.ngOnInit()
    expect(component.assesmentdata.questions[0].questionType).toBe('mcq-mca')
  })

  it('should fetch content detail when artifactUrl is missing', async () => {
    component = createComponent(mockRoute({}))
    component.content = { identifier: 'id-1' }
    const quiz = { questions: [{ multiSelection: false, question: 'q1' }] }
    ;(mockContentSvc.fetchContent as jest.Mock).mockReturnValue(of({ result: { content: { artifactUrl: 'http://x/content/artifact.json' } } }))
    ;(mockHttp.get as jest.Mock).mockReturnValue(of(quiz))
    await component.ngOnInit()
    expect(mockContentSvc.fetchContent).toHaveBeenCalledWith('id-1', 'detail')
    expect(component.assesmentdata.questions[0].questionType).toBe('mcq-sca')
  })

  it('should replace to auth url when forPreview is true', async () => {
    component = createComponent(mockRoute({}))
    component.forPreview = true
    component.content = { artifactUrl: 'http://x/artifact.json', identifier: 'id-1' }
    const quiz = { questions: [] }
    ;(mockHttp.get as jest.Mock).mockReturnValue(of(quiz))
    await component.ngOnInit()
    expect(mockViewSvc.getAuthoringUrl).toHaveBeenCalledWith('http://x/artifact.json')
    expect(mockViewSvc.replaceToAuthUrl).toHaveBeenCalled()
  })

  it('should follow competency path when queryParam competency is present with artifactUrl', async () => {
    (window as any)['env'] = { azureHost: 'http://azure-host' }
    component = createComponent(mockRoute({ competency: 'true' }))
    component.content = { artifactUrl: 'http://x/content/artifact.json', identifier: 'id-1' }
    const quiz = { questions: [{ multiSelection: false, question: 'q1' }] }
    ;(mockHttp.get as jest.Mock).mockReturnValue(of(quiz))
    await component.ngOnInit()
    expect(mockViewSvc.getCompetencyAuthoringUrl).toHaveBeenCalled()
    expect(component.assesmentdata.passPercentage).toBe(60)
  })

  it('should handle http error via catch and rejection downstream', async () => {
    component = createComponent(mockRoute({}))
    component.content = { artifactUrl: 'http://x/artifact.json', identifier: 'id-1' }
    ;(mockHttp.get as jest.Mock).mockReturnValue(throwError(() => new Error('network')))
    await expect(component.ngOnInit()).rejects.toBeTruthy()
  })

  it('should strip hi/ segment from competency artifact url', async () => {
    (window as any)['env'] = { azureHost: 'http://azure-host' }
    ;(mockViewSvc.getCompetencyAuthoringUrl as jest.Mock).mockReturnValue('http://x/hi/artifact.json')
    component = createComponent(mockRoute({ competency: 'true' }))
    component.content = { artifactUrl: 'http://x/content/artifact.json', identifier: 'id-1' }
    const quiz = { questions: [{ multiSelection: false, question: 'q1' }] }
    ;(mockHttp.get as jest.Mock).mockReturnValue(of(quiz))
    await component.ngOnInit()
    expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('http://x/artifact.json'))
  })

  it('should replace to auth url for competency artifactUrl path when forPreview is true', async () => {
    (window as any)['env'] = { azureHost: 'http://azure-host' }
    component = createComponent(mockRoute({ competency: 'true' }))
    component.forPreview = true
    component.content = { artifactUrl: 'http://x/content/artifact.json', identifier: 'id-1' }
    const quiz = { questions: [] }
    ;(mockHttp.get as jest.Mock).mockReturnValue(of(quiz))
    await component.ngOnInit()
    expect(mockViewSvc.replaceToAuthUrl).toHaveBeenCalled()
  })

  it('should set mcq-mca for multiSelection in competency artifactUrl path', async () => {
    (window as any)['env'] = { azureHost: 'http://azure-host' }
    component = createComponent(mockRoute({ competency: 'true' }))
    component.content = { artifactUrl: 'http://x/content/artifact.json', identifier: 'id-1' }
    const quiz = { questions: [{ multiSelection: true, question: 'q1' }] }
    ;(mockHttp.get as jest.Mock).mockReturnValue(of(quiz))
    await component.ngOnInit()
    expect(component.assesmentdata.questions[0].questionType).toBe('mcq-mca')
  })

  it('should follow competency path via fetchContent when artifactUrl is missing', async () => {
    (window as any)['env'] = { azureHost: 'http://azure-host' }
    component = createComponent(mockRoute({ competency: 'true' }))
    component.content = { identifier: 'id-1' }
    const quiz = { questions: [{ multiSelection: false, question: 'q1' }] }
    ;(mockContentSvc.fetchContent as jest.Mock).mockReturnValue(
      of({ result: { content: { artifactUrl: 'http://x/content/hi/artifact.json' } } }),
    )
    ;(mockHttp.get as jest.Mock).mockReturnValue(of(quiz))
    await component.ngOnInit()
    expect(mockContentSvc.fetchContent).toHaveBeenCalledWith('id-1', 'detail')
    expect(component.assesmentdata.questions[0].questionType).toBe('mcq-sca')
  })

  it('should set mcq-mca for multiSelection when artifactUrl is missing (non-competency)', async () => {
    component = createComponent(mockRoute({}))
    component.content = { identifier: 'id-1' }
    const quiz = { questions: [{ multiSelection: true, question: 'q1' }] }
    ;(mockContentSvc.fetchContent as jest.Mock).mockReturnValue(of({ result: { content: { artifactUrl: 'http://x/content/artifact.json' } } }))
    ;(mockHttp.get as jest.Mock).mockReturnValue(of(quiz))
    await component.ngOnInit()
    expect(component.assesmentdata.questions[0].questionType).toBe('mcq-mca')
  })

  it('should use authoring url when forPreview is true and artifactUrl is missing (non-competency)', async () => {
    component = createComponent(mockRoute({}))
    component.forPreview = true
    component.content = { identifier: 'id-1' }
    ;(mockContentSvc.fetchContent as jest.Mock).mockReturnValue(of({ result: { content: { artifactUrl: 'http://x/content/artifact.json' } } }))
    ;(mockHttp.get as jest.Mock).mockReturnValue(of({ questions: [] }))
    await component.ngOnInit()
    expect(mockViewSvc.getAuthoringUrl).toHaveBeenCalledWith('http://x/content/artifact.json')
  })
})
