import { ActivatedRoute, Router } from '@angular/router'
import { BehaviorSubject, of, Subject } from 'rxjs'

jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class MockWidgetContentService {},
}))

jest.mock('@ws/author/src/public-api', () => ({
  AccessControlService: class MockAccessControlService {},
}))

import { WidgetContentService } from '@ws-widget/collection'
import { ConfigurationsService, LoggerService, SafeResourceUrlService } from '@ws-widget/utils'
import { AccessControlService } from '@ws/author/src/public-api'
import { AppTocService } from '../../services/app-toc.service'
import { WidgetUserService } from './../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-user.service'
import { DiscussConfigResolve } from '../../../../../../../../../src/app/routes/discussion-forum/wrapper/resolvers/discuss-config-resolve'
import { AppTocHomeComponent } from './app-toc-home.component'

const dataSubject = new BehaviorSubject<any>({
  content: { data: { identifier: 'id-1', creatorDetails: '', reviewer: '' } },
  pageData: { data: { banners: null, subtitleOnBanners: true, showDescription: true } },
})

const mockRoute: Partial<ActivatedRoute> = {
  queryParams: of({}),
  data: dataSubject.asObservable(),
  fragment: of(null),
  snapshot: { data: { pageData: { data: { analytics: null } } } } as any,
}

const mockRouter: Partial<Router> = {
  url: '/app/toc/course-1/overview',
  navigate: jest.fn(),
}

const mockContentSvc: Partial<WidgetContentService> = {
  fetchCourseBatches: jest.fn().mockReturnValue(of({})),
  fetchContentHistoryV2: jest.fn().mockReturnValue(of({})),
}

const mockUserSvc: Partial<WidgetUserService> = {
  fetchUserBatchList: jest.fn().mockReturnValue(of([])),
}

const showComponentSubject = new Subject<any>()

const mockTocSvc: Partial<AppTocService> = {
  batchReplaySubject: new Subject(),
  _showComponent: showComponentSubject as any,
  initData: jest.fn().mockReturnValue({ content: { identifier: 'id-1', children: [], primaryCategory: 'Course' }, errorCode: null }),
  updateResumaData: jest.fn(),
}

const mockLogger: Partial<LoggerService> = {
  log: jest.fn(),
  error: jest.fn(),
}

const mockConfigSvc: Partial<ConfigurationsService> = {
  userProfile: { userId: 'user-1' } as any,
  nodebbUserProfile: { username: 'test-user' } as any,
  pageNavBar: {},
  restrictedFeatures: new Set(),
}

const mockSafeResourceUrlSvc: Partial<SafeResourceUrlService> = {
  trustHtml: jest.fn().mockReturnValue('safe-html'),
}

const mockAuthAccessControlSvc: Partial<AccessControlService> = {
  proxyToAuthoringUrl: jest.fn().mockReturnValue('proxy-url'),
}

const mockDiscussConfig: Partial<DiscussConfigResolve> = {
  setConfig: jest.fn(),
}

function createComponent(): AppTocHomeComponent {
  return new AppTocHomeComponent(
    mockRoute as ActivatedRoute,
    mockRouter as Router,
    mockContentSvc as WidgetContentService,
    mockUserSvc as WidgetUserService,
    mockTocSvc as AppTocService,
    mockLogger as LoggerService,
    mockConfigSvc as ConfigurationsService,
    mockSafeResourceUrlSvc as SafeResourceUrlService,
    mockAuthAccessControlSvc as AccessControlService,
    mockDiscussConfig as DiscussConfigResolve,
  )
}

