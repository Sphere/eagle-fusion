jest.mock('../../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {},
  LoggerService: class { log = jest.fn() },
  ValueService: class { isXSmall$ = { subscribe: jest.fn((cb: any) => cb(false)) } },
}))

jest.mock('../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service', () => ({
  UserProfileService: class {
    upsmfSendOtp = jest.fn()
    upsmfRegistration = jest.fn()
  },
}))

jest.mock('../../../../project/ws/author/src/public-api', () => ({
  LoaderService: class { changeLoad = { next: jest.fn() } },
}))

jest.mock('../bnrc-popup/bnrc-modal-component', () => ({
  BnrcmodalComponent: class {},
}))

jest.mock('../../constants/apiConstants', () => ({
  S3_END_POINTS: { UP_DISTRICT_CONFIG: 'https://s3/up-districts.json' },
}))

import { FormBuilder } from '@angular/forms'
import { of, BehaviorSubject } from 'rxjs'
import { UpsmfRegisterComponent } from './upsmf-register.component'

describe('UpsmfRegisterComponent', () => {
  let component: UpsmfRegisterComponent
  let mockHttp: any
  let mockSnackBar: any
  let mockDialog: any
  let mockLoader: any
  let mockLogger: any
  let mockRoute: any
  let queryParamsSubject: BehaviorSubject<any>

  beforeEach(() => {
    queryParamsSubject = new BehaviorSubject({})
    mockHttp = { get: jest.fn().mockReturnValue(of([])) }
    mockSnackBar = { open: jest.fn() }
    mockDialog = { open: jest.fn() }
    mockLoader = { changeLoad: { next: jest.fn() } }
    mockLogger = { log: jest.fn() }
    mockRoute = { queryParams: queryParamsSubject.asObservable() }

    component = new UpsmfRegisterComponent(
      {} as any,
      { isXSmall$: { subscribe: jest.fn() } } as any,
      { upsmfSendOtp: jest.fn(), upsmfRegistration: jest.fn() } as any,
      mockSnackBar,
      mockHttp,
      new FormBuilder(),
      mockDialog,
      mockLoader,
      mockRoute,
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

  it('should initialize all three forms on construction', () => {
    expect(component.anmRegistrationForm).toBeDefined()
    expect(component.preServiceForm).toBeDefined()
    expect(component.medicalOfficerForm).toBeDefined()
  })

  it('should default service type flags to false/inService', () => {
    expect(component.isPreService).toBe(false)
    expect(component.isMedicalOfficerUP).toBe(false)
    expect(component.isStudent).toBe(false)
    expect(component.isFaculty).toBe(false)
  })

  describe('ngOnInit', () => {
    it('should set isInService=true for service=inservice', () => {
      queryParamsSubject.next({ service: 'inservice' })
      component.ngOnInit()
      expect(component.isInService).toBe(true)
      expect(component.isPreService).toBe(false)
    })

    it('should set isPreService=true for service=preservice', () => {
      queryParamsSubject.next({ service: 'preservice' })
      component.ngOnInit()
      expect(component.isPreService).toBe(true)
      expect(component.isInService).toBe(false)
    })

    it('should set isMedicalOfficerUP=true for service=medicalofficerup', () => {
      queryParamsSubject.next({ service: 'medicalofficerup' })
      component.ngOnInit()
      expect(component.isMedicalOfficerUP).toBe(true)
      expect(component.isInService).toBe(false)
    })

    it('should default isInService=true for unknown service', () => {
      queryParamsSubject.next({ service: 'unknown' })
      component.ngOnInit()
      expect(component.isInService).toBe(true)
    })
  })

  describe('onRoleChange', () => {
    it('should set isStudent=true for Student', () => {
      component.onRoleChange('Student')
      expect(component.isStudent).toBe(true)
      expect(component.isFaculty).toBe(false)
    })

    it('should set isFaculty=true for Faculty', () => {
      component.onRoleChange('Faculty')
      expect(component.isFaculty).toBe(true)
      expect(component.isStudent).toBe(false)
    })
  })

  describe('onEmploymentTypeChange', () => {
    it('should set isGovernmentEmployee=true for Government', () => {
      component.onEmploymentTypeChange('Government')
      expect(component.isGovernmentEmployee).toBe(true)
      expect(component.isPrivateEmployee).toBe(false)
    })

    it('should set isPrivateEmployee=true for Private', () => {
      component.onEmploymentTypeChange('Private')
      expect(component.isPrivateEmployee).toBe(true)
      expect(component.isGovernmentEmployee).toBe(false)
    })
  })

  describe('onDistrictChange', () => {
    it('should populate blocks when district has data', () => {
      component.biharDistrictData = { 'UP': { 'Block1': {}, 'Block2': {} } }
      component.onDistrictChange('UP')
      expect(component.blocks).toEqual(['Block1', 'Block2'])
    })

    it('should empty blocks for unknown district', () => {
      component.onDistrictChange('Unknown')
      expect(component.blocks).toEqual([])
    })
  })

  describe('onBlockChange', () => {
    it('should populate facilityTypes when district and block have data', () => {
      component.biharDistrictData = { 'UP': { 'Block1': { 'PHC': [], 'CHC': [] } } }
      component.anmRegistrationForm.get('district')?.setValue('UP')
      component.onBlockChange('Block1')
      expect(component.facilityTypes).toEqual(['PHC', 'CHC'])
    })
  })

  describe('openSnackbar', () => {
    it('should call snackBar.open', () => {
      component.openSnackbar('Error message')
      expect(mockSnackBar.open).toHaveBeenCalledWith('Error message', 'X', expect.any(Object))
    })
  })

  describe('onDobChange', () => {
    it('should set dob on anmRegistrationForm when isInService=true', () => {
      component.isInService = true
      component.onDobChange('1990-01-01')
      expect(component.anmRegistrationForm.get('dob')?.value).toBe('1990-01-01')
    })

    it('should not throw when isPreService=true (dob field not present in preServiceForm)', () => {
      component.isInService = false
      component.isPreService = true
      expect(() => component.onDobChange('1990-01-01')).not.toThrow()
    })
  })

  describe('onMedicalOfficerDobChange', () => {
    it('should set dob on medicalOfficerForm', () => {
      component.onMedicalOfficerDobChange('1985-05-10')
      expect(component.medicalOfficerForm.get('dob')?.value).toBe('1985-05-10')
    })
  })

  describe('onDateOfJoiningChange', () => {
    it('should set dateOfJoining on medicalOfficerForm', () => {
      component.onDateOfJoiningChange('2010-03-15')
      expect(component.medicalOfficerForm.get('dateOfJoining')?.value).toBe('2010-03-15')
    })
  })

  describe('onFacilityTypeChange', () => {
    it('should populate availableFacilities when all selections are set', () => {
      component.biharDistrictData = { 'UP': { 'Block1': { 'PHC': [{ name: 'Facility1' }] } } }
      component.anmRegistrationForm.get('district')?.setValue('UP')
      component.anmRegistrationForm.get('block')?.setValue('Block1')
      component.onFacilityTypeChange('PHC')
      expect(component.availableFacilities).toEqual([{ name: 'Facility1' }])
    })

    it('should clear availableFacilities for unknown facility type', () => {
      component.biharDistrictData = {}
      component.onFacilityTypeChange('Unknown')
      expect(component.availableFacilities).toEqual([])
    })
  })

  describe('onSubmit', () => {
    it('should call onSubmitInService when isInService=true', () => {
      component.isInService = true
      const spy = jest.spyOn(component, 'onSubmitInService').mockImplementation(() => {})
      component.onSubmit()
      expect(spy).toHaveBeenCalled()
    })

    it('should call onSubmitPreService when isPreService=true', () => {
      component.isInService = false
      component.isPreService = true
      const spy = jest.spyOn(component, 'onSubmitPreService').mockImplementation(() => {})
      component.onSubmit()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('onSubmitInService', () => {
    it('should call upsmfSendOtp and set otpPage=true on success status=success', () => {
      component.isInService = true
      component.userProfileSvc = {
        upsmfSendOtp: jest.fn().mockReturnValue(of({ status: 'success', message: 'OTP sent' })),
      } as any
      component.anmRegistrationForm.patchValue({
        firstName: 'John', lastName: 'Doe', phone: '9876543210',
        dob: '1990-01-01', regNurseRegMidwifeNumber: 'REG001', roleForInService: 'Government',
      })
      component.onSubmitInService()
      expect(component.otpPage).toBe(true)
    })

    it('should call openSnackbar when otp response is not success', () => {
      component.userProfileSvc = {
        upsmfSendOtp: jest.fn().mockReturnValue(of({ status: 'fail', message: 'Error' })),
      } as any
      component.anmRegistrationForm.patchValue({
        firstName: 'John', lastName: 'Doe', phone: '9876543210',
        dob: '1990-01-01', regNurseRegMidwifeNumber: 'REG001', roleForInService: 'Government',
      })
      component.onSubmitInService()
      expect(mockSnackBar.open).toHaveBeenCalled()
    })

    it('should not call upsmfSendOtp when form is invalid', () => {
      const mockSendOtp = jest.fn()
      component.userProfileSvc = { upsmfSendOtp: mockSendOtp } as any
      component.onSubmitInService()
      expect(mockSendOtp).not.toHaveBeenCalled()
    })
  })

  describe('onSubmitPreService', () => {
    it('should call upsmfSendOtp when preServiceForm is valid', () => {
      component.isPreService = true
      component.isInService = false
      const mockSendOtp = jest.fn().mockReturnValue(of({ status: 'success', message: 'OTP sent' }))
      component.userProfileSvc = { upsmfSendOtp: mockSendOtp } as any
      component.preServiceForm.patchValue({
        firstName: 'Jane', lastName: 'Doe', phone: '9876543210',
        district: 'UP', role: 'Student',
      })
      component.onSubmitPreService()
      expect(mockSendOtp).toHaveBeenCalled()
    })
  })

  describe('assignFields', () => {
    it('should log field info without throwing', () => {
      component.assignFields('phone', '1234567890', {})
      expect(mockLogger.log).toHaveBeenCalled()
    })
  })

  describe('createUser', () => {
    it('should call upsmfRegistration and open dialog on SUCCESS', () => {
      component.isInService = true
      component.isGovernmentEmployee = false
      component.userProfileSvc = {
        upsmfRegistration: jest.fn().mockReturnValue(of({ status: 'SUCCESS' })),
      } as any
      component.createUser({})
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should call openSnackbar when upsmfRegistration status is not SUCCESS', () => {
      component.isInService = true
      component.isGovernmentEmployee = false
      component.userProfileSvc = {
        upsmfRegistration: jest.fn().mockReturnValue(of({ status: 'FAIL', message: 'Failed' })),
      } as any
      component.createUser({})
      expect(mockSnackBar.open).toHaveBeenCalledWith('Failed', 'X', expect.any(Object))
    })
  })
})
