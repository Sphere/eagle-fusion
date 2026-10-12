jest.mock('@ws-widget/collection', () => ({
  NsContent: {},
}))
jest.mock('@ws-widget/resolver', () => ({
  NsWidgetResolver: {},
  WidgetBaseComponent: class {
    widgetType = ''
    widgetSubType = ''
  },
}))

import { of } from 'rxjs'
import { LearningCardComponent } from './learning-card.component'

const mockConfigSvc: any = {
  instanceConfig: { logos: { defaultContent: '/default.png' } },
  unMappedUser: { id: 'user-1' },
}

const mockSafeResourceUrlSvc: any = {
  trustHtml: jest.fn((html: string) => html),
}

const mockRouter: any = {
  navigateByUrl: jest.fn(),
  navigate: jest.fn(),
}

const mockUserProfileSvc: any = {
  getUserdetailsFromRegistry: jest.fn().mockReturnValue(of({ profileDetails: { profileReq: {} } })),
  isBackgroundDetailsFilled: jest.fn().mockReturnValue(true),
}

const mockAuthSvc: any = {
  login: jest.fn(),
}

function createComponent(): LearningCardComponent {
  return new LearningCardComponent(
    mockConfigSvc,
    mockSafeResourceUrlSvc,
    mockRouter,
    mockUserProfileSvc,
    mockAuthSvc,
  )
}

describe('LearningCardComponent', () => {
  let component: LearningCardComponent
  let originalLocation: Location

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
    mockConfigSvc.instanceConfig = { logos: { defaultContent: '/default.png' } }
    mockConfigSvc.unMappedUser = { id: 'user-1' }
    mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue(of({ profileDetails: { profileReq: {} } }))
    mockUserProfileSvc.isBackgroundDetailsFilled.mockReturnValue(true)
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should set defaultThumbnail from instanceConfig', () => {
      component.ngOnInit()
      expect(component.defaultThumbnail).toBe('/default.png')
    })

    it('should set redirectUrl', () => {
      component.ngOnInit()
      expect(component.redirectUrl).toContain('openid/keycloak')
    })

    it('should not throw when instanceConfig missing', () => {
      mockConfigSvc.instanceConfig = null
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  describe('ngOnChanges', () => {
    it('should parse competencies_v1 and populate cometencyData when level present', () => {
      component.content = {} as any
      component.ngOnChanges({
        content: {
          currentValue: {
            competencies_v1: JSON.stringify([{ competencyName: 'Comm', level: 2 }]),
          },
        } as any,
      })
      expect(component.cometencyData).toEqual([{ name: 'Comm', levels: ' Level 2' }])
    })

    it('should skip competencies without level', () => {
      component.ngOnChanges({
        content: {
          currentValue: {
            competencies_v1: JSON.stringify([{ competencyName: 'Comm' }]),
          },
        } as any,
      })
      expect(component.cometencyData).toEqual([])
    })

    it('should not process competencies when currentValue missing', () => {
      component.ngOnChanges({
        content: { currentValue: null } as any,
      })
      expect(component.cometencyData).toEqual([])
    })

    it('should not process when content change key absent', () => {
      expect(() => component.ngOnChanges({})).not.toThrow()
    })

    it('should sanitize and trust description when present', () => {
      component.content = { description: 'Hello<br>World<br>' } as any
      component.ngOnChanges({ content: { currentValue: {} } as any })
      expect(component.content.description).toBe('HelloWorld')
      expect(mockSafeResourceUrlSvc.trustHtml).toHaveBeenCalledWith('HelloWorld')
    })

    it('should skip description handling when no description', () => {
      component.content = {} as any
      component.ngOnChanges({ content: { currentValue: {} } as any })
      expect(component.description).toBe('')
    })
  })

  describe('raiseTelemetry', () => {
    beforeEach(() => {
      originalLocation = window.location
      delete (window as any).location
      window.location = { href: 'http://localhost/app', assign: jest.fn() } as any
    })

    afterEach(() => {
      window.location = originalLocation
    })

    it('should set hi redirectUrl when baseURI includes hi', () => {
      Object.defineProperty(document, 'baseURI', { value: 'http://localhost/hi/', configurable: true })
      component.raiseTelemetry({ identifier: 'c1' })
      expect(component.redirectUrl).toContain('openid/keycloak')
      expect(sessionStorage.getItem('lang')).toBe('hi')
    })

    it('should set default redirectUrl when baseURI does not include hi', () => {
      Object.defineProperty(document, 'baseURI', { value: 'http://localhost/', configurable: true })
      component.raiseTelemetry({ identifier: 'c1' })
      expect(component.redirectUrl).toBe('http://localhost/openid/keycloak')
    })

    it('should redirect to login when no telemetrySessionId present', () => {
      Object.defineProperty(document, 'baseURI', { value: 'http://localhost/', configurable: true })
      localStorage.removeItem('telemetrySessionId')
      component.raiseTelemetry({ identifier: 'c1' })
      expect(sessionStorage.getItem('login-btn')).toBe('clicked')
      expect(mockAuthSvc.login).toHaveBeenCalledWith('S', component.redirectUrl)
    })

    it('should navigate to url when session exists and background details filled', () => {
      Object.defineProperty(document, 'baseURI', { value: 'http://localhost/', configurable: true })
      localStorage.setItem('telemetrySessionId', 'abc')
      mockUserProfileSvc.isBackgroundDetailsFilled.mockReturnValue(true)
      component.raiseTelemetry({ identifier: 'c1' })
      return new Promise(resolve => setTimeout(() => {
        expect(mockRouter.navigateByUrl).toHaveBeenCalled()
        resolve(null)
      }, 600))
    })

    it('should navigate to about-you when background details not filled', () => {
      Object.defineProperty(document, 'baseURI', { value: 'http://localhost/', configurable: true })
      localStorage.setItem('telemetrySessionId', 'abc')
      mockUserProfileSvc.isBackgroundDetailsFilled.mockReturnValue(false)
      component.raiseTelemetry({ identifier: 'c1' })
      return new Promise(resolve => setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/about-you'], expect.objectContaining({
          queryParams: { redirect: '/app/toc/c1/overview' },
        }))
        resolve(null)
      }, 600))
    })

    it('should not fetch user details when unMappedUser is absent', () => {
      Object.defineProperty(document, 'baseURI', { value: 'http://localhost/', configurable: true })
      localStorage.setItem('telemetrySessionId', 'abc')
      mockConfigSvc.unMappedUser = null
      component.raiseTelemetry({ identifier: 'c1' })
      expect(mockUserProfileSvc.getUserdetailsFromRegistry).not.toHaveBeenCalled()
    })
  })
})