describe('AppTocHomeComponent', () => {
  let component: AppTocHomeComponent

  beforeEach(() => {
    jest.clearAllMocks()
    ;(mockTocSvc.initData as jest.Mock).mockReturnValue({
      content: { identifier: 'id-1', children: [], primaryCategory: 'Course' },
      errorCode: null,
    })
    ;(mockUserSvc.fetchUserBatchList as jest.Mock).mockReturnValue(of([]))
    ;(mockContentSvc.fetchCourseBatches as jest.Mock).mockReturnValue(of({}))
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call setConfig and set discussionConfig when userProfile exists', () => {
    expect(mockDiscussConfig.setConfig).toHaveBeenCalled()
    expect(component.discussionConfig.userName).toBe('test-user')
  })

  it('enableAnalytics should reflect restrictedFeatures', () => {
    mockConfigSvc.restrictedFeatures = new Set(['tocAnalytics'])
    expect(component.enableAnalytics).toBe(false)
    mockConfigSvc.restrictedFeatures = new Set()
    expect(component.enableAnalytics).toBe(true)
    mockConfigSvc.restrictedFeatures = undefined as any
    expect(component.enableAnalytics).toBe(false)
  })

  it('should initialize data via ngOnInit and subscribe to route data', () => {
    component.ngOnInit()
    expect(component.content).toEqual({ identifier: 'id-1', children: [], primaryCategory: 'Course' })
    expect(component.matspinner).toBe(false)
    expect(mockSafeResourceUrlSvc.trustHtml).toHaveBeenCalled()
  })

  it('should navigate to login when content.data is missing and no stored url', () => {
    localStorage.removeItem('url_before_login')
    dataSubject.next({ content: {}, pageData: { data: {} } })
    component.ngOnInit()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/login'])
    dataSubject.next({
      content: { data: { identifier: 'id-1' } },
      pageData: { data: {} },
    })
  })

  it('should navigate to stored url when present and content.data missing', () => {
    localStorage.setItem('url_before_login', '/stored-url')
    dataSubject.next({ content: {}, pageData: { data: {} } })
    component.ngOnInit()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/stored-url'])
    localStorage.removeItem('url_before_login')
    dataSubject.next({
      content: { data: { identifier: 'id-1' } },
      pageData: { data: {} },
    })
  })

  it('should unsubscribe routeSubscription on destroy', () => {
    component.ngOnInit()
    const unsubSpy = jest.spyOn(component.routeSubscription as any, 'unsubscribe')
    component.ngOnDestroy()
    expect(unsubSpy).toHaveBeenCalled()
  })

  it('checkJson should return true for valid json and false for invalid', () => {
    expect(component.checkJson('{"a":1}')).toBe(true)
    expect(component.checkJson('not-json')).toBe(false)
  })

  it('getBatchId should return last batchId from batchData content', () => {
    component.batchData = { content: [{ batchId: 'b1' }, { batchId: 'b2' }], enrolled: false } as any
    expect(component.getBatchId()).toBe('b2')
  })

  it('getBatchId should return empty string when no batchData', () => {
    component.batchData = null
    expect(component.getBatchId()).toBe('')
  })

  it('toggleComponent should set routelinK for known component names', () => {
    component.toggleComponent('overview')
    expect(component.routelinK).toBe('overview')
    component.toggleComponent('contents')
    expect(component.routelinK).toBe('contents')
    component.toggleComponent('license')
    expect(component.routelinK).toBe('license')
    component.toggleComponent('unknown')
    expect(component.routelinK).toBe('')
  })

  it('checkRoute should toggle overview/contents/license based on router url', () => {
    mockRouter.url = '/app/toc/course-1/overview'
    component.checkRoute()
    expect(component.routelinK).toBe('overview')

    mockRouter.url = '/app/toc/course-1/contents'
    component.checkRoute()
    expect(component.routelinK).toBe('contents')

    mockRouter.url = '/app/toc/course-1/something-else'
    component.checkRoute()
    expect(component.routelinK).toBe('license')
  })

  it('redirectTo should set routelinK to discuss and eventually load discussion widget', () => {
    jest.useFakeTimers()
    component.redirectTo()
    expect(component.routelinK).toBe('discuss')
    jest.runAllTimers()
    expect(component.loadDiscussionWidget).toBe(true)
    jest.useRealTimers()
  })

  it('showContents should call getUserEnrollmentList flow', () => {
    component.content = { identifier: 'id-1', primaryCategory: 'Resource' } as any
    const fetchSpy = jest.spyOn(mockContentSvc, 'fetchContentHistoryV2' as any)
    component.showContents()
    expect(fetchSpy).toHaveBeenCalled()
  })

  it('fetchBatchDetails should update batchData from content service response', () => {
    component.content = { identifier: 'id-1' } as any
    ;(mockContentSvc.fetchCourseBatches as jest.Mock).mockReturnValue(
      of({ content: [{ endDate: '2999-01-01' }] }),
    )
    component.fetchBatchDetails()
    expect(component.batchData?.content.length).toBe(1)
  })

  it('fetchBatchDetails should log error on failure', () => {
    component.content = { identifier: 'id-1' } as any
    ;(mockContentSvc.fetchCourseBatches as jest.Mock).mockReturnValue({
      subscribe: (_next: any, error: any) => error('failure'),
    })
    component.fetchBatchDetails()
    expect(mockLogger.error).toHaveBeenCalledWith('CONTENT HISTORY FETCH ERROR >', 'failure')
  })

  it('getUserEnrollmentList (via ngOnInit) should call getContinueLearningData when not primary Course', () => {
    ;(mockTocSvc.initData as jest.Mock).mockReturnValue({
      content: { identifier: 'id-1', primaryCategory: 'Resource', children: [] },
      errorCode: null,
    })
    component.ngOnInit()
    expect(mockContentSvc.fetchContentHistoryV2).toHaveBeenCalled()
  })

  it('getUserEnrollmentList should fetch batch details when user is not enrolled', () => {
    ;(mockUserSvc.fetchUserBatchList as jest.Mock).mockReturnValue(of([]))
    component.ngOnInit()
    expect(mockContentSvc.fetchCourseBatches).toHaveBeenCalled()
  })

  it('getUserEnrollmentList should populate batchData and navigate when user is enrolled', () => {
    ;(mockUserSvc.fetchUserBatchList as jest.Mock).mockReturnValue(
      of([{ courseId: 'id-1', batchId: 'batch-9', batch: { batchId: 'batch-9' }, completionPercentage: 40, status: 1 }]),
    )
    component.ngOnInit()
    expect(component.batchData?.enrolled).toBe(true)
    expect(mockRouter.navigate).toHaveBeenCalled()
  })

  it('getContinueLearningData (via getUserEnrollmentList) should set resumeData when response has contentList', () => {
    ;(mockContentSvc.fetchContentHistoryV2 as jest.Mock).mockReturnValue(
      of({ result: { contentList: [{ contentId: 'id-1', completionPercentage: 0, status: 2 }] } }),
    )
    ;(mockTocSvc.initData as jest.Mock).mockReturnValue({
      content: { identifier: 'id-1', primaryCategory: 'Resource', children: [], leafNodesCount: 2 },
      errorCode: null,
    })
    component.ngOnInit()
    expect(mockTocSvc.updateResumaData).toHaveBeenCalled()
  })
})
