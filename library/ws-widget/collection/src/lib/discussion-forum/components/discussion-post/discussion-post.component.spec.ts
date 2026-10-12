import { of, throwError } from 'rxjs'
import { NsDiscussionForum } from '../../ws-discussion-forum.model'
import { DiscussionPostComponent } from './discussion-post.component'

const mockDialogRef = {
  afterClosed: jest.fn().mockReturnValue(of(true)),
}

const mockDialog: any = {
  open: jest.fn().mockReturnValue(mockDialogRef),
}

const mockSnackBar: any = {
  open: jest.fn(),
}

const mockConfigSvc: any = {
  userProfile: {
    userId: 'user-1',
    email: 'user@test.com',
    userName: 'Test User',
  },
}

const mockDiscussionSvc: any = {
  updatePost: jest.fn(),
  publishPost: jest.fn(),
  fetchPost: jest.fn(),
}

function createComponent(): DiscussionPostComponent {
  const component = new DiscussionPostComponent(
    mockDialog,
    mockSnackBar,
    mockConfigSvc,
    mockDiscussionSvc,
  )
  component.post = {
    id: 'post-1',
    source: 'src-1',
    postContent: { title: 'title' },
    lastEdited: { dtLastEdited: '' },
    dtLastModified: '',
  } as any
  return component
}

