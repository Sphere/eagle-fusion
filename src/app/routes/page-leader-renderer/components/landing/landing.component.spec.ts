jest.mock('../../services/leadership.service', () => ({
  LeadershipService: class {
    emailToUserId = jest.fn()
    fetchUserFollow = jest.fn()
    followUser = jest.fn()
    unFollowUser = jest.fn()
  },
}))

jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {
    userProfile = { userId: 'user-1' }
  },
}))

jest.mock('../send-mail-dialog/send-mail-dialog.component', () => ({
  SendMailDialogComponent: class {},
}))

import { of, throwError, BehaviorSubject } from 'rxjs'
import { LandingComponent } from './landing.component'

describe('LandingComponent', () => {
  let component: LandingComponent
  let mockRoute: any
  let mockRouter: any
  let mockDialog: any
  let mockSnackBar: any
  let mockLeaderSvc: any
  let mockConfigSvc: any

  beforeEach(() => {
    mockRoute = {
      data: { subscribe: jest.fn((cb: any) => cb({ leaderData: { data: null } })) },
      paramMap: new BehaviorSubject({ get: jest.fn().mockReturnValue('john-doe') }),
      queryParamMap: new BehaviorSubject({ get: jest.fn().mockReturnValue(null) }),
    }
    mockRouter = { navigate: jest.fn() }
    mockDialog = { open: jest.fn() }
    mockSnackBar = { open: jest.fn() }
    mockLeaderSvc = {
      emailToUserId: jest.fn().mockReturnValue(of({ userId: 'leader-uuid' })),
      fetchUserFollow: jest.fn().mockReturnValue(of({ followers: [], following: [] })),
      followUser: jest.fn().mockReturnValue(of({})),
      unFollowUser: jest.fn().mockReturnValue(of({})),
    }
    mockConfigSvc = { userProfile: { userId: 'user-1' } }

    component = new LandingComponent(
      mockRoute,
      mockRouter,
      mockDialog,
      mockSnackBar,
      mockLeaderSvc,
      mockConfigSvc,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set userId from configSvc.userProfile on construction', () => {
    expect(component.userId).toBe('user-1')
  })

  it('should default isFetchingFollow to false', () => {
    expect(component.isFetchingFollow).toBe(false)
  })

  it('should default isFollowDisabled to true', () => {
    expect(component.isFollowDisabled).toBe(true)
  })

  it('should default tabs to empty array', () => {
    expect(component.tabs).toEqual([])
  })

  it('should subscribe to route data on ngOnInit', () => {
    component.ngOnInit()
    expect(mockRoute.data.subscribe).toHaveBeenCalled()
  })

  it('should set errorFetchingJson when leaderResponse has error', () => {
    component.init({ leaderData: { data: null, error: 'Not found' } })
    expect(component.errorFetchingJson).toBe(true)
  })

  it('should set leaderData and tabs when leaderResponse has data', () => {
    component.init({
      leaderData: {
        data: {
          profile: { emailId: 'leader@test.com', name: 'Leader Name' },
          tabs: [{ title: 'About' }, { title: 'Articles' }],
          mailMeta: {},
        },
      },
    })
    expect(component.leaderData).not.toBeNull()
    expect(component.tabs).toHaveLength(2)
  })

  describe('isFollowing', () => {
    it('should return true when id is in following list', () => {
      component.loggedUserFollowData = { followers: [], following: [{ id: 'leader-uuid', email: '', firstname: '' }] }
      expect(component.isFollowing('leader-uuid')).toBe(true)
    })

    it('should return false when id is not in following list', () => {
      component.loggedUserFollowData = { followers: [], following: [] }
      expect(component.isFollowing('other-uuid')).toBe(false)
    })
  })

  describe('onIndexChange', () => {
    it('should navigate with tab queryParam', () => {
      component.tabs = ['About', 'Articles']
      component.onIndexChange(1)
      expect(mockRouter.navigate).toHaveBeenCalledWith([], { queryParams: { tab: 'Articles' } })
    })
  })
})
