jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {
    userProfile = { userId: 'user-123' }
  },
  LoggerService: class {
    log = jest.fn()
    warn = jest.fn()
    error = jest.fn()
  },
}))

import { LocalStorageService } from './local-storage.service'
import { ConfigurationsService, LoggerService } from '@ws-widget/utils'

describe('LocalStorageService', () => {
  let service: LocalStorageService
  let mockConfigSvc: any
  let mockLogger: any

  beforeEach(() => {
    localStorage.clear()
    mockConfigSvc = new ConfigurationsService()
    mockLogger = new LoggerService()
    service = new LocalStorageService(mockConfigSvc, mockLogger)
  })

  afterEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('numberOfNotificatios defaults to 0', () => {
    expect(service.numberOfNotificatios).toBe(0)
  })

  it('setNumberOfNotifications updates numberOfNotificatios', () => {
    service.setNumberOfNotifications(5)
    expect(service.numberOfNotificatios).toBe(5)
  })

  it('getNumberOfNotifications returns current count', () => {
    service.setNumberOfNotifications(3)
    expect(service.getNumberOfNotifications()).toBe(3)
  })

  describe('setLocalStorage', () => {
    it('stores value with userId prefix when userProfile is present', async () => {
      await service.setLocalStorage('myKey', { a: 1 })
      const stored = localStorage.getItem('user-123myKey')
      expect(stored).toBe(JSON.stringify({ a: 1 }))
    })

    it('stores value without userId prefix when userProfile is null', async () => {
      mockConfigSvc.userProfile = null
      await service.setLocalStorage('myKey', 'hello')
      expect(localStorage.getItem('myKey')).toBe('"hello"')
    })
  })

  describe('getLocalStorage', () => {
    it('retrieves and parses stored value with userId prefix', async () => {
      localStorage.setItem('user-123myKey', JSON.stringify({ x: 42 }))
      const result = await service.getLocalStorage('myKey')
      expect(result).toEqual({ x: 42 })
    })

    it('returns null when key is not found', async () => {
      const result = await service.getLocalStorage('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('deleteAllStorage', () => {
    it('clears all localStorage entries', async () => {
      localStorage.setItem('item1', 'v1')
      localStorage.setItem('item2', 'v2')
      await service.deleteAllStorage()
      expect(localStorage.length).toBe(0)
    })
  })

  describe('deleteOneStorage', () => {
    it('removes a specific key with userId prefix', async () => {
      localStorage.setItem('user-123myKey', 'value')
      await service.deleteOneStorage('myKey')
      expect(localStorage.getItem('user-123myKey')).toBeNull()
    })
  })
})
