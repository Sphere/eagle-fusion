jest.mock('@ws-widget/resolver', () => ({
  NsWidgetResolver: {},
}))

jest.mock('@ws-widget/collection', () => ({
  ROOT_WIDGET_CONFIG: {
    errorResolver: { _type: 'resolver', errorResolver: 'errorResolver' },
  },
  NsError: {},
}))

jest.mock('../../services/tnc-app-resolver.service', () => ({
  TncAppResolverService: class {
    getTnc = jest.fn()
  },
}))

jest.mock('../../services/tnc-public-resolver.service', () => ({
  TncPublicResolverService: class {
    getPublicTnc = jest.fn()
  },
}))

jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {
    pageNavBar = {}
    unMappedUser: any = null
    userProfile: any = null
  },
  LoggerService: class {
    log = jest.fn()
  },
}))

jest.mock('../signup/signup.service', () => ({
  SignupService: class {
    fetchStartUpDetails = jest.fn()
  },
}))

import { of, BehaviorSubject } from 'rxjs'
import { TncComponent } from './tnc.component'

describe('TncComponent', () => {
  let component: TncComponent
  let mockRoute: any
  let mockRouter: any
  let mockTncProtectedSvc: any
  let mockTncPublicSvc: any
  let mockConfigSvc: any
  let mockSignupService: any
  let mockLogger: any
  let mockCdr: any
  let routeDataSubject: BehaviorSubject<any>

  const tncData = {
    termsAndConditions: [
      { name: 'Generic T&C', language: 'en', version: '1.0' },
      { name: 'Data Privacy', language: 'en', version: '1.0' },
    ],
  }

  beforeEach(() => {
    routeDataSubject = new BehaviorSubject({ tnc: { data: tncData }, isPublic: false })
    mockRoute = { data: routeDataSubject.asObservable() }
    mockRouter = { navigate: jest.fn(), navigateByUrl: jest.fn() }
    mockTncProtectedSvc = { getTnc: jest.fn().mockReturnValue(of(tncData)) }
    mockTncPublicSvc = { getPublicTnc: jest.fn().mockReturnValue(of(tncData)) }
    mockConfigSvc = { unMappedUser: null, userProfile: null }
    mockSignupService = { fetchStartUpDetails: jest.fn().mockResolvedValue({ userId: 'user-1' }) }
    mockLogger = { log: jest.fn() }
    mockCdr = { markForCheck: jest.fn() }
    component = new TncComponent(
      mockRoute,
      mockRouter,
      mockTncProtectedSvc,
      mockTncPublicSvc,
      mockConfigSvc,
      mockSignupService,
      mockLogger,
      mockCdr,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default tncData to null', () => {
    expect(component.tncData).toBeNull()
  })

  it('should default tncFlag to false', () => {
    expect(component.tncFlag).toBe(false)
  })

  it('should set tncData from route data on ngOnInit', async () => {
    await component.ngOnInit()
    expect(component.tncData).toEqual(tncData)
  })

  it('should set isPublic from route data', async () => {
    routeDataSubject.next({ tnc: { data: tncData }, isPublic: true })
    await component.ngOnInit()
    expect(component.isPublic).toBe(true)
  })

  it('should navigate to error when tnc has no data', async () => {
    routeDataSubject.next({ tnc: { data: null } })
    await component.ngOnInit()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['error-service-unavailable'])
  })

  it('should set userId true when unMappedUser has profileDetails', async () => {
    mockConfigSvc.unMappedUser = { profileDetails: { name: 'Test' } }
    await component.ngOnInit()
    expect(component.userId).toBe(true)
  })

  it('should set userId false when unMappedUser has no profileDetails', async () => {
    await component.ngOnInit()
    expect(component.userId).toBe(false)
  })

  it('should log configSvc on homePage()', () => {
    component.homePage()
    expect(mockLogger.log).toHaveBeenCalledWith(mockConfigSvc)
  })

  it('should call getTnc on getTnc() when not public and language differs', async () => {
    await component.ngOnInit()
    component.getTnc('hi')
    expect(mockTncProtectedSvc.getTnc).toHaveBeenCalledWith('hi')
  })

  it('should call getPublicTnc on getTnc() when isPublic', async () => {
    routeDataSubject.next({ tnc: { data: tncData }, isPublic: true })
    await component.ngOnInit()
    component.getTnc('hi')
    expect(mockTncPublicSvc.getPublicTnc).toHaveBeenCalled()
  })

  it('should navigate to /page/home on backEvent()', async () => {
    await component.ngOnInit()
    component.backEvent()
    expect(component.tncData).toBeNull()
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/page/home')
  })

  it('should unsubscribe on ngOnDestroy', async () => {
    await component.ngOnInit()
    expect(() => component.ngOnDestroy()).not.toThrow()
  })
})
