jest.mock('@angular/core', () => {
  const actual = jest.requireActual('@angular/core')
  return { ...actual, effect: (fn: () => void) => { fn() } }
})

jest.mock('../../../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {
    userProfile = { userId: 'user-1' }
    unMappedUser = { id: 'unmapped-1', profileDetails: { preferences: { language: 'en' } } }
  },
  LoggerService: class { log = jest.fn() },
  ValueService: class { isMobile = jest.fn().mockReturnValue(false) },
}))

jest.mock('../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service', () => ({
  UserProfileService: class {
    getUserdetailsFromRegistry = jest.fn()
    updateProfileDetails = jest.fn()
  },
}))

jest.mock('../../../../../library/ws-widget/collection/src/public-api', () => ({
  WidgetContentService: class {
    workMessage = { subscribe: jest.fn((cb: any) => { cb(null); return { unsubscribe: jest.fn() } }) }
  },
}))

jest.mock('../../../../../project/ws/app/src/public-api', () => ({
  AppDateAdapter: class {},
  APP_DATE_FORMATS: {},
  changeformat: jest.fn(d => d),
}))

jest.mock('../request-util', () => ({
  constructReq: jest.fn().mockReturnValue({
    profileReq: { personalDetails: { profileLocation: '' } },
  }),
}))

jest.mock('src/app/services/user-agent.service', () => ({
  UserAgentResolverService: class {
    getUserAgent = jest.fn().mockReturnValue('test-agent')
    generateCookie = jest.fn().mockReturnValue('test-cookie')
  },
}))

jest.mock('../../../services/language.service', () => ({
  LanguageService: class {
    getCurrentLanguage = jest.fn().mockReturnValue('en')
  },
}))

jest.mock('@ngx-translate/core', () => ({
  TranslateService: class {
    instant = jest.fn().mockImplementation((k: string) => k)
  },
}))

import { of, BehaviorSubject } from 'rxjs'
import { WorkInfoEditComponent } from './work-info-edit.component'

describe('WorkInfoEditComponent', () => {
  let component: WorkInfoEditComponent
  let mockConfigSvc: any
  let mockUserProfileSvc: any
  let mockRouter: any
  let mockSnackBar: any
  let mockRoute: any
  let mockValueSvc: any
  let mockContentSvc: any
  let mockLogger: any
  let mockUnsubscribe: any

  beforeEach(() => {
    mockUnsubscribe = jest.fn()
    mockConfigSvc = {
      userProfile: { userId: 'user-1' },
      unMappedUser: { id: 'unmapped-1', profileDetails: { preferences: { language: 'en' }, userSource: null } },
    }
    mockUserProfileSvc = {
      getUserdetailsFromRegistry: jest.fn().mockReturnValue(of({
        profileDetails: { profileReq: { professionalDetails: [{ name: 'AIIMS', designation: 'Nurse' }] } },
      })),
      updateProfileDetails: jest.fn().mockReturnValue(of({ success: true })),
    }
    mockRouter = { navigate: jest.fn() }
    mockSnackBar = { open: jest.fn() }
    mockRoute = { queryParams: new BehaviorSubject({}) }
    mockValueSvc = { isMobile: jest.fn().mockReturnValue(false) }
    mockContentSvc = {
      workMessage: { subscribe: jest.fn().mockReturnValue({ unsubscribe: mockUnsubscribe }) },
    }
    mockLogger = { log: jest.fn() }

    component = new WorkInfoEditComponent(
      mockConfigSvc,
      mockUserProfileSvc,
      mockRouter,
      mockSnackBar,
      mockRoute,
      mockValueSvc,
      {} as any,           // UserAgentResolverService
      mockContentSvc,      // contentSvc
      {} as any,           // languageSvc
      mockLogger,
      {} as any,           // translate
    )
    sessionStorage.clear()
  })

  afterEach(() => {
    sessionStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize workInfoForm with organizationName and designation controls', () => {
    expect(component.workInfoForm.get('organizationName')).toBeTruthy()
    expect(component.workInfoForm.get('designation')).toBeTruthy()
  })

  it('should default showbackButton false when isMobile returns false', () => {
    expect(component.showbackButton).toBe(false)
  })

  it('should set showbackButton true when isMobile returns true', () => {
    mockValueSvc.isMobile.mockReturnValue(true)
    component = new WorkInfoEditComponent(
      mockConfigSvc, mockUserProfileSvc, mockRouter, mockSnackBar,
      mockRoute, mockValueSvc, {} as any, mockContentSvc, {} as any, mockLogger, {} as any,
    )
    expect(component.showbackButton).toBe(true)
  })

  it('should subscribe to workMessage on construction', () => {
    expect(mockContentSvc.workMessage.subscribe).toHaveBeenCalled()
  })

  describe('updateForm', () => {
    it('should patch form from professionalDetails', () => {
      component.userProfileData = {
        professionalDetails: [{ name: 'AIIMS Hospital', designation: 'Staff Nurse' }],
      }
      component.updateForm()
      expect(component.workInfoForm.get('organizationName')?.value).toBe('AIIMS Hospital')
      expect(component.workInfoForm.get('designation')?.value).toBe('Staff Nurse')
    })

    it('should not throw when userProfileData is null', () => {
      component.userProfileData = null
      expect(() => component.updateForm()).not.toThrow()
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe workMessage subscription', () => {
      component.ngOnDestroy()
      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })
})