describe('DiscussionPostComponent', () => {
  let component: DiscussionPostComponent

  beforeEach(() => {
    jest.clearAllMocks()
    mockDiscussionSvc.fetchPost.mockReturnValue(of({}))
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(component.userId).toBe('user-1')
    expect(component.userEmail).toBe('user@test.com')
    expect(component.userName).toBe('Test User')
    expect(component.conversationRequest.userId).toBe('user-1')
  })

  it('should not set user fields if no userProfile', () => {
    const svc = { userProfile: undefined } as any
    const comp = new DiscussionPostComponent(mockDialog, mockSnackBar, svc, mockDiscussionSvc)
    expect(comp.userId).toBe('')
  })

  it('should set postId and fetch replies on init', () => {
    const spy = jest.spyOn(component, 'fetchPostReplies')
    component.ngOnInit()
    expect(component.conversationRequest.postId).toBe('post-1')
    expect(spy).toHaveBeenCalled()
  })

  it('should open dialog and emit deleteSuccess on success', () => {
    const emitSpy = jest.spyOn(component.deleteSuccess, 'emit')
    component.deletePost('fail')
    expect(mockDialog.open).toHaveBeenCalled()
    expect(emitSpy).toHaveBeenCalledWith(true)
  })

  it('should not emit deleteSuccess when dialog returns falsy', () => {
    mockDialogRef.afterClosed.mockReturnValueOnce(of(false))
    const emitSpy = jest.spyOn(component.deleteSuccess, 'emit')
    component.deletePost('fail')
    expect(emitSpy).not.toHaveBeenCalled()
  })

  it('should open snackbar on dialog error', () => {
    mockDialogRef.afterClosed.mockReturnValueOnce(throwError(() => new Error('err')))
    component.deletePost('fail-msg')
    expect(mockSnackBar.open).toHaveBeenCalledWith('fail-msg')
  })

  it('should edit post successfully', () => {
    mockDiscussionSvc.updatePost.mockReturnValue(of({}))
    component.updatedBody = 'new body'
    component.editPost('fail')
    expect(component.post.postContent.title).toBe('new body')
    expect(component.editMode).toBe(false)
    expect(component.updatedBody).toBeUndefined()
    expect(component.post.lastEdited && component.post.lastEdited.dtLastEdited).not.toBe('')
  })

  it('should handle editPost error', () => {
    mockDiscussionSvc.updatePost.mockReturnValue(throwError(() => new Error('err')))
    component.editPost('fail-edit')
    expect(component.editMode).toBe(true)
    expect(mockSnackBar.open).toHaveBeenCalledWith('fail-edit')
  })

  it('should update postPublishEnabled and updatedBody on text change', () => {
    component.onTextChange({ isValid: true, htmlText: 'abc' })
    expect(component.postPublishEnabled).toBe(true)
    expect(component.updatedBody).toBe('abc')
  })

  it('should publish reply successfully', () => {
    mockDiscussionSvc.publishPost.mockReturnValue(of({}))
    const spy = jest.spyOn(component, 'fetchPostReplies')
    component.replyBody = 'reply text'
    component.publishReply('fail')
    expect(spy).toHaveBeenCalledWith(true)
    expect(component.isPostingReply).toBe(false)
    expect(component.isValidReply).toBe(false)
    expect(component.replyBody).toBeUndefined()
  })

  it('should handle publishReply error', () => {
    mockDiscussionSvc.publishPost.mockReturnValue(throwError(() => new Error('err')))
    component.publishReply('fail-reply')
    expect(mockSnackBar.open).toHaveBeenCalledWith('fail-reply')
    expect(component.isPostingReply).toBe(false)
  })

  it('should update reply text change fields', () => {
    component.onReplyTextChange({ isValid: true, htmlText: 'reply' })
    expect(component.isValidReply).toBe(true)
    expect(component.replyBody).toBe('reply')
  })

  it('should skip fetch when already fetching', () => {
    component.replyFetchStatus = 'fetching'
    component.fetchPostReplies()
    expect(mockDiscussionSvc.fetchPost).not.toHaveBeenCalled()
  })

  it('should reset pgNo and replies when forceNew', () => {
    mockDiscussionSvc.fetchPost.mockReturnValue(of({
      newPostCount: 1,
      replyPost: [{ id: 'r1' }],
      postCount: 0,
    }))
    component.postReplies = [{ id: 'old' } as any]
    component.fetchPostReplies(true)
    expect(component.isNewRepliesAvailable).toBe(true)
    expect(component.postReplies.length).toBe(1)
    expect(component.replyFetchStatus).toBe('done')
    expect(component.conversationRequest.pgNo).toBe(1)
  })

  it('should set hasMore status when postCount truthy', () => {
    mockDiscussionSvc.fetchPost.mockReturnValue(of({
      newPostCount: 0,
      replyPost: [{ id: 'r1' }],
      postCount: 5,
    }))
    component.fetchPostReplies()
    expect(component.replyFetchStatus).toBe('hasMore')
  })

  it('should set none status when no replies and no postCount', () => {
    mockDiscussionSvc.fetchPost.mockReturnValue(of({
      newPostCount: 0,
      replyPost: [],
      postCount: 0,
    }))
    component.postReplies = []
    component.fetchPostReplies()
    expect(component.replyFetchStatus).toBe('none')
  })

  it('should not touch state when fetchPost returns falsy', () => {
    mockDiscussionSvc.fetchPost.mockReturnValue(of(null))
    component.fetchPostReplies()
    expect(component.replyFetchStatus).toBe('fetching')
  })

  it('should set error status on fetchPostReplies error', () => {
    mockDiscussionSvc.fetchPost.mockReturnValue(throwError(() => new Error('err')))
    component.fetchPostReplies()
    expect(component.replyFetchStatus).toBe('error')
  })

  it('should remove reply on onDeleteReply', () => {
    component.postReplies = [{ id: '1' } as any, { id: '2' } as any]
    component.onDeleteReply(0)
    expect(component.postReplies.length).toBe(1)
    expect(component.postReplies[0].id).toBe('2')
  })

  it('should toggle replyPlaceholderToggler on cancelReply', () => {
    component.replyPlaceholderToggler = false
    component.cancelReply()
    expect(component.replyPlaceholderToggler).toBe(true)
  })

  it('should toggle showReplies', () => {
    component.showReplies = false
    component.toggleReplies()
    expect(component.showReplies).toBe(true)
  })

  it('should toggle replyPlaceholderToggler and scroll el on showCommentBox', () => {
    jest.useFakeTimers()
    const el = { scrollIntoView: jest.fn() } as unknown as HTMLElement
    component.showCommentBox(el)
    expect(component.replyPlaceholderToggler).toBe(true)
    jest.advanceTimersByTime(500)
    expect(el.scrollIntoView).toHaveBeenCalled()
    jest.useRealTimers()
  })
})
