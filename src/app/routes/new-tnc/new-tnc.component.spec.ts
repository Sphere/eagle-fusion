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
})
