import { TestBed } from '@angular/core/testing'
import { ChangeDetectorRef } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { DOCUMENT } from '@angular/common'
import { of, Subject } from 'rxjs'

jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class MockWidgetContentService { },
  NsContent: {
    EContentTypes: {
      COURSE: 'Course',
      RESOURCE: 'Resource',
      KNOWLEDGE_ARTIFACT: 'Knowledge Artifact',
    },
    EFilterCategory: {
      PRACTICE: 'PRACTICE',
      ASSESS: 'ASSESS',
      ALL: 'ALL',
    },
  },
  viewerRouteGenerator: jest.fn().mockReturnValue({ url: '/viewer/url', queryParams: {} }),
}))

jest.mock('@ws/author/src/lib/services/loader.service', () => ({
  LoaderService: class MockLoaderService { },
}))

import { WidgetContentService } from '@ws-widget/collection'
import { ConfigurationsService, TelemetryService, LoggerService, SafeResourceUrlService } from '@ws-widget/utils'
import { UtilityService } from '@ws-widget/utils/src/lib/services/utility.service'
import { AppTocService } from '../../services/app-toc.service'
import { MobileAppsService } from 'src/app/services/mobile-apps.service'
import { IndexedDBService } from 'src/app/services/online-indexed-db.service'
import { LoaderService } from 'src/app/services/loader.service'
import { TranslateService } from '@ngx-translate/core'
import { ThemeService } from '../../../../../../../../../src/app/services/theme.service'
import { AppTocDesktopComponent } from './app-toc-desktop.component'
import { AppTocDesktopModalComponent } from '../app-toc-desktop-modal/app-toc-desktop-modal.component'
import { AppTocCertificateModalComponent } from '../app-toc-certificate-modal/app-toc-certificate-modal.component'

const mockSanitizer: Partial<SafeResourceUrlService> = {
  trustStyle: jest.fn().mockReturnValue('trusted-style'),
}

const mockRouter: Partial<Router> = {
  url: '/app/toc/course-1/overview',
  navigate: jest.fn(),
  navigateByUrl: jest.fn(),
  events: of({}),
}

const mockRoute: Partial<ActivatedRoute> = {
  data: of({ pageData: { data: {} } }),
  queryParamMap: of({ get: () => null } as any),
  snapshot: { queryParams: {} } as any,
}

const dialogRefStub = { afterClosed: () => of({ event: 'CONFIRMED' }) }
const mockDialog: Partial<MatDialog> = {
  open: jest.fn().mockReturnValue(dialogRefStub),
}

const mockTocSvc: Partial<AppTocService> = {
  showStartButton: jest.fn().mockReturnValue({ show: true, msg: '' }),
  subtitleOnBanners: false,
  analyticsFetchStatus: 'none' as any,
  fetchPostAssessmentStatus: jest.fn().mockReturnValue(of({ result: [] })),
  filterToc: jest.fn().mockReturnValue(null),
  fetchExternalContentAccess: jest.fn().mockReturnValue(of({ hasAccess: true })),
  fetchContentCohorts: jest.fn().mockReturnValue(of([])),
}

const mockConfigSvc: Partial<ConfigurationsService> = {
  userProfile: { userId: 'user-1', rootOrgId: 'org-1' } as any,
  instanceConfig: { logos: { defaultSourceLogo: 'logo.svg' } } as any,
  restrictedFeatures: new Set(),
  orgSelectiveCourseConfig: null as any,
  rootOrg: 'org-1',
}

const mockContentSvc: Partial<WidgetContentService> = {
  showConformation: false,
  fetchUserBatchList: jest.fn().mockReturnValue(of([])),
  getFirstChildInHierarchy: jest.fn().mockReturnValue({ identifier: 'first-1', mimeType: 'application/pdf' }),
  getRegistrationStatus: jest.fn().mockResolvedValue({ hasAccess: true }),
  processCertificate: jest.fn().mockReturnValue(of({ responseCode: 'OK' })),
  readCourseRating: jest.fn().mockResolvedValue({ params: { status: 'success' }, result: {} }),
  readCourseRatingSummary: jest.fn().mockResolvedValue({ result: { message: 'Successful', response: { sum_of_total_ratings: 8, total_number_of_ratings: 2 } } }),
  enrollUserToBatch: jest.fn().mockResolvedValue({ result: { response: 'SUCCESS' } }),
}

const mockUtilitySvc: Partial<UtilityService> = {
  isMobile: false,
}

const mockMobileAppsSvc: Partial<MobileAppsService> = {
  sendViewerData: jest.fn(),
}

const mockSnackBar: Partial<MatSnackBar> = {
  open: jest.fn(),
}

const mockLoader: Partial<LoaderService> = {
  changeLoad: new Subject<boolean>() as any,
}

const mockIndexedDbService: Partial<IndexedDBService> = {
  getRecordFromTable: jest.fn().mockReturnValue(of({ contentId: '', url: '' })),
}

