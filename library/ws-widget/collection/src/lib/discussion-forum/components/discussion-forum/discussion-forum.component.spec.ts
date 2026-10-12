import { of, throwError } from 'rxjs'
import { DiscussionForumComponent } from './discussion-forum.component'

const mockSnackBar: any = {
  open: jest.fn(),
}

const mockDiscussionSvc: any = {
  fetchTimelineData: jest.fn(),
  publishPost: jest.fn(),
  fetchAllPosts: jest.fn(),
}

const mockConfigSvc: any = {
  userProfile: {
    userId: 'user-1',
    email: 'user@test.com',
    userName: 'Test User',
  },
  restrictedFeatures: new Set<string>(),
}

function createComponent(): DiscussionForumComponent {
  const component = new DiscussionForumComponent(mockSnackBar, mockDiscussionSvc, mockConfigSvc)
  component.widgetData = { id: 'id-1', name: 'name-1', isDisabled: false, initialPostCount: undefined } as any
  return component
}

describe('DiscussionForumComponent', () => {
  let component: DiscussionForumComponent

  beforeEach(() => {
    jest.clearAllMocks()
    mockConfigSvc.restrictedFeatures = new Set<string>()
    mockDiscussionSvc.fetchTimelineData.mockReturnValue(of({}))
    component = createComponent()
  })

  it('should create and set user fields', () => {
    expect(component).toBeTruthy()
    expect(component.userId).toBe('user-1')
    expect(component.userEmail).toBe('user@test.com')
    expect(component.userName).toBe('Test User')
    expect(component.discussionRequest.userId).toBe('user-1')
    expect(component.conversationRequest.userId).toBe('user-1')
  })

  it('should not set user fields if no userProfile', () => {
    const svc = { restrictedFeatures: new Set() } as any
    const comp = new DiscussionForumComponent(mockSnackBar, mockDiscussionSvc, svc)
    expect(comp.userId).toBe('')
  })

  it('should set isRestricted true when feature restricted', () => {
    mockConfigSvc.restrictedFeatures = new Set(['disscussionForum'])
    component.ngOnInit()
    expect(component.isRestricted).toBe(true)
  })

  it('should fetch discussion when not restricted and not disabled', () => {
    mockConfigSvc.restrictedFeatures = new Set(['other'])
    const spy = jest.spyOn(component, 'fetchDiscussion')
    component.widgetData = { id: 'id-1', name: 'name-1', isDisabled: false, initialPostCount: 6 } as any
    component.ngOnInit()
    expect(component.isRestricted).toBe(false)
    expect(component.discussionRequest.pgSize).toBe(6)
    expect(component.discussionRequest.source).toEqual({ id: 'id-1', name: 'name-1' })
    expect(spy).toHaveBeenCalled()
  })

  it('should not fetch discussion when widgetData isDisabled', () => {
    mockConfigSvc.restrictedFeatures = new Set(['other'])
    const spy = jest.spyOn(component, 'fetchDiscussion')
    component.widgetData = { id: 'id-1', name: 'name-1', isDisabled: true } as any
    component.ngOnInit()
    expect(spy).not.toHaveBeenCalled()
  })

  it('should not fetch when restrictedFeatures is falsy', () => {
    mockConfigSvc.restrictedFeatures = undefined
    const spy = jest.spyOn(component, 'fetchDiscussion')
    component.ngOnInit()
    expect(component.isRestricted).toBe(true)
    expect(spy).not.toHaveBeenCalled()
  })

  it('should fetch discussion data and set hasMore', () => {
    mockDiscussionSvc.fetchTimelineData.mockReturnValue(of({ hits: 10, result: [{ id: '1' }] }))
    component.fetchDiscussion()
    expect(component.discussionResult.hits).toBe(10)
    expect(component.discussionResult.result.length).toBe(1)
    expect(component.discussionFetchStatus).toBe('hasMore')
    expect(component.discussionRequest.pgNo).toBe(1)
  })

  it('should fetch discussion data and set done when all fetched', () => {
    mockDiscussionSvc.fetchTimelineData.mockReturnValue(of({ hits: 1, result: [{ id: '1' }] }))
    component.fetchDiscussion()
    expect(component.discussionFetchStatus).toBe('done')
  })

  it('should reset result on refresh', () => {
    component.discussionResult = { hits: 5, result: [{ id: 'old' } as any] }
    mockDiscussionSvc.fetchTimelineData.mockReturnValue(of({ hits: 1, result: [{ id: 'new' }] }))
    component.fetchDiscussion(true)
    expect(component.discussionResult.result.length).toBe(1)
    expect(component.discussionResult.result[0].id).toBe('new')
    expect(component.discussionRequest.pgNo).toBe(0)
  })

  it('should set status none when no data and no existing results', () => {
    mockDiscussionSvc.fetchTimelineData.mockReturnValue(of({ hits: 0, result: [] }))
    component.fetchDiscussion()
    expect(component.discussionFetchStatus).toBe('none')
  })

  it('should not override status when data empty but results exist', () => {
    component.discussionResult = { hits: 1, result: [{ id: '1' } as any] }
    mockDiscussionSvc.fetchTimelineData.mockReturnValue(of({ hits: 0, result: [] }))
    component.fetchDiscussion()
    expect(component.discussionFetchStatus).toBe('fetching')
  })

  it('should set error status on fetchDiscussion error', () => {
    mockDiscussionSvc.fetchTimelineData.mockReturnValue(throwError(() => new Error('err')))
    component.fetchDiscussion()
    expect(component.discussionFetchStatus).toBe('error')
  })

  it('should publish conversation successfully', () => {
    mockDiscussionSvc.publishPost.mockReturnValue(of({}))
    const spy = jest.spyOn(component, 'fetchDiscussion')
    component.editorText = 'text'
    component.publishConversation('fail')
    expect(component.editorText).toBeUndefined()
    expect(component.isValidPost).toBe(false)
    expect(component.isPostingDiscussion).toBe(false)
    expect(spy).toHaveBeenCalledWith(true)
  })

  it('should handle publishConversation error', () => {
    mockDiscussionSvc.publishPost.mockReturnValue(throwError(() => new Error('err')))
    component.publishConversation('fail-msg')
    expect(mockSnackBar.open).toHaveBeenCalledWith('fail-msg')
    expect(component.isPostingDiscussion).toBe(false)
  })

  it('should delete post and decrement hits', () => {
    component.discussionFetchStatus = 'done'
    component.discussionResult = { hits: 2, result: [{ id: '1' } as any, { id: '2' } as any] }
    component.onDeletePost(0)
    expect(component.discussionResult.result.length).toBe(1)
    expect(component.discussionResult.hits).toBe(1)
    expect(component.discussionFetchStatus).toBe('done')
  })

  it('should set status none when last post deleted', () => {
    component.discussionResult = { hits: 1, result: [{ id: '1' } as any] }
    component.onDeletePost(0)
    expect(component.discussionFetchStatus).toBe('none')
  })

  it('should update editorText and isValidPost on text change', () => {
    component.onTextChange({ isValid: true, htmlText: 'abc' })
    expect(component.isValidPost).toBe(true)
    expect(component.editorText).toBe('abc')
  })

  it('should fetch all posts', () => {
    component.discussionResult = { hits: 1, result: [{ id: 'p1' } as any] }
    mockDiscussionSvc.fetchAllPosts.mockReturnValue(of({ p1: {} }))
    component.fetchAllPosts()
    expect(component.conversationRequest.postId).toEqual(['p1'])
    expect(component.discussionConverstionResult).toEqual(['p1'])
  })

  it('should toggle showCommentBox on cancelPost', () => {
    component.showCommentBox = false
    component.cancelPost()
    expect(component.showCommentBox).toBe(true)
  })
})
