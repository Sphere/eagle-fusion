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
})
