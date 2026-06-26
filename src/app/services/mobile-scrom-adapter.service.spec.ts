jest.mock('../../../project/ws/viewer/src/lib/plugins/html/SCORMAdapter/storage', () => ({
  Storage: class {
    key = ''
    contentKey = ''
    getItem = jest.fn().mockReturnValue(null)
    setItem = jest.fn()
    getAll = jest.fn().mockReturnValue({})
    setAll = jest.fn()
    clearAll = jest.fn()
  },
}))

jest.mock('../../../project/ws/viewer/src/lib/plugins/html/SCORMAdapter/errors', () => ({
  errorCodes: {
    101: { 101: { errorString: 'General Exception', diagnostic: 'General diagnostic' } },
    201: { 201: { errorString: 'Element Not Defined', diagnostic: 'Not defined' } },
    301: { 301: { errorString: 'Not Initialized', diagnostic: 'Not initialized' } },
  },
}))

jest.mock('../../../library/ws-widget/utils/src/lib/services/telemetry.service', () => ({
  TelemetryService: class {
    paramTriggerStart = jest.fn()
    paramTriggerEnd = jest.fn()
  },
}))

jest.mock('src/app/services/user-agent.service', () => ({
  UserAgentResolverService: class {
    getUserAgent = jest.fn().mockReturnValue({ browserName: 'Chrome', OS: 'Windows' })
  },
}))

jest.mock('../../../library/ws-widget/utils/src/public-api', () => ({
  LoggerService: class { log = jest.fn(); warn = jest.fn(); error = jest.fn() },
}))

jest.mock('../constants/apiConstants', () => ({
  API_END_POINTS: {
    CONTENT_STATE_READ: '/api/content/state/read',
    PROGRESS_UPDATE: '/api/content/state/update',
  },
}))

import { MobileScromAdapterService } from './mobile-scrom-adapter.service'
import { Storage } from '../../../project/ws/viewer/src/lib/plugins/html/SCORMAdapter/storage'
import { TelemetryService } from '../../../library/ws-widget/utils/src/lib/services/telemetry.service'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'

