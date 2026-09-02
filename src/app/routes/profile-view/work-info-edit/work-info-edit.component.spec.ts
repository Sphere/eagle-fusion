jest.mock('@angular/core', () => {
  const actual = jest.requireActual('@angular/core')
  return { ...actual, effect: (fn: () => void) => { fn() } }
})

jest.mock('../../../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {
    userProfile = { userId: 'user-1' }
    unMappedUser = { id: 'unmapped-1', profileDetails: { preferences: { language: 'en' } } }
  },
  LoggerService: class { log = jest.fn() },
  ValueService: class { isMobile = jest.fn().mockReturnValue(false) },
}))

jest.mock('../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service', () => ({
  UserProfileService: class {
    getUserdetailsFromRegistry = jest.fn()
    updateProfileDetails = jest.fn()
  },
}))

jest.mock('../../../../../library/ws-widget/collection/src/public-api', () => ({
  WidgetContentService: class {
    workMessage = { subscribe: jest.fn((cb: any) => { cb(null); return { unsubscribe: jest.fn() } }) }
  },
}))

jest.mock('../../../../../project/ws/app/src/public-api', () => ({
  AppDateAdapter: class {},
  APP_DATE_FORMATS: {},
  changeformat: jest.fn(d => d),
}))

jest.mock('../request-util', () => ({
  constructReq: jest.fn().mockReturnValue({
    profileReq: { personalDetails: { profileLocation: '' } },
  }),
}))

jest.mock('src/app/services/user-agent.service', () => ({
  UserAgentResolverService: class {
    getUserAgent = jest.fn().mockReturnValue('test-agent')
    generateCookie = jest.fn().mockReturnValue('test-cookie')
  },
}))

jest.mock('../../../services/language.service', () => ({
  LanguageService: class {
    getCurrentLanguage = jest.fn().mockReturnValue('en')
  },
}))

jest.mock('@ngx-translate/core', () => ({
  TranslateService: class {
    instant = jest.fn().mockImplementation((k: string) => k)
  },
}))

import { of, BehaviorSubject } from 'rxjs'
import { WorkInfoEditComponent } from './work-info-edit.component'

