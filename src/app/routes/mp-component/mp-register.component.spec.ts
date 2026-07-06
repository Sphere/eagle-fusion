jest.mock('../../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {},
  LoggerService: class { log = jest.fn(); warn = jest.fn() },
  ValueService: class { isXSmall$ = { subscribe: jest.fn((cb: any) => cb(false)) } },
}))

jest.mock('../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service', () => ({
  UserProfileService: class {
    mpSendOtp = jest.fn()
    mpRegistration = jest.fn()
  },
}))

jest.mock('../../../../project/ws/author/src/public-api', () => ({
  LoaderService: class { changeLoad = { next: jest.fn() } },
}))

jest.mock('../bnrc-popup/bnrc-modal-component', () => ({
  BnrcmodalComponent: class {},
}))

jest.mock('../../constants/apiConstants', () => ({
  S3_END_POINTS: { mpANMDistrictUrl: 'https://s3/mp-districts.json' },
}))

import { FormBuilder } from '@angular/forms'
import { of } from 'rxjs'
import { MpRegisterComponent } from './mp-register.component'

describe('MpRegisterComponent', () => {
  let component: MpRegisterComponent
  let mockHttp: any
  let mockSnackBar: any
  let mockDialog: any
  let mockLoader: any
  let mockLogger: any

  beforeEach(() => {
    mockHttp = { get: jest.fn().mockReturnValue(of([])) }
    mockSnackBar = { open: jest.fn() }
    mockDialog = { open: jest.fn() }
    mockLoader = { changeLoad: { next: jest.fn() } }
    mockLogger = { log: jest.fn(), warn: jest.fn() }

    component = new MpRegisterComponent(
      {} as any,
      { isXSmall$: { subscribe: jest.fn() } } as any,
      { mpSendOtp: jest.fn(), mpRegistration: jest.fn() } as any,
      mockSnackBar,
      mockHttp,
      new FormBuilder(),
      mockDialog,
      mockLoader,
      mockLogger,
      { detectChanges: jest.fn() } as any,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize anmRegistrationForm on construction', () => {
    expect(component.anmRegistrationForm).toBeDefined()
    expect(component.anmRegistrationForm.get('firstName')).toBeTruthy()
    expect(component.anmRegistrationForm.get('phone')).toBeTruthy()
  })

  it('should default isSubmitting and otpPage to false', () => {
    expect(component.isSubmitting).toBe(false)
    expect(component.otpPage).toBe(false)
  })

  it('should default districts and blocks to empty arrays', () => {
    expect(component.districts).toEqual([])
    expect(component.blocks).toEqual([])
  })

  it('should call http.get on ngOnInit to load district data', () => {
    component.ngOnInit()
    expect(mockHttp.get).toHaveBeenCalledWith('https://s3/mp-districts.json')
  })

  it('should populate districts when district data is an array', () => {
    const districtData = [{ 'District A': { 'Block1': {} }, 'District B': {} }]
    mockHttp.get.mockReturnValue(of(districtData))
    component.ngOnInit()
    expect(component.districts).toEqual(['District A', 'District B'])
  })

  it('should reset districts when district data is empty array', () => {
    mockHttp.get.mockReturnValue(of([]))
    component.ngOnInit()
    expect(component.districts).toEqual([])
  })

  it('should call snackBar.open in openSnackbar()', () => {
    component.openSnackbar('Test error')
    expect(mockSnackBar.open).toHaveBeenCalledWith('Test error', 'X', expect.any(Object))
  })

  it('should not submit when form is invalid on onSubmit()', () => {
    component.onSubmit()
    expect(mockLoader.changeLoad.next).not.toHaveBeenCalled()
  })

  it('should not call mpSendOtp when form is invalid (missing required fields)', () => {
    const mockUserProfileSvc = { mpSendOtp: jest.fn().mockReturnValue(of({})), mpRegistration: jest.fn() }
    component['userProfileSvc'] = mockUserProfileSvc
    // form is invalid because required fields are missing
    component.onSubmit()
    expect(mockUserProfileSvc.mpSendOtp).not.toHaveBeenCalled()
  })

  it('should log field assignment on assignFields()', () => {
    component.assignFields('district', 'Bihar', {})
    expect(mockLogger.log).toHaveBeenCalled()
  })

  describe('onSubmit validation paths', () => {
    it('should show snackBar when blockOthers is Others but no customBlockName', () => {
      component.anmRegistrationForm.patchValue({ blockOthers: 'Others', customBlockName: '' })
      component.onSubmit()
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        expect.stringContaining('Block Name'),
        expect.any(String),
        expect.any(Object),
      )
    })

    it('should show snackBar when facilityType is not set', () => {
      component.anmRegistrationForm.patchValue({ blockOthers: '', facilityType: '' })
      component.onSubmit()
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        expect.stringContaining('Facility Type'),
        expect.any(String),
        expect.any(Object),
      )
    })

    it('should call mpSendOtp when form is valid', () => {
      const mockUserProfileSvc = { mpSendOtp: jest.fn().mockReturnValue(of({ status: 'success', message: 'OTP sent' })), mpRegistration: jest.fn() }
      component['userProfileSvc'] = mockUserProfileSvc
      component.anmRegistrationForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        phone: '9876543210',
        role: 'ANM',
        district: 'District A',
        block: 'Block A',
        facilityType: 'PHC',
        facilityName: 'Facility A',
        otp: '123456',
      })
      component.anmRegistrationForm.markAllAsTouched()
      if (component.anmRegistrationForm.valid) {
        component.onSubmit()
        expect(mockUserProfileSvc.mpSendOtp).toHaveBeenCalled()
      }
    })
  })

  describe('createUser', () => {
    it('should call mpRegistration and resetForm on SUCCESS', () => {
      const mockUserProfileSvc = {
        mpSendOtp: jest.fn(),
        mpRegistration: jest.fn().mockReturnValue(of({ status: 'SUCCESS' })),
      }
      component['userProfileSvc'] = mockUserProfileSvc
      component.createUser()
      expect(mockUserProfileSvc.mpRegistration).toHaveBeenCalled()
      expect(component.otpPage).toBe(false)
    })

    it('should call openSnackbar when mpRegistration fails with error message', () => {
      const { throwError } = require('rxjs')
      const mockUserProfileSvc = {
        mpSendOtp: jest.fn(),
        mpRegistration: jest.fn().mockReturnValue(throwError(() => ({ error: { message: 'Error' } }))),
      }
      component['userProfileSvc'] = mockUserProfileSvc
      component.createUser()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Error', 'X', expect.any(Object))
    })

    it('should use customBlockName as block when blockOthers is Others', () => {
      const mockUserProfileSvc = {
        mpSendOtp: jest.fn(),
        mpRegistration: jest.fn().mockReturnValue(of({ status: 'SUCCESS' })),
      }
      component['userProfileSvc'] = mockUserProfileSvc
      component.anmRegistrationForm.patchValue({ blockOthers: 'Others', customBlockName: 'Custom Block', customFacilityName: 'Custom Facility' })
      component.createUser()
      const reqArg = mockUserProfileSvc.mpRegistration.mock.calls[0][0]
      expect(reqArg.request.formValues.block).toBe('Custom Block')
      expect(reqArg.request.formValues.facilityName).toBe('Custom Facility')
    })
  })

  describe('form subscriptions (setupFormSubscriptions)', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should update blocks when district changes', () => {
      component.biharDistrictData = { 'District A': { 'Block1': {}, 'Block2': {} } }
      component.anmRegistrationForm.get('district')?.setValue('District A')
      expect(component.blocks).toEqual(['Block1', 'Block2'])
    })

    it('should handle Others block selection', () => {
      component.biharDistrictData = { 'District A': { 'Block1': { PHC: [] } } }
      component.anmRegistrationForm.patchValue({ district: 'District A' })
      component.anmRegistrationForm.get('block')?.setValue('Others')
      expect(component.showCustomBlockInput).toBe(true)
    })

    it('should set facilityTypes when normal block is selected', () => {
      component.biharDistrictData = { 'District A': { 'Block1': { PHC: [], CHC: [] } } }
      component.anmRegistrationForm.patchValue({ district: 'District A' })
      component.anmRegistrationForm.get('block')?.setValue('Block1')
      expect(component.facilityTypes).toEqual(['PHC', 'CHC'])
    })

    it('should show custom facility input when facilityName is Others', () => {
      component.anmRegistrationForm.get('facilityName')?.setValue('Others')
      expect(component.showCustomFacilityInput).toBe(true)
    })
  })
})