describe('MobileScromAdapterService', () => {
  let service: MobileScromAdapterService
  let mockStore: any
  let mockLogger: any

  beforeEach(() => {
    mockStore = new Storage()
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    const mockHttp = { post: jest.fn() }
    const mockTelemetrySvc = new TelemetryService()
    const mockRoute = { snapshot: { queryParamMap: { keys: [], get: jest.fn() } } }
    const mockUserAgentSvc = new UserAgentResolverService()

    service = new MobileScromAdapterService(
      mockHttp as any,
      mockStore,
      mockTelemetrySvc as any,
      mockRoute as any,
      mockUserAgentSvc as any,
      mockLogger as any,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('setProperty / getProperty', () => {
    it('sets and gets userId', () => {
      service.setProperty('userId', 'user-123')
      expect(service.getProperty('userId')).toBe('user-123')
    })

    it('sets and gets batchId', () => {
      service.setProperty('batchId', 'batch-abc')
      expect(service.getProperty('batchId')).toBe('batch-abc')
    })

    it('sets and gets courseId', () => {
      service.setProperty('courseId', 'course-xyz')
      expect(service.getProperty('courseId')).toBe('course-xyz')
    })

    it('sets and gets authorization token', () => {
      service.setProperty('authorization', 'Bearer token123')
      expect(service.getProperty('authorization')).toBe('Bearer token123')
    })

    it('returns empty string for a property that was not set', () => {
      expect(service.getProperty('userId')).toBe('')
    })

    it('overwrites an existing value', () => {
      service.setProperty('userId', 'old-id')
      service.setProperty('userId', 'new-id')
      expect(service.getProperty('userId')).toBe('new-id')
    })
  })

  describe('contentId getter/setter', () => {
    it('stores and returns the id', () => {
      service.contentId = 'content-abc'
      expect(service.contentId).toBe('content-abc')
    })

    it('assigns store.key when contentId is set', () => {
      service.contentId = 'content-xyz'
      expect(mockStore.key).toBe('content-xyz')
    })

    it('updates id on subsequent assignments', () => {
      service.contentId = 'first'
      service.contentId = 'second'
      expect(service.contentId).toBe('second')
    })
  })

  describe('getStatus', () => {
    it('returns 2 for completed lesson_status', () => {
      expect(service.getStatus({ 'cmi.core.lesson_status': 'completed' })).toBe(2)
    })

    it('returns 2 for passed lesson_status', () => {
      expect(service.getStatus({ 'cmi.core.lesson_status': 'passed' })).toBe(2)
    })

    it('returns 1 for incomplete lesson_status', () => {
      expect(service.getStatus({ 'cmi.core.lesson_status': 'incomplete' })).toBe(1)
    })

    it('returns 1 for not-attempted lesson_status', () => {
      expect(service.getStatus({ 'cmi.core.lesson_status': 'not-attempted' })).toBe(1)
    })

    it('returns 1 when lesson_status key is absent', () => {
      expect(service.getStatus({})).toBe(1)
    })
  })

  describe('getPercentage', () => {
    it('returns 100 for completed', () => {
      expect(service.getPercentage({ 'cmi.core.lesson_status': 'completed' })).toBe(100)
    })

    it('returns 100 for passed', () => {
      expect(service.getPercentage({ 'cmi.core.lesson_status': 'passed' })).toBe(100)
    })

    it('returns 0 for incomplete', () => {
      expect(service.getPercentage({ 'cmi.core.lesson_status': 'incomplete' })).toBe(0)
    })

    it('returns 0 for absent lesson_status', () => {
      expect(service.getPercentage({})).toBe(0)
    })
  })

  describe('convertDurationToEpoch', () => {
    it('returns current epoch + duration in seconds', () => {
      const spy = jest.spyOn(Date, 'now').mockReturnValue(0)
      // 1:30:00.0 → 1*3600 + 30*60 + 0 + 0/1000 = 5400
      const result = service.convertDurationToEpoch('1:30:00.0')
      expect(result).toBeCloseTo(5400, 0)
      spy.mockRestore()
    })

    it('includes the current epoch in the result', () => {
      const fakeNow = 1_000_000_000_000 // epoch in ms
      const spy = jest.spyOn(Date, 'now').mockReturnValue(fakeNow)
      const result = service.convertDurationToEpoch('0:00:00.0')
      expect(result).toBeCloseTo(fakeNow / 1000, 0)
      spy.mockRestore()
    })

    it('handles zero duration', () => {
      const spy = jest.spyOn(Date, 'now').mockReturnValue(0)
      expect(service.convertDurationToEpoch('0:00:00.0')).toBe(0)
      spy.mockRestore()
    })
  })

  describe('LMSGetLastError', () => {
    it('returns empty string when store returns null', () => {
      mockStore.getItem.mockReturnValue(null)
      expect(service.LMSGetLastError()).toBe('')
    })

    it('returns empty string for an empty errors array', () => {
      mockStore.getItem.mockReturnValue('[]')
      expect(service.LMSGetLastError()).toBe('')
    })

    it('pops and returns the last error code from the array', () => {
      mockStore.getItem.mockReturnValue('[301, 201]')
      expect(service.LMSGetLastError()).toBe(201)
    })

    it('returns the only element when array has one error', () => {
      mockStore.getItem.mockReturnValue('[101]')
      expect(service.LMSGetLastError()).toBe(101)
    })
  })

  describe('setProperties', () => {
    it('should set multiple properties at once', () => {
      service.setProperties({ userId: 'u1', batchId: 'b1', courseId: 'c1' })
      expect(service.getProperty('userId')).toBe('u1')
      expect(service.getProperty('batchId')).toBe('b1')
      expect(service.getProperty('courseId')).toBe('c1')
    })
  })

  describe('LMSInitialize', () => {
    it('should return true', () => {
      expect(service.LMSInitialize()).toBe(true)
    })

    it('should call store.setItem with Initialized true', () => {
      service.LMSInitialize()
      expect(mockStore.setItem).toHaveBeenCalledWith('Initialized', true)
    })

    it('should set store.contentKey to contentId', () => {
      service.contentId = 'content-123'
      service.LMSInitialize()
      expect(mockStore.contentKey).toBe('content-123')
    })
  })

  describe('LMSFinish', () => {
    it('should return false when not initialized', () => {
      mockStore.getItem.mockReturnValue(null)
      expect(service.LMSFinish()).toBe(false)
    })

    it('should call store.clearAll when initialized', () => {
      mockStore.getItem.mockImplementation((key: string) => {
        if (key === 'Initialized') return true
        return null
      })
      mockStore.getAll.mockReturnValue(null)
      service.LMSFinish()
      expect(mockStore.clearAll).toHaveBeenCalled()
    })
  })

  describe('LMSGetValue', () => {
    it('should return false when not initialized', () => {
      mockStore.getItem.mockReturnValue(null)
      expect(service.LMSGetValue('cmi.core.lesson_status')).toBe(false)
    })

    it('should return empty string when value not found', () => {
      mockStore.getItem.mockReturnValue(true)
      mockStore.getAll.mockReturnValue({})
      expect(service.LMSGetValue('cmi.core.lesson_status')).toBe('')
    })

    it('should return value when found', () => {
      mockStore.getItem.mockReturnValue(true)
      mockStore.getAll.mockReturnValue({ 'cmi.core.lesson_status': 'completed' })
      expect(service.LMSGetValue('cmi.core.lesson_status')).toBe('completed')
    })
  })

  describe('LMSSetValue', () => {
    it('should return false when not initialized', () => {
      mockStore.getItem.mockReturnValue(null)
      expect(service.LMSSetValue('cmi.core.lesson_status', 'completed')).toBe(false)
    })

    it('should call store.setItem and return getItem result when initialized', () => {
      mockStore.getItem.mockImplementation((key: string) => {
        if (key === 'Initialized') return true
        return 'completed'
      })
      const result = service.LMSSetValue('cmi.core.lesson_status', 'completed')
      expect(mockStore.setItem).toHaveBeenCalledWith('cmi.core.lesson_status', 'completed')
      expect(result).toBe('completed')
    })
  })

  describe('postCordovaMessage', () => {
    it('should throw error when webkit is not available', () => {
      expect(() => service.postCordovaMessage(50)).toThrow('Cordova IAB postMessage API not found!')
    })
  })

  describe('LMSGetErrorString', () => {
    it('should return errorString for known code', () => {
      const result = service.LMSGetErrorString(101)
      expect(result).toBe('General Exception')
    })

    it('should return empty string for unknown code', () => {
      expect(service.LMSGetErrorString(999)).toBe('')
    })
  })

  describe('LMSGetDiagnostic', () => {
    it('should return diagnostic for known code', () => {
      const result = service.LMSGetDiagnostic(101)
      expect(result).toBe('General diagnostic')
    })

    it('should return empty string for unknown code', () => {
      expect(service.LMSGetDiagnostic(999)).toBe('')
    })
  })

  describe('LMSCommit', () => {
    it('should return false when store.getAll returns null', () => {
      mockStore.getItem.mockReturnValue(true)
      mockStore.getAll.mockReturnValue(null)
      expect(service.LMSCommit()).toBe(false)
    })

    it('should return false for data with other lesson status (calls updateScromProgress)', () => {
      const { of } = require('rxjs')
      mockStore.getItem.mockReturnValue(true)
      mockStore.getAll.mockReturnValue({ 'cmi.core.lesson_status': 'unknown', 'cmi.core.session_time': '0:01:00.0' })
      service['http'] = { post: jest.fn().mockReturnValue(of({ result: {} })) } as any
      expect(service.LMSCommit()).toBe(false)
    })
  })
})
