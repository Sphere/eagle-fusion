import { of } from 'rxjs'
import { NotificationService } from './notification.service'

const mockApiService: any = {
  post: jest.fn().mockReturnValue(of({ success: true })),
}

const mockWorkFlowService: any = {
  getWorkFlow: jest.fn(),
  getNextStatus: jest.fn(),
  getOwner: jest.fn(),
  getActionName: jest.fn(),
  getOwnerName: jest.fn(),
}

const mockAccessService: any = {
  userId: 'user-1',
}

const mockInitService: any = {
  authAdditionalConfig: { allowNotification: true },
}

function createService(): NotificationService {
  return new NotificationService(
    mockApiService,
    mockWorkFlowService,
    mockAccessService,
    mockInitService,
  )
}

describe('NotificationService', () => {
  let service: NotificationService
  const baseContent: any = {
    identifier: 'c1',
    name: 'Content 1',
    category: 'Course',
    contentType: 'Resource',
    status: 'Draft',
    expiryDate: '2024-01-01',
    creatorContacts: [{ id: 'author-1' }],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockInitService.authAdditionalConfig = { allowNotification: true }
    service = createService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('triggerPushPullNotification', () => {
    it('returns empty observable when notifications not allowed', done => {
      mockInitService.authAdditionalConfig = { allowNotification: false }
      service.triggerPushPullNotification(baseContent, 'c', true).subscribe(res => {
        expect(res).toEqual({})
        done()
      })
    })

    it('sends content when approved and moving to next stage with a valid nextStateOwner', done => {
      const workFlow = ['Draft', 'Review', 'Approval', 'Live']
      mockWorkFlowService.getWorkFlow.mockReturnValue(workFlow)
      mockWorkFlowService.getNextStatus.mockReturnValue('Review')
      mockWorkFlowService.getOwner.mockImplementation((s: string) => (s === 'Review' ? 'reviewer' : 'author'))
      mockWorkFlowService.getActionName.mockReturnValue('Send for review')
      mockWorkFlowService.getOwnerName.mockReturnValue('Reviewer')
      const content: any = { ...baseContent, status: 'Draft', reviewer: [{ id: 'rev-1' }] }
      service.triggerPushPullNotification(content, 'comment', true).subscribe(res => {
        expect(res).toEqual({ success: true })
        expect(mockApiService.post).toHaveBeenCalled()
        done()
      })
    })

    it('returns empty observable when nextStateOwner list is empty on send stage', done => {
      const workFlow = ['Draft', 'Review', 'Approval', 'Live']
      mockWorkFlowService.getWorkFlow.mockReturnValue(workFlow)
      mockWorkFlowService.getNextStatus.mockReturnValue('Review')
      mockWorkFlowService.getOwner.mockImplementation((s: string) => (s === 'Review' ? 'reviewer' : 'author'))
      mockWorkFlowService.getActionName.mockReturnValue('Send for review')
      mockWorkFlowService.getOwnerName.mockReturnValue('Reviewer')
      const content: any = { ...baseContent, status: 'Draft', reviewer: [] }
      service.triggerPushPullNotification(content, 'comment', true).subscribe(res => {
        expect(res).toEqual({})
        done()
      })
    })

    it('approves content when reviewer sends to next stage mid-workflow', done => {
      const workFlow = ['Draft', 'Review', 'Approval', 'Live']
      mockWorkFlowService.getWorkFlow.mockReturnValue(workFlow)
      mockWorkFlowService.getNextStatus.mockReturnValue('Draft')
      mockWorkFlowService.getOwner.mockImplementation((s: string) => (s === 'Review' ? 'reviewer' : 'author'))
      mockWorkFlowService.getActionName.mockReturnValue('Approve')
      mockWorkFlowService.getOwnerName.mockReturnValue('Approver')
      const content: any = { ...baseContent, status: 'Review', reviewer: [{ id: 'rev-1' }], author: [{ id: 'app-1' }] }
      service.triggerPushPullNotification(content, 'comment', true).subscribe(res => {
        expect(res).toEqual({ success: true })
        expect(mockApiService.post).toHaveBeenCalled()
        done()
      })
    })

    it('returns empty observable when approved but neither send nor approve condition matches', done => {
      const workFlow = ['Draft', 'Review', 'Live']
      mockWorkFlowService.getWorkFlow.mockReturnValue(workFlow)
      mockWorkFlowService.getNextStatus.mockReturnValue('Live')
      mockWorkFlowService.getOwner.mockReturnValue('owner')
      mockWorkFlowService.getActionName.mockReturnValue('Publish')
      mockWorkFlowService.getOwnerName.mockReturnValue('Owner')
      const content: any = { ...baseContent, status: 'Review' }
      service.triggerPushPullNotification(content, 'comment', true).subscribe(res => {
        expect(res).toEqual({})
        done()
      })
    })

    it('rejects content when not approved', done => {
      mockWorkFlowService.getWorkFlow.mockReturnValue(['Draft', 'Review', 'Live'])
      mockWorkFlowService.getNextStatus.mockReturnValue('Draft')
      mockWorkFlowService.getOwner.mockReturnValue('author')
      mockWorkFlowService.getActionName.mockReturnValue('Reject')
      mockWorkFlowService.getOwnerName.mockReturnValue('Author')
      const content: any = { ...baseContent, status: 'Review' }
      service.triggerPushPullNotification(content, 'rejected', false).subscribe(res => {
        expect(res).toEqual({ success: true })
        expect(mockApiService.post).toHaveBeenCalled()
        done()
      })
    })
  })

  describe('publishContent', () => {
    it('builds the publish content payload', () => {
      const result = service.publishContent(baseContent, 'comment', ['pub-1'])
      expect(result['event-id']).toBe('publish_content')
      expect(result.recipients.publisher).toEqual(['pub-1'])
      expect(result.recipients.author).toEqual(['author-1'])
    })

    it('defaults author recipients to empty array when no creatorContacts', () => {
      const content = { ...baseContent, creatorContacts: undefined }
      const result = service.publishContent(content, 'c', [])
      expect(result.recipients.author).toEqual([])
    })
  })

  describe('approveContent', () => {
    it('builds approve content payload with pluralized actor names', () => {
      const result = service.approveContent(
        baseContent, 'c', 'Review', 'Approval', 'Reviewer', 'Approver',
        ['a1', 'a2'], ['n1'],
      )
      expect(result['event-id']).toBe('approve_content')
      expect(result['tag-value-pair']['#currentActor']).toBe('Reviewers')
      expect(result['tag-value-pair']['#nextActor']).toBe('Approver')
    })
  })

  describe('rejectContent', () => {
    it('builds reject content payload', () => {
      const result = service.rejectContent(baseContent, 'c', 'Review', 'Reviewer', ['r1'])
      expect(result['event-id']).toBe('reject_content')
      expect(result['tag-value-pair']['#currentActor']).toBe('Reviewer')
    })
  })

  describe('sendContent', () => {
    it('builds send content payload with pluralized next actor name', () => {
      const result = service.sendContent(baseContent, 'c', 'Review', 'Reviewer', ['r1', 'r2'])
      expect(result['event-id']).toBe('send_content')
      expect(result['tag-value-pair']['#nextActor']).toBe('Reviewers')
    })
  })

  describe('deleteContent', () => {
    it('returns empty observable when notifications not allowed', done => {
      mockInitService.authAdditionalConfig = { allowNotification: false }
      service.deleteContent(baseContent, 'c').subscribe(res => {
        expect(res).toEqual({})
        done()
      })
    })

    it('uses delete_live_content event when status is Live', done => {
      mockWorkFlowService.getActionName.mockReturnValue('Live Action')
      const content = { ...baseContent, status: 'Live' }
      service.deleteContent(content, 'c').subscribe(() => {
        expect(mockApiService.post).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ 'event-id': 'delete_live_content' }),
          false,
        )
        done()
      })
    })

    it('uses delete_non_live_content event when status is not Live', done => {
      mockWorkFlowService.getActionName.mockReturnValue(undefined)
      const content = { ...baseContent, status: 'Draft' }
      service.deleteContent(content, 'c').subscribe(() => {
        expect(mockApiService.post).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ 'event-id': 'delete_non_live_content' }),
          false,
        )
        done()
      })
    })
  })

  describe('markForDeletion', () => {
    it('returns empty observable when notifications not allowed', done => {
      mockInitService.authAdditionalConfig = { allowNotification: false }
      service.markForDeletion(baseContent, 'c').subscribe(res => {
        expect(res).toEqual({})
        done()
      })
    })

    it('posts mark_content_for_deletion payload', done => {
      service.markForDeletion(baseContent, 'c').subscribe(() => {
        expect(mockApiService.post).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ 'event-id': 'mark_content_for_deletion' }),
          false,
        )
        done()
      })
    })
  })

  describe('unpublishContent', () => {
    it('returns empty observable when notifications not allowed', done => {
      mockInitService.authAdditionalConfig = { allowNotification: false }
      service.unpublishContent(baseContent, 'c').subscribe(res => {
        expect(res).toEqual({})
        done()
      })
    })

    it('posts unpublish_content payload', done => {
      service.unpublishContent(baseContent, 'c').subscribe(() => {
        expect(mockApiService.post).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ 'event-id': 'unpublish_content' }),
          false,
        )
        done()
      })
    })
  })

  describe('moveToDraft', () => {
    it('returns empty observable when notifications not allowed', done => {
      mockInitService.authAdditionalConfig = { allowNotification: false }
      service.moveToDraft(baseContent, 'c').subscribe(res => {
        expect(res).toEqual({})
        done()
      })
    })

    it('posts move_content_to_draft payload', done => {
      mockWorkFlowService.getActionName.mockReturnValue('Review')
      service.moveToDraft(baseContent, 'c').subscribe(() => {
        expect(mockApiService.post).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ 'event-id': 'move_content_to_draft' }),
          false,
        )
        done()
      })
    })
  })

  describe('getApi', () => {
    it('delegates to apiService.post', done => {
      service.getApi({ foo: 'bar' }).subscribe(res => {
        expect(mockApiService.post).toHaveBeenCalledWith(expect.anything(), { foo: 'bar' }, false)
        expect(res).toEqual({ success: true })
        done()
      })
    })
  })
})
