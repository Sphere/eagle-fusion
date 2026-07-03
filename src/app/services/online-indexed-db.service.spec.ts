jest.mock('@ws-widget/utils', () => ({
  LoggerService: class {
    log = jest.fn()
    warn = jest.fn()
    error = jest.fn()
  },
}))

import { IndexedDBService } from './online-indexed-db.service'

describe('IndexedDBService', () => {
  let service: IndexedDBService
  const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }

  beforeEach(() => {
    service = new IndexedDBService(mockLogger as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('isIndexedDBSupported returns a boolean', () => {
    expect(typeof service.isIndexedDBSupported()).toBe('boolean')
  })

  it('isIndexedDBSupported returns false when indexedDB is not in window', () => {
    const original = (window as any).indexedDB
    delete (window as any).indexedDB
    expect(service.isIndexedDBSupported()).toBe(false)
    ;(window as any).indexedDB = original
  })
})
