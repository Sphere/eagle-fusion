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

  describe('professionalChange', () => {
    it('should set rnShow true and showDesignation true for Healthcare Worker', () => {
      component.professionalChange('Healthcare Worker')
      expect(component.rnShow).toBe(true)
      expect(component.showDesignation).toBe(true)
      expect(component.savebtnDisable).toBe(false)
    })

    it('should set rnShow false for Healthcare Volunteer', () => {
      component.professionalChange('Healthcare Volunteer')
      expect(component.rnShow).toBe(false)
      expect(component.orgTypeField).toBe(false)
    })

    it('should set rnShow false for Faculty', () => {
      component.professionalChange('Faculty')
      expect(component.rnShow).toBe(false)
      expect(component.orgOthersField).toBe(false)
    })

    it('should set professionOtherField true for Others', () => {
      component.professionalChange('Others')
      expect(component.rnShow).toBe(false)
      expect(component.professionOtherField).toBe(true)
    })

    it('should set orgOthersField false for Student', () => {
      component.professionalChange('Student')
      expect(component.rnShow).toBe(false)
      expect(component.orgOthersField).toBe(false)
    })

    it('should set orgTypeField true for unknown value', () => {
      component.professionalChange('SomeOtherValue')
      expect(component.orgTypeField).toBe(true)
      expect(component.rnShow).toBe(false)
    })
  })

  describe('orgTypeSelect', () => {
    it('should set orgType value when not null string', () => {
      component.orgTypeSelect('NGO')
      expect(component.personalDetailForm.get('orgType')?.value).toBe('NGO')
      expect(component.savebtnDisable).toBe(false)
    })

    it('should set null when value is null string', () => {
      component.orgTypeSelect('null')
      expect(component.personalDetailForm.get('orgType')?.value).toBeNull()
    })

    it('should set orgOthersField true and validators for Others', () => {
      component.orgTypeSelect('Others')
      expect(component.orgOthersField).toBe(true)
    })

    it('should set orgOthersField false and clear validators for non-Others', () => {
      component.orgOthersField = true
      component.orgTypeSelect('NGO')
      expect(component.orgOthersField).toBe(false)
    })
  })

  describe('removeKnowLanguage', () => {
    it('should remove language from selectedKnowLangs', () => {
      component.selectedKnowLangs = ['English', 'Hindi'] as any
      component.removeKnowLanguage('English')
      expect(component.selectedKnowLangs).toEqual(['Hindi'])
      expect(component.savebtnDisable).toBe(false)
    })

    it('should not throw when language is not in the list', () => {
      component.selectedKnowLangs = ['English'] as any
      expect(() => component.removeKnowLanguage('French')).not.toThrow()
    })
  })

  describe('onDateChange', () => {
    it('should set invalidDob false for DOB more than 18 years ago', () => {
      const oldDate = new Date()
      oldDate.setFullYear(oldDate.getFullYear() - 20)
      component.onDateChange(oldDate)
      expect(component.invalidDob).toBe(false)
      expect(component.savebtnDisable).toBe(false)
    })

    it('should set invalidDob true for DOB less than 18 years ago', () => {
      const recentDate = new Date()
      recentDate.setFullYear(recentDate.getFullYear() - 10)
      component.onDateChange(recentDate)
      expect(component.invalidDob).toBe(true)
      expect(component.savebtnDisable).toBe(true)
    })
  })

  describe('fieldChange', () => {
    it('should set savebtnDisable false for default case', () => {
      component.savebtnDisable = true
      component.fieldChange()
      expect(component.savebtnDisable).toBe(false)
    })

    it('should set savebtnDisable true for state case', () => {
      jest.spyOn(component as any, 'stateSelect').mockImplementation(() => {})
      component.fieldChange('state')
      expect(component.savebtnDisable).toBe(true)
    })
  })

  describe('getUserDetails', () => {
    it('should skip API call when userProfile is null', () => {
      mockConfigSvc.userProfile = null
      const spy = jest.spyOn(mockUserProfileSvc, 'getUserdetailsFromRegistry')
      component.getUserDetails()
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('ngOnDestroy', () => {
    it('should complete without throw', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})
