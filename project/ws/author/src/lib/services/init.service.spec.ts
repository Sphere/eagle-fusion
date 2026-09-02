import { AuthInitService } from './init.service'

describe('AuthInitService', () => {
  let service: AuthInitService

  beforeEach(() => {
    service = new AuthInitService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('should default creationEntity to an empty Map', () => {
    expect(service.creationEntity instanceof Map).toBe(true)
    expect(service.creationEntity.size).toBe(0)
  })

  it('should allow setting all store fields', () => {
    service.authConfig = {} as any
    service.authMetaV2 = { key: 'value' }
    service.ordinals = ['a', 'b']
    service.authAdditionalConfig = { extra: true }
    service.collectionConfig = {} as any
    service.creationEntity.set('key', {} as any)
    service.optimizedWorkFlow = { allow: true, conditions: {} as any }
    service.workFlowTable = [{ conditions: {} as any, workFlow: ['step1'] }]
    service.ownerDetails = [{ status: ['active'], owner: 'owner1', name: 'Owner', relatedActions: ['edit'], actionName: 'action1' }]
    service.permissionDetails = [{ role: 'admin', editContent: { conditions: {} as any, enabledByDefault: true }, editMeta: { conditions: {} as any, enabledByDefault: false } }]

    expect(service.authMetaV2).toEqual({ key: 'value' })
    expect(service.ordinals).toEqual(['a', 'b'])
    expect(service.authAdditionalConfig).toEqual({ extra: true })
    expect(service.creationEntity.get('key')).toEqual({})
    expect(service.optimizedWorkFlow.allow).toBe(true)
    expect(service.workFlowTable[0].workFlow).toEqual(['step1'])
    expect(service.ownerDetails[0].owner).toBe('owner1')
    expect(service.permissionDetails[0].role).toBe('admin')
  })
})