describe('WorkInfoEditComponent', () => {
  let component: WorkInfoEditComponent
  let mockConfigSvc: any
  let mockUserProfileSvc: any
  let mockRouter: any
  let mockSnackBar: any
  let mockRoute: any
  let mockValueSvc: any
  let mockContentSvc: any
  let mockLogger: any
  let mockUnsubscribe: any

  beforeEach(() => {
    mockUnsubscribe = jest.fn()
    mockConfigSvc = {
      userProfile: { userId: 'user-1' },
      unMappedUser: { id: 'unmapped-1', profileDetails: { preferences: { language: 'en' }, userSource: null } },
    }
    mockUserProfileSvc = {
      getUserdetailsFromRegistry: jest.fn().mockReturnValue(of({
        profileDetails: { profileReq: { professionalDetails: [{ name: 'AIIMS', designation: 'Nurse' }] } },
      })),
      updateProfileDetails: jest.fn().mockReturnValue(of({ success: true })),
    }
    mockRouter = { navigate: jest.fn() }
    mockSnackBar = { open: jest.fn() }
    mockRoute = { queryParams: new BehaviorSubject({}) }
    mockValueSvc = { isMobile: jest.fn().mockReturnValue(false) }
    mockContentSvc = {
      workMessage: { subscribe: jest.fn().mockReturnValue({ unsubscribe: mockUnsubscribe }) },
    }
    mockLogger = { log: jest.fn() }

    component = new WorkInfoEditComponent(
      mockConfigSvc,
      mockUserProfileSvc,
      mockRouter,
      mockSnackBar,
      mockRoute,
      mockValueSvc,
      {} as any,           // UserAgentResolverService
      mockContentSvc,      // contentSvc
      {} as any,           // languageSvc
      mockLogger,
      {} as any,           // translate
    )
    sessionStorage.clear()
  })

  afterEach(() => {
    sessionStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize workInfoForm with organizationName and designation controls', () => {
    expect(component.workInfoForm.get('organizationName')).toBeTruthy()
    expect(component.workInfoForm.get('designation')).toBeTruthy()
  })

  it('should default showbackButton false when isMobile returns false', () => {
    expect(component.showbackButton).toBe(false)
  })

  it('should set showbackButton true when isMobile returns true', () => {
    mockValueSvc.isMobile.mockReturnValue(true)
    component = new WorkInfoEditComponent(
      mockConfigSvc, mockUserProfileSvc, mockRouter, mockSnackBar,
      mockRoute, mockValueSvc, {} as any, mockContentSvc, {} as any, mockLogger, {} as any,
    )
    expect(component.showbackButton).toBe(true)
  })

  it('should subscribe to workMessage on ngOnInit', () => {
    component.ngOnInit()
    expect(mockContentSvc.workMessage.subscribe).toHaveBeenCalled()
  })

  describe('updateForm', () => {
    it('should patch form from professionalDetails', () => {
      component.userProfileData = {
        professionalDetails: [{ name: 'AIIMS Hospital', designation: 'Staff Nurse' }],
      }
      component.updateForm()
      expect(component.workInfoForm.get('organizationName')?.value).toBe('AIIMS Hospital')
      expect(component.workInfoForm.get('designation')?.value).toBe('Staff Nurse')
    })

    it('should not throw when userProfileData is null', () => {
      component.userProfileData = null
      expect(() => component.updateForm()).not.toThrow()
    })
  })

  describe('workMessage subscribe async callback', () => {
    it('invokes async callback, sets workLog, and calls getUserDetails', async () => {
      let capturedCallback: any
      const contentSvcWithCb = {
        workMessage: {
          subscribe: jest.fn((cb: any) => {
            capturedCallback = cb
            return { unsubscribe: jest.fn() }
          }),
        },
      }
      const comp = new WorkInfoEditComponent(
        mockConfigSvc,
        mockUserProfileSvc,
        mockRouter,
        mockSnackBar,
        mockRoute,
        mockValueSvc,
        { getUserAgent: jest.fn().mockReturnValue({}), generateCookie: jest.fn() } as any,
        contentSvcWithCb,
        { getCurrentLanguage: jest.fn().mockReturnValue('en') } as any,
        mockLogger,
        { instant: jest.fn() } as any,
      )
      comp.ngOnInit()
      capturedCallback({ edit: true })
      await Promise.resolve()
      await Promise.resolve()
      expect(mockLogger.log).toHaveBeenCalledWith(expect.anything(), 'here')
      expect(mockUserProfileSvc.getUserdetailsFromRegistry).toHaveBeenCalled()
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe workMessage subscription', () => {
      component.ngOnInit()
      component.ngOnDestroy()
      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('ngOnInit', () => {
    it('should call getUserDetails when userProfile is set', () => {
      sessionStorage.setItem('work', 'true')
      const spy = jest.spyOn(component as any, 'getUserDetails')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })

    it('should set workLog from sessionStorage', () => {
      sessionStorage.setItem('work', 'true')
      component.ngOnInit()
      expect(component.workLog).toBe('true')
    })

    it('should set workLog to null when sessionStorage is empty', () => {
      component.workLog = 'something'
      mockConfigSvc.userProfile = null
      component.ngOnInit()
      expect(component.workLog).toBeNull()
    })
  })

  describe('getUserDetails', () => {
    it('should skip API call when userProfile is null', () => {
      mockConfigSvc.userProfile = null
      component['getUserDetails']()
      expect(mockUserProfileSvc.getUserdetailsFromRegistry).not.toHaveBeenCalled()
    })

    it('should fetch user data and call updateForm when workLog is true', () => {
      component.workLog = 'true'
      const spy = jest.spyOn(component, 'updateForm')
      component['getUserDetails']()
      expect(mockUserProfileSvc.getUserdetailsFromRegistry).toHaveBeenCalledWith('unmapped-1')
      expect(spy).toHaveBeenCalled()
    })

    it('should reset form when workLog edit is false', () => {
      component.workLog = { edit: false }
      const resetSpy = jest.spyOn(component.workInfoForm, 'reset')
      component['getUserDetails']()
      expect(resetSpy).toHaveBeenCalled()
    })

    it('should call updateForm when route has isEdit param', () => {
      component.workLog = 'true'
      const updateSpy = jest.spyOn(component, 'updateForm')
      mockRoute.queryParams.next({ isEdit: true })
      component['getUserDetails']()
      expect(updateSpy).toHaveBeenCalled()
    })
  })

  describe('onSubmit', () => {
    let componentWithMocks: any

    beforeEach(() => {
      componentWithMocks = new WorkInfoEditComponent(
        mockConfigSvc,
        mockUserProfileSvc,
        mockRouter,
        mockSnackBar,
        mockRoute,
        mockValueSvc,
        { getUserAgent: jest.fn().mockReturnValue({ OS: 'Mac', browserName: 'Chrome' }), generateCookie: jest.fn().mockReturnValue('cookie') } as any,
        mockContentSvc,
        { getCurrentLanguage: jest.fn().mockReturnValue('en') } as any,
        mockLogger,
        { instant: jest.fn().mockReturnValue('Success') } as any,
      )
      componentWithMocks.userProfileData = { professionalDetails: [] }
    })

    it('should call updateProfileDetails and navigate to workinfo-list on success', () => {
      componentWithMocks.onSubmit({ organizationName: 'Test Org', designation: 'Dev' })
      expect(mockUserProfileSvc.updateProfileDetails).toHaveBeenCalled()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/workinfo-list'])
    })

    it('should not throw when form has no doj', () => {
      expect(() => componentWithMocks.onSubmit({ organizationName: 'Org' })).not.toThrow()
    })
  })
})