const mockTelemetrySvc: Partial<TelemetryService> = {
  interact: jest.fn(),
}

const mockLogger: Partial<LoggerService> = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}

const mockTranslate: Partial<TranslateService> = {
  instant: jest.fn().mockImplementation((key: string) => key),
}

const mockThemeSvc: Partial<ThemeService> = {
  isDark: jest.fn().mockReturnValue(false) as any,
}

function createComponent(): AppTocDesktopComponent {
  return TestBed.runInInjectionContext(() => new AppTocDesktopComponent(
    mockSanitizer as SafeResourceUrlService,
    mockRouter as Router,
    mockRoute as ActivatedRoute,
    mockDialog as MatDialog,
    mockTocSvc as AppTocService,
    mockConfigSvc as ConfigurationsService,
    mockContentSvc as WidgetContentService,
    mockUtilitySvc as UtilityService,
    mockMobileAppsSvc as MobileAppsService,
    mockSnackBar as MatSnackBar,
    mockDialog as MatDialog,
    mockLoader as LoaderService,
    mockIndexedDbService as IndexedDBService,
    document as Document,
    mockTelemetrySvc as TelemetryService,
    mockLogger as LoggerService,
    mockTranslate as TranslateService,
    { detectChanges: jest.fn(), markForCheck: jest.fn() } as unknown as ChangeDetectorRef,
    mockThemeSvc as ThemeService,
  ))
}

