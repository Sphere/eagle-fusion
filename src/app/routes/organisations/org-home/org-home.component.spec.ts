jest.mock('../org-home-service.service', () => ({
  OrgServiceService: class {
    getLiveSearchResults = jest.fn()
    fetchUserBatchList = jest.fn()
  },
}))

jest.mock('@ws-widget/utils/src/lib/services/configurations.service', () => ({
  ConfigurationsService: class {
    userProfile: any = null
    unMappedUser: any = null
  },
}))

jest.mock('project/ws/app/src/lib/routes/user-profile/services/user-profile.service', () => ({
  UserProfileService: class {
    getUserdetailsFromRegistry = jest.fn()
    isBackgroundDetailsFilled = jest.fn()
  },
}))

jest.mock('../../../routes/signup/signup.service', () => ({
  SignupService: class {
    keyClockLogin = jest.fn()
  },
}))

import { of } from 'rxjs'
import { OrgHomeComponent } from './org-home.component'

describe('OrgHomeComponent', () => {
  let component: OrgHomeComponent
  let mockRouter: any
  let mockOrgService: any
  let mockUserProfileSvc: any
  let mockConfigSvc: any
  let mockSignupSvc: any

  const mockContent = [
    { identifier: 'course-1', name: 'Course 1' },
    { identifier: 'course-2', name: 'Course 2' },
  ]

  beforeEach(() => {
    mockRouter = { navigateByUrl: jest.fn(), navigate: jest.fn() }
    mockOrgService = {
      getLiveSearchResults: jest.fn().mockReturnValue(of({ result: { content: mockContent } })),
      fetchUserBatchList: jest.fn().mockReturnValue(of([])),
    }
    mockUserProfileSvc = {
      getUserdetailsFromRegistry: jest.fn().mockReturnValue(of({ profileDetails: {} })),
      isBackgroundDetailsFilled: jest.fn().mockReturnValue(true),
    }
    mockConfigSvc = { userProfile: null, unMappedUser: null }
    mockSignupSvc = { keyClockLogin: jest.fn() }
    component = new OrgHomeComponent(
      mockRouter,
      mockOrgService,
      mockUserProfileSvc,
      mockConfigSvc,
      mockSignupSvc,
    )
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default enrollData to true and contentId to empty array', () => {
    expect(component.enrollData).toBe(true)
    expect(component.contentId).toEqual([])
  })

  it('should call getCourseDetails on ngOnInit', () => {
    jest.spyOn(component, 'getCourseDetails')
    component.ngOnInit()
    expect(component.getCourseDetails).toHaveBeenCalledWith('')
  })

  it('should set resultResponse from getLiveSearchResults', () => {
    component.ngOnInit()
    expect(component.resultResponse).toEqual(mockContent)
  })

  it('should fetch user batch list when userProfile is available', () => {
    mockConfigSvc.userProfile = { userId: 'user-123' }
    component.ngOnInit()
    expect(mockOrgService.fetchUserBatchList).toHaveBeenCalledWith('user-123')
  })

  it('should not fetch batch list when userProfile is null', () => {
    component.ngOnInit()
    expect(mockOrgService.fetchUserBatchList).not.toHaveBeenCalled()
  })

  it('should invoke enrollment filter callback when fetchUserBatchList returns items', () => {
    mockConfigSvc.userProfile = { userId: 'user-123' }
    mockOrgService.fetchUserBatchList = jest.fn().mockReturnValue(
      of([{ contentId: 'course-1', dateTime: '2024-01-01' }])
    )
    component.ngOnInit()
    expect(mockOrgService.fetchUserBatchList).toHaveBeenCalledWith('user-123')
    expect(component.resultResponse).toBeDefined()
  })

  it('should call keyClockLogin when userProfile is null on navigateToToc', () => {
    component.navigateToToc('course-1')
    expect(mockSignupSvc.keyClockLogin).toHaveBeenCalled()
    expect(localStorage.getItem('url_before_login')).toBe('app/toc/course-1/overview')
  })

  it('should navigate to about-you when background details are not filled', () => {
    jest.useFakeTimers()
    mockConfigSvc.userProfile = { userId: 'user-1' }
    mockConfigSvc.unMappedUser = { id: 'unmapped-1' }
    mockUserProfileSvc.isBackgroundDetailsFilled.mockReturnValue(false)
    component.navigateToToc('course-1')
    jest.runAllTimers()
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/app/about-you'],
      { queryParams: { redirect: '/app/toc/course-1/overview' } },
    )
    jest.useRealTimers()
  })

  it('should navigateByUrl to toc when background details are filled', () => {
    jest.useFakeTimers()
    mockConfigSvc.userProfile = { userId: 'user-1' }
    mockConfigSvc.unMappedUser = { id: 'unmapped-1' }
    mockUserProfileSvc.isBackgroundDetailsFilled.mockReturnValue(true)
    component.navigateToToc('course-1')
    jest.runAllTimers()
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/toc/course-1/overview')
    jest.useRealTimers()
  })
})
