import { of, throwError } from 'rxjs'
import { NsDiscussionForum } from '../../ws-discussion-forum.model'
import { DiscussionReplyComponent } from './discussion-reply.component'

function createComponent(overrides: any = {}) {
  const dialogMock = {
    open: jest.fn().mockReturnValue({
      afterClosed: jest.fn().mockReturnValue(of(true)),
    }),
  }
  const snackBarMock = { open: jest.fn() }
  const configSvcMock = { userProfile: { userId: 'user-1' } }
  const discussionSvcMock = {
    updatePost: jest.fn().mockReturnValue(of({})),
  }
  const breakpointObserverMock = {
    observe: jest.fn().mockReturnValue(of({ matches: false })),
  }

  const component = new DiscussionReplyComponent(
    overrides.dialog || dialogMock as any,
    overrides.snackBar || snackBarMock as any,
    overrides.configSvc || configSvcMock as any,
    overrides.discussionSvc || discussionSvcMock as any,
    overrides.breakpointObserver || breakpointObserverMock as any,
  )
  return { component, dialogMock, snackBarMock, configSvcMock, discussionSvcMock, breakpointObserverMock }
}

describe('DiscussionReplyComponent', () => {
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

  describe('ngOnInit', () => {
    it('should set isSmall from breakpointObserver stream', () => {
      const breakpointObserverMock = { observe: jest.fn().mockReturnValue(of({ matches: true })) }
      const { component } = createComponent({ breakpointObserver: breakpointObserverMock })
      component.ngOnInit()
      expect(component.isSmall).toBe(true)
    })
  })

  describe('deletePost', () => {
    it('should emit deleteSuccess when dialog resolves with data', () => {
      const { component } = createComponent()
      component.reply = { id: 'reply-1' } as any
      const emitSpy = jest.spyOn(component.deleteSuccess, 'emit')
      component.deletePost('failed to delete')
      expect(emitSpy).toHaveBeenCalledWith(true)
    })

    it('should not emit when dialog resolves without data', () => {
      const dialogMock = { open: jest.fn().mockReturnValue({ afterClosed: jest.fn().mockReturnValue(of(false)) }) }
      const { component } = createComponent({ dialog: dialogMock })
      component.reply = { id: 'reply-1' } as any
      const emitSpy = jest.spyOn(component.deleteSuccess, 'emit')
      component.deletePost('failed to delete')
      expect(emitSpy).not.toHaveBeenCalled()
    })

    it('should show snackbar on dialog error', () => {
      const dialogMock = { open: jest.fn().mockReturnValue({ afterClosed: jest.fn().mockReturnValue(throwError(() => new Error('err'))) }) }
      const { component, snackBarMock } = createComponent({ dialog: dialogMock })
      component.reply = { id: 'reply-1' } as any
      component.deletePost('failed to delete')
      expect(snackBarMock.open).toHaveBeenCalledWith('failed to delete')
    })
  })

  describe('editReply', () => {
    it('should update post and reset edit state on success', () => {
      const { component, discussionSvcMock } = createComponent()
      component.reply = {
        id: 'reply-1',
        postContent: { body: 'old' },
        lastEdited: { dtLastEdited: '' },
        dtLastModified: '',
      } as any
      component.updatedBody = 'new body'
      component.editMode = true
      component.editReply('failed to edit')
      expect(component.reply.postContent.body).toBe('new body')
      expect(component.editMode).toBe(false)
      expect(discussionSvcMock.updatePost).toHaveBeenCalledWith(expect.objectContaining({
        editor: 'user-1',
        id: 'reply-1',
        postKind: NsDiscussionForum.EPostKind.REPLY,
      }))
      expect(component.updatedBody).toBeUndefined()
      expect(component.reply.lastEdited.dtLastEdited).toBeTruthy()
      expect(component.reply.dtLastModified).toBeTruthy()
    })

    it('should default body to empty string when updatedBody is undefined', () => {
      const { component } = createComponent()
      component.reply = { id: 'reply-1', postContent: { body: 'old' } } as any
      component.updatedBody = undefined
      component.editReply('failed to edit')
      expect(component.reply.postContent.body).toBe('')
    })

    it('should not update lastEdited when reply has none', () => {
      const { component } = createComponent()
      component.reply = { id: 'reply-1', postContent: { body: 'old' } } as any
      component.editReply('failed to edit')
      expect(component.reply.lastEdited).toBeUndefined()
      expect(component.reply.dtLastModified).toBeTruthy()
    })

    it('should re-enable editMode and show snackbar on update error', () => {
      const discussionSvcMock = { updatePost: jest.fn().mockReturnValue(throwError(() => new Error('fail'))) }
      const { component, snackBarMock } = createComponent({ discussionSvc: discussionSvcMock })
      component.reply = { id: 'reply-1', postContent: { body: 'old' } } as any
      component.editMode = false
      component.editReply('failed to edit')
      expect(component.editMode).toBe(true)
      expect(snackBarMock.open).toHaveBeenCalledWith('failed to edit')
    })
  })

  describe('onReplyTextChange', () => {
    it('should update replyPostEnabled and updatedBody', () => {
      const { component } = createComponent()
      component.onReplyTextChange({ isValid: true, htmlText: '<p>hi</p>' })
      expect(component.replyPostEnabled).toBe(true)
      expect(component.updatedBody).toBe('<p>hi</p>')
    })
  })

  describe('cancelReply', () => {
    it('should reset editMode and clear reply body', () => {
      const { component } = createComponent()
      component.reply = { postContent: { body: 'something' } } as any
      component.editMode = true
      component.cancelReply()
      expect(component.editMode).toBe(false)
      expect(component.reply.postContent.body).toBe('')
    })
  })
})
