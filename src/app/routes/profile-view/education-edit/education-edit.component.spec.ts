jest.mock('@angular/core', () => ({
  ...jest.requireActual('@angular/core'),
  effect: (fn: any) => { fn(); return {} },
}))

jest.mock('../../../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {
    userProfile = { userId: 'user-1' }
    unMappedUser = { id: 'unmapped-1', profileDetails: { userSource: null, preferences: { language: 'en' } } }
  },
  ValueService: class { isMobile = jest.fn().mockReturnValue(false) },
  LoggerService: class { log = jest.fn(); error = jest.fn() },
}))

jest.mock('../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service', () => ({
  UserProfileService: class {
    getUserdetailsFromRegistry = jest.fn()
    updateProfileDetails = jest.fn()
    _updateuser = { next: jest.fn() }
  },
}))

jest.mock('../../../../../library/ws-widget/collection/src/public-api', () => ({
  WidgetContentService: class {
    workMessage = { subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }) }
    changeWork = jest.fn()
  },
}))

jest.mock('../request-util', () => ({
  constructReq: jest.fn().mockReturnValue({ profileReq: { personalDetails: { profileLocation: '' } } }),
}))

jest.mock('src/app/services/user-agent.service', () => ({
  UserAgentResolverService: class {
    getUserAgent = jest.fn().mockReturnValue({ OS: 'Mac', browserName: 'Chrome' })
    generateCookie = jest.fn().mockReturnValue('cookie')
  },
}))

jest.mock('../../../services/language.service', () => ({
  LanguageService: class { getCurrentLanguage = jest.fn().mockReturnValue('en') },
}))

jest.mock('@ngx-translate/core', () => ({
  TranslateService: class { instant = jest.fn().mockImplementation((k: string) => k) },
}))

import { of } from 'rxjs'
import { EducationEditComponent } from './education-edit.component'

describe('EducationEditComponent', () => {
  let component: EducationEditComponent
  let mockConfigSvc: any
  let mockUserProfileSvc: any
  let mockSnackBar: any
  let mockRoute: any
  let mockValueSvc: any
  let mockUserAgentSvc: any
  let mockContentSvc: any
  let mockLangSvc: any
  let mockLogger: any
  let mockTranslate: any

  beforeEach(() => {
    mockConfigSvc = {
      userProfile: { userId: 'user-1' },
      unMappedUser: { id: 'unmapped-1', profileDetails: { userSource: null, preferences: { language: 'en' } } },
    }
    mockUserProfileSvc = {
      getUserdetailsFromRegistry: jest.fn().mockReturnValue(of({
        profileDetails: { profileReq: { personalDetails: { photo: '' } } },
      })),
      updateProfileDetails: jest.fn().mockReturnValue(of({ res: true })),
      _updateuser: { next: jest.fn() },
    }
    mockSnackBar = { open: jest.fn() }
    mockRoute = { queryParams: { subscribe: jest.fn((cb: any) => cb({})) } }
    mockValueSvc = { isMobile: jest.fn().mockReturnValue(false) }
    mockUserAgentSvc = {
      getUserAgent: jest.fn().mockReturnValue({ OS: 'Mac', browserName: 'Chrome' }),
      generateCookie: jest.fn().mockReturnValue('cookie'),
    }
    mockContentSvc = {
      workMessage: { subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }) },
      changeWork: jest.fn(),
    }
    mockLangSvc = { getCurrentLanguage: jest.fn().mockReturnValue('en') }
    mockLogger = { log: jest.fn(), error: jest.fn() }
    mockTranslate = { instant: jest.fn().mockImplementation((k: string) => k) }

    component = new EducationEditComponent(
      mockConfigSvc,
      mockUserProfileSvc,
      mockSnackBar,
      mockRoute,
      mockValueSvc,
      mockUserAgentSvc,
      mockContentSvc,
      mockLangSvc,
      mockLogger,
      mockTranslate,
    )
  })

  afterEach(() => {
    sessionStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize educationForm with required controls', () => {
    expect(component.educationForm.get('courseDegree')).toBeTruthy()
    expect(component.educationForm.get('courseName')).toBeTruthy()
    expect(component.educationForm.get('institutionName')).toBeTruthy()
    expect(component.educationForm.get('yearPassing')).toBeTruthy()
  })

  it('should initialize academics array with 4 entries', () => {
    expect(component.academics).toHaveLength(4)
    expect(component.academics[0].type).toBe('X_STANDARD')
  })

  it('should set showbackButton true when isMobile is true', () => {
    mockValueSvc.isMobile.mockReturnValue(true)
    component = new EducationEditComponent(
      mockConfigSvc, mockUserProfileSvc, mockSnackBar, mockRoute,
      mockValueSvc, mockUserAgentSvc, mockContentSvc, mockLangSvc, mockLogger, mockTranslate,
    )
    expect(component.showbackButton).toBe(true)
  })

  it('should set showbackButton false when isMobile is false', () => {
    expect(component.showbackButton).toBe(false)
  })

  it('should subscribe to contentSvc.workMessage in constructor', () => {
    expect(mockContentSvc.workMessage.subscribe).toHaveBeenCalled()
  })

  describe('updateForm', () => {
    it('should patch institutionName and yearPassing', () => {
      component.updateForm({
        type: 'X_STANDARD',
        nameOfQualification: 'Math',
        nameOfInstitute: 'Delhi School',
        yearOfPassing: '2005',
      })
      expect(component.educationForm.get('institutionName')?.value).toBe('Delhi School')
      expect(component.educationForm.get('yearPassing')?.value).toBe('2005')
    })

    it('should set cName from nameOfQualification', () => {
      component.updateForm({
        type: 'GRADUATE',
        nameOfQualification: 'BSc Nursing',
        nameOfInstitute: 'AIIMS',
        yearOfPassing: '2015',
      })
      expect(component.cName).toBe('BSc Nursing')
    })
  })

  describe('getUserDetails', () => {
    it('should call getUserdetailsFromRegistry when userProfile is set', () => {
      component.getUserDetails()
      expect(mockUserProfileSvc.getUserdetailsFromRegistry).toHaveBeenCalledWith('unmapped-1')
    })

    it('should not call getUserdetailsFromRegistry when userProfile is null', () => {
      mockConfigSvc.userProfile = null
      component.getUserDetails()
      expect(mockUserProfileSvc.getUserdetailsFromRegistry).not.toHaveBeenCalled()
    })
  })
})
