import { of } from 'rxjs'
import { NsDiscussionForum } from '../../ws-discussion-forum.model'
import { BtnSocialLikeComponent } from './btn-social-like.component'

function createComponent(overrides: any = {}) {
  const configSvcMock = { userProfile: { userId: 'user-1' } }
  const socialSvcMock = { updateActivity: jest.fn().mockReturnValue(of({})) }
  const snackBarMock = { open: jest.fn() }
  const dialogMock = { open: jest.fn() }

  const component = new BtnSocialLikeComponent(
    overrides.configSvc || configSvcMock as any,
    overrides.socialSvc || socialSvcMock as any,
    overrides.snackBar || snackBarMock as any,
    overrides.dialog || dialogMock as any,
  )
  return { component, configSvcMock, socialSvcMock, snackBarMock, dialogMock }
}

describe('BtnSocialLikeComponent', () => {
  it('should create', () => {
    const { component } = createComponent()
    expect(component).toBeTruthy()
  })

  it('should set userId from configSvc.userProfile', () => {
    const { component } = createComponent()
    expect(component.userId).toBe('user-1')
  })

  it('should default userId when userProfile is absent', () => {
    const { component } = createComponent({ configSvc: {} })
    expect(component.userId).toBe('')
  })

  describe('updateLike', () => {
    it('should show snackbar and skip update when postCreatorId equals userId', () => {
      const { component, snackBarMock, socialSvcMock } = createComponent()
      component.postCreatorId = 'user-1'
      component.updateLike('cannot like own post')
      expect(snackBarMock.open).toHaveBeenCalledWith('cannot like own post')
      expect(socialSvcMock.updateActivity).not.toHaveBeenCalled()
    })

    it('should skip update when already updating', () => {
      const { component, socialSvcMock } = createComponent()
      component.postCreatorId = 'other-user'
      component.isUpdating = true
      component.updateLike('msg')
      expect(socialSvcMock.updateActivity).not.toHaveBeenCalled()
    })

    it('should call updateActivity with correct request and reset isUpdating', () => {
      const { component, socialSvcMock } = createComponent()
      component.postId = 'post-1'
      component.postCreatorId = 'other-user'
      component.updateLike('msg')
      expect(socialSvcMock.updateActivity).toHaveBeenCalledWith({
        id: 'post-1',
        userId: 'user-1',
        activityType: NsDiscussionForum.EActivityType.LIKE,
      })
      expect(component.isUpdating).toBe(false)
    })

    it('should unlike and decrement count when already liked', () => {
      const { component } = createComponent()
      component.postCreatorId = 'other-user'
      component.activity = {
        userActivity: { like: true },
        activityData: { like: 5 },
      } as any
      component.updateLike('msg')
      expect(component.activity.userActivity.like).toBe(false)
      expect(component.activity.activityData.like).toBe(4)
    })

    it('should like and increment count when not liked', () => {
      const { component } = createComponent()
      component.postCreatorId = 'other-user'
      component.activity = {
        userActivity: { like: false },
        activityData: { like: 2 },
      } as any
      component.updateLike('msg')
      expect(component.activity.userActivity.like).toBe(true)
      expect(component.activity.activityData.like).toBe(3)
    })

    it('should not touch activity when it is null', () => {
      const { component } = createComponent()
      component.postCreatorId = 'other-user'
      component.activity = null
      expect(() => component.updateLike('msg')).not.toThrow()
    })
  })

  describe('openLikesDialog', () => {
    it('should open the dialog with postId and activityType', () => {
      const { component, dialogMock } = createComponent()
      component.postId = 'post-1'
      component.openLikesDialog()
      expect(dialogMock.open).toHaveBeenCalledWith(expect.anything(), {
        data: { postId: 'post-1', activityType: NsDiscussionForum.EActivityType.LIKE },
      })
    })
  })
})
