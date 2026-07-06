jest.mock('rxjs/operators', () => ({
  ...jest.requireActual('rxjs/operators'),
  delay: () => (source: any) => source,
}))

jest.mock('@angular/core', () => ({
  ...jest.requireActual('@angular/core'),
  effect: (fn: any) => { fn(); return {} },
}))

jest.mock('lodash', () => ({
  get: (obj: any, path: string, defaultVal?: any) => {
    if (!obj || !path) return defaultVal
    const keys = path.split('.')
    let result = obj
    for (const k of keys) { result = result?.[k] }
    return result !== undefined ? result : defaultVal
  },
}))

jest.mock('@ws-widget/utils', () => ({
  LoggerService: class { log = jest.fn(); error = jest.fn() },
  ConfigurationsService: class {
    userProfile = { userId: 'user-1', email: 'test@test.com', firstName: 'Jane', lastName: 'Doe' }
    unMappedUser = { id: 'unmapped-1' }
  },
  ValueService: class { isMobile = jest.fn().mockReturnValue(false) },
  TelemetryService: class { registrationInteract = jest.fn() },
}))

jest.mock('@ws-widget/resolver', () => ({
  NsWidgetResolver: {},
}))

jest.mock('@ws-widget/collection', () => ({
  ROOT_WIDGET_CONFIG: { errorResolver: { _type: 'errorResolver', errorResolver: 'errorResolver' } },
  NsError: {},
}))

jest.mock('../../services/tnc-app-resolver.service', () => ({
  TncAppResolverService: class { getTnc = jest.fn() },
}))

jest.mock('../../services/tnc-public-resolver.service', () => ({
  TncPublicResolverService: class { getPublicTnc = jest.fn() },
}))

jest.mock('../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service', () => ({
  UserProfileService: class {
    getUserdetailsFromRegistry = jest.fn()
    updateProfileDetails = jest.fn()
    isBackgroundDetailsFilled = jest.fn().mockReturnValue(true)
  },
}))

jest.mock('../signup/signup.service', () => ({
  SignupService: class {
    fetchStartUpDetails = jest.fn().mockResolvedValue({ userId: 'result-user-1', tncStatus: true })
  },
}))

jest.mock('src/app/services/user-agent.service', () => ({
  UserAgentResolverService: class {
    getUserAgent = jest.fn().mockReturnValue({ OS: 'Mac', browserName: 'Chrome' })
    generateCookie = jest.fn().mockReturnValue('cookie')
    getSource = jest.fn().mockReturnValue(null)
  },
}))

jest.mock('../create-account-modal/create-account-dialog.component', () => ({
  CreateAccountDialogComponent: class {},
}))

jest.mock('../profile-view/request-util', () => ({
  constructReq: jest.fn().mockReturnValue({ profileReq: { personalDetails: { profileLocation: '' } } }),
}))

jest.mock('src/app/constants/apiConstants', () => ({
  API_END_POINTS: { LOGOUT_USER: '/apis/logout' },
}))

import { of } from 'rxjs'
import { NewTncComponent } from './new-tnc.component'

