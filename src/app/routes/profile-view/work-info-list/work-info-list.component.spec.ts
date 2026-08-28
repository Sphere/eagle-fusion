jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class { getCouseByContentSearch = jest.fn(); changeWork = jest.fn() },
  WidgetUserService: class {},
}))
jest.mock('../../../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {},
  ValueService: class {},
  LoggerService: class { log = jest.fn(); warn = jest.fn(); error = jest.fn() },
}))
jest.mock('src/app/services/user-data-cache.service', () => ({ UserDataCacheService: class {} }))
jest.mock('../../../services/language.service', () => ({ LanguageService: class {} }))
jest.mock('src/app/services/user-agent.service', () => ({ UserAgentResolverService: class {} }))

import { ChangeDetectorRef } from '@angular/core'
import { Subject, of } from 'rxjs'
import { WorkInfoListComponent } from './work-info-list.component'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ConfigurationsService, ValueService } from '../../../../../library/ws-widget/utils/src/public-api'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { WidgetContentService } from '@ws-widget/collection'
import { HttpClient } from '@angular/common/http'
import { LanguageService } from '../../../services/language.service'

describe('WorkInfoListComponent', () => {
  let component: WorkInfoListComponent
  let mockValueService: any
  let mockConfigService: any
  let mockUserProfileService: any
  let mockSnackBar: any
  let mockHttpClient: any
  let mockLogger: any
  let mockCdr: any
  let mockTranslate: any

  const makeComponent = () => new WorkInfoListComponent(
    mockConfigService,
    mockUserProfileService,
    mockValueService as any as ValueService,
    {} as WidgetContentService,
    {} as any,
    mockSnackBar,
    mockHttpClient,
    {} as any as LanguageService,
    mockLogger,
    mockTranslate,
    mockCdr as any as ChangeDetectorRef,
  )

  beforeEach(() => {
    mockValueService = { isXSmall$: new Subject<boolean>() }
    mockConfigService = {}
    mockUserProfileService = {}
    mockSnackBar = { open: jest.fn() }
    mockHttpClient = { get: jest.fn() }
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    mockCdr = { detectChanges: jest.fn(), markForCheck: jest.fn() }
    mockTranslate = { instant: jest.fn().mockImplementation((k: string) => k), get: jest.fn() }
    component = makeComponent()
  })

  afterEach(() => jest.clearAllMocks())

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize form with profession control', () => {
    expect(component.personalDetailForm.get('profession')).toBeTruthy()
  })

  it('should set showbackButton when isXSmall$ emits true', () => {
    component.ngOnInit()
    mockValueService.isXSmall$.next(true)
    expect(component.showbackButton).toBe(true)
  })

  describe('ngOnInit', () => {
    it('should call getUserDetails', () => {
      const spy = jest.spyOn(component as any, 'getUserDetails')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should disable form when isEkshamata is true', () => {
      component.isEkshamata = true
      const spy = jest.spyOn(component.personalDetailForm, 'disable')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('getUserDetails', () => {
    it('should skip API call when userProfile is null', () => {
      mockConfigService.userProfile = null
      component['getUserDetails']()
      expect(mockUserProfileService.getUserdetailsFromRegistry).toBeUndefined()
    })

    it('should fetch profile data when userProfile exists', () => {
      const profileData = {
        profileDetails: {
          profileReq: {
            professionalDetails: [{ profession: 'ASHA', name: 'PHC', designation: 'ASHA', locationselect: null, block: 'B1' }],
            personalDetails: { regNurseRegMidwifeNumber: '', postalAddress: 'India, UP, Dist' },
          },
        },
      }
      mockConfigService.userProfile = { userId: 'u1' }
      mockConfigService.unMappedUser = { id: 'um-1' }
      mockUserProfileService.getUserdetailsFromRegistry = jest.fn().mockReturnValue(of(profileData))
      mockHttpClient.get.mockReturnValue(of({ states: [{ state: 'UP', districts: ['Dist', 'Dist2'] }] }))
      component['getUserDetails']()
      expect(mockUserProfileService.getUserdetailsFromRegistry).toHaveBeenCalledWith('um-1')
    })
  })

  describe('professionSelect', () => {
    it('should set validators for Others', () => {
      const spy = jest.spyOn(component.personalDetailForm.controls.professionOtherSpecify, 'setValidators')
      component.professionSelect('Others')
      expect(spy).toHaveBeenCalled()
    })

    it('should clear validators for non-Others', () => {
      const spy = jest.spyOn(component.personalDetailForm.controls.professionOtherSpecify, 'clearValidators')
      component.professionSelect('Nurse')
      expect(spy).toHaveBeenCalled()
      expect(component.personalDetailForm.get('professionOtherSpecify')?.value).toBeNull()
    })
  })

  describe('orgTypeSelect', () => {
    it('should set orgType value', () => {
      component.orgTypeSelect('NGO')
      expect(component.personalDetailForm.get('orgType')?.value).toBe('NGO')
    })

    it('should set null when value is null string', () => {
      component.orgTypeSelect('null')
      expect(component.personalDetailForm.get('orgType')?.value).toBeNull()
    })

    it('should set validators for Others', () => {
      const spy = jest.spyOn(component.personalDetailForm.controls.orgOtherSpecify, 'setValidators')
      component.orgTypeSelect('Others')
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('shouldShowField', () => {
    // showIf gating only applies while the form is editable. In the read-only view every
    // stored field is shown regardless of profession, so these cases need edit mode on.
    beforeEach(() => {
      component.isEditableForSphere = true
    })

    it('should return true when no showIf', () => {
      expect(component.shouldShowField({ label: 'test' })).toBe(true)
    })

    it('should return false when profession does not match', () => {
      component.personalDetailForm.patchValue({ profession: 'ASHA' })
      expect(component.shouldShowField({ showIf: { profession: ['Healthcare Worker'] } })).toBe(false)
    })

    it('should return true when profession matches', () => {
      component.personalDetailForm.patchValue({ profession: 'ASHA' })
      expect(component.shouldShowField({ showIf: { profession: ['ASHA'] } })).toBe(true)
    })

    it('should return false when non-profession key value is null', () => {
      component.personalDetailForm.patchValue({ profession: 'ASHA', designation: null })
      expect(component.shouldShowField({ showIf: { profession: ['ASHA'], designation: 'Nurse' } })).toBe(false)
    })

    it('should match a profession given as a bare string', () => {
      component.personalDetailForm.patchValue({ profession: 'ASHA' })
      expect(component.shouldShowField({ showIf: { profession: 'ASHA' } })).toBe(true)
      expect(component.shouldShowField({ showIf: { profession: 'Other' } })).toBe(false)
    })

    it('should match a secondary key given as a bare string', () => {
      component.personalDetailForm.patchValue({ profession: 'ASHA', designation: 'Nurse' })
      expect(component.shouldShowField({ showIf: { profession: ['ASHA'], designation: 'Nurse' } })).toBe(true)
      expect(component.shouldShowField({ showIf: { profession: ['ASHA'], designation: 'Doctor' } })).toBe(false)
    })

    it('should match a secondary key given as a list', () => {
      component.personalDetailForm.patchValue({ profession: 'ASHA', designation: 'Nurse' })
      expect(component.shouldShowField({ showIf: { profession: ['ASHA'], designation: ['Nurse', 'GNM'] } })).toBe(true)
      expect(component.shouldShowField({ showIf: { profession: ['ASHA'], designation: ['GNM'] } })).toBe(false)
    })

    it('should skip the background check unless the profession is Others', () => {
      component.personalDetailForm.patchValue({ profession: 'ASHA' })
      expect(component.shouldShowField({ showIf: { profession: ['ASHA'], selectBackground: 'X' } })).toBe(true)
    })

    it('should apply the background check when the profession is Others', () => {
      component.personalDetailForm.patchValue({ profession: 'Others', selectBackground: 'X' })
      expect(component.shouldShowField({ showIf: { profession: ['Others'], selectBackground: 'X' } })).toBe(true)
      expect(component.shouldShowField({ showIf: { profession: ['Others'], selectBackground: 'Y' } })).toBe(false)
    })

    it('should show a field whose showIf has no profession gate', () => {
      component.personalDetailForm.patchValue({ designation: 'Nurse' })
      expect(component.shouldShowField({ showIf: { designation: 'Nurse' } })).toBe(true)
    })
  })

  describe('getOptions', () => {
    it('should return empty array when no options field', () => {
      expect(component.getOptions({})).toEqual([])
    })

    it('should return healthWorkerProfessions for Healthcare Worker', () => {
      component.personalDetailForm.patchValue({ profession: 'Healthcare Worker' })
      const opts = component.getOptions({ options: 'professionalOptions' })
      expect(opts).toEqual(component.healthWorkerProfessions)
    })

    it('should return healthVolunteerProfessions for Healthcare Volunteer', () => {
      component.personalDetailForm.patchValue({ profession: 'Healthcare Volunteer' })
      expect(component.getOptions({ options: 'professionalOptions' })).toEqual(component.healthVolunteerProfessions)
    })

    it('should return studentList for Student', () => {
      component.personalDetailForm.patchValue({ profession: 'Student' })
      expect(component.getOptions({ options: 'professionalOptions' })).toEqual(component.studentList)
    })

    it('should return facultyList for Faculty', () => {
      component.personalDetailForm.patchValue({ profession: 'Faculty' })
      expect(component.getOptions({ options: 'professionalOptions' })).toEqual(component.facultyList)
    })

    it('should return [] for default profession', () => {
      component.personalDetailForm.patchValue({ profession: 'Unknown' })
      expect(component.getOptions({ options: 'professionalOptions' })).toEqual([])
    })

    it('should return named array for non-professional options', () => {
      expect(component.getOptions({ options: 'orgTypes' })).toEqual(component.orgTypes)
    })

    it('should return the India list for an Others profession with an Indian address', () => {
      component.personalDetailForm.patchValue({ profession: 'Others' })
      component.userProfileData = { personalDetails: { postalAddress: 'Delhi, India' } } as any
      expect(component.getOptions({ options: 'professionalOptions' })).toEqual(component.OthersList)
    })

    it('should return the overseas list for an Others profession abroad', () => {
      component.personalDetailForm.patchValue({ profession: 'Others' })
      component.userProfileData = { personalDetails: { postalAddress: 'London, UK' } } as any
      expect(component.getOptions({ options: 'professionalOptions' }))
        .toEqual(['Mother/ Family Members', 'Other'])
    })

    it('should return an empty array for an unknown named option', () => {
      expect(component.getOptions({ options: 'notARealList' })).toEqual([])
    })
  })

  describe('handleChange', () => {
    it('should call professionSelect for designation field', () => {
      const spy = jest.spyOn(component, 'professionSelect')
      component.handleChange({ value: 'Others' }, { key: 'designation' })
      expect(spy).toHaveBeenCalledWith('Others')
    })

    it('should call orgTypeSelect for orgType field', () => {
      const spy = jest.spyOn(component, 'orgTypeSelect')
      component.handleChange({ value: 'NGO' }, { key: 'orgType' })
      expect(spy).toHaveBeenCalledWith('NGO')
    })

    it('should call chooseBackground for selectBackground field', () => {
      const spy = jest.spyOn(component, 'chooseBackground')
      component.personalDetailForm.patchValue({ profession: 'Others' })
      component.userProfileData = {
        personalDetails: { postalAddress: 'India, UP, Dist' },
        professionalDetails: [{ locationselect: 'Dist' }],
      } as any
      mockHttpClient.get.mockReturnValue(of({ states: [] }))
      component.handleChange({ value: 'Asha Facilitator' }, { key: 'selectBackground' })
      expect(spy).toHaveBeenCalledWith('Asha Facilitator')
    })
  })

  describe('onLocationSelectChange', () => {
    it('should not update when postalAddress is absent', () => {
      component.userProfileData = { personalDetails: {} } as any
      expect(() => component.onLocationSelectChange('NewDist')).not.toThrow()
    })

    it('should update postalAddress with new district', () => {
      component.userProfileData = { personalDetails: { postalAddress: 'India, UP, OldDist' } } as any
      component.onLocationSelectChange('NewDist')
      expect(component.userProfileData.personalDetails.postalAddress).toBe('India,UP,NewDist')
    })

    it('should not update when country is not India', () => {
      component.userProfileData = { personalDetails: { postalAddress: 'USA, NY, NYC' } } as any
      component.onLocationSelectChange('NewDist')
      expect(component.userProfileData.personalDetails.postalAddress).toBe('USA, NY, NYC')
    })
  })

  describe('chooseBackground', () => {
    beforeEach(() => {
      component.userProfileData = {
        personalDetails: { postalAddress: 'India, UP, Dist' },
        professionalDetails: [{ locationselect: null }],
      } as any
      mockHttpClient.get.mockReturnValue(of({ states: [{ state: 'UP', districts: ['Dist'] }] }))
    })

    it('should set enableSubmit false for Mother/Family Members', () => {
      component.chooseBackground('Mother/Family Members')
      expect(component.enableSubmit).toBe(false)
    })

    it('should set enableSubmit true for Asha Facilitator', () => {
      component.chooseBackground('Asha Facilitator')
      expect(component.enableSubmit).toBe(true)
    })

    it('should set designation null for Other', () => {
      component.chooseBackground('Other')
      expect(component.personalDetailForm.get('designation')?.value).toBeNull()
    })
  })

  describe('professionalChange', () => {
    const baseProfileData: any = {
      userId: 'u-1', id: 'u-1',
      personalDetails: {
        firstname: 'F', middlename: '', surname: 'L', about: '', dob: '',
        nationality: '', domicileMedium: '', regNurseRegMidwifeNumber: '',
        nationalUniqueId: '', doctorRegNumber: '', instituteName: '',
        nursingCouncil: '', gender: '', maritalStatus: '', category: '',
        knownLanguages: [], countryCode: '', mobile: '', telephone: '',
        primaryEmail: 'f@t.com', secondaryEmail: '', postalAddress: 'India,UP,Dist',
        pincode: '', osName: '', browserName: '', userCookie: '',
        primaryEmailType: 'personal', service: '', cadre: '', allotmentYear: '',
        otherDetailsDoj: '', payType: '', civilListNo: '', employeeCode: '',
        otherDetailsOfficeAddress: '', otherDetailsOfficePinCode: '',
        skillAquiredDesc: '', certificationDesc: '', interests: [], hobbies: [],
      },
      academics: [],
      professionalDetails: [{
        profession: 'Healthcare Worker', designation: 'GNM', locationselect: 'Dist',
        selectBackground: null, osid: 'os-1', block: '', subcentre: '',
        professionOtherSpecify: '', qualification: '', instituteName: '', nameOther: '',
      }],
    }

    beforeEach(() => {
      component.userProfileData = { ...baseProfileData, personalDetails: { ...baseProfileData.personalDetails } } as any
    })

    it('should clear validators and set Healthcare Worker validators', () => {
      component.professionalChange('Healthcare Worker')
      expect(component.personalDetailForm.controls.orgType.validator).toBeTruthy()
      expect(component.personalDetailForm.controls.designation.validator).toBeTruthy()
    })

    it('should set Student designation validator', () => {
      component.professionalChange('Student')
      expect(component.personalDetailForm.controls.designation.validator).toBeTruthy()
    })

    it('should handle Others case without selectBackground', () => {
      component.userProfileData.professionalDetails[0].selectBackground = null
      component.userProfileData.personalDetails.regNurseRegMidwifeNumber = ''
      component.professionalChange('Others')
      expect(component.personalDetailForm.get('selectBackground')?.value).toBeNull()
    })

    it('should handle ASHA case and invoke loadDistrictsByState onDone callback', () => {
      mockHttpClient.get.mockReturnValue(of({ states: [{ state: 'UP', districts: ['Dist'] }] }))
      component.professionalChange('ASHA')
      expect(component.personalDetailForm.get('locationselect')?.value).toBe('Dist')
    })

    it('should handle default case and clear orgType', () => {
      component.professionalChange('Unknown')
      expect(component.personalDetailForm.get('orgType')?.value).toBeNull()
    })
  })

  describe('onSubmit', () => {
    const minimalProfile: any = {
      userId: 'u-1', id: 'u-1',
      personalDetails: {
        firstname: 'F', middlename: '', surname: 'L', about: '', dob: '',
        nationality: '', domicileMedium: '', regNurseRegMidwifeNumber: '',
        nationalUniqueId: '', doctorRegNumber: '', instituteName: '',
        nursingCouncil: '', gender: '', maritalStatus: '', category: '',
        knownLanguages: [], countryCode: '', mobile: '', telephone: '',
        primaryEmail: 'f@t.com', secondaryEmail: '', postalAddress: '',
        pincode: '', osName: '', browserName: '', userCookie: '',
        primaryEmailType: 'personal', service: '', cadre: '', allotmentYear: '',
        otherDetailsDoj: '', payType: '', civilListNo: '', employeeCode: '',
        otherDetailsOfficeAddress: '', otherDetailsOfficePinCode: '',
        skillAquiredDesc: '', certificationDesc: '', interests: [], hobbies: [],
      },
      academics: [],
      professionalDetails: [{
        osid: 'os-1', block: '', subcentre: '', professionOtherSpecify: '',
        qualification: '', instituteName: '', locationselect: '', selectBackground: null, nameOther: '',
      }],
    }

    beforeEach(() => {
      component.userProfileData = { ...minimalProfile, personalDetails: { ...minimalProfile.personalDetails } } as any
      mockConfigService.userProfile = { userId: 'u-1' }
      mockConfigService.unMappedUser = { profileDetails: { preferences: { language: 'en' }, userSource: null } }
      mockUserProfileService.updateProfileDetails = jest.fn().mockReturnValue(of({ success: true }))
      component['UserAgentResolverService'] = {
        getUserAgent: jest.fn().mockReturnValue({ OS: 'Mac', browserName: 'Chrome' }),
        generateCookie: jest.fn().mockReturnValue('cookie-xyz'),
      }
      component['contentSvc'] = { changeWork: jest.fn() } as any
    })

    it('should call updateProfileDetails and openSnackbar on success', () => {
      component.onSubmit(component.personalDetailForm)
      expect(mockUserProfileService.updateProfileDetails).toHaveBeenCalled()
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should emit profession via passProfession', () => {
      const spy = jest.spyOn(component.passProfession, 'emit')
      component.personalDetailForm.patchValue({ profession: 'ASHA' })
      component.onSubmit(component.personalDetailForm)
      expect(spy).toHaveBeenCalledWith('ASHA')
    })

    it('should rebuild postalAddress from locationselect when address includes India', () => {
      component.userProfileData.personalDetails.postalAddress = 'India,UP,OldDist'
      component.personalDetailForm.patchValue({ locationselect: 'NewDist' })
      component.onSubmit(component.personalDetailForm)
      const call = mockUserProfileService.updateProfileDetails.mock.calls[0][0]
      expect(call.request.profileDetails.profileReq.personalDetails.postalAddress).toBe('India,UP,NewDist')
    })

    it('should fall back to languageSvc language when preference is undefined', () => {
      mockConfigService.unMappedUser = { profileDetails: { preferences: {}, userSource: 'src' } }
      component['languageSvc'] = { getCurrentLanguage: jest.fn().mockReturnValue('hi') } as any
      component.onSubmit(component.personalDetailForm)
      const call = mockUserProfileService.updateProfileDetails.mock.calls[0][0]
      expect(call.request.profileDetails.preferences.language).toBe('hi')
    })
  })

  describe('openSnackbar', () => {
    it('should call snackBar.open with message', () => {
      component.openSnackbar('Test message')
      expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', expect.any(Object))
    })
  })

  describe('getUserDetails additional branches', () => {
    it('should enable form and patch Healthcare Worker with ANM designation for non-India address', () => {
      const profileData = {
        profileDetails: {
          profileReq: {
            professionalDetails: [{ profession: 'Healthcare Worker', name: 'PHC', designation: 'ANM' }],
            personalDetails: { regNurseRegMidwifeNumber: 'RN-1', postalAddress: 'USA, NY, City' },
          },
        },
      }
      component.data = { isEditable: true }
      mockConfigService.userProfile = { userId: 'u1' }
      mockConfigService.unMappedUser = { id: 'um-1' }
      mockUserProfileService.getUserdetailsFromRegistry = jest.fn().mockReturnValue(of(profileData))
      const enableSpy = jest.spyOn(component.personalDetailForm, 'enable')
      component['getUserDetails']()
      expect(enableSpy).toHaveBeenCalled()
      expect(component.personalDetailForm.get('designation')?.value).toBe('ANM/MPW')
      expect(component.professions).not.toContain('ASHA')
    })

    it('should match saved district for ASHA when locationselect present', () => {
      const profileData = {
        profileDetails: {
          profileReq: {
            professionalDetails: [{ profession: 'ASHA', name: 'PHC', designation: 'ASHA', locationselect: 'Dist', block: 'B1' }],
            personalDetails: { regNurseRegMidwifeNumber: '', postalAddress: 'India, UP, Dist' },
          },
        },
      }
      mockConfigService.userProfile = { userId: 'u1' }
      mockConfigService.unMappedUser = { id: 'um-1' }
      mockUserProfileService.getUserdetailsFromRegistry = jest.fn().mockReturnValue(of(profileData))
      mockHttpClient.get.mockReturnValue(of({ states: [{ state: 'UP', districts: ['Dist', 'Dist2'] }] }))
      component['getUserDetails']()
      expect(component.disticts).toEqual(['Dist', 'Dist2'])
      expect(component.personalDetailForm.get('locationselect')?.value).toBe('Dist')
    })

    it('should disable form when data not editable', () => {
      const profileData = {
        profileDetails: { profileReq: { professionalDetails: null, personalDetails: {} } },
      }
      component.data = { isEditable: false }
      mockConfigService.userProfile = { userId: 'u1' }
      mockConfigService.unMappedUser = { id: 'um-1' }
      mockUserProfileService.getUserdetailsFromRegistry = jest.fn().mockReturnValue(of(profileData))
      const disableSpy = jest.spyOn(component.personalDetailForm, 'disable')
      component['getUserDetails']()
      expect(disableSpy).toHaveBeenCalled()
    })
  })

  describe('shouldShowField additional branches', () => {
    it('should skip selectBackground key when profession is not Others', () => {
      component.personalDetailForm.patchValue({ profession: 'ASHA' })
      expect(component.shouldShowField({ showIf: { profession: ['ASHA'], selectBackground: 'x' } })).toBe(true)
    })

    it('should match array expected values for non-profession key', () => {
      component.personalDetailForm.patchValue({ profession: 'ASHA', designation: 'Nurse' })
      expect(component.shouldShowField({ showIf: { profession: ['ASHA'], designation: ['Nurse'] } })).toBe(true)
    })

    it('should match scalar profession when not an array', () => {
      component.personalDetailForm.patchValue({ profession: 'ASHA' })
      expect(component.shouldShowField({ showIf: { profession: 'ASHA' } })).toBe(true)
    })
  })

  describe('getOptions Others branches', () => {
    it('should return OthersList when postalAddress includes India', () => {
      component.userProfileData = { personalDetails: { postalAddress: 'India, UP, Dist' } } as any
      component.personalDetailForm.patchValue({ profession: 'Others' })
      expect(component.getOptions({ options: 'professionalOptions' })).toEqual(component.OthersList)
    })

    it('should return limited list when postalAddress is not India', () => {
      component.userProfileData = { personalDetails: { postalAddress: 'USA, NY, City' } } as any
      component.personalDetailForm.patchValue({ profession: 'Others' })
      expect(component.getOptions({ options: 'professionalOptions' })).toEqual(['Mother/ Family Members', 'Other'])
    })
  })

  describe('handleChange locationselect', () => {
    it('should call onLocationSelectChange for locationselect field', () => {
      const spy = jest.spyOn(component, 'onLocationSelectChange')
      component.userProfileData = { personalDetails: { postalAddress: 'India, UP, Dist' } } as any
      component.handleChange({ value: 'NewDist' }, { key: 'locationselect' })
      expect(spy).toHaveBeenCalledWith('NewDist')
    })
  })

  describe('constructReq official email branch', () => {
    it('should set officialEmail when primaryEmailType is OFFICIAL', () => {
      component.userProfileData = {
        userId: 'u-1', id: 'u-1', academics: [],
        personalDetails: { primaryEmail: 'off@t.com', secondaryEmail: 's@t.com', primaryEmailType: component.ePrimaryEmailType.OFFICIAL },
        professionalDetails: [{}],
      } as any
      component['UserAgentResolverService'] = {
        getUserAgent: jest.fn().mockReturnValue({ OS: 'Mac', browserName: 'Chrome' }),
        generateCookie: jest.fn().mockReturnValue('c'),
      } as any
      const req = component.constructReq(component.personalDetailForm)
      expect(req.profileReq.personalDetails.officialEmail).toBe('off@t.com')
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe mobileSubscription', () => {
      component.ngOnInit()
      const spy = jest.spyOn(component['mobileSubscription'] as any, 'unsubscribe')
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalled()
    })
  })
})
