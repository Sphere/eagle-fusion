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
})