describe('NewTncComponent', () => {
  let component: NewTncComponent
  let mockRoute: any
  let mockRouter: any
  let mockLogger: any
  let mockConfigSvc: any
  let mockTncProtectedSvc: any
  let mockTncPublicSvc: any
  let mockUserProfileSvc: any
  let mockHttp: any
  let mockSignupService: any
  let mockUserAgentSvc: any
  let mockValueSvc: any
  let mockDialog: any
  let mockTelemetrySvc: any

  beforeEach(() => {
    mockRoute = {
      data: { subscribe: jest.fn((cb: any) => cb({ tnc: { data: null } })) },
      snapshot: { queryParamMap: { keys: [], get: jest.fn().mockReturnValue(null) } },
    }
    mockRouter = { navigate: jest.fn() }
    mockLogger = { log: jest.fn(), error: jest.fn() }
    mockConfigSvc = {
      userProfile: { userId: 'user-1', email: 'test@test.com', firstName: 'Jane', lastName: 'Doe' },
      unMappedUser: { id: 'unmapped-1' },
    }
    mockTncProtectedSvc = { getTnc: jest.fn().mockReturnValue(of({})) }
    mockTncPublicSvc = { getPublicTnc: jest.fn().mockReturnValue(of({})) }
    mockUserProfileSvc = {
      getUserdetailsFromRegistry: jest.fn().mockReturnValue(of({
        profileDetails: { profileReq: { personalDetails: { tncAccepted: false } } },
      })),
      updateProfileDetails: jest.fn().mockReturnValue(of({ result: { response: 'SUCCESS' } })),
      isBackgroundDetailsFilled: jest.fn().mockReturnValue(true),
    }
    mockHttp = { get: jest.fn().mockReturnValue(of({})) }
    mockSignupService = {
      fetchStartUpDetails: jest.fn().mockResolvedValue({ userId: 'result-user-1', tncStatus: true }),
    }
    mockUserAgentSvc = {
      getUserAgent: jest.fn().mockReturnValue({ OS: 'Mac', browserName: 'Chrome' }),
      generateCookie: jest.fn().mockReturnValue('cookie'),
      getSource: jest.fn().mockReturnValue(null),
    }
    mockValueSvc = { isMobile: jest.fn().mockReturnValue(false) }
    mockDialog = { open: jest.fn().mockReturnValue({ afterClosed: jest.fn().mockReturnValue(of(null)) }) }
    mockTelemetrySvc = { registrationInteract: jest.fn() }

    component = new NewTncComponent(
      mockRoute,
      mockRouter,
      mockLogger,
      mockConfigSvc,
      mockTncProtectedSvc,
      mockTncPublicSvc,
      mockUserProfileSvc,
      mockHttp,
      mockSignupService,
      mockUserAgentSvc,
      mockValueSvc,
      mockDialog,
      mockTelemetrySvc,
    )
  })

  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default tncAcceptedBtn to false', () => {
    expect(component.tncAcceptedBtn).toBe(false)
  })

  it('should default showTnc to false', () => {
    expect(component.showTnc).toBe(false)
  })

  it('should default isAcceptInProgress to false', () => {
    expect(component.isAcceptInProgress).toBe(false)
  })

  it('should set isXSmall$ false when isMobile is false', () => {
    expect(component.isXSmall$).toBe(false)
  })

  describe('tncChecked', () => {
    it('should toggle tncAcceptedBtn from false to true', () => {
      component.tncChecked()
      expect(component.tncAcceptedBtn).toBe(true)
    })

    it('should toggle tncAcceptedBtn from true to false', () => {
      component.tncAcceptedBtn = true
      component.tncChecked()
      expect(component.tncAcceptedBtn).toBe(false)
    })
  })

  describe('showTncPage', () => {
    it('should set showTnc to true', () => {
      component.showTncPage('Terms')
      expect(component.showTnc).toBe(true)
    })

    it('should set showTerms to the given name', () => {
      component.showTncPage('Privacy Policy')
      expect(component.showTerms).toBe('Privacy Policy')
    })
  })

  describe('backToTncHome', () => {
    it('should set showTnc to false', () => {
      component.showTnc = true
      component.backToTncHome()
      expect(component.showTnc).toBe(false)
    })
  })

  describe('handleScrollToBottom', () => {
    it('should set shouldScrollToBottom true when at bottom', () => {
      component.handleScrollToBottom(true)
      expect(component.shouldScrollToBottom).toBe(true)
    })

    it('should set shouldScrollToBottom false when not at bottom', () => {
      component.shouldScrollToBottom = true
      component.handleScrollToBottom(false)
      expect(component.shouldScrollToBottom).toBe(false)
    })
  })

  describe('handleScroll', () => {
    it('should set shouldScrollToBottom based on isScrolled', () => {
      component.handleScroll(true)
      expect(component.shouldScrollToBottom).toBe(true)
      component.handleScroll(false)
      expect(component.shouldScrollToBottom).toBe(false)
    })
  })

  describe('createTncFormFields', () => {
    it('should create FormGroup with required controls', () => {
      const form = component.createTncFormFields()
      expect(form.get('tncAccepted')).toBeTruthy()
      expect(form.get('firstname')).toBeTruthy()
      expect(form.get('primaryEmail')).toBeTruthy()
      expect(form.get('dob')).toBeTruthy()
    })
  })

  describe('handleKeyDown', () => {
    it('should open dialog for Enter key', () => {
      const event = { key: 'Enter', preventDefault: jest.fn() } as any
      component.handleKeyDown(event)
      expect(mockDialog.open).toHaveBeenCalled()
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should not open dialog for other keys', () => {
      const event = { key: 'Tab', preventDefault: jest.fn() } as any
      component.handleKeyDown(event)
      expect(mockDialog.open).not.toHaveBeenCalled()
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe routeSubscription if present', () => {
      const mockSub = { unsubscribe: jest.fn() }
      component.routeSubscription = mockSub as any
      component.ngOnDestroy()
      expect(mockSub.unsubscribe).toHaveBeenCalled()
    })

    it('should handle null routeSubscription gracefully', () => {
      component.routeSubscription = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('ngOnInit', () => {
    it('should set tncData when response.tnc.data exists', async () => {
      const tncData = { termsAndConditions: [] }
      mockRoute.data.subscribe = jest.fn((cb: any) => cb({ tnc: { data: tncData }, isPublic: false }))
      await component.ngOnInit()
      expect(component.tncData).toEqual(tncData)
      expect(component.isPublic).toBe(false)
    })

    it('should navigate to error when tnc data is null', async () => {
      mockRoute.data.subscribe = jest.fn((cb: any) => cb({ tnc: { data: null } }))
      await component.ngOnInit()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['error-service-unavailable'])
    })

    it('should call fetchStartUpDetails and createTncFormFields', async () => {
      mockRoute.data.subscribe = jest.fn((cb: any) => cb({ tnc: { data: null } }))
      await component.ngOnInit()
      expect(mockSignupService.fetchStartUpDetails).toHaveBeenCalled()
    })

    it('should call getUserdetailsFromRegistry when unMappedUser is set', async () => {
      mockRoute.data.subscribe = jest.fn((cb: any) => cb({ tnc: { data: null } }))
      mockConfigSvc.unMappedUser = { id: 'unmapped-1' }
      await component.ngOnInit()
      expect(mockUserProfileSvc.getUserdetailsFromRegistry).toHaveBeenCalledWith('unmapped-1')
    })

    it('should set showAcceptbtn true when tncAccepted is undefined', async () => {
      mockRoute.data.subscribe = jest.fn((cb: any) => cb({ tnc: { data: null } }))
      mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue(of({
        profileDetails: { profileReq: { personalDetails: {} } },
      }))
      await component.ngOnInit()
      expect(component.showAcceptbtn).toBe(true)
    })

    it('should set showAcceptbtn false when tncAccepted is true', async () => {
      mockRoute.data.subscribe = jest.fn((cb: any) => cb({ tnc: { data: null } }))
      mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue(of({
        profileDetails: { profileReq: { personalDetails: { tncAccepted: true } } },
      }))
      await component.ngOnInit()
      expect(component.showAcceptbtn).toBe(false)
    })
  })

  describe('updateUser', () => {
    it('covers subscribe callback, getUserdetailsFromRegistry pipe, and navigateToHome', async () => {
      mockRoute.data.subscribe = jest.fn((cb: any) => cb({ tnc: { data: null } }))
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({ userId: 'result-user-1', tncStatus: true })
      mockUserProfileSvc.getUserdetailsFromRegistry = jest.fn().mockReturnValue(of({
        profileDetails: { profileReq: { personalDetails: { tncAccepted: false } } },
      }))
      mockUserProfileSvc.updateProfileDetails = jest.fn().mockReturnValue(of({ result: { response: 'SUCCESS' } }))
      mockUserProfileSvc.isBackgroundDetailsFilled = jest.fn().mockReturnValue(true)
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: '', assign: jest.fn(), origin: 'https://test.com' },
      })
      await component.ngOnInit()
      component.updateUser({ request: { userId: 'result-user-1', profileDetails: {}, tncAcceptedVersion: 'v1', tncAcceptedOn: 1 } })
      await Promise.resolve(); await Promise.resolve(); await Promise.resolve()
      expect(mockTelemetrySvc.registrationInteract).toHaveBeenCalled()
    })

    it('covers navigateToHome with orgSelectiveConfig matching rootOrgId with queryParams in URL', async () => {
      mockRoute.data.subscribe = jest.fn((cb: any) => cb({ tnc: { data: null } }))
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({ userId: 'result-user-1', tncStatus: true })
      mockUserProfileSvc.updateProfileDetails = jest.fn().mockReturnValue(of({ result: { response: 'SUCCESS' } }))
      mockUserProfileSvc.isBackgroundDetailsFilled = jest.fn().mockReturnValue(true)
      ;(mockConfigSvc as any).orgSelectiveCourseConfig = {
        orgId: 'org-1',
        redirectUrl: '/app/org-selective?source=campaign&mode=learn',
      }
      mockConfigSvc.userProfile = { ...mockConfigSvc.userProfile, rootOrgId: 'org-1' }
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: '', assign: jest.fn(), origin: 'https://test.com' },
      })
      await component.ngOnInit()
      component.updateUser({ request: { userId: 'result-user-1', profileDetails: {}, tncAcceptedVersion: 'v1', tncAcceptedOn: 1 } })
      await Promise.resolve(); await Promise.resolve(); await Promise.resolve()
      expect(window.location.assign).toHaveBeenCalled()
    })

    it('covers updateUser error callback', async () => {
      const { throwError } = require('rxjs')
      mockUserProfileSvc.updateProfileDetails = jest.fn().mockReturnValue(throwError(() => new Error('update failed')))
      expect(() => component.updateUser({ request: {} })).not.toThrow()
      expect(component.errorInAccepting).toBe(true)
    })
  })

  describe('homePage', () => {
    it('should set location.href to /page/home when result.userId exists', async () => {
      const origLocation = window.location
      Object.defineProperty(window, 'location', { writable: true, value: { href: '' } })
      mockSignupService.fetchStartUpDetails.mockResolvedValue({ userId: 'result-user-1', tncStatus: true })
      mockRoute.data.subscribe = jest.fn((cb: any) => cb({ tnc: { data: null } }))
      await component.ngOnInit()
      component.homePage()
      expect(window.location.href).toBe('/page/home')
      Object.defineProperty(window, 'location', { writable: true, value: origLocation })
    })
  })

  describe('gotoLogin', () => {
    it('should call http.get for logout and clear storage keys', async () => {
      localStorage.setItem('telemetrySessionId', 'abc')
      localStorage.setItem('loginbtn', 'true')
      await component.gotoLogin()
      expect(mockHttp.get).toHaveBeenCalledWith('/apis/logout')
      expect(localStorage.getItem('telemetrySessionId')).toBeNull()
    })
  })

  describe('getTnc', () => {
    beforeEach(async () => {
      component.tncData = {
        termsAndConditions: [
          { name: 'Generic T&C', language: 'en', version: '1.0' },
          { name: 'Data Privacy', language: 'en', version: '1.0' },
        ],
      } as any
    })

    it('should return early when locale matches tncTerm language', () => {
      component.getTnc('en')
      expect(mockTncProtectedSvc.getTnc).not.toHaveBeenCalled()
      expect(mockTncPublicSvc.getPublicTnc).not.toHaveBeenCalled()
    })

    it('should call tncProtectedSvc when locale differs and not public', () => {
      component.isPublic = false
      mockTncProtectedSvc.getTnc.mockReturnValue(of({ termsAndConditions: [{}, {}] }))
      component.getTnc('hi')
      expect(mockTncProtectedSvc.getTnc).toHaveBeenCalledWith('hi')
    })

    it('should call tncPublicSvc when locale differs and isPublic', () => {
      component.isPublic = true
      mockTncPublicSvc.getPublicTnc.mockReturnValue(of({ termsAndConditions: [{}, {}] }))
      component.getTnc('hi')
      expect(mockTncPublicSvc.getPublicTnc).toHaveBeenCalled()
    })

    it('should not call any service when tncData is null', () => {
      component.tncData = null
      component.getTnc('hi')
      expect(mockTncProtectedSvc.getTnc).not.toHaveBeenCalled()
    })
  })

  describe('getDp', () => {
    beforeEach(() => {
      component.tncData = {
        termsAndConditions: [
          { name: 'Generic T&C', language: 'en', version: '1.0' },
          { name: 'Data Privacy', language: 'en', version: '1.0' },
        ],
      } as any
    })

    it('should return early when locale matches dpTerm language', () => {
      component.getDp('en')
      expect(mockTncProtectedSvc.getTnc).not.toHaveBeenCalled()
    })

    it('should call tncProtectedSvc when locale differs and not public', () => {
      component.isPublic = false
      mockTncProtectedSvc.getTnc.mockReturnValue(of({ termsAndConditions: [{}, {}] }))
      component.getDp('hi')
      expect(mockTncProtectedSvc.getTnc).toHaveBeenCalledWith('hi')
    })

    it('should call tncPublicSvc when locale differs and isPublic', () => {
      component.isPublic = true
      mockTncPublicSvc.getPublicTnc.mockReturnValue(of({ termsAndConditions: [{}, {}] }))
      component.getDp('hi')
      expect(mockTncPublicSvc.getPublicTnc).toHaveBeenCalled()
    })
  })

  describe('ngOnInit error and else branch', () => {
    it('covers error callback when getUserdetailsFromRegistry throws', async () => {
      const { throwError } = require('rxjs')
      mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue(throwError(() => new Error('API error')))
      mockRoute.data.subscribe = jest.fn((cb: any) => cb({ tnc: { data: null } }))
      await component.ngOnInit()
      expect(component.showAcceptbtn).toBe(true)
    })

    it('covers else branch when unMappedUser is null and result.userId exists', async () => {
      mockConfigSvc.unMappedUser = null
      mockSignupService.fetchStartUpDetails = jest.fn().mockResolvedValue({ userId: 'user-X', tncStatus: false })
      mockRoute.data.subscribe = jest.fn((cb: any) => cb({ tnc: { data: null } }))
      await component.ngOnInit()
      expect(component.showAcceptbtn).toBe(true)
    })
  })

  describe('acceptTnc', () => {
    it('covers paramMap.keys forEach callback when keys are present', async () => {
      component.tncData = {
        termsAndConditions: [{ name: 'Generic T&C', language: 'en', version: 'v1' }],
      } as any
      mockRoute.snapshot.queryParamMap = { keys: ['code'], get: jest.fn().mockReturnValue('value123') }
      mockRoute.data.subscribe = jest.fn((cb: any) => cb({ tnc: { data: null } }))
      await component.ngOnInit()
      component.acceptTnc()
      expect(component.isAcceptInProgress).toBe(true)
    })

    it('covers localStorage preferedLanguage truthy branch', async () => {
      component.tncData = {
        termsAndConditions: [{ name: 'Generic T&C', language: 'en', version: 'v1' }],
      } as any
      localStorage.setItem('preferedLanguage', JSON.stringify({ id: 'hi' }))
      mockRoute.data.subscribe = jest.fn((cb: any) => cb({ tnc: { data: null } }))
      await component.ngOnInit()
      component.acceptTnc()
      expect(component.isAcceptInProgress).toBe(true)
      localStorage.removeItem('preferedLanguage')
    })

    it('should set errorInAccepting false when tncData is null', () => {
      component.tncData = null
      component.acceptTnc()
      expect(component.errorInAccepting).toBe(false)
    })

    it('should set isAcceptInProgress true when tncData exists', async () => {
      component.tncData = {
        termsAndConditions: [
          { name: 'Generic T&C', language: 'en', version: '1.0' },
          { name: 'Data Privacy', language: 'en', version: '1.0' },
        ],
      } as any
      mockSignupService.fetchStartUpDetails.mockResolvedValue({ userId: 'result-user-1', tncStatus: true })
      mockRoute.data.subscribe = jest.fn((cb: any) => cb({ tnc: { data: null } }))
      await component.ngOnInit()
      component.acceptTnc()
      expect(component.isAcceptInProgress).toBe(true)
    })

    it('should set termsAccepted to generalTnc version', async () => {
      component.tncData = {
        termsAndConditions: [
          { name: 'Generic T&C', language: 'en', version: 'v2' },
          { name: 'Data Privacy', language: 'en', version: 'v1' },
        ],
      } as any
      mockRoute.data.subscribe = jest.fn((cb: any) => cb({ tnc: { data: null } }))
      await component.ngOnInit()
      component.acceptTnc()
      expect(component.termsAccepted).toBe('v2')
    })
  })
})
