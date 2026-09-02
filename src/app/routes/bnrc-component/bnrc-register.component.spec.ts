jest.mock('../../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {},
  LoggerService: class { log = jest.fn(); error = jest.fn() },
  ValueService: class { isXSmall$ = { subscribe: jest.fn((cb: any) => cb(false)) } },
}))

jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class {},
}))

jest.mock('../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service', () => ({
  UserProfileService: class {
    bnrcSendOtp = jest.fn()
    bnrcRegistration = jest.fn()
  },
}))

jest.mock('../../../../project/ws/author/src/public-api', () => ({
  LoaderService: class { changeLoad = { next: jest.fn() } },
}))

jest.mock('../bnrc-popup/bnrc-modal-component', () => ({
  BnrcmodalComponent: class {},
}))

jest.mock('src/app/services/user-agent.service', () => ({
  UserAgentResolverService: class {
    getUserAgent = jest.fn().mockReturnValue({})
    generateCookie = jest.fn().mockReturnValue('cookie')
  },
}))

jest.mock('../../constants/apiConstants', () => ({
  S3_END_POINTS: { biharDistrictUrl: 'https://s3/districts.json', instituteNameUrl: 'https://s3/institutes.json' },
}))

jest.mock('../../../../project/ws/app/src/lib/routes/user-profile/models/NsUserProfile', () => ({
  NsUserProfileDetails: { EPrimaryEmailType: {} },
}))

import { UntypedFormBuilder } from '@angular/forms'
import { of } from 'rxjs'
import { BehaviorSubject } from 'rxjs'
import { BnrcRegisterComponent } from './bnrc-register.component'

