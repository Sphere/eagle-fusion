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

  describe('ngOnDestroy', () => {
    it('should unsubscribe mobileSubscription', () => {
      const spy = jest.spyOn(component['mobileSubscription'] as any, 'unsubscribe')
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalled()
    })
  })
})