describe('AppTocDesktopComponent', () => {
  let component: AppTocDesktopComponent

  beforeEach(() => {
    jest.clearAllMocks()
    TestBed.configureTestingModule({ providers: [{ provide: DOCUMENT, useValue: document }] })
      ; (mockContentSvc.fetchUserBatchList as jest.Mock).mockReturnValue(of([]))
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('redirect should navigate to sessionStorage url when present', () => {
    sessionStorage.setItem('cURL', '/some-path')
    component.redirect()
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/some-path')
    sessionStorage.removeItem('cURL')
  })

  it('redirect should navigate to org selective url when config matches', () => {
    sessionStorage.removeItem('cURL')
    mockConfigSvc.orgSelectiveCourseConfig = { orgId: 'org-1', redirectUrl: '/selective' } as any
    component.redirect()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/selective'])
    mockConfigSvc.orgSelectiveCourseConfig = null as any
  })

  it('redirect should default to home when no match', () => {
    sessionStorage.removeItem('cURL')
    component.redirect()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/page/home'])
  })

  it('uniqueIdsByContentType should collect matching identifiers recursively', () => {
    const tree = [{ contentType: 'Resource', identifier: 'r1' }, { contentType: 'Course', identifier: 'c1', children: [{ contentType: 'Resource', identifier: 'r1' }] }]
    expect(component.uniqueIdsByContentType(tree, 'Resource')).toEqual(['r1'])
  })

  it('getStarImage should return full, half and empty star icons', () => {
    component.averageRating = 3.5
    expect(component.getStarImage(0)).toBe('/fusion-assets/icons/toc_star.png')
    expect(component.getStarImage(3)).toBe('/fusion-assets/icons/Half_star1.svg')
    expect(component.getStarImage(4)).toBe('/fusion-assets/icons/empty_star.png')
  })

  it('setConfirmDialogStatus should set showConformation on contentSvc', () => {
    component.setConfirmDialogStatus(70)
    expect(mockContentSvc.showConformation).toBe(70)
  })

  it('showIntranetMsg should return true when isMobile', () => {
    mockUtilitySvc.isMobile = true
    expect(component.showIntranetMsg).toBe(true)
    mockUtilitySvc.isMobile = false
  })

  it('showIntranetMsg should return showIntranetMessage when not mobile', () => {
    mockUtilitySvc.isMobile = false
    component.showIntranetMessage = true
    expect(component.showIntranetMsg).toBe(true)
  })

  it('showStart should delegate to tocSvc.showStartButton', () => {
    component.content = { identifier: 'c1' } as any
    expect(component.showStart).toEqual({ show: true, msg: '' })
    expect(mockTocSvc.showStartButton).toHaveBeenCalledWith(component.content)
  })

  it('isPostAssessment should be false without tocConfig', () => {
    component.tocConfig = null
    expect(component.isPostAssessment).toBe(false)
  })

  it('isPostAssessment should be true for instructor-led course', () => {
    component.tocConfig = {}
    component.content = { contentType: 'Course', learningMode: 'Instructor-Led' } as any
    expect(component.isPostAssessment).toBe(true)
  })

  it('isMobile getter should reflect utilitySvc.isMobile', () => {
    mockUtilitySvc.isMobile = true
    expect(component.isMobile).toBe(true)
    mockUtilitySvc.isMobile = false
  })

  it('showSubtitleOnBanner should reflect tocSvc.subtitleOnBanners', () => {
    ; (mockTocSvc as any).subtitleOnBanners = true
    expect(component.showSubtitleOnBanner).toBe(true)
  })

  it('isResource should be true for KNOWLEDGE_ARTIFACT/RESOURCE/no children and call sendViewerData', () => {
    component.content = { contentType: 'Resource', children: [] } as any
    expect(component.isResource).toBe(true)
    expect(mockMobileAppsSvc.sendViewerData).toHaveBeenCalledWith(component.content)
  })

  it('isResource should be false when content is null', () => {
    component.content = null
    expect(component.isResource).toBe(false)
  })

  it('showInstructorLedMsg should reflect learningMode and empty children/artifactUrl', () => {
    component.actionBtnStatus = 'grant'
    component.content = { status: 'Active', learningMode: 'Instructor-Led', children: [], artifactUrl: '' } as any
    expect(component.showInstructorLedMsg).toBe(true)
  })

  it('isHeaderHidden should reflect isResource and empty artifactUrl', () => {
    component.content = { contentType: 'Resource', children: [], artifactUrl: '' } as any
    expect(component.isHeaderHidden).toBe(true)
  })

  it('showActionButtons should be false when status is Deleted', () => {
    component.actionBtnStatus = 'grant'
    component.content = { status: 'Deleted' } as any
    expect(component.showActionButtons).toBe(false)
  })

  it('showButtonContainer should be false when Course has no children and no artifactUrl', () => {
    component.actionBtnStatus = 'grant'
    component.content = { contentType: 'Course', children: [], artifactUrl: '', isInIntranet: false } as any
    expect(component.showButtonContainer).toBe(false)
  })

  it('isInIFrame should return false in normal window context', () => {
    expect(component.isInIFrame).toBe(false)
  })

  it('showOrgprofile should store currentURL and navigate', () => {
    component.showOrgprofile('org-5')
    expect(sessionStorage.getItem('currentURL')).toBeTruthy()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/org-details'], { queryParams: { orgId: 'org-5' } })
  })

  it('ngOnDestroy should reset analyticsFetchStatus and unsubscribe subscriptions', () => {
    component.ngOnInit()
    const routerSub = component.routerParamSubscription
    const routeSub = component.routeSubscription
    const routerUnsubSpy = jest.spyOn(routerSub as any, 'unsubscribe')
    const routeUnsubSpy = jest.spyOn(routeSub as any, 'unsubscribe')
    component.ngOnDestroy()
    expect(mockTocSvc.analyticsFetchStatus).toBe('none')
    expect(routerUnsubSpy).toHaveBeenCalled()
    expect(routeUnsubSpy).toHaveBeenCalled()
  })

  it('getRatingIcon should return star, star_half and star_border appropriately', () => {
    component.content = { averageRating: 3.5 } as any
    expect(component.getRatingIcon(2)).toBe('star')
    expect(component.getRatingIcon(4)).toBe('star_half')
    expect(component.getRatingIcon(5)).toBe('star_border')
  })

  it('checkRegistrationStatus (via ngOnInit) should grant access when source matches and hasAccess', () => {
    component.content = { sourceShortName: 'Pluralsight' } as any
    component.forPreview = false
    component.ngOnInit()
    expect(mockContentSvc.getRegistrationStatus).toHaveBeenCalledWith('Pluralsight')
  })

  it('generateQuery should return default params for START type', () => {
    component.forPreview = false
    component.firstResourceLink = null
    component.resumeDataLink = null
    const result = component.generateQuery('START')
    expect(result.viewMode).toBe('START')
  })

  it('generateQuery should build params from firstResourceLink for START', () => {
    component.firstResourceLink = { url: '/x', queryParams: { a: '1' } }
    component.forPreview = false
    const result = component.generateQuery('START')
    expect(result.a).toBe('1')
    expect(result.viewMode).toBe('START')
  })

  it('generateQuery should return empty object in preview mode with no links', () => {
    component.forPreview = true
    component.firstResourceLink = null
    component.resumeDataLink = null
    expect(component.generateQuery('START')).toEqual({})
  })

  it('fetchCohorts should populate cohortResults on success', () => {
    component.forPreview = false
    component.fetchCohorts('mentor' as any, 'id-1')
    expect(component.cohortResults['mentor']).toEqual({ contents: [], hasError: false, count: 0 })
  })

  it('fetchCohorts should set hasError true on failure', () => {
    ; (mockTocSvc.fetchContentCohorts as jest.Mock).mockReturnValue({ subscribe: (_next: any, error: any) => error() })
    component.forPreview = false
    component.fetchCohorts('peer' as any, 'id-1')
    expect(component.cohortResults['peer'].hasError).toBe(true)
  })

  it('fetchCohorts should short-circuit when forPreview is true', () => {
    component.forPreview = true
    component.fetchCohorts('mentor' as any, 'id-1')
    expect(component.cohortResults['mentor']).toEqual({ contents: [], hasError: false, count: 0 })
  })

  it('openRating should open confirm modal and refresh rating summary on confirm', async () => {
    component.content = { identifier: 'id-1' } as any
    const readSummarySpy = jest.spyOn(component, 'readCourseRatingSummary')
    component.openRating('course-1')
    await Promise.resolve()
    await Promise.resolve()
    expect(mockDialog.open).toHaveBeenCalled()
    expect(readSummarySpy).toHaveBeenCalled()
  })

  it('openRating should show error snackbar when API status is not success', async () => {
    ; (mockContentSvc.readCourseRating as jest.Mock).mockResolvedValue({ params: { status: 'failure' } })
    component.content = { identifier: 'id-1' } as any
    component.openRating('course-1')
    await Promise.resolve()
    await Promise.resolve()
    expect(mockSnackBar.open).toHaveBeenCalled()
  })

  it('readCourseRatingSummary should set averageRating and totalRatings', async () => {
    component.content = { identifier: 'id-1' } as any
    await component.readCourseRatingSummary()
    expect(component.averageRating).toBe('4.0')
    expect(component.totalRatings).toBe(2)
  })

  it('enrollUser should navigate and schedule resume navigation on success', async () => {
    jest.useFakeTimers()
    component.resumeData = { some: 'data' } as any
    component.resumeDataLink = { url: '/resume', queryParams: {} }
    component.enrollUser([{ courseId: 'c1', batchId: 'b1' }])
    await Promise.resolve()
    await Promise.resolve()
    jest.runAllTimers()
    expect(mockRouter.navigate).toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('enrollUser should show error snackbar on failed enroll response', async () => {
    ; (mockContentSvc.enrollUserToBatch as jest.Mock).mockResolvedValue({ result: { response: 'FAILURE' } })
    component.enrollUser([{ courseId: 'c1', batchId: 'b1' }])
    await Promise.resolve()
    await Promise.resolve()
    expect(mockSnackBar.open).toHaveBeenCalled()
  })

  it('openPopup should open certificate modal', () => {
    component.openPopup('cert-1', 'Course Name')
    expect(mockDialog.open).toHaveBeenCalledWith(AppTocCertificateModalComponent, expect.any(Object))
  })

  it('openDetails should open desktop modal with DETAILS type', () => {
    component.openDetails({ a: 1 }, {})
    expect(mockDialog.open).toHaveBeenCalledWith(AppTocDesktopModalComponent, expect.any(Object))
  })

  it('openCompetency should open desktop modal with COMPETENCY type', () => {
    component.openCompetency({ competencies_v1: '[]' })
    expect(mockDialog.open).toHaveBeenCalledWith(AppTocDesktopModalComponent, expect.any(Object))
  })

  it('redirectFirstResource should navigate using firstResourceLink', () => {
    component.firstResourceLink = { url: '/first', queryParams: {} }
    component.redirectFirstResource({ queryParams: { collectionId: 'c1', batchId: 'b1' } })
    expect(mockRouter.navigateByUrl).toHaveBeenCalled()
  })

  it('redirectPage should navigate using firstResourceLink when updatedContentFound is undefined', () => {
    component.content = { identifier: 'id-1' } as any
    component.firstResourceLink = { url: '/first', queryParams: {} }
    component.batchData = null
    component.redirectPage(undefined)
    expect(mockTelemetrySvc.interact).toHaveBeenCalled()
    expect(mockRouter.navigateByUrl).toHaveBeenCalled()
  })

  it('redirectPage should navigate directly when updatedContentFound provided and no baseURI match', () => {
    component.content = { identifier: 'id-1' } as any
    component.redirectPage('/some/other/url')
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/some/other/url')
  })

  it('findObjectById should locate nested item by identifier', () => {
    const tree = [{ identifier: 'a', children: [{ identifier: 'b' }] }]
    expect(component.findObjectById(tree, 'b')).toEqual({ identifier: 'b' })
    expect(component.findObjectById(tree, 'zz')).toBeNull()
  })

  it('sendApi should open popup when enrolledCourse has issued certificates', () => {
    component.content = { identifier: 'id-1' } as any
      ; (mockContentSvc.fetchUserBatchList as jest.Mock).mockReturnValue(
        of([{ courseId: 'id-1', issuedCertificates: [{ identifier: 'cert-1' }], courseName: 'Course A' }]),
      )
    const openPopupSpy = jest.spyOn(component, 'openPopup')
    component.sendApi()
    expect(openPopupSpy).toHaveBeenCalledWith('cert-1', 'Course A')
  })

  it('getCourseID should set lastCourseID from enrolled course list', () => {
    component.content = { identifier: 'id-1' } as any
      ; (mockContentSvc.fetchUserBatchList as jest.Mock).mockReturnValue(
        of([{ courseId: 'id-1' }]),
      )
    component.getCourseID()
    expect(component.lastCourseID).toEqual({ courseId: 'id-1' })
  })

  it('downloadCertificate should show enroll alert when not enrolled', () => {
    component.batchData = { enrolled: false }
    component.downloadCertificate({})
    expect(mockSnackBar.open).toHaveBeenCalled()
  })

  it('downloadCertificate should show alert dialog when enrolled but percentage below 100', () => {
    component.batchData = { enrolled: true }
    component.optmisticPercentage = 40
    component.downloadCertificate({ completionPercentage: 40 })
    expect(mockDialog.open).toHaveBeenCalledWith(AppTocDesktopModalComponent, expect.objectContaining({ width: '480px' }))
  })

  it('downloadCertificate should show success dialog when enrolled and fully complete without course completion', () => {
    component.batchData = { enrolled: true }
    component.optmisticPercentage = 100
    component.downloadCertificate({ completionPercentage: 40 })
    expect(mockDialog.open).toHaveBeenCalledWith(AppTocDesktopModalComponent, expect.objectContaining({ width: '312px' }))
  })

  it('ngOnInit should complete without throwing for minimal content', () => {
    component.content = { identifier: 'id-1' } as any
    expect(() => component.ngOnInit()).not.toThrow()
  })

  describe('onPopState', () => {
    afterEach(() => sessionStorage.removeItem('cURL'))

    it('should send the browser back to the stored url', () => {
      sessionStorage.setItem('cURL', '/page/previous')
      const setHref = jest.fn()
      Object.defineProperty(window, 'location', {
        value: { set href(v: string) { setHref(v) }, get href() { return '' } },
        configurable: true,
      })
      component.onPopState()
      expect(setHref).toHaveBeenCalledWith('/page/previous')
    })
  })

  describe('isPostAssessment', () => {
    it('should be false without a toc config', () => {
      component.tocConfig = null
      expect(component.isPostAssessment).toBe(false)
    })

    it('should be false without content', () => {
      component.tocConfig = {}
      component.content = null
      expect(component.isPostAssessment).toBe(false)
    })

    it('should be true for an instructor-led course', () => {
      component.tocConfig = {}
      component.content = { contentType: 'Course', learningMode: 'Instructor-Led' } as any
      expect(component.isPostAssessment).toBe(true)
    })

    it('should be false for a self-paced course', () => {
      component.tocConfig = {}
      component.content = { contentType: 'Course', learningMode: 'Self-Paced' } as any
      expect(component.isPostAssessment).toBe(false)
    })

    it('should be false for a non-course', () => {
      component.tocConfig = {}
      component.content = { contentType: 'Resource', learningMode: 'Instructor-Led' } as any
      expect(component.isPostAssessment).toBe(false)
    })
  })

  describe('showIntranetMsg', () => {
    afterEach(() => { (mockUtilitySvc as any).isMobile = false })

    it('should always be true on mobile', () => {
      ;(mockUtilitySvc as any).isMobile = true
      component.showIntranetMessage = false
      expect(component.showIntranetMsg).toBe(true)
    })

    it('should follow the intranet flag on desktop', () => {
      component.showIntranetMessage = true
      expect(component.showIntranetMsg).toBe(true)
      component.showIntranetMessage = false
      expect(component.showIntranetMsg).toBe(false)
    })
  })

  describe('setConfirmDialogStatus', () => {
    it('should push the percentage onto the content service', () => {
      component.setConfirmDialogStatus(75)
      expect(mockContentSvc.showConformation).toBe(75)
    })
  })

  describe('getBatchId', () => {
    it('should return an empty id when there is no batch data', () => {
      component.batchData = null
      expect(component['getBatchId']()).toBe('')
    })

    it('should return an empty id when the batch data has no content', () => {
      component.batchData = {}
      expect(component['getBatchId']()).toBe('')
    })

    it('should return the last batch id in the list', () => {
      component.batchData = { content: [{ batchId: 'b1' }, { batchId: 'b2' }] }
      expect(component['getBatchId']()).toBe('b2')
    })
  })

  describe('buildViewerUrl', () => {
    it('should build a viewer url for the given kind', () => {
      expect(component['buildViewerUrl']('pdf', 'c1', 'coll-1', 'b1')).toBe(
        '/viewer/pdf/c1?primaryCategory=Learning%20Resource&collectionId=coll-1&collectionType=Course&batchId=b1',
      )
    })
  })

  describe('resolveResourceUrlForMimeType', () => {
    beforeEach(() => {
      component.content = { identifier: 'course-1' } as any
      component.enrolledCourse = { batchId: 'b9' }
    })

    const dataFor = (mimeType: string) => ({
      identifier: 'do_1',
      contents: [{ progressdetails: { mimeType }, contentId: 'c1', courseId: 'course-1', batchId: 'b1' }],
    })

    it('should map a pdf to the pdf viewer', () => {
      expect(component['resolveResourceUrlForMimeType'](dataFor('application/pdf'))).toContain('/viewer/pdf/c1')
    })

    it('should map an mp4 to the video viewer', () => {
      expect(component['resolveResourceUrlForMimeType'](dataFor('video/mp4'))).toContain('/viewer/video/c1')
    })

    it('should map json to the pdf viewer keyed on the parent identifier', () => {
      const url = component['resolveResourceUrlForMimeType'](dataFor('application/json'))
      expect(url).toContain('/viewer/pdf/do_1')
      expect(url).toContain('batchId=b9')
    })

    it('should map an html archive to the html viewer', () => {
      expect(component['resolveResourceUrlForMimeType'](dataFor('application/vnd.ekstep.html-archive')))
        .toContain('/viewer/html/do_1')
    })

    it('should map an external url to the html viewer', () => {
      expect(component['resolveResourceUrlForMimeType'](dataFor('text/x-url'))).toContain('/viewer/html/do_1')
    })

    it('should return an empty string for an unmapped mime type', () => {
      expect(component['resolveResourceUrlForMimeType'](dataFor('application/unknown'))).toBe('')
    })
  })

  describe('handleCompletedResumeCase', () => {
    beforeEach(() => {
      component.content = { identifier: 'course-1' } as any
      component.firstResourceLink = { url: '/viewer/pdf/first', queryParams: {} }
    })

    it('should point at the first resource when the last item is complete', () => {
      const data = { contents: [{ contentId: 'r2', batchId: 'b1', progressdetails: { mimeType: 'application/pdf' } }] }
      component['handleCompletedResumeCase'](data, ['r1', 'r2'])
      expect(component.updatedContentFound).toContain('/viewer/pdf/first')
      expect(component.updatedContentFound).toContain('batchId=b1')
    })

    it('should build a pdf viewer url when a mid-list pdf is complete', () => {
      const data = {
        contents: [{ contentId: 'r1', courseId: 'course-1', batchId: 'b1', progressdetails: { mimeType: 'application/pdf' } }],
      }
      component['handleCompletedResumeCase'](data, ['r1', 'r2'])
      expect(component.updatedContentFound).toContain('/viewer/pdf/r1')
    })

    it('should leave the resume target unset for a mid-list non-pdf', () => {
      component.updatedContentFound = undefined
      const data = {
        contents: [{ contentId: 'r1', courseId: 'course-1', batchId: 'b1', progressdetails: { mimeType: 'video/mp4' } }],
      }
      component['handleCompletedResumeCase'](data, ['r1', 'r2'])
      expect(component.updatedContentFound).toBeUndefined()
    })
  })

  describe('handleChaptersOverviewCase', () => {
    beforeEach(() => {
      component.content = { identifier: 'course-1' } as any
      component.firstResourceLink = { url: '/viewer/pdf/first', queryParams: {} }
      component.enrolledCourse = { batchId: 'b9' }
    })

    it('should route through the completed path at 100%', () => {
      component.optmisticPercentage = 100
      const data = {
        contents: [{ contentId: 'r2', batchId: 'b1', completionPercentage: 100, progressdetails: { mimeType: 'application/pdf' } }],
      }
      component['handleChaptersOverviewCase'](data, ['r1', 'r2'])
      expect(component.updatedContentFound).toContain('/viewer/pdf/first')
    })

    it('should resolve the in-progress resource url below 100%', () => {
      component.optmisticPercentage = 40
      const data = {
        identifier: 'do_1',
        contents: [{ contentId: 'r1', courseId: 'course-1', batchId: 'b1', completionPercentage: 40, progressdetails: { mimeType: 'video/mp4' } }],
      }
      component['handleChaptersOverviewCase'](data, ['r1'])
      expect(component.updatedContentFound).toContain('/viewer/video/r1')
    })

    it('should leave the target untouched when no url can be resolved', () => {
      component.optmisticPercentage = 40
      component.updatedContentFound = 'previous'
      const data = {
        identifier: 'do_1',
        contents: [{ contentId: 'r1', completionPercentage: 40, progressdetails: { mimeType: 'application/unknown' } }],
      }
      component['handleChaptersOverviewCase'](data, ['r1'])
      expect(component.updatedContentFound).toBe('previous')
    })
  })

  describe('handleGenericResumeUrl', () => {
    beforeEach(() => {
      component.content = { identifier: 'course-1' } as any
      component.firstResourceLink = { url: '/viewer/pdf/first', queryParams: {} }
      component.enrolledCourse = { batchId: 'b9' }
    })

    it('should bail out when the url has no content identifier', () => {
      component.updatedContentFound = 'previous'
      component['handleGenericResumeUrl']({ url: '/app/toc/overview' }, ['do_1'])
      expect(component.updatedContentFound).toBe('previous')
    })

    it('should restart from the first resource when the last item is complete', () => {
      component.optmisticPercentage = 100
      component['handleGenericResumeUrl']({ url: '/viewer/pdf/do_2?primaryCategory=x' }, ['do_1', 'do_2'])
      expect(component.updatedContentFound).toContain('/viewer/pdf/first')
      expect(component.updatedContentFound).toContain('batchId=b9')
    })

    it('should resume at the stored url when the course is incomplete', () => {
      component.optmisticPercentage = 60
      component['handleGenericResumeUrl']({ url: '/viewer/pdf/do_2?primaryCategory=x' }, ['do_1', 'do_2'])
      expect(component.updatedContentFound).toBe('/viewer/pdf/do_2?primaryCategory=x')
    })

    it('should resume at the stored url for a mid-list resource', () => {
      component.optmisticPercentage = 100
      component['handleGenericResumeUrl']({ url: '/viewer/pdf/do_1?primaryCategory=x' }, ['do_1', 'do_2'])
      expect(component.updatedContentFound).toBe('/viewer/pdf/do_1?primaryCategory=x')
    })
  })

  describe('applyResumeRecordError', () => {
    beforeEach(() => {
      component.content = { identifier: 'course-1', children: [{ contentType: 'Resource', identifier: 'do_1' }] } as any
      component.firstResourceLink = { url: '/viewer/pdf/first', queryParams: {} }
      component.enrolledCourse = { batchId: 'b9' }
    })

    it('should bail out when the current target has no identifier', () => {
      component.updatedContentFound = '/app/toc/overview'
      component['applyResumeRecordError'](new Error('missing'))
      expect(component.updatedContentFound).toBe('/app/toc/overview')
    })

    it('should restart from the first resource when the last item is complete', () => {
      component.optmisticPercentage = 100
      component.updatedContentFound = '/viewer/pdf/do_1?primaryCategory=x'
      component['applyResumeRecordError'](new Error('missing'))
      expect(component.updatedContentFound).toContain('/viewer/pdf/first')
    })

    it('should keep the current target when the course is incomplete', () => {
      component.optmisticPercentage = 50
      component.updatedContentFound = '/viewer/pdf/do_1?primaryCategory=x'
      component['applyResumeRecordError'](new Error('missing'))
      expect(component.updatedContentFound).toBe('/viewer/pdf/do_1?primaryCategory=x')
    })
  })

  describe('deriveLastResourceInfo', () => {
    it('should return blanks when nothing has been started', () => {
      component.enrollCourse = { contentStatus: {} }
      expect(component['deriveLastResourceInfo']()).toEqual({ lastResource: '', lastResourceMimeType: undefined })
    })

    it('should return the last started resource and its mime type', () => {
      component.enrollCourse = { contentStatus: { r1: 2, r2: 1 } }
      component.content = {
        children: [{ identifier: 'r1', mimeType: 'application/pdf' }, { identifier: 'r2', mimeType: 'video/mp4' }],
      } as any
      expect(component['deriveLastResourceInfo']()).toEqual({ lastResource: 'r2', lastResourceMimeType: 'video/mp4' })
    })

    it('should leave the mime type undefined when the resource is not a child', () => {
      component.enrollCourse = { contentStatus: { orphan: 1 } }
      component.content = { children: [{ identifier: 'r1', mimeType: 'application/pdf' }] } as any
      expect(component['deriveLastResourceInfo']()).toEqual({ lastResource: 'orphan', lastResourceMimeType: undefined })
    })
  })

  describe('redirectPage', () => {
    beforeEach(() => {
      component.content = { identifier: 'course-1' } as any
      component.firstResourceLink = { url: '/viewer/pdf/first', queryParams: {} }
    })

    it('should build a first-resource url from the batch data when nothing was resumed', () => {
      component.batchData = { content: [{ batchId: 'b1' }] }
      component.redirectPage(undefined)
      expect(mockTelemetrySvc.interact).toHaveBeenCalled()
      expect(component.updatedContentFound).toContain('batchId=b1')
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(component.updatedContentFound)
    })

    it('should fall back to the base uri for the batch id when there is no batch data', () => {
      component.batchData = null
      component.redirectPage(undefined)
      expect(component.updatedContentFound).toContain('/viewer/pdf/first')
    })

    it('should navigate to an absolute resume url stripped of the base uri', () => {
      component.redirectPage(`${document.baseURI}app/viewer/pdf/c1`)
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/viewer/pdf/c1')
    })

    it('should navigate to a relative resume url unchanged', () => {
      component.redirectPage('/viewer/pdf/c1')
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/viewer/pdf/c1')
    })
  })

  describe('redirectFirstResource', () => {
    it('should build a first-resource url from the supplied query params', () => {
      component.firstResourceLink = { url: '/viewer/pdf/first', queryParams: {} }
      component.redirectFirstResource({ queryParams: { collectionId: 'coll-1', batchId: 'b1' } })
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(
        '/viewer/pdf/first?primaryCategory=Learning%20Resource&collectionId=coll-1&collectionType=Course&batchId=b1',
      )
    })
  })

  describe('subscribeBatchControlChanges', () => {
    beforeEach(() => {
      component['subscribeBatchControlChanges']()
    })

    it('should ignore a cleared batch selection', () => {
      component.batchControl.setValue(null)
      expect(component.disableEnrollBtn).toBe(true)
      expect(mockContentSvc.enrollUserToBatch).not.toHaveBeenCalled()
    })

    it('should enrol the user and re-enable the button on success', async () => {
      ;(mockContentSvc.enrollUserToBatch as jest.Mock).mockResolvedValue({ result: { response: 'SUCCESS' } })
      component.batchControl.setValue({ courseId: 'course-1', batchId: 'b1' } as any)
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(mockContentSvc.enrollUserToBatch).toHaveBeenCalledWith({
        request: { userId: 'user-1', courseId: 'course-1', batchId: 'b1' },
      })
      expect(component.batchData).toEqual({ content: [{ courseId: 'course-1', batchId: 'b1' }], enrolled: true })
      expect(mockRouter.navigate).toHaveBeenCalled()
      expect(component.disableEnrollBtn).toBe(false)
    })

    it('should warn and re-enable the button when enrolment fails', async () => {
      ;(mockContentSvc.enrollUserToBatch as jest.Mock).mockResolvedValueOnce({ result: { response: 'FAILED' } })
      component.batchControl.setValue({ courseId: 'course-1', batchId: 'b2' } as any)
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(mockSnackBar.open).toHaveBeenCalled()
      expect(component.disableEnrollBtn).toBe(false)
    })
  })

  describe('handleEnrollApiResponse', () => {
    beforeEach(() => {
      component.content = { identifier: 'course-1', children: [] } as any
      component.forPreview = false
    })

    it('should ignore an empty course list', () => {
      component['handleEnrollApiResponse']([])
      expect(component.enrolledCourse).toBeUndefined()
    })

    it('should ignore the response in preview mode', () => {
      component.forPreview = true
      component['handleEnrollApiResponse']([{ courseId: 'course-1', issuedCertificates: [] }] as any)
      expect(component.enrolledCourse).toBeUndefined()
    })

    it('should ignore the response when there is no content', () => {
      component.content = null
      component['handleEnrollApiResponse']([{ courseId: 'course-1', issuedCertificates: [] }] as any)
      expect(component.enrolledCourse).toBeUndefined()
    })

    it('should capture the matching enrolment and its resume point', () => {
      component['handleEnrollApiResponse']([
        { courseId: 'other', issuedCertificates: [], lastReadContentId: 'x' },
        { courseId: 'course-1', issuedCertificates: [], lastReadContentId: 'r1' },
      ] as any)
      expect(component.enrolledCourse.courseId).toBe('course-1')
      expect(component.resumeData).toBe('r1')
      expect(component.issueCertificate).toBe(false)
    })

    it('should flag an issued certificate', () => {
      component['handleEnrollApiResponse']([
        { courseId: 'course-1', issuedCertificates: [{ id: 'c1' }], lastReadContentId: 'r1' },
      ] as any)
      expect(component.issueCertificate).toBe(true)
    })
  })

  describe('handleCertificateBatchList', () => {
    const req = { request: {} }

    beforeEach(() => {
      component.content = { identifier: 'course-1' } as any
      component.forPreview = false
    })

    it('should do nothing in preview mode', () => {
      component.forPreview = true
      component['handleCertificateBatchList']([{ courseId: 'course-1', issuedCertificates: [] }] as any, 0, req)
      expect(mockContentSvc.processCertificate).not.toHaveBeenCalled()
    })

    it('should do nothing for an empty course list', () => {
      component['handleCertificateBatchList']([], 0, req)
      expect(mockContentSvc.processCertificate).not.toHaveBeenCalled()
    })

    it('should request a certificate when none has been issued', () => {
      localStorage.removeItem('certificate_downloaded_course-1')
      component['handleCertificateBatchList']([{ courseId: 'course-1', issuedCertificates: [] }] as any, 0, req)
      expect(mockContentSvc.processCertificate).toHaveBeenCalledWith(req)
    })

    it('should skip the request when a certificate already exists', () => {
      component['handleCertificateBatchList']([{ courseId: 'course-1', issuedCertificates: [{ id: 'c1' }] }] as any, 0, req)
      expect(mockContentSvc.processCertificate).not.toHaveBeenCalled()
    })
  })

  describe('processCertificateRequest', () => {
    const key = 'certificate_downloaded_course-1'
    const req = { request: {} }

    beforeEach(() => {
      component.content = { identifier: 'course-1' } as any
      localStorage.removeItem(key)
    })

    afterEach(() => localStorage.removeItem(key))

    it('should throttle a repeat request inside the cool-off window', () => {
      localStorage.setItem(key, new Date().toString())
      component['processCertificateRequest'](10, req)
      expect(mockSnackBar.open).toHaveBeenCalled()
      expect(mockContentSvc.processCertificate).not.toHaveBeenCalled()
    })

    it('should stamp the request and confirm on success', () => {
      component['processCertificateRequest'](undefined as any, req)
      expect(localStorage.getItem(key)).not.toBeNull()
      expect(mockDialog.open).toHaveBeenCalledWith(AppTocDesktopModalComponent, expect.objectContaining({ width: '312px' }))
    })

    it('should warn when the certificate service rejects the request', () => {
      ;(mockContentSvc.processCertificate as jest.Mock).mockReturnValueOnce(of({ responseCode: 'ERROR' }))
      component['processCertificateRequest'](undefined as any, req)
      expect(mockSnackBar.open).toHaveBeenCalled()
    })
  })
})
