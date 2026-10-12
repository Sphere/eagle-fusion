import { WorkFlowService } from './work-flow.service'

describe('WorkFlowService', () => {
  let service: WorkFlowService
  let mockInitService: any
  let mockConditionService: any
  let mockAccessControlSvc: any

  beforeEach(() => {
    mockInitService = {
      workFlowTable: [
        { conditions: {}, workFlow: ['Draft', 'Review', 'Approved', 'Live'] },
      ],
      optimizedWorkFlow: { allow: false, conditions: {} },
      ownerDetails: [
        { status: ['Review'], owner: 'reviewers', actionName: 'Send for review', name: 'Reviewer' },
        { status: ['Approved'], owner: 'approvers', actionName: 'Approve', name: 'Approver' },
      ],
    }
    mockConditionService = { checkConditionV2: jest.fn().mockReturnValue(true) }
    mockAccessControlSvc = { userId: 'user-1' }
    service = new WorkFlowService(mockInitService, mockConditionService, mockAccessControlSvc)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('getWorkFlow', () => {
    it('returns the workflow array matching the condition', () => {
      const result = service.getWorkFlow({ status: 'Draft' } as any)
      expect(result).toEqual(['Draft', 'Review', 'Approved', 'Live'])
      expect(mockConditionService.checkConditionV2).toHaveBeenCalled()
    })
  })

  describe('isOptimised', () => {
    it('returns false when optimizedWorkFlow.allow is false', () => {
      mockInitService.optimizedWorkFlow.allow = false
      expect(service.isOptimised({ status: 'Draft' } as any)).toBe(false)
    })

    it('returns true when allow is true and condition matches', () => {
      mockInitService.optimizedWorkFlow.allow = true
      mockConditionService.checkConditionV2.mockReturnValue(true)
      expect(service.isOptimised({ status: 'Draft' } as any)).toBe(true)
    })

    it('returns false when allow is true but condition does not match', () => {
      mockInitService.optimizedWorkFlow.allow = true
      mockConditionService.checkConditionV2.mockReturnValue(false)
      expect(service.isOptimised({ status: 'Draft' } as any)).toBe(false)
    })
  })

  describe('getOwner / getActionName / getOwnerName', () => {
    it('returns the owner for a matching status', () => {
      expect(service.getOwner('Review')).toBe('reviewers')
    })

    it('returns the action name for a matching status', () => {
      expect(service.getActionName('Approved')).toBe('Approve')
    })

    it('returns the owner name for a matching status', () => {
      expect(service.getOwnerName('Review')).toBe('Reviewer')
    })
  })

  describe('getNextStatus', () => {
    it('returns Live when the workflow has 3 or fewer steps', () => {
      mockInitService.workFlowTable = [{ conditions: {}, workFlow: ['Draft', 'Live'] }]
      const result = service.getNextStatus({ status: 'Draft' } as any)
      expect(result).toBe('Live')
    })

    it('advances to the next status when not optimised', () => {
      jest.spyOn(service, 'isOptimised').mockReturnValue(false)
      const result = service.getNextStatus({ status: 'Draft' } as any)
      expect(result).toBe('Review')
    })

    it('resets index to 1 when optimised and current index is 0', () => {
      jest.spyOn(service, 'isOptimised').mockReturnValue(true)
      jest.spyOn(service, 'getOwner').mockReturnValue(null)
      const result = service.getNextStatus({ status: 'Draft' } as any)
      expect(result).toBe('Review')
    })

    it('resets index to 1 when optimised and current index is last', () => {
      jest.spyOn(service, 'isOptimised').mockReturnValue(true)
      jest.spyOn(service, 'getOwner').mockReturnValue(null)
      const result = service.getNextStatus({ status: 'Live' } as any)
      expect(result).toBe('Review')
    })

    it('increments index by 1 when optimised and in the middle of the workflow', () => {
      jest.spyOn(service, 'isOptimised').mockReturnValue(true)
      jest.spyOn(service, 'getOwner').mockReturnValue(null)
      const result = service.getNextStatus({ status: 'Review' } as any)
      expect(result).toBe('Approved')
    })

    it('skips over statuses owned by the current user', () => {
      jest.spyOn(service, 'isOptimised').mockReturnValue(true)
      jest.spyOn(service, 'getOwner').mockImplementation((status: string) => (status === 'Review' ? 'reviewers' : null))
      const content: any = { status: 'Draft', reviewers: [{ id: 'user-1' }] }
      const result = service.getNextStatus(content)
      expect(result).toBe('Approved')
    })

    it('stops at a status not owned by the current user', () => {
      jest.spyOn(service, 'isOptimised').mockReturnValue(true)
      jest.spyOn(service, 'getOwner').mockImplementation((status: string) => (status === 'Review' ? 'reviewers' : null))
      const content: any = { status: 'Draft', reviewers: [{ id: 'other-user' }] }
      const result = service.getNextStatus(content)
      expect(result).toBe('Review')
    })
  })
})
