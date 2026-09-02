jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class {},
  NsContent: { EContentTypes: {} },
  NsDiscussionForum: {},
}))
jest.mock('@ws-widget/resolver', () => ({ NsWidgetResolver: {} }))
jest.mock('@ws-widget/utils', () => ({
  ValueService: class {},
  ConfigurationsService: class {},
}))
jest.mock('../../../../../src/app/routes/discussion-forum/wrapper/resolvers/discuss-config-resolve', () => ({
  DiscussConfigResolve: class {},
}))

import { of, BehaviorSubject, Subject } from 'rxjs'
import { TestBed } from '@angular/core/testing'
import { ViewerComponent, ErrorType } from './viewer.component'

describe('ViewerComponent', () => {
  let component: ViewerComponent
  let mockActivatedRoute: any
  let mockRouter: any
  let mockValueSvc: any
  let mockDataSvc: any
  let mockRootSvc: any
  let mockChangeDetector: any
  let mockConfigSvc: any
  let mockWidgetContentSvc: any
  let mockViewerSvc: any
  let mockDiscussiConfig: any

  beforeEach(() => {
    mockActivatedRoute = {
      snapshot: { queryParamMap: { get: jest.fn().mockReturnValue('collection-1') }, queryParams: {} },
      data: of({ content: { data: null } }),
    }
    mockRouter = { navigate: jest.fn() }
    mockValueSvc = { isMobile: jest.fn().mockReturnValue(false), isLtMedium$: of(false) }
    mockDataSvc = {
      changedSubject: new Subject<any>(),
      status: 'none',
      error: null,
      changeFullScreen: jest.fn(),
    }
    mockRootSvc = { showNavbarDisplay$: new BehaviorSubject<boolean>(true) }
    mockChangeDetector = { markForCheck: jest.fn() }
    mockConfigSvc = { userProfile: null, nodebbUserProfile: null }
    mockWidgetContentSvc = {
      fetchContent: jest.fn().mockReturnValue(of({})),
      fetchConfig: jest.fn().mockReturnValue(of({})),
    }
    mockViewerSvc = { getContent: jest.fn().mockReturnValue(of({})) }
    mockDiscussiConfig = { setConfig: jest.fn() }

    component = TestBed.runInInjectionContext(() => new ViewerComponent(
      mockActivatedRoute,
      mockRouter,
      mockValueSvc,
      mockDataSvc,
      mockRootSvc,
      mockChangeDetector,
      mockConfigSvc,
      mockWidgetContentSvc,
      mockViewerSvc,
      mockDiscussiConfig,
    ))
  })

  it('should create and hide the navbar on construction', () => {
    expect(component).toBeTruthy()
    expect(mockRootSvc.showNavbarDisplay$.getValue()).toBe(false)
    expect(mockDiscussiConfig.setConfig).toHaveBeenCalled()
  })

  it('sets discussionConfig.userName when a userProfile with nodebb profile exists', () => {
    mockConfigSvc.userProfile = { userId: 'u1' }
    mockConfigSvc.nodebbUserProfile = { username: 'jdoe' }
    const comp = TestBed.runInInjectionContext(() => new ViewerComponent(
      mockActivatedRoute, mockRouter, mockValueSvc, mockDataSvc, mockRootSvc,
      mockChangeDetector, mockConfigSvc, mockWidgetContentSvc, mockViewerSvc, mockDiscussiConfig,
    ))
    expect(comp.discussionConfig.userName).toBe('jdoe')
  })

  describe('checkJson', () => {
    it('returns false for null/undefined input', () => {
      expect(component.checkJson(null)).toBe(false)
      expect(component.checkJson(undefined)).toBe(false)
    })

    it('returns true for valid JSON strings', () => {
      expect(component.checkJson('{"a":1}')).toBe(true)
    })

    it('returns false for invalid JSON strings', () => {
      expect(component.checkJson('not-json')).toBe(false)
    })
  })

  describe('getContentData', () => {
    it('parses a JSON reviewer string, sets content and builds the discussion widget', () => {
      const activatedRoute = { data: of({ content: { data: { reviewer: '{"name":"x"}', learningObjective: 'CC0', identifier: 'id1', name: 'n', description: 'd' } } }) } as any
      component.getContentData({ activatedRoute } as any)
      expect(component.content!.reviewer).toEqual({ name: 'x' })
      expect(component.currentLicenseName).toBe('CC0')
    })

    it('defaults currentLicenseName to CC BY when learningObjective is missing', () => {
      const activatedRoute = { data: of({ content: { data: { identifier: 'id1', name: 'n', description: 'd' } } }) } as any
      component.getContentData({ activatedRoute } as any)
      expect(component.currentLicenseName).toBe('CC BY')
    })

    it('does nothing when content data is absent', () => {
      const activatedRoute = { data: of({ content: null }) } as any
      component.getContentData({ activatedRoute } as any)
      expect(component.content).toBeNull()
    })
  })

  describe('getCourseContentData', () => {
    it('fetches and stores contentData from the collectionId query param', () => {
      const data: any = { identifier: 'course-1' }
      mockWidgetContentSvc.fetchContent.mockReturnValue(of(data))
      component.getCourseContentData()
      expect(component.contentData).toBe(data)
    })
  })

  describe('formDiscussionForumWidget', () => {
    it('returns early when content is null', () => {
      component.discussionConfig = {}
      component.formDiscussionForumWidget(null)
      expect(component.discussionConfig).toEqual({})
    })

    it('sets contextIdArr and contextType from content', () => {
      component.formDiscussionForumWidget({ identifier: 'r1', name: 'n', description: 'd' } as any)
      expect(component.discussionConfig.contextIdArr).toEqual(['r1'])
      expect(component.discussionConfig.contextType).toBe('course')
    })
  })

  describe('ngOnInit / error handling', () => {
    it('sets isTypeOfCollection based on the collectionType query param', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionType: 'Course' }
      component.ngOnInit()
      expect(component.isTypeOfCollection).toBe(true)
    })

    it('maps a 403 error status to accessForbidden', () => {
      component.ngOnInit()
      mockDataSvc.status = 'error'
      mockDataSvc.error = { status: 403 }
      mockDataSvc.changedSubject.next(undefined)
      expect(component.errorWidgetData.widgetData.errorType).toBe(ErrorType.accessForbidden)
    })

    it('maps a 404 error status to notFound', () => {
      component.ngOnInit()
      mockDataSvc.error = { status: 404 }
      mockDataSvc.changedSubject.next(undefined)
      expect(component.errorWidgetData.widgetData.errorType).toBe(ErrorType.notFound)
    })

    it('maps a 500 error status to internalServer', () => {
      component.ngOnInit()
      mockDataSvc.error = { status: 500 }
      mockDataSvc.changedSubject.next(undefined)
      expect(component.errorWidgetData.widgetData.errorType).toBe(ErrorType.internalServer)
    })

    it('maps a 503 error status to serviceUnavailable', () => {
      component.ngOnInit()
      mockDataSvc.error = { status: 503 }
      mockDataSvc.changedSubject.next(undefined)
      expect(component.errorWidgetData.widgetData.errorType).toBe(ErrorType.serviceUnavailable)
    })

    it('maps any other error status to somethingWrong', () => {
      component.ngOnInit()
      mockDataSvc.error = { status: 418 }
      mockDataSvc.changedSubject.next(undefined)
      expect(component.errorWidgetData.widgetData.errorType).toBe(ErrorType.somethingWrong)
    })

    it('navigates to the probable url on a mimeTypeMismatch error after a delay', () => {
      jest.useFakeTimers()
      component.ngOnInit()
      mockDataSvc.error = { errorType: ErrorType.mimeTypeMismatch, probableUrl: '/viewer/video/r1' }
      mockDataSvc.changedSubject.next(undefined)
      jest.advanceTimersByTime(3000)
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/viewer/video/r1'])
      jest.useRealTimers()
    })
  })

  describe('getLicenseConfig', () => {
    it('filters the fetched license metadata by currentLicenseName', () => {
      component.currentLicenseName = 'CC BY'
      mockWidgetContentSvc.fetchConfig.mockReturnValue(of({ licenses: [{ licenseName: 'CC BY' }, { licenseName: 'Other' }] }))
      component.getLicenseConfig()
      expect(component.currentLicense).toEqual([{ licenseName: 'CC BY' }])
    })

    it('retries once on a 404 error response', () => {
      let callCount = 0
      mockWidgetContentSvc.fetchConfig.mockImplementation(() => ({
        subscribe: (success: any, error: any) => {
          callCount += 1
          if (callCount === 1) {
            error({ status: 404 })
          } else {
            success({ licenses: [] })
          }
        },
      }))
      component.getLicenseConfig()
      expect(callCount).toBe(2)
    })
  })

  describe('fullScreenState', () => {
    it('delegates to dataSvc.changeFullScreen', () => {
      component.fullScreenState(true)
      expect(mockDataSvc.changeFullScreen).toHaveBeenCalledWith(true)
    })
  })

  describe('toggleSideBar / minimizeBar', () => {
    it('toggle the sideNavBarOpened flag', () => {
      component.sideNavBarOpened = false
      component.toggleSideBar()
      expect(component.sideNavBarOpened).toBe(true)
      component.minimizeBar()
      expect(component.sideNavBarOpened).toBe(false)
    })
  })

  describe('parseJsonData', () => {
    it('parses valid JSON', () => {
      expect(component.parseJsonData('{"a":1}')).toEqual({ a: 1 })
    })

    it('returns {} for invalid JSON', () => {
      expect(component.parseJsonData('not-json')).toEqual({})
    })
  })

  describe('ngOnDestroy', () => {
    it('restores the navbar and unsubscribes all active subscriptions', () => {
      component.ngOnInit()
      component.ngOnDestroy()
      expect(mockRootSvc.showNavbarDisplay$.getValue()).toBe(true)
    })

    it('is safe to call when no subscriptions were established', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})
