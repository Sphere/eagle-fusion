jest.mock('lodash', () => ({
  forEach: (arr: any[], fn: (v: any) => void) => (arr || []).forEach(fn),
  get: (obj: any, path: string, def?: any) => {
    const keys = path.split('.')
    let result: any = obj
    for (const key of keys) {
      if (result == null) return def
      result = result[key]
    }
    return result !== undefined ? result : def
  },
}))

jest.mock('../../../../library/ws-widget/utils/src/public-api', () => ({
  LoggerService: class { log = jest.fn() },
  TelemetryService: class { interact = jest.fn() },
}))

jest.mock('../../../../library/ws-widget/utils/src/lib/services/configurations.service', () => ({
  ConfigurationsService: class {
    userProfile = { userId: 'user-1' }
  },
}))

jest.mock('../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service', () => ({
  UserProfileService: class {
    getUserdetailsFromRegistry = jest.fn()
  },
}))

jest.mock('../signup/signup.service', () => ({
  SignupService: class { fetchStartUpDetails = jest.fn() },
}))

import { MobileCourseViewComponent } from './mobile-course-view.component'

describe('MobileCourseViewComponent', () => {
  let component: MobileCourseViewComponent
  let mockRouter: any
  let mockConfigSvc: any
  let mockLogger: any
  let mockTelemetrySvc: any

  beforeEach(() => {
    mockRouter = { navigate: jest.fn() }
    mockConfigSvc = { userProfile: { userId: 'user-1' } }
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    mockTelemetrySvc = { interact: jest.fn() }

    component = new MobileCourseViewComponent(
      mockRouter,
      mockConfigSvc,
      {} as any,  // userProfileSvc
      {} as any,  // signUpSvc
      { setTitle: jest.fn() } as any,
      mockTelemetrySvc,
      mockLogger,
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

  it('should default displayStyle to "none"', () => {
    expect(component.displayStyle).toBe('none')
  })

  it('should default imgLoaded to false', () => {
    expect(component.imgLoaded).toBe(false)
  })

  it('should set isLoggedIn true when userProfile is set', () => {
    component.ngOnInit()
    expect(component.isLoggedIn).toBe(true)
  })

  it('should set isLoggedIn false when userProfile is null', () => {
    mockConfigSvc.userProfile = null
    component.ngOnInit()
    expect(component.isLoggedIn).toBe(false)
  })

  it('should remove cURL from sessionStorage when logged in', () => {
    sessionStorage.setItem('cURL', 'https://example.com/course')
    component.ngOnInit()
    expect(sessionStorage.getItem('cURL')).toBeNull()
  })

  it('should accept courseData input', () => {
    component.courseData = { name: 'Test Course', identifier: 'do_123' }
    expect(component.courseData.name).toBe('Test Course')
  })

  it('should accept cnePoints input', () => {
    component.cnePoints = 5
    expect(component.cnePoints).toBe(5)
  })

  it('should default cometencyData to empty array', () => {
    expect(component.cometencyData).toEqual([])
  })

  describe('showPopup / closePopup', () => {
    it('showPopup should set displayStyle to block', () => {
      component.showPopup()
      expect(component.displayStyle).toBe('block')
    })

    it('closePopup should set displayStyle to none', () => {
      component.displayStyle = 'block'
      component.closePopup()
      expect(component.displayStyle).toBe('none')
    })
  })

  describe('orgLogin', () => {
    it('should navigate to public/login', () => {
      mockRouter.navigateByUrl = jest.fn()
      component.orgLogin()
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('public/login')
    })
  })

  describe('slugify', () => {
    it('should lowercase and replace spaces with hyphens', () => {
      expect(component.slugify('Hello World')).toBe('hello-world')
    })

    it('should replace & with and', () => {
      expect(component.slugify('Health & Safety')).toBe('health-and-safety')
    })

    it('should remove leading and trailing hyphens', () => {
      expect(component.slugify('  Test Course  ')).toBe('test-course')
    })

    it('should replace multiple symbols with single hyphen', () => {
      expect(component.slugify('ABC!!!DEF')).toBe('abc-def')
    })
  })

  describe('login', () => {
    it('should navigate to public/toc/overview and set localStorage', () => {
      const data = { name: 'Test Course', identifier: 'do_123' }
      component.login(data)
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/public/toc/overview', 'do_123', 'test-course'],
        expect.objectContaining({ state: { tocData: data } }),
      )
      expect(localStorage.getItem('tocData')).toBe(JSON.stringify(data))
      expect(localStorage.getItem('url_before_login')).toBe('app/toc/do_123/overview')
    })
  })

  describe('redirectPage', () => {
    it('should call navigateToToc when logged in', () => {
      component.isLoggedIn = true
      const navigateSpy = jest.spyOn(component as any, 'navigateToToc').mockImplementation(() => {})
      component.redirectPage({ identifier: 'do_1', name: 'Course' })
      expect(navigateSpy).toHaveBeenCalledWith('do_1')
    })

    it('should call login and showPopup when not logged in on org-selective route', () => {
      component.isLoggedIn = false
      mockRouter.url = '/org-selective-course'
      const showPopupSpy = jest.spyOn(component, 'showPopup')
      const loginSpy = jest.spyOn(component, 'login')
      component.redirectPage({ identifier: 'do_1', name: 'Course' })
      expect(showPopupSpy).toHaveBeenCalled()
      expect(loginSpy).not.toHaveBeenCalled()
    })

    it('should call login when not logged in on regular route', () => {
      component.isLoggedIn = false
      mockRouter.url = '/public/courses'
      const loginSpy = jest.spyOn(component, 'login')
      component.redirectPage({ identifier: 'do_1', name: 'Course' })
      expect(loginSpy).toHaveBeenCalled()
    })
  })

  describe('orgCreateAccount', () => {
    it('should navigate to /app/create-account when no org config and no URL param', () => {
      mockConfigSvc.orgSelectiveCourseConfig = null
      mockRouter.navigateByUrl = jest.fn()
      component.orgCreateAccount()
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/create-account')
    })

    it('should navigate to dynamic path when orgSelectiveCourseConfig is set', () => {
      mockConfigSvc.orgSelectiveCourseConfig = {
        stateCode: 'TN',
        orgName: 'TNNMC',
        signupRole: 'Nurse',
      }
      mockRouter.navigateByUrl = jest.fn()
      component.orgCreateAccount()
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(
        expect.stringContaining('/app/create-account/TN'),
      )
    })
  })

  describe('ngOnInit with competencies_v1', () => {
    it('should populate cometencyData from competencies_v1', () => {
      const competencies = JSON.stringify([
        { competencyName: 'Clinical', level: 2 },
        { competencyName: 'Nursing', level: 1 },
      ])
      component.courseData = { competencies_v1: competencies }
      component.ngOnInit()
      expect(component.cometencyData).toHaveLength(2)
      expect(component.cometencyData[0].name).toBe('Clinical')
      expect(component.cometencyData[0].levels).toBe(' Level 2')
    })

    it('should skip competency entries without level', () => {
      const competencies = JSON.stringify([
        { competencyName: 'Clinical' },
      ])
      component.courseData = { competencies_v1: competencies }
      component.ngOnInit()
      expect(component.cometencyData).toHaveLength(0)
    })
  })
})
