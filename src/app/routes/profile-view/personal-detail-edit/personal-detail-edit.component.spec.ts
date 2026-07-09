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
import { of, throwError } from 'rxjs'
import { constructReq } from '../request-util'
import { PersonalDetailEditComponent } from './personal-detail-edit.component'

describe('PersonalDetailEditComponent', () => {
  let component: PersonalDetailEditComponent
  let mockConfigSvc: any
  let mockUserProfileSvc: any
  let mockValueSvc: any
  let mockRouter: any
  let mockSnackBar: any
  let mockDialog: any
  let mockCdr: any
  let mockUserAgentSvc: any
  let mockHttp: any
  let mockLangSvc: any
  let mockLogger: any
  let mockTranslate: any

  beforeEach(() => {
    mockConfigSvc = {
      userProfile: { userId: 'user-1' },
      unMappedUser: { id: 'unmapped-1', profileDetails: { preferences: { language: 'en' }, userSource: null } },
      userProfileV2: null,
    }
    mockUserProfileSvc = {
      getUserdetailsFromRegistry: jest.fn(),
      updateProfileDetails: jest.fn(),
    }
    mockValueSvc = { isMobile: jest.fn().mockReturnValue(false) }
    mockRouter = { navigate: jest.fn() }
    mockSnackBar = { open: jest.fn() }
    mockDialog = { open: jest.fn() }
    mockCdr = { markForCheck: jest.fn(), detectChanges: jest.fn() }
    mockUserAgentSvc = {
      getUserAgent: jest.fn().mockReturnValue({ OS: 'TestOS', browserName: 'TestBrowser' }),
      generateCookie: jest.fn().mockReturnValue('gen-cookie'),
    }
    mockHttp = {
      get: jest.fn().mockImplementation((url: string) => {
        if (url.includes('country')) {
          return of({ nationalities: [{ name: 'India', countryCode: '+91' }, { name: 'France', countryCode: '+33' }] })
        }
        if (url.includes('state') || url.includes('district')) {
          return of({ states: [{ state: 'Karnataka', districts: ['Bangalore', 'Mysore'] }] })
        }
        return of({})
      }),
    }
    mockLangSvc = { getCurrentLanguage: jest.fn().mockReturnValue('en') }
    mockLogger = { log: jest.fn(), error: jest.fn() }
    mockTranslate = { instant: jest.fn().mockImplementation((k: string) => k) }

    component = new PersonalDetailEditComponent(
      mockConfigSvc,
      mockUserProfileSvc,
      mockRouter,
      mockSnackBar,
      mockDialog,
      mockValueSvc,
      mockCdr,
      mockUserAgentSvc,
      mockHttp,
      new FormBuilder(),
      mockLangSvc,
      mockLogger,
      mockTranslate,
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

  describe('ngOnInit', () => {
    it('should add controls from formConfig with validators and fetch meta', () => {
      component.data = {
        formData: [
          { key: 'customReq', required: true, pattern: '^[a-z]+$' },
          { key: 'customOpt' },
        ],
      }
      component.ngOnInit()
      const ctrl = component.personalDetailForm.get('customReq')
      expect(ctrl).toBeTruthy()
      expect(ctrl?.hasError('required')).toBe(true)
      ctrl?.setValue('ABC')
      expect(ctrl?.hasError('pattern')).toBe(true)
      ctrl?.setValue('abc')
      expect(ctrl?.valid).toBe(true)
      expect(component.personalDetailForm.get('customOpt')?.valid).toBe(true)
      expect(component.countries).toEqual([{ name: 'India', countryCode: '+91' }, { name: 'France', countryCode: '+33' }])
      expect(component.states).toEqual([{ state: 'Karnataka', districts: ['Bangalore', 'Mysore'] }])
    })

    it('should disable the form for ekshamata users', () => {
      component.data = { formData: [] }
      component.isEkshamata = true
      component.ngOnInit()
      expect(component.personalDetailForm.disabled).toBe(true)
    })
  })

  describe('stateSelect', () => {
    it('should load districts for the selected state and reset distict', () => {
      component.personalDetailForm.get('distict')?.setValue('Old')
      component.stateSelect('Karnataka')
      expect(component.personalDetailForm.get('distict')?.value).toBeNull()
      expect(component.disticts).toEqual([{ name: 'Bangalore' }, { name: 'Mysore' }])
    })

    it('should leave districts unchanged when state is not found', () => {
      component.disticts = [{ name: 'Existing' }]
      component.stateSelect('Atlantis')
      expect(component.disticts).toEqual([{ name: 'Existing' }])
    })

    it('should log an error when the district fetch fails', () => {
      mockHttp.get.mockReturnValueOnce(throwError(() => new Error('boom')))
      component.stateSelect('Karnataka')
      expect(mockLogger.error).toHaveBeenCalledWith('Error fetching districts:', expect.any(Error))
    })
  })

  describe('countrySelect', () => {
    beforeEach(() => {
      component.countries = [{ name: 'India', countryCode: '+91' }, { name: 'France', countryCode: '+33' }]
    })

    it('should disable free select and add validators for India', () => {
      component.countrySelect('India')
      expect(component.selectDisable).toBe(true)
      expect(component.personalDetailForm.get('countryCode')?.value).toBe('+91')
      const state = component.personalDetailForm.get('state')
      state?.updateValueAndValidity()
      expect(state?.hasError('required')).toBe(true)
    })

    it('should clear state and district for non-India countries', () => {
      component.countrySelect('France')
      expect(component.selectDisable).toBe(false)
      expect(component.personalDetailForm.get('state')?.value).toBeNull()
      expect(component.personalDetailForm.get('distict')?.value).toBeNull()
      expect(component.savebtnDisable).toBe(false)
      expect(component.disticts).toEqual([])
      expect(component.personalDetailForm.get('countryCode')?.value).toBe('+33')
    })

    it('setCountryCode should match country names case-insensitively', () => {
      component.setCountryCode('india')
      expect(component.personalDetailForm.get('countryCode')?.value).toBe('+91')
    })
  })

  describe('fieldChange with country and distict keys', () => {
    it('should run countrySelect for country key', () => {
      component.countries = [{ name: 'India', countryCode: '+91' }]
      component.personalDetailForm.get('country')?.setValue('India')
      component.fieldChange('country')
      expect(component.personalDetailForm.get('countryCode')?.value).toBe('+91')
      expect(component.savebtnDisable).toBe(false)
    })

    it('should only enable save for distict key', () => {
      component.fieldChange('distict')
      expect(component.savebtnDisable).toBe(false)
    })
  })

  describe('language autocomplete streams', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      component.masterLanguagesEntries = [{ name: 'English' }, { name: 'Hindi' }] as any
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('onChangesLanuage should start with the full list and filter as the user types', () => {
      component.onChangesLanuage()
      const emissions: any[] = []
      component.masterLanguages?.subscribe(v => emissions.push(v))
      expect(emissions[0]).toEqual([{ name: 'English' }, { name: 'Hindi' }])
      component.personalDetailForm.get('domicileMedium')?.setValue('eng')
      jest.advanceTimersByTime(600)
      expect(emissions[1]).toEqual([{ name: 'English' }])
      component.personalDetailForm.get('domicileMedium')?.setValue({ name: 'hin' })
      jest.advanceTimersByTime(600)
      expect(emissions[2]).toEqual([{ name: 'Hindi' }])
      component.personalDetailForm.get('domicileMedium')?.setValue(null)
      jest.advanceTimersByTime(600)
      expect(emissions[3]).toEqual([{ name: 'English' }, { name: 'Hindi' }])
    })

    it('onChangesKnownLanuage should filter strings and handle array values', () => {
      component.onChangesKnownLanuage()
      const emissions: any[] = []
      component.masterKnownLanguages?.subscribe(v => emissions.push(v))
      expect(emissions[0]).toEqual([{ name: 'English' }, { name: 'Hindi' }])
      component.personalDetailForm.get('knownLanguages')?.setValue('hin')
      jest.advanceTimersByTime(600)
      expect(emissions[1]).toEqual([{ name: 'Hindi' }])
      component.personalDetailForm.get('knownLanguages')?.setValue(['eng'])
      jest.advanceTimersByTime(600)
      expect(emissions[2]).toEqual([])
    })

    it('filter helpers should return the master list for empty input', () => {
      expect((component as any).filterLanguage(null)).toEqual([{ name: 'English' }, { name: 'Hindi' }])
      expect((component as any).filterMultiLanguage(null)).toEqual([{ name: 'English' }, { name: 'Hindi' }])
    })
  })

  describe('known language chips', () => {
    beforeEach(() => {
      component.knownLanguagesInputRef = { nativeElement: { value: 'typed' } } as any
    })

    it('selectKnowLanguage should add the selected language and clear the input', () => {
      const lang = { name: 'English' }
      component.selectKnowLanguage({ option: { value: lang } })
      expect(component.selectedKnowLangs).toContain(lang)
      expect(component.knownLanguagesInputRef.nativeElement.value).toBe('')
      expect(component.savebtnDisable).toBe(false)
    })

    it('selectKnowLanguage should not add a duplicate language', () => {
      const lang = { name: 'English' } as any
      component.selectedKnowLangs = [lang]
      component.selectKnowLanguage({ option: { value: lang } })
      expect(component.selectedKnowLangs.length).toBe(1)
    })

    it('add should push the chip value and reset the input', () => {
      const input = { value: 'partial' }
      component.add({ input, value: 'French' } as any)
      expect(component.selectedKnowLangs).toContain('French')
      expect(input.value).toBe('')
      expect(component.savebtnDisable).toBe(false)
    })

    it('add should ignore empty values and missing input', () => {
      component.add({ input: null, value: '' } as any)
      expect(component.selectedKnowLangs.length).toBe(0)
    })
  })

  describe('getUserDetails with registry data', () => {
    const buildProfileReq = (overrides: any = {}) => ({
      personalDetails: {
        firstname: 'Asha',
        surname: 'Kumar',
        dob: '01-02-1990',
        regNurseRegMidwifeNumber: 'RN1',
        nationality: 'Indian',
        domicileMedium: 'English',
        gender: 'Female',
        maritalStatus: 'Single',
        knownLanguages: [{ name: 'English' }, null],
        mobile: '9999999999',
        primaryEmail: 'asha@example.com',
        postalAddress: 'India, Karnataka, Bangalore',
        pincode: '560001',
        ...overrides.personalDetails,
      },
      professionalDetails: overrides.professionalDetails || [{
        profession: 'Healthcare Worker',
        professionOtherSpecify: '',
        orgType: 'NGO',
        orgOtherSpecify: '',
        name: 'OrgName',
        block: 'B1',
        subcentre: 'S1',
        designation: 'Nurse',
      }],
    })

    const registryData = (language: string, profileReq: any) => ({
      profileDetails: { profileReq, preferences: { language } },
      phone: '8888888888',
    })

    it('should enable the form and populate hindi preference data', () => {
      component.data = { isEditable: true }
      mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue(of(registryData('hi', buildProfileReq())))
      component.getUserDetails()
      expect(mockUserProfileSvc.getUserdetailsFromRegistry).toHaveBeenCalledWith('unmapped-1')
      expect(component.isEditableForSphere).toBe(true)
      expect(component.personalDetailForm.get('mobile')?.disabled).toBe(true)
      expect(component.personalDetailForm.get('email')?.disabled).toBe(true)
      expect(component.personalDetailForm.get('firstname')?.disabled).toBe(false)
      expect(component.personalDetailForm.get('firstname')?.value).toBe('Asha')
      expect(component.personalDetailForm.get('dob')?.value).toBe('01/02/1990')
      expect(component.personalDetailForm.get('country')?.value).toBe('India')
      expect(component.personalDetailForm.get('state')?.value).toBe('Karnataka')
      expect(component.personalDetailForm.get('distict')?.value).toBe('Bangalore')
      expect(component.personalDetailForm.get('knownLanguage')?.value).toBe('हिंदी')
      expect(component.selectedKnowLangs.length).toBe(1)
      expect(component.rnShow).toBe(true)
      expect(component.showDesignation).toBe(true)
      expect(component.loadDob).toBe(true)
      expect(component.countryName).toBe(true)
      expect(component.selectDisable).toBe(true)
    })

    it('should disable the form for non-editable data and handle non-India address', () => {
      component.data = {}
      const profileReq = buildProfileReq({
        personalDetails: { postalAddress: 'France', dob: '', mobile: undefined },
        professionalDetails: [{
          profession: 'Others',
          professionOtherSpecify: 'Consultant',
          orgType: 'Others',
          orgOtherSpecify: 'MyOrg',
          name: 'OrgName',
          block: '',
          subcentre: '',
          designation: '',
        }],
      })
      mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue(of(registryData('en', profileReq)))
      component.getUserDetails()
      expect(component.isEditableForSphere).toBe(false)
      expect(component.personalDetailForm.disabled).toBe(true)
      expect(component.personalDetailForm.get('country')?.value).toBe('France')
      expect(component.selectDisable).toBe(false)
      expect(component.personalDetailForm.get('mobile')?.value).toBe('8888888888')
      expect(component.orgOthersField).toBe(true)
      expect(component.professionOtherField).toBe(true)
      expect(component.showDesignation).toBe(false)
      expect(component.rnShow).toBe(false)
      expect(component.loadDob).toBe(false)
      expect(component.selectedKnowLangs.length).toBe(0)
    })

    it('should do nothing when the registry returns no data', () => {
      component.data = { isEditable: true }
      mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue(of(null))
      component.getUserDetails()
      expect(component.userProfileData).toBeUndefined()
      expect(component.isEditableForSphere).toBe(false)
    })

    it('should log an error when the registry call fails', () => {
      mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue(throwError(() => new Error('nope')))
      component.getUserDetails()
      expect(mockLogger.error).toHaveBeenCalledWith('Error fetching user details:', expect.any(Error))
    })

    it('updateForm should fall back to userlang phone and skip address when missing', () => {
      component.userProfileData = { personalDetails: { firstname: 'A', surname: 'B', dob: '' } } as any
      component.userlang = { phone: '1234567890' }
      component.updateForm()
      expect(component.personalDetailForm.get('mobile')?.value).toBe('1234567890')
      expect(component.personalDetailForm.get('firstname')?.value).toBe('A')
      expect(component.loadDob).toBe(false)
    })
  })

  describe('getDateFromText', () => {
    it('should convert dash and slash separated dates and pass empty through', () => {
      expect((component as any).getDateFromText('01-02-1990')).toBe('01/02/1990')
      expect((component as any).getDateFromText('01/02/1990')).toBe('01/02/1990')
      expect((component as any).getDateFromText('')).toBe('')
    })
  })

  describe('onSubmit', () => {
    const constructReqMock = constructReq as jest.Mock

    beforeEach(() => {
      constructReqMock.mockImplementation(() => ({
        profileReq: { personalDetails: {}, professionalDetails: [{}] },
      }))
      component.userData = { personalDetails: { osName: 'iOS', browserName: 'Safari', userCookie: 'stored-ck' } }
    })

    it('should build the request, save and navigate on success', () => {
      mockConfigSvc.unMappedUser.profileDetails.userSource = 'web'
      mockUserProfileSvc.updateProfileDetails.mockReturnValue(of({ ok: true }))
      const emitSpy = jest.spyOn(component.userName, 'emit')
      const form: any = {
        value: {
          firstname: 'F',
          surname: 'S',
          dob: '01/02/1990/undefined',
          country: 'India',
          state: 'Karnataka',
          distict: 'Bangalore',
        },
      }
      component.onSubmit(form)
      expect(form.value.dob).toBe('01/02/1990')
      expect(form.value.knownLanguages).toBe(component.selectedKnowLangs)
      expect(component.userID).toBe('user-1')
      const req = mockUserProfileSvc.updateProfileDetails.mock.calls[0][0]
      expect(req.request.userId).toBe('user-1')
      expect(req.request.firstName).toBe('F')
      expect(req.request.lastName).toBe('S')
      expect(req.request.profileDetails.profileReq.personalDetails.postalAddress).toBe('India,Karnataka,Bangalore')
      expect(req.request.profileDetails.profileReq.personalDetails.osName).toBe('iOS')
      expect(req.request.profileDetails.profileReq.personalDetails.browserName).toBe('Safari')
      expect(req.request.profileDetails.profileReq.personalDetails.userCookie).toBe('stored-ck')
      expect(req.request.profileDetails.profileReq.professionalDetails[0].locationselect).toBe('Bangalore')
      expect(req.request.profileDetails.preferences.language).toBe('en')
      expect(req.request.profileDetails.userSource).toBe('web')
      expect(mockSnackBar.open).toHaveBeenCalledWith('USER_UPDATE_SUCCESS')
      expect(emitSpy).toHaveBeenCalledWith({ firstname: 'F', surname: 'S' })
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/profile-view'])
    })

    it('should fall back to userAgent values and language service for missing data', () => {
      mockConfigSvc.unMappedUser.profileDetails.preferences = undefined
      mockLangSvc.getCurrentLanguage.mockReturnValue('hi')
      component.userData = { personalDetails: {} }
      mockUserProfileSvc.updateProfileDetails.mockReturnValue(of(null))
      const form: any = { value: { firstname: 'F', surname: 'S', dob: '01/02/1990', country: 'France' } }
      component.onSubmit(form)
      expect(mockLangSvc.getCurrentLanguage).toHaveBeenCalled()
      const req = mockUserProfileSvc.updateProfileDetails.mock.calls[0][0]
      expect(req.request.profileDetails.profileReq.personalDetails.postalAddress).toBe('France')
      expect(req.request.profileDetails.profileReq.personalDetails.osName).toBe('TestOS')
      expect(req.request.profileDetails.profileReq.personalDetails.browserName).toBe('TestBrowser')
      expect(req.request.profileDetails.profileReq.personalDetails.userCookie).toBe('gen-cookie')
      expect(req.request.profileDetails.preferences.language).toBe('hi')
      expect(mockSnackBar.open).not.toHaveBeenCalled()
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })

    it('should show an error snackbar when the update fails', () => {
      mockUserProfileSvc.updateProfileDetails.mockReturnValue(throwError(() => new Error('fail')))
      const form: any = { value: { firstname: 'F', surname: 'S', dob: '01/02/1990', country: 'India', state: 'S', distict: '' } }
      component.onSubmit(form)
      expect(mockLogger.error).toHaveBeenCalledWith('Error updating profile:', expect.any(Error))
      expect(mockSnackBar.open).toHaveBeenCalledWith('PROFILE_UPDATE_ERR')
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })

    it('should keep userID empty when there is no user profile', () => {
      mockConfigSvc.userProfile = null
      mockUserProfileSvc.updateProfileDetails.mockReturnValue(of(null))
      const form: any = { value: { firstname: 'F', surname: 'S', dob: '01/02/1990', country: 'France' } }
      component.onSubmit(form)
      expect(component.userID).toBe('')
      const req = mockUserProfileSvc.updateProfileDetails.mock.calls[0][0]
      expect(req.request.userId).toBe('')
    })
  })

  describe('changeLanguage', () => {
    it('should not change anything when the dialog closes without a result', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(null) })
      component.changeLanguage()
      expect(component.preferedLanguage).toBe('English')
      expect(mockUserProfileSvc.getUserdetailsFromRegistry).not.toHaveBeenCalled()
    })

    it('should set the preferred language but skip the update without userProfileV2', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of({ lang: 'hindi', id: 'hi' }) })
      mockConfigSvc.userProfileV2 = null
      component.changeLanguage()
      expect(component.preferedLanguage).toEqual({ lang: 'hindi', id: 'hi' })
      expect(component.personalDetailForm.get('knownLanguage')?.value).toBe('Hindi')
      expect(mockUserProfileSvc.getUserdetailsFromRegistry).not.toHaveBeenCalled()
    })

    it('should update the language preference and redirect on success', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of({ lang: 'hindi', id: 'hi' }) })
      mockConfigSvc.userProfileV2 = { userId: 'u-v2' }
      mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue(of({ profileDetails: { existing: true } }))
      mockUserProfileSvc.updateProfileDetails.mockReturnValue(of({}))
      component.changeLanguage()
      const req = mockUserProfileSvc.updateProfileDetails.mock.calls[0][0]
      expect(req.request.userId).toBe('u-v2')
      expect(req.request.profileDetails.preferences.language).toBe('hi')
      expect(req.request.profileDetails.osName).toBe('TestOS')
      expect(req.request.profileDetails.browserName).toBe('TestBrowser')
      expect(req.request.profileDetails.userCookie).toBe('gen-cookie')
    })

    it('should log an error when the language update fails', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of({ lang: 'hindi', id: 'hi' }) })
      mockConfigSvc.userProfileV2 = { userId: 'u-v2' }
      mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue(of({ profileDetails: {} }))
      mockUserProfileSvc.updateProfileDetails.mockReturnValue(throwError(() => new Error('fail')))
      component.changeLanguage()
      expect(mockLogger.error).toHaveBeenCalledWith('Error updating language preference:', expect.any(Error))
    })

    it('should log an error when fetching user details fails', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of({ lang: 'hindi', id: 'hi' }) })
      mockConfigSvc.userProfileV2 = { userId: 'u-v2' }
      mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue(throwError(() => new Error('fail')))
      component.changeLanguage()
      expect(mockLogger.error).toHaveBeenCalledWith('Error fetching user details:', expect.any(Error))
    })
  })

  describe('misc UI helpers', () => {
    it('dobData should patch dob and enable save', () => {
      component.dobData('01/01/1990')
      expect(component.personalDetailForm.get('dob')?.value).toBe('01/01/1990')
      expect(component.savebtnDisable).toBe(false)
    })

    it('ngAfterViewInit should trigger getUserDetails', () => {
      const spy = jest.spyOn(component, 'getUserDetails').mockImplementation(() => {})
      component.ngAfterViewInit()
      expect(spy).toHaveBeenCalled()
    })

    it('ngAfterViewChecked should mark for check', () => {
      component.ngAfterViewChecked()
      expect(mockCdr.markForCheck).toHaveBeenCalled()
    })

    it('getOptions should resolve option lists from component fields', () => {
      expect(component.getOptions({ options: 'professions' })).toEqual(component.professions)
      expect(component.getOptions({ options: 'missing' })).toEqual([])
    })

    it('showSelectField should gate state and distict on selectDisable', () => {
      component.selectDisable = false
      expect(component.showSelectField({ key: 'state' })).toBe(false)
      expect(component.showSelectField({ key: 'distict' })).toBe(false)
      expect(component.showSelectField({ key: 'gender' })).toBe(true)
    })
  })
})
