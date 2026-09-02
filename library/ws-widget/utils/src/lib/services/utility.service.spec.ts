import { of } from 'rxjs'
import { UtilityService } from './utility.service'

describe('UtilityService', () => {
  let service: UtilityService
  let mockHttp: any
  let platform: any

  beforeEach(() => {
    mockHttp = { get: jest.fn().mockReturnValue(of({ ok: true })) }
    platform = { IOS: false, ANDROID: false }
    service = new UtilityService(mockHttp, platform)
    delete (window as any).appRef
    delete (window as any).webkit
  })

  afterEach(() => {
    delete (window as any).appRef
    delete (window as any).webkit
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('should expose a stable random id', () => {
    expect(service.randomId).toBe(1)
  })

  describe('getJson', () => {
    it('should delegate to HttpClient.get', done => {
      service.getJson<{ ok: boolean }>('/config.json').subscribe(res => {
        expect(res).toEqual({ ok: true })
        expect(mockHttp.get).toHaveBeenCalledWith('/config.json')
        done()
      })
    })
  })

  describe('getLeafNodes', () => {
    it('should return the node itself when it has no children', () => {
      const node = { identifier: 'a', children: null }
      expect(service.getLeafNodes(node, [])).toEqual([node])
    })

    it('should treat an empty children array as a leaf', () => {
      const node = { identifier: 'a', children: [] }
      expect(service.getLeafNodes(node, [])).toEqual([node])
    })

    it('should collect leaves depth-first across the whole tree', () => {
      const tree = {
        identifier: 'root',
        children: [
          { identifier: 'a', children: [{ identifier: 'a1', children: null }] },
          { identifier: 'b', children: null },
        ],
      }
      expect(service.getLeafNodes(tree as any, []).map(n => n.identifier)).toEqual(['a1', 'b'])
    })

    it('should append to a pre-seeded accumulator', () => {
      const seed = [{ identifier: 'seed', children: null }]
      const node = { identifier: 'a', children: null }
      expect(service.getLeafNodes(node, seed).map(n => n.identifier)).toEqual(['seed', 'a'])
    })
  })

  describe('getPath', () => {
    const tree = {
      identifier: 'root',
      children: [
        { identifier: 'a', children: [{ identifier: 'a1', children: null }] },
        { identifier: 'b', children: null },
      ],
    } as any

    it('should return the chain of nodes down to the target', () => {
      expect(service.getPath(tree, 'a1').map((n: any) => n.identifier)).toEqual(['root', 'a', 'a1'])
    })

    it('should return just the root when the root is the target', () => {
      expect(service.getPath(tree, 'root').map((n: any) => n.identifier)).toEqual(['root'])
    })

    it('should return a path to a shallow sibling', () => {
      expect(service.getPath(tree, 'b').map((n: any) => n.identifier)).toEqual(['root', 'b'])
    })

    it('should return an empty path when the id is not in the tree', () => {
      expect(service.getPath(tree, 'missing')).toEqual([])
    })

    it('should return an empty path for a null node', () => {
      expect(service.getPath(null as any, 'a')).toEqual([])
    })
  })

  describe('platform flags', () => {
    it('should report iOS from the platform service', () => {
      platform.IOS = true
      expect(service.isIos).toBe(true)
      expect(service.isMobile).toBe(true)
    })

    it('should report Android from the platform service', () => {
      platform.ANDROID = true
      expect(service.isAndroid).toBe(true)
      expect(service.isMobile).toBe(true)
    })

    it('should not report mobile on desktop', () => {
      expect(service.isMobile).toBe(false)
    })
  })

  describe('native app bridges', () => {
    it('should detect the android app bridge', () => {
      expect(service.isAndroidApp).toBe(false)
      ;(window as any).appRef = {}
      expect(service.isAndroidApp).toBe(true)
    })

    it('should return the iOS app handler when present', () => {
      const appRef = { postMessage: jest.fn() }
      ;(window as any).webkit = { messageHandlers: { appRef } }
      expect(service.iOsAppRef).toBe(appRef)
    })

    it('should return null when the webkit bridge is absent', () => {
      expect(service.iOsAppRef).toBeNull()
    })

    it('should return null when webkit has no message handlers', () => {
      ;(window as any).webkit = {}
      expect(service.iOsAppRef).toBeNull()
    })

    it('should return null when the handlers have no appRef', () => {
      ;(window as any).webkit = { messageHandlers: {} }
      expect(service.iOsAppRef).toBeNull()
    })
  })
})
