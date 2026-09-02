import { of, throwError } from 'rxjs'
import { NsDiscussionForum } from '../../ws-discussion-forum.model'
import { BtnSocialVoteComponent } from './btn-social-vote.component'

const mockSnackBar: any = { open: jest.fn() }
const mockDialog: any = { open: jest.fn() }
const mockSocialSvc: any = { updateActivity: jest.fn() }
const mockConfigSvc: any = { userProfile: { userId: 'user-1' } }

function createComponent(): BtnSocialVoteComponent {
  const component = new BtnSocialVoteComponent(mockConfigSvc, mockSocialSvc, mockSnackBar, mockDialog)
  component.invalidUser = { nativeElement: { value: 'invalid msg' } } as any
  return component
}

function activity(): NsDiscussionForum.IPostActivity {
  return {
    userActivity: { upVote: false, downVote: false },
    activityData: { upVote: 0, downVote: 0 },
  } as any
}

describe('BtnSocialVoteComponent', () => {
  let component: BtnSocialVoteComponent

  beforeEach(() => {
    jest.clearAllMocks()
    mockSocialSvc.updateActivity.mockReturnValue(of({}))
    component = createComponent()
    component.postId = 'post-1'
    component.postCreatorId = 'creator-1'
  })

  it('should create and set userId', () => {
    expect(component).toBeTruthy()
    expect(component.userId).toBe('user-1')
  })

  it('should not set userId when no userProfile', () => {
    const configSvc: any = {}
    const comp = new BtnSocialVoteComponent(configSvc, mockSocialSvc, mockSnackBar, mockDialog)
    expect(comp.userId).toBe('')
  })

  it('should show snackbar and not upvote when postCreatorId equals userId', () => {
    component.postCreatorId = 'user-1'
    component.upVote('invalid msg')
    expect(mockSnackBar.open).toHaveBeenCalledWith('invalid msg')
    expect(mockSocialSvc.updateActivity).not.toHaveBeenCalled()
  })

  it('should call downVote when already upvoted', () => {
    component.activity = activity()
    component.activity.userActivity.upVote = true
    const spy = jest.spyOn(component, 'downVote')
    component.upVote('invalid msg')
    expect(spy).toHaveBeenCalledWith('invalid msg')
  })

  it('should upvote and decrement downVote when previously downvoted', () => {
    component.activity = activity()
    component.activity.userActivity.downVote = true
    component.activity.activityData.downVote = 1
    component.upVote('invalid msg')
    expect(component.activity.userActivity.downVote).toBe(false)
    expect(component.activity.activityData.downVote).toBe(0)
    expect(component.isUpdating).toBe(false)
  })

  it('should upvote and increment upVote when not previously downvoted', () => {
    component.activity = activity()
    component.upVote('invalid msg')
    expect(component.activity.userActivity.upVote).toBe(true)
    expect(component.activity.activityData.upVote).toBe(1)
    expect(component.isUpdating).toBe(false)
  })

  it('should upvote when activity is null', () => {
    component.activity = null
    component.upVote('invalid msg')
    expect(mockSocialSvc.updateActivity).toHaveBeenCalled()
    expect(component.isUpdating).toBe(false)
  })

  it('should set isUpdating false on upVote error', () => {
    mockSocialSvc.updateActivity.mockReturnValue(throwError(() => new Error('err')))
    component.activity = activity()
    component.upVote('invalid msg')
    expect(component.isUpdating).toBe(false)
  })

  it('should show snackbar and not downvote when postCreatorId equals userId', () => {
    component.postCreatorId = 'user-1'
    component.downVote('invalid msg')
    expect(mockSnackBar.open).toHaveBeenCalledWith('invalid msg')
    expect(mockSocialSvc.updateActivity).not.toHaveBeenCalled()
  })

  it('should call upVote when already downvoted', () => {
    component.activity = activity()
    component.activity.userActivity.downVote = true
    const spy = jest.spyOn(component, 'upVote')
    component.downVote('invalid msg')
    expect(spy).toHaveBeenCalledWith('invalid msg')
  })

  it('should downvote and decrement upVote when previously upvoted', () => {
    component.activity = activity()
    component.activity.userActivity.upVote = true
    component.activity.activityData.upVote = 1
    component.downVote('invalid msg')
    expect(component.activity.userActivity.upVote).toBe(false)
    expect(component.activity.activityData.upVote).toBe(0)
    expect(component.isUpdating).toBe(false)
  })

  it('should downvote and increment downVote when not previously upvoted', () => {
    component.activity = activity()
    component.downVote('invalid msg')
    expect(component.activity.userActivity.downVote).toBe(true)
    expect(component.activity.activityData.downVote).toBe(1)
    expect(component.isUpdating).toBe(false)
  })

  it('should not touch isUpdating when downVote succeeds but activity null', () => {
    component.activity = null
    component.downVote('invalid msg')
    expect(mockSocialSvc.updateActivity).toHaveBeenCalled()
  })

  it('should set isUpdating false on downVote error', () => {
    mockSocialSvc.updateActivity.mockReturnValue(throwError(() => new Error('err')))
    component.activity = activity()
    component.downVote('invalid msg')
    expect(component.isUpdating).toBe(false)
  })

  it('should open votes dialog with proper data', () => {
    component.openVotesDialog(NsDiscussionForum.EActivityType.UPVOTE)
    expect(mockDialog.open).toHaveBeenCalledWith(expect.anything(), {
      data: { postId: 'post-1', activityType: NsDiscussionForum.EActivityType.UPVOTE },
    })
  })
})
