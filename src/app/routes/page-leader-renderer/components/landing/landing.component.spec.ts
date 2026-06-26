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

  describe('fetchUserId', () => {
    beforeEach(() => {
      component.leaderData = {
        profile: { emailId: 'leader@test.com', name: 'Leader' },
        tabs: [],
        mailMeta: { placeholder: '', emailTo: '', name: '', subject: '' },
      } as any
    })

    it('should set leaderUuid and enable follow on success', () => {
      mockLeaderSvc.emailToUserId = jest.fn().mockReturnValue(of({ userId: 'leader-uuid' }))
      component.fetchUserId()
      expect(component.leaderUuid).toBe('leader-uuid')
      expect(component.isFollowDisabled).toBe(false)
    })

    it('should set isFollowDisabled=true on error', () => {
      mockLeaderSvc.emailToUserId = jest.fn().mockReturnValue(throwError(() => new Error('fail')))
      component.fetchUserId()
      expect(component.isFollowDisabled).toBe(true)
    })
  })

  describe('openSendMailDialog', () => {
    it('should open SendMailDialogComponent when leaderData is set', () => {
      component.leaderData = {
        profile: { emailId: 'leader@test.com', name: 'Leader' },
        tabs: [],
        mailMeta: { placeholder: 'Hi', emailTo: 'leader@test.com', name: 'Leader', subject: 'Hello' },
      } as any
      component.openSendMailDialog()
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should not open dialog when leaderData is null', () => {
      component.leaderData = null
      component.openSendMailDialog()
      expect(mockDialog.open).not.toHaveBeenCalled()
    })
  })

  describe('follow / unFollow / toggleFollow', () => {
    beforeEach(() => {
      component.leaderData = {
        profile: { emailId: 'leader@test.com', name: 'Leader Name' },
        tabs: [],
        mailMeta: {} as any,
      } as any
      component.leaderUuid = 'leader-uuid'
      component.followed = { nativeElement: { value: 'Followed' } } as any
      component.unfollowed = { nativeElement: { value: 'Unfollowed' } } as any
      component.followUnfollowError = { nativeElement: { value: 'Error' } } as any
    })

    it('follow should call followUser and open snackbar on success', () => {
      mockLeaderSvc.followUser = jest.fn().mockReturnValue(of({}))
      component.follow()
      expect(mockLeaderSvc.followUser).toHaveBeenCalled()
      expect(mockSnackBar.open).toHaveBeenCalled()
      expect(component.isFetchingFollow).toBe(false)
    })

    it('follow should revert following on error', () => {
      mockLeaderSvc.followUser = jest.fn().mockReturnValue(throwError(() => new Error('fail')))
      component.follow()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Error')
      expect(component.isFetchingFollow).toBe(false)
    })

    it('unFollow should call unFollowUser and remove from following list on success', () => {
      mockLeaderSvc.unFollowUser = jest.fn().mockReturnValue(of({}))
      component.loggedUserFollowData.following = [{ id: 'leader-uuid', email: '', firstname: '' }]
      component.unFollow()
      expect(mockLeaderSvc.unFollowUser).toHaveBeenCalled()
      expect(component.loggedUserFollowData.following.length).toBe(0)
    })

    it('toggleFollow should call unFollow when already following', () => {
      component.loggedUserFollowData = { followers: [], following: [{ id: 'leader-uuid', email: '', firstname: '' }] }
      mockLeaderSvc.unFollowUser = jest.fn().mockReturnValue(of({}))
      component.toggleFollow()
      expect(mockLeaderSvc.unFollowUser).toHaveBeenCalled()
    })

    it('toggleFollow should call follow when not following', () => {
      component.loggedUserFollowData = { followers: [], following: [] }
      mockLeaderSvc.followUser = jest.fn().mockReturnValue(of({}))
      component.toggleFollow()
      expect(mockLeaderSvc.followUser).toHaveBeenCalled()
    })
  })
})
