import { ChangeDetectorRef } from '@angular/core'
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
import { IndexedDBService } from 'src/app/services/online-indexed-db.service'
import { TranslateService } from '@ngx-translate/core'
import { AppTocHomePageComponent } from './app-toc-home-page.component'

const dataSubject = new BehaviorSubject<any>({
  content: { data: { identifier: 'id-1', creatorDetails: '', reviewer: '' } },
  pageData: { data: { analytics: null, banners: null, subtitleOnBanners: true, showDescription: true } },
})

const mockRoute: Partial<ActivatedRoute> = {
  queryParams: of({}),
  data: dataSubject.asObservable(),
  fragment: of(null),
  firstChild: undefined,
}

const mockRouter: Partial<Router> = {
  url: '/app/toc/course-1/overview',
  navigate: jest.fn(),
  events: of({} as any),
}

const mockContentSvc: Partial<WidgetContentService> = {
  fetchCourseBatches: jest.fn().mockReturnValue(of({})),
  fetchContentHistoryV2: jest.fn().mockReturnValue(of({})),
  enrollUserToBatch: jest.fn().mockReturnValue(Promise.resolve({})),
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
  warn: jest.fn(),
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

const mockIndexedDbService: Partial<IndexedDBService> = {
  checkDatabaseTablesExists: jest.fn().mockResolvedValue(true),
  getData: jest.fn().mockResolvedValue([]),
  getRecordFromTable: jest.fn().mockReturnValue(of({ data: '[]' })),
  insertData: jest.fn().mockReturnValue(of('ok')),
}

const mockCdr: Partial<ChangeDetectorRef> = {
  detectChanges: jest.fn(),
}

const mockTranslate: Partial<TranslateService> = {
  instant: jest.fn().mockImplementation((key: string) => key),
}

function createComponent(): AppTocHomePageComponent {
  return new AppTocHomePageComponent(
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
    mockIndexedDbService as IndexedDBService,
    mockCdr as ChangeDetectorRef,
    mockTranslate as TranslateService,
  )
}

describe('AppTocHomePageComponent', () => {
  let component: AppTocHomePageComponent

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

  it('should call setConfig() on construction', () => {
    expect(mockDiscussConfig.setConfig).toHaveBeenCalled()
  })

  it('should call show() and set discussionConfig on init when userProfile exists', () => {
    component.ngOnInit()
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
    dataSubject.next({ content: {}, pageData: {} })
    component.ngOnInit()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/login'])
    dataSubject.next({
      content: { data: { identifier: 'id-1' } },
      pageData: { data: {} },
    })
  })

  it('should navigate to stored url when present and content.data missing', () => {
    localStorage.setItem('url_before_login', '/stored-url')
    dataSubject.next({ content: {}, pageData: {} })
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
    component.toggleComponent('license')
    expect(component.routelinK).toBe('license')
    component.toggleComponent('references')
    expect(component.routelinK).toBe('references')
  })

  it('toggleComponent should enroll user for chapters when batchData is not enrolled', () => {
    component.batchData = { content: [{ courseId: 'c1', batchId: 'b1' }], enrolled: false } as any
    ;(mockContentSvc.enrollUserToBatch as jest.Mock).mockReturnValue(Promise.resolve({ result: { response: 'FAILURE' } }))
    component.toggleComponent('chapters')
    expect(component.routelinK).toBe('chapters')
    expect(mockContentSvc.enrollUserToBatch).toHaveBeenCalled()
  })

  it('checkRoute should toggle overview/chapters/references/license based on router url', () => {
    mockRouter.url = '/app/toc/course-1/overview'
    component.checkRoute()
    expect(component.routelinK).toBe('overview')

    mockRouter.url = '/app/toc/course-1/references'
    component.checkRoute()
    expect(component.routelinK).toBe('references')

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

  it('onTabChange should redirect to discuss when tab is discuss', () => {
    component.visibleTabs = ['overview', 'discuss']
    const redirectSpy = jest.spyOn(component, 'redirectTo')
    component.onTabChange(1)
    expect(redirectSpy).toHaveBeenCalled()
  })

  it('onTabChange should navigate with query params for chapters tab', () => {
    component.visibleTabs = ['overview', 'chapters']
    component.content = { identifier: 'id-1' } as any
    component.batchId = 'batch-1'
    component.onTabChange(1)
    expect(mockRouter.navigate).toHaveBeenCalledWith(['./chapters'], {
      relativeTo: mockRoute,
      queryParams: { batchId: 'batch-1', contentId: 'id-1' },
    })
  })

  it('updateVisibleTabs should push certification, chapters and references tabs based on content', () => {
    component.content = {
      resourceType: 'Certification',
      children: [{ id: 1 }],
      references: true,
    } as any
    component.updateVisibleTabs()
    expect(component.visibleTabs).toEqual(['overview', 'certification', 'chapters', 'references', 'discuss'])
  })

  it('setTabIndex should default to 0 when routelinK is not found', () => {
    component.visibleTabs = ['overview', 'chapters']
    component.routelinK = 'unknown'
    component.setTabIndex()
    expect(component.selectedIndex).toBe(0)
  })

  it('uniqueIdsByContentType should collect unique identifiers recursively', () => {
    const tree = [{ contentType: 'Resource', identifier: 'r1' }, { contentType: 'Course', identifier: 'c1', children: [{ contentType: 'Resource', identifier: 'r1' }] }]
    const result = component.uniqueIdsByContentType(tree, 'Resource')
    expect(result).toEqual(['r1'])
  })

  it('generateQuery should return default batchId/viewMode when no resume/first link', () => {
    component.forPreview = false
    component.batchData = null
    const result = component.generateQuery('START')
    expect(result.viewMode).toBe('START')
    expect(result.batchId).toBe('')
  })

  it('generateQuery should return empty object for preview mode with no links', () => {
    component.forPreview = true
    const result = component.generateQuery('START')
    expect(result).toEqual({})
  })

  it('generateQuery should build resume query params when resumeDataLink present', () => {
    component.forPreview = false
    component.resumeDataLink = { queryParams: { a: '1' } }
    const result = component.generateQuery('RESUME')
    expect(result.a).toBe('1')
    expect(result.viewMode).toBe('RESUME')
  })

  it('fetchBatchDetails should update batchData from content service response', () => {
    component.content = { identifier: 'id-1' } as any
    ;(mockContentSvc.fetchCourseBatches as jest.Mock).mockReturnValue(
      of({ content: [{ endDate: '2999-01-01' }] }),
    )
    component.fetchBatchDetails()
    expect(component.batchData?.content.length).toBe(1)
  })

  it('show should create tables when they do not exist', async () => {
    ;(mockIndexedDbService.checkDatabaseTablesExists as jest.Mock).mockResolvedValue(false)
    const createSpy = jest.fn().mockResolvedValue(undefined)
    component.createDatabaseAndTables = createSpy
    await component.show()
    expect(createSpy).toHaveBeenCalled()
  })

  it('show should check data when tables exist', async () => {
    ;(mockIndexedDbService.checkDatabaseTablesExists as jest.Mock).mockResolvedValue(true)
    const checkDataSpy = jest.spyOn(component, 'checkData')
    await component.show()
    expect(checkDataSpy).toHaveBeenCalled()
  })

  it('refreshTable should log fetched table data', async () => {
    await component.refreshTable()
    expect(mockIndexedDbService.getData).toHaveBeenCalledWith('onlineCourseProgress')
  })
})
