jest.mock('@angular/core', () => {
  const actual = jest.requireActual('@angular/core')
  return { ...actual, effect: (fn: () => void) => { fn() } }
})

jest.mock('../../../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {
    userProfile = { userId: 'user-1' }
    unMappedUser = { id: 'unmapped-1', profileDetails: { preferences: { language: 'en' } } }
  },
  ValueService: class { isMobile = jest.fn().mockReturnValue(false) },
}))

jest.mock('@ws-widget/utils', () => ({
  LoggerService: class { log = jest.fn() },
}))

jest.mock('../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service', () => ({
  UserProfileService: class {
    getUserdetailsFromRegistry = jest.fn()
    updateProfileDetails = jest.fn()
  },
}))

jest.mock('../../../../../project/ws/app/src/public-api', () => ({
  AppDateAdapter: class {},
  APP_DATE_FORMATS: {},
}))

jest.mock('../request-util', () => ({
  constructReq: jest.fn().mockReturnValue({
    profileReq: { personalDetails: { profileLocation: '' } },
  }),
}))

jest.mock('src/app/services/user-agent.service', () => ({
  UserAgentResolverService: class {
    getUserAgent = jest.fn().mockReturnValue('agent')
    generateCookie = jest.fn().mockReturnValue('cookie')
  },
}))

jest.mock('../../../services/language.service', () => ({
  LanguageService: class { getCurrentLanguage = jest.fn().mockReturnValue('en') },
}))

jest.mock('@ngx-translate/core', () => ({
  TranslateService: class { instant = jest.fn().mockImplementation((k: string) => k) },
}))

jest.mock('../../language-dialog/language-dialog.component', () => ({
  LanguageDialogComponent: class {},
}))

jest.mock('lodash', () => ({
  upperFirst: (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : ''),
}))

import { FormBuilder } from '@angular/forms'
import { PersonalDetailEditComponent } from './personal-detail-edit.component'

describe('PersonalDetailEditComponent', () => {
  let component: PersonalDetailEditComponent
  let mockConfigSvc: any
  let mockUserProfileSvc: any
  let mockValueSvc: any

  beforeEach(() => {
    mockConfigSvc = {
      userProfile: { userId: 'user-1' },
      unMappedUser: { id: 'unmapped-1', profileDetails: { preferences: { language: 'en' }, userSource: null } },
    }
    mockUserProfileSvc = {
      getUserdetailsFromRegistry: jest.fn(),
      updateProfileDetails: jest.fn(),
    }
    mockValueSvc = { isMobile: jest.fn().mockReturnValue(false) }

    component = new PersonalDetailEditComponent(
      mockConfigSvc,
      mockUserProfileSvc,
      {} as any,          // router
      {} as any,          // matSnackBar
      {} as any,          // dialog
      mockValueSvc,
      { markForCheck: jest.fn(), detectChanges: jest.fn() } as any,
      {} as any,          // UserAgentResolverService
      { get: jest.fn().mockReturnValue({ subscribe: jest.fn() }) } as any,  // http
      new FormBuilder(),
      {} as any,          // langSvc
      { log: jest.fn() } as any,
      { instant: jest.fn() } as any,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize personalDetailForm with required fields', () => {
    expect(component.personalDetailForm).toBeDefined()
    expect(component.personalDetailForm.get('firstname')).toBeTruthy()
    expect(component.personalDetailForm.get('surname')).toBeTruthy()
    expect(component.personalDetailForm.get('dob')).toBeTruthy()
  })

  it('should initialize form with optional fields', () => {
    expect(component.personalDetailForm.get('gender')).toBeTruthy()
    expect(component.personalDetailForm.get('nationality')).toBeTruthy()
    expect(component.personalDetailForm.get('mobile')).toBeTruthy()
    expect(component.personalDetailForm.get('email')).toBeTruthy()
  })

  it('should default showbackButton false when isMobile returns false', () => {
    expect(component.showbackButton).toBe(false)
  })

  it('should set showbackButton true when isMobile returns true', () => {
    mockValueSvc.isMobile.mockReturnValue(true)
    component = new PersonalDetailEditComponent(
      mockConfigSvc, mockUserProfileSvc, {} as any, {} as any, {} as any, mockValueSvc,
      { markForCheck: jest.fn(), detectChanges: jest.fn() } as any,
      {} as any,
      { get: jest.fn().mockReturnValue({ subscribe: jest.fn() }) } as any,
      new FormBuilder(), {} as any, { log: jest.fn() } as any, { instant: jest.fn() } as any,
    )
    expect(component.showbackButton).toBe(true)
  })

  it('should default savebtnDisable to true', () => {
    expect(component.savebtnDisable).toBe(true)
  })

  it('should default selectedKnowLangs to empty array', () => {
    expect(component.selectedKnowLangs).toEqual([])
  })

  it('should have professions array', () => {
    expect(component.professions).toContain('Healthcare Worker')
    expect(component.professions).toContain('Student')
    expect(component.professions).toContain('Others')
  })
})
