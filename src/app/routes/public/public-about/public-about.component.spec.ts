jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {
    pageNavBar = { background: 'primary' }
  },
  NsPage: {},
}))

import { of, BehaviorSubject } from 'rxjs'
import { PublicAboutComponent } from './public-about.component'

describe('PublicAboutComponent', () => {
  let component: PublicAboutComponent
  let mockBreakpointObserver: any
  let mockSanitizer: any
  let mockConfigSvc: any
  let mockRoute: any
  let routeDataSubject: BehaviorSubject<any>

  const mockAboutPage = {
    banner: {
      img: 'https://example.com/banner.jpg',
      videoLink: 'https://youtube.com/embed/abc',
    },
  }

  beforeEach(() => {
    routeDataSubject = new BehaviorSubject({ pageData: { data: mockAboutPage } })
    mockBreakpointObserver = {
      observe: jest.fn().mockReturnValue(of({ matches: false })),
    }
    mockSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn().mockImplementation(url => ({ resource: url })),
      bypassSecurityTrustStyle: jest.fn().mockImplementation(style => ({ style })),
    }
    mockConfigSvc = { pageNavBar: {} }
    mockRoute = { data: routeDataSubject.asObservable() }
    component = new PublicAboutComponent(
      mockBreakpointObserver,
      mockSanitizer,
      mockConfigSvc,
      mockRoute,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default aboutPage to null', () => {
    expect(component.aboutPage).toBeNull()
  })

  it('should set aboutPage from route data on ngOnInit', () => {
    component.ngOnInit()
    expect(component.aboutPage).toEqual(mockAboutPage)
  })

  it('should sanitize videoLink when banner has videoLink', () => {
    component.ngOnInit()
    expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
      'https://youtube.com/embed/abc',
    )
    expect(component.videoLink).toEqual({ resource: 'https://youtube.com/embed/abc' })
  })

  it('should sanitize headerBanner from banner img', () => {
    component.ngOnInit()
    expect(mockSanitizer.bypassSecurityTrustStyle).toHaveBeenCalledWith(
      "url('https://example.com/banner.jpg')",
    )
  })

  it('should not sanitize when aboutPage has no banner', () => {
    routeDataSubject.next({ pageData: { data: {} } })
    component = new PublicAboutComponent(mockBreakpointObserver, mockSanitizer, mockConfigSvc, mockRoute)
    component.ngOnInit()
    expect(mockSanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled()
  })

  it('should unsubscribe on ngOnDestroy', () => {
    component.ngOnInit()
    expect(() => component.ngOnDestroy()).not.toThrow()
  })

  it('isSmallScreen$ map callback emits breakpoint matches value', done => {
    component.isSmallScreen$.subscribe((v: boolean) => {
      expect(typeof v).toBe('boolean')
      done()
    })
  })
})
