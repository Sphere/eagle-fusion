import { of, throwError } from 'rxjs'
import { NsDiscussionForum } from '../../ws-discussion-forum.model'
import { DialogSocialActivityUserComponent } from './dialog-social-activity-user.component'

const mockDialogRef: any = { close: jest.fn() }

const mockSocialSvc: any = {
  fetchActivityUsers: jest.fn(),
}

const mockUserSvc: any = {
  fetchUserFollow: jest.fn(),
  followUser: jest.fn(),
  unFollowUser: jest.fn(),
}

const mockConfigSvc: any = {
  userProfile: { userId: 'user-1' },
}

function createComponent(data: NsDiscussionForum.IDialogActivityUsers = {
  postId: 'post-1',
  activityType: NsDiscussionForum.EActivityType.LIKE,
}): DialogSocialActivityUserComponent {
  return new DialogSocialActivityUserComponent(
    mockDialogRef,
    data,
    mockSocialSvc,
    mockConfigSvc,
    mockUserSvc,
  )
}

describe('DialogSocialActivityUserComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSocialSvc.fetchActivityUsers.mockReturnValue(of({ total: 0, users: [] }))
    mockUserSvc.fetchUserFollow.mockReturnValue(of({ followers: [], following: [] }))
    mockUserSvc.followUser.mockReturnValue(of({}))
    mockUserSvc.unFollowUser.mockReturnValue(of({}))
  })

  it('should create and set userId', () => {
    const component = createComponent()
    expect(component).toBeTruthy()
    expect(component.userId).toBe('user-1')
  })

  it('should not set userId when no userProfile', () => {
    const configSvc = {} as any
    const component = new DialogSocialActivityUserComponent(
      mockDialogRef,
      { postId: 'p1', activityType: NsDiscussionForum.EActivityType.LIKE },
      mockSocialSvc,
      configSvc,
      mockUserSvc,
    )
    expect(component.userId).toBe('')
  })

  it('should set selectedTabIndex based on activityType on init', () => {
    const component = createComponent({ postId: 'p1', activityType: NsDiscussionForum.EActivityType.UPVOTE })
    component.ngOnInit()
    expect(component.selectedTabIndex).toBe(1)
  })

  it('should not match any tab index when activityType unmatched', () => {
    const component = createComponent({ postId: 'p1', activityType: 'unknown' as any })
    component.activityUsersResult.unknown = { data: null, fetchStatus: 'none' }
    component.activityUsersFetchRequest.unknown = { postId: 'p1', pgNo: 0, pgSize: 20, activityType: 'unknown' as any }
    component.ngOnInit()
    expect(component.selectedTabIndex).toBe(0)
  })

  it('should fetch user followers on init', () => {
    const component = createComponent()
    component.ngOnInit()
    expect(component.userFollowData).toEqual({ followers: [], following: [] })
    expect(component.userFollowFetchStatus).toBe('done')
  })

  it('should set error status when fetchUserFollow errors', () => {
    mockUserSvc.fetchUserFollow.mockReturnValue(throwError(() => new Error('err')))
    const component = createComponent()
    component.ngOnInit()
    expect(component.userFollowFetchStatus).toBe('error')
    expect(component.userFollowData).toEqual({ followers: [], following: [] })
  })

  it('should skip fetch when status already fetching', () => {
    const component = createComponent()
    component.activityUsersResult.like.fetchStatus = 'fetching'
    component.fetchActivityUsers(NsDiscussionForum.EActivityType.LIKE)
    expect(mockSocialSvc.fetchActivityUsers).not.toHaveBeenCalled()
  })

  it('should skip fetch when status already done', () => {
    const component = createComponent()
    component.activityUsersResult.like.fetchStatus = 'done'
    component.fetchActivityUsers(NsDiscussionForum.EActivityType.LIKE)
    expect(mockSocialSvc.fetchActivityUsers).not.toHaveBeenCalled()
  })

  it('should set data and hasMore when total exceeds users length', () => {
    mockSocialSvc.fetchActivityUsers.mockReturnValue(of({ total: 5, users: [{ id: 'u1' }] }))
    const component = createComponent()
    component.fetchActivityUsers(NsDiscussionForum.EActivityType.LIKE)
    expect(component.activityUsersResult.like.data).toEqual({ total: 5, users: [{ id: 'u1' }] })
    expect(component.activityUsersResult.like.fetchStatus).toBe('hasMore')
    expect(component.activityUsersFetchRequest.like.pgNo).toBe(1)
  })

  it('should append to existing data and set done when all fetched', () => {
    const component = createComponent()
    component.activityUsersResult.like.data = { total: 2, users: [{ id: 'u0' }] } as any
    mockSocialSvc.fetchActivityUsers.mockReturnValue(of({ total: 2, users: [{ id: 'u1' }] }))
    component.fetchActivityUsers(NsDiscussionForum.EActivityType.LIKE)
    expect((component.activityUsersResult.like.data as any).users.length).toBe(2)
    expect(component.activityUsersResult.like.fetchStatus).toBe('done')
  })

  it('should set none status when data has no total', () => {
    mockSocialSvc.fetchActivityUsers.mockReturnValue(of({ total: 0, users: [] }))
    const component = createComponent()
    component.fetchActivityUsers(NsDiscussionForum.EActivityType.LIKE)
    expect(component.activityUsersResult.like.fetchStatus).toBe('none')
  })

  it('should set none status on 404 error', () => {
    mockSocialSvc.fetchActivityUsers.mockReturnValue(throwError(() => ({ status: 404 })))
    const component = createComponent()
    component.fetchActivityUsers(NsDiscussionForum.EActivityType.LIKE)
    expect(component.activityUsersResult.like.fetchStatus).toBe('none')
  })

  it('should set error status on non-404 error', () => {
    mockSocialSvc.fetchActivityUsers.mockReturnValue(throwError(() => ({ status: 500 })))
    const component = createComponent()
    component.fetchActivityUsers(NsDiscussionForum.EActivityType.LIKE)
    expect(component.activityUsersResult.like.fetchStatus).toBe('error')
  })

  it('should return true from ifFollowing when user is followed', () => {
    const component = createComponent()
    component.userFollowData = { followers: [], following: [{ id: 'u1' } as any] }
    expect(component.ifFollowing('u1')).toBe(true)
  })

  it('should return false from ifFollowing when not followed or no data', () => {
    const component = createComponent()
    component.userFollowData = null
    expect(component.ifFollowing('u1')).toBe(false)
  })

  it('should follow a user', () => {
    const component = createComponent()
    component.userFollowData = { followers: [], following: [] }
    component.follow({ id: 'u2' } as any)
    expect(component.userFollowData.following.length).toBe(1)
    expect(mockUserSvc.followUser).toHaveBeenCalledWith({ followsourceid: 'user-1', followtargetid: 'u2' })
  })

  it('should not throw follow when userFollowData is null', () => {
    const component = createComponent()
    component.userFollowData = null
    expect(() => component.follow({ id: 'u2' } as any)).not.toThrow()
  })

  it('should unfollow a user', () => {
    const component = createComponent()
    component.userFollowData = { followers: [], following: [{ id: 'u2' } as any] }
    component.unFollow({ id: 'u2' } as any)
    expect(component.userFollowData.following.length).toBe(0)
    expect(mockUserSvc.unFollowUser).toHaveBeenCalledWith({ followsourceid: 'user-1', followtargetid: 'u2' })
  })

  it('should not throw unFollow when userFollowData is null', () => {
    const component = createComponent()
    component.userFollowData = null
    expect(() => component.unFollow({ id: 'u2' } as any)).not.toThrow()
  })

  it('should call follow via toggleFollow when not following', () => {
    const component = createComponent()
    component.userFollowData = { followers: [], following: [] }
    const followSpy = jest.spyOn(component, 'follow')
    component.toggleFollow({ id: 'u3' } as any)
    expect(followSpy).toHaveBeenCalled()
  })

  it('should call unFollow via toggleFollow when following', () => {
    const component = createComponent()
    component.userFollowData = { followers: [], following: [{ id: 'u3' } as any] }
    const unFollowSpy = jest.spyOn(component, 'unFollow')
    component.toggleFollow({ id: 'u3' } as any)
    expect(unFollowSpy).toHaveBeenCalled()
  })

  it('should fetch activity users on tab change when no data yet', () => {
    const component = createComponent()
    const spy = jest.spyOn(component, 'fetchActivityUsers')
    component.tabChange({ index: 1 } as any)
    expect(spy).toHaveBeenCalledWith(NsDiscussionForum.EActivityType.UPVOTE)
  })

  it('should not fetch activity users on tab change when data already present', () => {
    const component = createComponent()
    component.activityUsersResult.upvote.data = { total: 1, users: [] } as any
    const spy = jest.spyOn(component, 'fetchActivityUsers')
    component.tabChange({ index: 1 } as any)
    expect(spy).not.toHaveBeenCalled()
  })
})
