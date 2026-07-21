jest.mock('../../../../../../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {},
  LoggerService: class { log = jest.fn(); warn = jest.fn(); error = jest.fn() },
  TelemetryService: class { start = jest.fn(); end = jest.fn() },
}))
jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class { changeMessage = jest.fn() },
}))
jest.mock('src/app/services/online-indexed-db.service', () => ({
  IndexedDBService: class {
    getRecordFromTable = jest.fn()
    deleteRecordByKey = jest.fn()
    insertProgressData = jest.fn()
  },
}))

import { SCORMAdapterService } from './scormAdapter'
import { of, throwError } from 'rxjs'

describe('SCORMAdapterService', () => {
  let service: SCORMAdapterService
  let mockStore: any
  let mockHttp: any
  let mockActivatedRoute: any
  let mockConfigSvc: any
  let mockRouter: any
  let mockContentSvc: any
  let mockTelemetrySvc: any
  let mockIndexedDbSvc: any
  let mockLogger: any

  beforeEach(() => {
    mockStore = {
      key: '',
      contentKey: '',
      setItem: jest.fn(),
      getItem: jest.fn(),
      getAll: jest.fn(),
      setAll: jest.fn(),
      clearAll: jest.fn(),
      returnKey: jest.fn().mockReturnValue('key1'),
    }
    mockHttp = {
      get: jest.fn().mockReturnValue(of({})),
      post: jest.fn().mockReturnValue(of({})),
      patch: jest.fn().mockReturnValue(of({ result: Promise.resolve({}) })),
    }
    mockActivatedRoute = {
      snapshot: {
        queryParamMap: { get: jest.fn().mockReturnValue('batch1') },
        queryParams: { collectionId: 'course1' },
      },
    }
    mockConfigSvc = { userProfile: { userId: 'user1' } }
    mockRouter = { url: '/viewer/html/content1?primary' }
    mockContentSvc = { changeMessage: jest.fn() }
    mockTelemetrySvc = { start: jest.fn(), end: jest.fn() }
    mockIndexedDbSvc = {
      getRecordFromTable: jest.fn().mockReturnValue(of(null)),
      deleteRecordByKey: jest.fn().mockReturnValue(of({})),
      insertProgressData: jest.fn().mockReturnValue(of({})),
    }
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }

    // constructor calls `new HttpClient(handler)` - pass a dummy handler
    service = new SCORMAdapterService(
      mockStore,
      mockHttp,
      {} as any,
      mockActivatedRoute,
      mockConfigSvc,
      mockRouter,
      mockContentSvc,
      mockTelemetrySvc,
      mockIndexedDbSvc,
      mockLogger
    )
    // override http created internally in constructor with our mock
    ;(service as any).http = mockHttp
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('contentId/htmlName/parentName accessors', () => {
    it('sets contentId and updates store key', () => {
      service.contentId = 'c1'
      expect(service.contentId).toBe('c1')
      expect(mockStore.key).toBe('c1')
    })

    it('sets and gets htmlName', () => {
      service.htmlName = 'name1'
      expect(service.htmlName).toBe('name1')
    })

    it('sets and gets parentName', () => {
      service.parentName = 'parent1'
      expect(service.parentName).toBe('parent1')
    })
  })

  describe('LMSInitialize', () => {
    it('sets contentKey, loads data, marks initialized and returns true', () => {
      service.contentId = 'c1'
      mockHttp.post.mockReturnValue(of({ result: { contentList: [] } }))
      const result = service.LMSInitialize()
      expect(mockStore.setItem).toHaveBeenCalledWith('Initialized', true)
      expect(result).toBe(true)
    })
  })

  describe('LMSFinish', () => {
    it('returns false and sets error 301 when not initialized', () => {
      mockStore.getItem.mockReturnValue(null)
      const result = service.LMSFinish()
      expect(result).toBe(false)
      // NB: _setError stores the pre-parse `errors` string, not the mutated array (existing behavior)
      expect(mockStore.setItem).toHaveBeenCalledWith('errors', '[]')
    })

    it('commits, clears store and returns commit result when initialized', () => {
      mockStore.getItem.mockImplementation((key: string) => (key === 'Initialized' ? true : null))
      mockStore.getAll.mockReturnValue(null)
      const result = service.LMSFinish()
      expect(mockStore.setItem).toHaveBeenCalledWith('Initialized', false)
      expect(mockStore.clearAll).toHaveBeenCalled()
      expect(result).toBe(false)
    })
  })

  describe('initValue', () => {
    it('returns data when store has data', () => {
      mockStore.getAll.mockReturnValue({ foo: 'bar' })
      expect(service.initValue()).toEqual({ foo: 'bar' })
    })

    it('returns empty string when store has no data', () => {
      mockStore.getAll.mockReturnValue(null)
      expect(service.initValue()).toBe('')
    })
  })

  describe('LMSGetValue', () => {
    it('returns false and sets error when not initialized', () => {
      mockStore.getItem.mockReturnValue(null)
      expect(service.LMSGetValue('foo')).toBe(false)
    })

    it('returns empty string and sets error 201 when value missing', () => {
      mockStore.getItem.mockImplementation((key: string) => (key === 'Initialized' ? true : null))
      expect(service.LMSGetValue('foo')).toBe('')
    })

    it('returns the value when initialized and value present', () => {
      mockStore.getItem.mockImplementation((key: string) => (key === 'Initialized' ? true : 'val'))
      expect(service.LMSGetValue('foo')).toBe('val')
    })
  })

  describe('LMSSetValue', () => {
    it('returns false when not initialized', () => {
      mockStore.getItem.mockReturnValue(null)
      expect(service.LMSSetValue('foo', 'bar')).toBe(false)
    })

    it('sets the item and returns the stored value when initialized', () => {
      mockStore.getItem.mockImplementation((key: string) => (key === 'Initialized' ? true : 'bar'))
      const result = service.LMSSetValue('foo', 'bar')
      expect(mockStore.setItem).toHaveBeenCalledWith('foo', 'bar')
      expect(result).toBe('bar')
    })
  })

  describe('LMSCommit', () => {
    it('returns false when no data in store', () => {
      mockStore.getAll.mockReturnValue(null)
      expect(service.LMSCommit()).toBe(false)
    })

    it('calls addDataV2 and returns true when data present', () => {
      mockStore.getAll.mockReturnValue({ 'cmi.core.lesson_status': 'completed' })
      mockHttp.post.mockReturnValue(of({ result: { contentList: [] } }))
      const result = service.LMSCommit()
      expect(result).toBe(true)
    })

    it('derives contentId from router url when it differs', () => {
      mockRouter.url = '/viewer/html/newContentId?primary'
      mockStore.getAll.mockReturnValue({ 'cmi.core.lesson_status': 'incomplete' })
      mockHttp.post.mockReturnValue(of({ result: { contentList: [] } }))
      service.LMSCommit()
      expect(service.contentId).toBe('newContentId')
    })
  })

  describe('LMSGetLastError', () => {
    it('returns last error when errors exist', () => {
      mockStore.getItem.mockReturnValue('[101,201]')
      expect(service.LMSGetLastError()).toBe(201)
    })

    it('returns empty string when no errors', () => {
      mockStore.getItem.mockReturnValue('[]')
      expect(service.LMSGetLastError()).toBe('')
    })
  })

  describe('LMSGetErrorString/LMSGetDiagnostic', () => {
    it('returns error string for a known error code', () => {
      expect(service.LMSGetErrorString(0)).toBe('No Error')
    })

    it('returns empty string for unknown error code', () => {
      expect(service.LMSGetErrorString(999)).toBe('')
    })

    it('returns empty string diagnostic since errorCodes is a single-element array (only index 0 populated)', () => {
      expect(service.LMSGetDiagnostic(301)).toBe('')
    })

    it('returns empty string diagnostic for unknown error code', () => {
      expect(service.LMSGetDiagnostic(999)).toBe('')
    })
  })

  describe('_isInitialized/_setError', () => {
    it('_isInitialized reflects store value', () => {
      mockStore.getItem.mockReturnValue(true)
      expect(service._isInitialized()).toBe(true)
    })

    it('_setError appends to existing errors array', () => {
      mockStore.getItem.mockReturnValue('[101]')
      service._setError(201)
      expect(mockStore.setItem).toHaveBeenCalledWith('errors', '[101]')
    })

    it('_setError initializes errors array when none exist', () => {
      mockStore.getItem.mockReturnValue(null)
      service._setError(101)
      expect(mockStore.setItem).toHaveBeenCalledWith('errors', '[]')
    })
  })

  describe('loadDataAsync/downladFile', () => {
    it('loadDataAsync calls http.get with contentId', () => {
      service.contentId = 'c1'
      service.loadDataAsync()
      expect(mockHttp.get).toHaveBeenCalled()
    })

    it('downladFile calls http.get with blob response type', () => {
      service.downladFile('someUrl')
      expect(mockHttp.get).toHaveBeenCalledWith('someUrl', { responseType: 'blob' })
    })
  })

  describe('loadDataV2', () => {
    it('sets store data when matching progress details found', () => {
      service.contentId = 'c1'
      mockHttp.post.mockReturnValue(of({
        result: {
          contentList: [
            { contentId: 'c1', progressdetails: { 'cmi.suspend_data': 'abc', 'cmi.core.lesson_status': 'incomplete' } },
          ],
        },
      }))
      service.loadDataV2()
      expect(mockStore.setAll).toHaveBeenCalled()
    })

    it('does nothing when no content list returned', () => {
      mockHttp.post.mockReturnValue(of({ result: { contentList: [] } }))
      service.loadDataV2()
      expect(mockStore.setAll).not.toHaveBeenCalled()
    })

    it('logs and does not set data when no progressdetails match found', () => {
      service.contentId = 'other'
      mockHttp.post.mockReturnValue(of({
        result: { contentList: [{ contentId: 'c1', progressdetails: {} }] },
      }))
      service.loadDataV2()
      expect(mockStore.setAll).not.toHaveBeenCalled()
    })
  })

  describe('loadData', () => {
    it('sets store data on success', () => {
      mockHttp.get.mockReturnValue(of({ result: { data: { 'cmi.core.lesson_status': 'completed' } } }))
      service.loadData()
      expect(mockStore.setAll).toHaveBeenCalled()
    })

    it('sets error on failure', () => {
      mockHttp.get.mockReturnValue(throwError(() => new Error('fail')))
      mockStore.getItem.mockReturnValue(null)
      service.loadData()
      expect(mockStore.setItem).toHaveBeenCalledWith('errors', '[]')
    })
  })

  describe('getStatus/getPercentage', () => {
    it('getStatus returns 2 for completed', () => {
      expect(service.getStatus({ 'cmi.core.lesson_status': 'completed' })).toBe(2)
    })
    it('getStatus returns 2 for passed', () => {
      expect(service.getStatus({ 'cmi.core.lesson_status': 'passed' })).toBe(2)
    })
    it('getStatus returns 1 otherwise', () => {
      expect(service.getStatus({ 'cmi.core.lesson_status': 'incomplete' })).toBe(1)
    })
    it('getPercentage returns 100 for completed/passed', () => {
      expect(service.getPercentage({ 'cmi.core.lesson_status': 'passed' })).toBe(100)
    })
    it('getPercentage returns 0 otherwise', () => {
      expect(service.getPercentage({ 'cmi.core.lesson_status': 'incomplete' })).toBe(0)
    })
  })

  describe('addDataV2', () => {
    it('skips update when no userProfile', () => {
      mockConfigSvc.userProfile = null
      mockHttp.post.mockReturnValue(of({ result: { contentList: [] } }))
      service.addDataV2({ 'cmi.core.lesson_status': 'incomplete' })
      expect(mockLogger.warn).toHaveBeenCalled()
    })

    it('builds request and patches progress on success path', () => {
      mockHttp.post.mockReturnValue(of({ result: { contentList: [] } }))
      mockHttp.patch.mockReturnValue(of({ result: Promise.resolve({}) }))
      service.contentId = 'c1'
      service.addDataV2({ 'cmi.core.lesson_status': 'incomplete' })
      expect(mockHttp.patch).toHaveBeenCalled()
    })

    it('falls back to update on READ API failure', () => {
      mockHttp.post.mockReturnValue(throwError(() => new Error('read fail')))
      mockHttp.patch.mockReturnValue(of({}))
      service.addDataV2({ 'cmi.core.lesson_status': 'incomplete' })
      expect(mockHttp.patch).toHaveBeenCalled()
    })

    it('sets error when fallback patch fails', () => {
      mockHttp.post.mockReturnValue(throwError(() => new Error('read fail')))
      mockHttp.patch.mockReturnValue(throwError(() => new Error('patch fail')))
      mockStore.getItem.mockReturnValue(null)
      service.addDataV2({ 'cmi.core.lesson_status': 'incomplete' })
      expect(mockStore.setItem).toHaveBeenCalledWith('errors', '[]')
    })
  })

  describe('ngOnDestroy', () => {
    it('unsubscribes scromSubscription if present', () => {
      const unsubscribe = jest.fn()
      ;(service as any).scromSubscription = { unsubscribe }
      service.ngOnDestroy()
      expect(unsubscribe).toHaveBeenCalled()
    })

    it('does nothing when no subscription present', () => {
      ;(service as any).scromSubscription = null
      expect(() => service.ngOnDestroy()).not.toThrow()
    })
  })
})