describe('BnrcRegisterComponent', () => {
  let component: BnrcRegisterComponent
  let mockUserProfileSvc: any
  let mockHttp: any
  let mockDialog: any
  let mockSnackBar: any
  let mockLoader: any
  let mockLogger: any
  let mockRoute: any

  beforeEach(() => {
    mockUserProfileSvc = { bnrcSendOtp: jest.fn(), bnrcRegistration: jest.fn() }
    mockHttp = { get: jest.fn().mockReturnValue(of([])) }
    mockDialog = { open: jest.fn() }
    mockSnackBar = { open: jest.fn() }
    mockLoader = { changeLoad: { next: jest.fn() } }
    mockLogger = { log: jest.fn(), error: jest.fn() }
    mockRoute = { queryParams: new BehaviorSubject({}) }

    component = new BnrcRegisterComponent(
      {} as any,
      mockUserProfileSvc,
      { isXSmall$: { subscribe: jest.fn() } } as any,
      {} as any,
      {} as any,
      mockSnackBar,
      mockHttp,
      new UntypedFormBuilder(),
      mockDialog,
      mockLoader,
      mockRoute as any,
      mockLogger,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize bnrcDetailForm on construction', () => {
    expect(component.bnrcDetailForm).toBeDefined()
    expect(component.bnrcDetailForm.get('firstName')).toBeTruthy()
    expect(component.bnrcDetailForm.get('phone')).toBeTruthy()
  })

  it('should default flags to false', () => {
    expect(component.Student).toBe(false)
    expect(component.Faculty).toBe(false)
    expect(component.inService).toBe(false)
    expect(component.publicHealthFacility).toBe(false)
    expect(component.cho).toBe(false)
  })

  describe('professionalChange', () => {
    it('should set Student=true and others false for "Student"', () => {
      component.professionalChange('Student')
      expect(component.Student).toBe(true)
      expect(component.Faculty).toBe(false)
      expect(component.inService).toBe(false)
    })

    it('should set Faculty=true and others false for "Faculty"', () => {
      component.professionalChange('Faculty')
      expect(component.Faculty).toBe(true)
      expect(component.Student).toBe(false)
      expect(component.inService).toBe(false)
    })

    it('should set inService=true for "In Service"', () => {
      component.professionalChange('In Service')
      expect(component.inService).toBe(true)
      expect(component.Student).toBe(false)
      expect(component.Faculty).toBe(false)
    })

    it('should set publicHealthFacility=true for "Public Health Facility"', () => {
      component.professionalChange('Public Health Facility')
      expect(component.publicHealthFacility).toBe(true)
      expect(component.privateHealthFacility).toBe(false)
    })

    it('should set privateHealthFacility=true for "Private Health Facility"', () => {
      component.professionalChange('Private Health Facility')
      expect(component.privateHealthFacility).toBe(true)
      expect(component.publicHealthFacility).toBe(false)
    })

    it('should set cho=true for "CHO"', () => {
      component.professionalChange('CHO')
      expect(component.cho).toBe(true)
      expect(component.Student).toBe(false)
    })

    it('should reset all flags for unknown value', () => {
      component.Student = true
      component.professionalChange('Unknown')
      expect(component.Student).toBe(false)
      expect(component.Faculty).toBe(false)
      expect(component.inService).toBe(false)
    })
  })

  describe('serviceTypeChange', () => {
    it('should set hrmsErr=true and bnrcErr=false for "Regular"', () => {
      component.serviceTypeChange('Regular')
      expect(component.hrmsErr).toBe(true)
      expect(component.bnrcErr).toBe(false)
    })

    it('should set hrmsErr=false and bnrcErr=true for other values', () => {
      component.serviceTypeChange('Contractual')
      expect(component.hrmsErr).toBe(false)
      expect(component.bnrcErr).toBe(true)
    })
  })

  describe('resetForm', () => {
    it('should reset all profession flags', () => {
      component.Student = true
      component.Faculty = true
      component.resetForm()
      expect(component.Student).toBe(false)
      expect(component.Faculty).toBe(false)
    })

    it('should create a new form group after reset', () => {
      const oldForm = component.bnrcDetailForm
      component.resetForm()
      expect(component.bnrcDetailForm).not.toBe(oldForm)
    })
  })

  describe('openSnackbar', () => {
    it('should call snackBar.open with message and "X"', () => {
      component.openSnackbar('Test message')
      expect(mockSnackBar.open).toHaveBeenCalledWith('Test message', 'X', expect.any(Object))
    })
  })

  describe('assignFields', () => {
    it('should log fieldName, value and event', () => {
      component.assignFields('district', 'Bihar', {})
      expect(mockLogger.log).toHaveBeenCalled()
    })
  })

  describe('ngOnInit', () => {
    it('should call http.get twice for district and institute data', () => {
      mockHttp.get.mockReturnValue(of([]))
      component.ngOnInit()
      expect(mockHttp.get).toHaveBeenCalledWith('https://s3/districts.json')
      expect(mockHttp.get).toHaveBeenCalledWith('https://s3/institutes.json')
    })

    it('should populate districts when district data is non-empty array', () => {
      mockHttp.get.mockReturnValue(of([{ Patna: { Block1: [], Block2: [] } }]))
      component.ngOnInit()
      expect(component.districts).toEqual(['Patna'])
    })

    it('should handle queryParams service=Student', () => {
      mockRoute.queryParams = new BehaviorSubject({ service: 'Student' })
      mockHttp.get.mockReturnValue(of([]))
      component['route'] = mockRoute as any
      component.ngOnInit()
      expect(component.Student).toBe(true)
    })

    it('should handle queryParams service=Faculty', () => {
      mockRoute.queryParams = new BehaviorSubject({ service: 'Faculty' })
      mockHttp.get.mockReturnValue(of([]))
      component['route'] = mockRoute as any
      component.ngOnInit()
      expect(component.Faculty).toBe(true)
    })

    it('should handle queryParams service=CHO', () => {
      mockRoute.queryParams = new BehaviorSubject({ service: 'CHO' })
      mockHttp.get.mockReturnValue(of([]))
      component['route'] = mockRoute as any
      component.ngOnInit()
      expect(component.isCHO).toBe(true)
    })

    it('should handle queryParams service=inservice', () => {
      mockRoute.queryParams = new BehaviorSubject({ service: 'inservice' })
      mockHttp.get.mockReturnValue(of([]))
      component['route'] = mockRoute as any
      component.ngOnInit()
      expect(component.isInservice).toBe(true)
    })
  })

  describe('onDistrictChange', () => {
    it('should set blocks from registrationData when district is selected', () => {
      component.registrationData = { Patna: { Block1: [], Block2: [] } }
      component.selectedDistrict = 'Patna'
      component.onDistrictChange()
      expect(component.blocks).toEqual(['Block1', 'Block2'])
    })

    it('should clear blocks when no district selected', () => {
      component.selectedDistrict = ''
      component.onDistrictChange()
      expect(component.blocks).toEqual([])
    })
  })

  describe('onBlockChange', () => {
    it('should set aamShcList from registrationData', () => {
      component.registrationData = { Patna: { Block1: [{ name: 'SHC1', nin: 1 }] } }
      component.selectedDistrict = 'Patna'
      component.selectedBlock = 'Block1'
      component.onBlockChange()
      expect(component.aamShcList).toEqual([{ name: 'SHC1', nin: 1 }])
    })

    it('should set empty aamShcList when block not found', () => {
      component.registrationData = {}
      component.selectedDistrict = 'Missing'
      component.selectedBlock = 'Block'
      component.onBlockChange()
      expect(component.aamShcList).toEqual([])
    })
  })

  describe('ngOnInit — valueChanges subscriptions', () => {
    beforeEach(() => {
      mockHttp.get.mockReturnValue(of([]))
      component.ngOnInit()
    })

    it('should update currentDistrictInstitutes when district changes to non-empty', () => {
      component.institutesData = { Patna: ['Institute1', 'Institute2'] }
      component.biharDistrictData = { Patna: { Block1: [], Block2: [] } }
      component.bnrcDetailForm.get('district')?.setValue('Patna')
      expect(component.currentDistrictInstitutes).toHaveLength(2)
    })

    it('should clear currentDistrictInstitutes when district changes to empty', () => {
      component.bnrcDetailForm.get('district')?.setValue('')
      expect(component.currentDistrictInstitutes).toEqual([])
    })

    it('should update aamShcs when block changes with both district and block set', () => {
      component.biharDistrictData = { Patna: { Block1: [{ name: 'SHC1', nin: 1 }] } }
      component.bnrcDetailForm.get('district')?.setValue('Patna')
      component.bnrcDetailForm.get('block')?.setValue('Block1')
      expect(component.aamShcs).toEqual([{ name: 'SHC1', nin: 1 }])
    })

    it('should clear aamShcs when block changes without district', () => {
      component.bnrcDetailForm.get('block')?.setValue('Block1')
      expect(component.aamShcs).toEqual([])
    })

    it('should set nin when facilityName changes with nin', () => {
      component.bnrcDetailForm.get('facilityName')?.setValue({ name: 'SHC1', nin: 42 })
      expect(component.bnrcDetailForm.get('nin')?.value).toBe(42)
    })
  })

  describe('ngOnInit — GNM-Bihar and isXSmall paths', () => {
    it('should set inServiceGNM=true for service=GNM-Bihar', () => {
      mockRoute.queryParams = new BehaviorSubject({ service: 'GNM-Bihar' })
      mockHttp.get.mockReturnValue(of([]))
      component['route'] = mockRoute as any
      component.ngOnInit()
      expect(component.inServiceGNM).toBe(true)
    })

    it('should set showbackButton=true when isXSmall is true', () => {
      const { isXSmall$ } = require('rxjs')
      component['valueSvc'] = { isXSmall$: { subscribe: jest.fn((cb: any) => cb(true)) } } as any
      mockHttp.get.mockReturnValue(of([]))
      component.ngOnInit()
      expect(component.showbackButton).toBe(true)
    })
  })

  describe('ngOnInit — institute data subscribe', () => {
    it('should set institutesData from http response', () => {
      const mockInstituteData = { Patna: ['Institute A'] }
      mockHttp.get.mockImplementation((url: string) => {
        if (url.includes('institutes')) return of(mockInstituteData)
        return of([])
      })
      component.ngOnInit()
      expect(component.institutesData).toEqual(mockInstituteData)
    })
  })

  describe('checkInstitute', () => {
    it('should do nothing when instituteName is empty', () => {
      component.bnrcDetailForm.get('instituteName')?.setValue('')
      expect(() => component.checkInstitute()).not.toThrow()
    })

    it('should clear and set error when institute not in list', () => {
      component.institutes = [{ name: 'ValidInstitute' }]
      component.bnrcDetailForm.get('instituteName')?.setValue('InvalidInstitute')
      component.checkInstitute()
      expect(component.bnrcDetailForm.get('instituteName')?.value).toBeNull()
    })

    it('should not clear when institute is in list', () => {
      component.institutes = [{ name: 'ValidInstitute' }]
      component.bnrcDetailForm.get('instituteName')?.setValue('ValidInstitute')
      component.checkInstitute()
      expect(component.bnrcDetailForm.get('instituteName')?.value).toBe('ValidInstitute')
    })
  })

  describe('onSubmit', () => {
    it('should call bnrcSendOtp when form is valid and phone is set', () => {
      mockUserProfileSvc.bnrcSendOtp = jest.fn().mockReturnValue(of({ status: 'success', message: 'OTP sent' }))
      component.bnrcDetailForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        phone: '9876543210',
        role: 'Student',
        district: 'Patna',
      })
      jest.spyOn(component, 'checkInstitute').mockImplementation(() => {})
      component.onSubmit()
      expect(mockUserProfileSvc.bnrcSendOtp).toHaveBeenCalled()
    })

    it('should set isSubmitting=true and otpPage=true when form is valid', () => {
      mockUserProfileSvc.bnrcSendOtp = jest.fn().mockReturnValue(of({ status: 'success', message: 'OTP sent' }))
      component.bnrcDetailForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        phone: '9876543210',
        role: 'Student',
        district: 'Patna',
      })
      jest.spyOn(component, 'checkInstitute').mockImplementation(() => {})
      component.onSubmit()
      expect(component.otpPage).toBe(true)
    })

    it('should not call bnrcSendOtp when form is invalid', () => {
      component.bnrcDetailForm.reset()
      jest.spyOn(component, 'checkInstitute').mockImplementation(() => {})
      component.onSubmit()
      expect(mockUserProfileSvc.bnrcSendOtp).not.toHaveBeenCalled()
    })
  })

  describe('createUser', () => {
    it('should call bnrcRegistration and open dialog on success', () => {
      mockUserProfileSvc.bnrcRegistration = jest.fn().mockReturnValue(of({ status: 'SUCCESS', message: 'Done' }))
      component.bnrcDetailForm.patchValue({
        firstName: 'Test', lastName: 'User', phone: '9876543210',
        role: 'Student', district: 'Patna',
      })
      component.createUser({})
      expect(mockUserProfileSvc.bnrcRegistration).toHaveBeenCalled()
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should call openSnackbar on non-SUCCESS response', () => {
      mockUserProfileSvc.bnrcRegistration = jest.fn().mockReturnValue(of({ status: 'FAILED', message: 'Error occurred' }))
      component.bnrcDetailForm.patchValue({ phone: '9876543210' })
      const spy = jest.spyOn(component, 'openSnackbar')
      component.createUser({})
      expect(spy).toHaveBeenCalledWith('Error occurred')
    })

    it('should set nin from facilityName when isCHO=true', () => {
      mockUserProfileSvc.bnrcRegistration = jest.fn().mockReturnValue(of({ status: 'SUCCESS', message: 'Done' }))
      component.isCHO = true
      component.bnrcDetailForm.get('facilityName')?.setValue({ name: 'CHO Facility', nin: 12345 })
      component.createUser({})
      expect(mockUserProfileSvc.bnrcRegistration).toHaveBeenCalled()
    })

    it('should call openSnackbar on error', () => {
      const { throwError } = require('rxjs')
      mockUserProfileSvc.bnrcRegistration = jest.fn().mockReturnValue(throwError(() => ({ error: { message: 'Server error' } })))
      const spy = jest.spyOn(component, 'openSnackbar')
      component.createUser({})
      expect(spy).toHaveBeenCalledWith('Server error')
    })
  })

  describe('onSubmit — error and invalid-form branches', () => {
    it('should handle bnrcSendOtp error callback', () => {
      const { throwError } = require('rxjs')
      mockUserProfileSvc.bnrcSendOtp = jest.fn().mockReturnValue(throwError(() => ({ error: { message: 'OTP failed' } })))
      component.bnrcDetailForm.patchValue({
        firstName: 'Test', lastName: 'User', phone: '9876543210', role: 'Student', district: 'Patna',
      })
      jest.spyOn(component, 'checkInstitute').mockImplementation(() => {})
      const spy = jest.spyOn(component, 'openSnackbar')
      component.onSubmit()
      expect(spy).toHaveBeenCalledWith('OTP failed')
      expect(component.isSubmitting).toBe(false)
    })

    it('should list missing required fields when form has required error', () => {
      jest.spyOn(component, 'checkInstitute').mockImplementation(() => {})
      component.bnrcDetailForm.reset()
      component.bnrcDetailForm.setErrors({ required: true })
      const spy = jest.spyOn(component, 'openSnackbar')
      component.onSubmit()
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('The following fields are required:'))
    })

    it('should show generic message when form required error but no control required errors', () => {
      jest.spyOn(component, 'checkInstitute').mockImplementation(() => {})
      component.bnrcDetailForm.patchValue({
        firstName: 'Test', lastName: 'User', phone: '9876543210', role: 'Student', district: 'Patna',
      })
      Object.keys(component.bnrcDetailForm.controls).forEach(name => {
        component.bnrcDetailForm.get(name)?.setErrors(null)
      })
      component.bnrcDetailForm.setErrors({ required: true })
      const spy = jest.spyOn(component, 'openSnackbar')
      component.onSubmit()
      expect(spy).toHaveBeenCalledWith('Some fields are required. Please check the form.')
    })
  })

  describe('ngOnInit — isXSmall false and filteredInstitutes callbacks', () => {
    it('should set showbackButton=false when isXSmall is false', () => {
      component['valueSvc'] = { isXSmall$: { subscribe: jest.fn((cb: any) => cb(false)) } } as any
      mockHttp.get.mockReturnValue(of([]))
      component.ngOnInit()
      expect(component.showbackButton).toBe(false)
      expect(component.showLogOutIcon).toBe(false)
    })

    it('should clear instituteName and set error when no institute matches filter', () => {
      mockHttp.get.mockImplementation((url: string) => {
        if (url.includes('institutes')) return of({ Patna: ['Institute A'] })
        return of([])
      })
      component.ngOnInit()
      component.currentDistrictInstitutes = []
      component.filteredInstitutes.subscribe()
      component.bnrcDetailForm.get('instituteName')?.setValue('NonMatching')
      expect(component.bnrcDetailForm.get('instituteName')?.value).toBeNull()
      expect(component.bnrcDetailForm.get('instituteName')?.errors).toEqual({ invalidInstitute: true })
    })

    it('should clear errors when institutes match filter', () => {
      mockHttp.get.mockImplementation((url: string) => {
        if (url.includes('institutes')) return of({ Patna: ['Institute A'] })
        return of([])
      })
      component.ngOnInit()
      component.currentDistrictInstitutes = [{ name: 'Institute A' }]
      component.filteredInstitutes.subscribe()
      component.bnrcDetailForm.get('instituteName')?.setValue('Institute A')
      expect(component.bnrcDetailForm.get('instituteName')?.errors).toBeNull()
    })

    it('should filter institutes via _filter after district change', () => {
      mockHttp.get.mockReturnValue(of([]))
      component.ngOnInit()
      component.institutesData = { Patna: ['Alpha', 'Beta'] }
      component.biharDistrictData = { Patna: { Block1: [] } }
      component.bnrcDetailForm.get('district')?.setValue('Patna')
      const results: any[] = []
      component.filteredInstitutes.subscribe(v => results.push(v))
      component.bnrcDetailForm.get('instituteName')?.setValue('alp')
      expect(results[results.length - 1]).toEqual([{ name: 'Alpha' }])
    })
  })

  describe('_filter', () => {
    it('should return all institutes when value is empty', () => {
      component.currentDistrictInstitutes = [{ name: 'X' }, { name: 'Y' }]
      expect(component['_filter']('')).toEqual([{ name: 'X' }, { name: 'Y' }])
    })

    it('should filter institutes by value ignoring commas and case', () => {
      component.currentDistrictInstitutes = [{ name: 'Hello,World' }, { name: 'Other' }]
      expect(component['_filter']('helloworld')).toEqual([{ name: 'Hello,World' }])
    })
  })
})
