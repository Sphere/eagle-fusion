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
})
