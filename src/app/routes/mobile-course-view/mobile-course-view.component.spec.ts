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
    mockLogger = { log: jest.fn() }
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
})
