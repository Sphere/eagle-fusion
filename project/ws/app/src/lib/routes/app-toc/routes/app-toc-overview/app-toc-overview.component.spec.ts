import { of } from 'rxjs'

jest.mock('@ws/author', () => ({
  AccessControlService: class MockAccessControlService {},
}))

jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class MockWidgetContentService {},
  NsContent: {},
}))

import { AppTocOverviewComponent } from './app-toc-overview.component'

describe('AppTocOverviewComponent', () => {
  let component: AppTocOverviewComponent
  let routeMock: any
  let tocSharedSvcMock: any
  let safeResourceUrlSvcMock: any
  let authAccessControlSvcMock: any
  let widgetContentSvcMock: any
  let cdrMock: any

  beforeEach(() => {
    routeMock = {
      queryParams: of({ license: 'CC BY' }),
      parent: {
        data: of({
          content: { data: { identifier: 'id1', body: '<p>body</p>' } },
          pageData: { data: { some: 'config' } },
        }),
      },
    }
    tocSharedSvcMock = {
      initData: jest.fn().mockReturnValue({ content: { identifier: 'id1', body: '<p>body</p>' }, errorCode: null }),
      showComponent$: of({ showComponent: true }),
      subtitleOnBanners: false,
      showDescription: false,
    }
    safeResourceUrlSvcMock = {
      trustHtml: jest.fn().mockReturnValue('safe-html'),
    }
    authAccessControlSvcMock = {
      proxyToAuthoringUrl: jest.fn().mockReturnValue('proxied-url'),
    }
    widgetContentSvcMock = {
      fetchConfig: jest.fn().mockReturnValue(of({ licenses: [{ licenseName: 'CC BY' }] })),
    }
    cdrMock = {
      detectChanges: jest.fn(),
    }
    component = new AppTocOverviewComponent(
      routeMock,
      tocSharedSvcMock,
      safeResourceUrlSvcMock,
      authAccessControlSvcMock,
      widgetContentSvcMock,
      cdrMock,
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should init data, license config and forPreview on ngOnInit', () => {
    component.ngOnInit()
    expect(component.content).toEqual({ identifier: 'id1', body: '<p>body</p>' })
    expect(component.tocConfig).toEqual({ some: 'config' })
    expect(component.licenseName).toBe('CC BY')
    expect(widgetContentSvcMock.fetchConfig).toHaveBeenCalled()
    expect(component.currentLicenseData).toEqual([{ licenseName: 'CC BY' }])
    expect(component.loadOverview).toBe(true)
  })

  it('should fallback loadOverview to false when showComponent is false', () => {
    tocSharedSvcMock.showComponent$ = of({ showComponent: false })
    component.ngOnInit()
    expect(component.loadOverview).toBe(false)
  })

  it('should set currentLicenseData to empty array on getLicenseConfig error', () => {
    widgetContentSvcMock.fetchConfig.mockReturnValue({
      pipe: () => ({
        subscribe: (handlers: any) => handlers.error(),
      }),
    })
    component.getLicenseConfig()
    expect(component.currentLicenseData).toEqual([])
  })

  it('should not update currentLicenseData when data has no licenses', () => {
    widgetContentSvcMock.fetchConfig.mockReturnValue(of({}))
    component.currentLicenseData = ['existing']
    component.getLicenseConfig()
    expect(component.currentLicenseData).toEqual(['existing'])
  })

  it('should detect forPreview from url when not already set', () => {
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/author/toc/id1/overview' },
      writable: true,
    })
    component.forPreview = false
    component.ngOnInit()
    expect(component.forPreview).toBe(true)
  })

  it('should not override forPreview when already true', () => {
    component.forPreview = true
    component.ngOnInit()
    expect(component.forPreview).toBe(true)
  })

  it('should return subtitleOnBanner and showDescription from service', () => {
    tocSharedSvcMock.subtitleOnBanners = true
    tocSharedSvcMock.showDescription = true
    expect(component.showSubtitleOnBanner).toBe(true)
    expect(component.showDescription).toBe(true)
  })

  it('should proxy body html for preview mode', () => {
    component.forPreview = true
    component.ngOnInit()
    expect(authAccessControlSvcMock.proxyToAuthoringUrl).toHaveBeenCalledWith('<p>body</p>')
  })

  it('should trust empty html when content body is missing', () => {
    tocSharedSvcMock.initData.mockReturnValue({ content: { identifier: 'id1' }, errorCode: null })
    component.ngOnInit()
    expect(safeResourceUrlSvcMock.trustHtml).toHaveBeenCalledWith('')
  })

  it('should unsubscribe on ngOnDestroy', () => {
    component.ngOnInit()
    const spy = jest.spyOn(component.unsubscribe, 'next')
    const completeSpy = jest.spyOn(component.unsubscribe, 'complete')
    component.ngOnDestroy()
    expect(spy).toHaveBeenCalled()
    expect(completeSpy).toHaveBeenCalled()
  })
})
