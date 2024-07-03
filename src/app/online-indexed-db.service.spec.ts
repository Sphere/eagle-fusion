import { TestBed } from '@angular/core/testing'
import { IndexedDBService } from './online-indexed-db.service'
import { of } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { fakeAsync, tick } from '@angular/core/testing'

describe('IndexedDBService', () => {
  let service: IndexedDBService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.get(IndexedDBService)
  })

  afterEach(() => {
    jest.restoreAllMocks() // Clean up mocks after each test
    delete (window as any).indexedDB // Clean up the indexedDB mock
  })

  it('should return true if IndexedDB is supported', () => {
    const mockWindow = { indexedDB: {} }
    Object.defineProperty(window, 'indexedDB', { value: mockWindow.indexedDB, configurable: true })

    const isSupported = service.isIndexedDBSupported()
    expect(isSupported).toBe(true)
  })

  it('should return false if IndexedDB is not supported', () => {
    // Mock IndexedDB not being supported
    const originalIndexedDB = (window as any).indexedDB
    delete (window as any).indexedDB

    const isSupported = service.isIndexedDBSupported()
    expect(isSupported).toBe(false);

    // Restore original IndexedDB
    (window as any).indexedDB = originalIndexedDB
  })

  it('should emit an error if IndexedDB is not supported', (done) => {
    jest.spyOn(service, 'isIndexedDBSupported').mockReturnValue(false)

    service.openOrCreateDatabase().pipe(
      catchError((error) => {
        expect(error).toBe('IndexedDB is not supported')
        done()
        return of(null)
      })
    ).subscribe()
  })

  it('should emit the database if IndexedDB is supported and tables exist', fakeAsync(() => {
    jest.spyOn(service, 'isIndexedDBSupported').mockReturnValue(true)

    const mockDb = {
      transaction: jest.fn().mockReturnValue({
        objectStore: jest.fn().mockImplementation((storeName) => {
          if (storeName === 'onlineCourseProgress' || storeName === 'userEnrollCourse') {
            return {}
          }
          return null
        }),
      }),
      objectStoreNames: {
        contains: jest.fn().mockImplementation((storeName) => {
          return storeName === 'onlineCourseProgress' || storeName === 'userEnrollCourse'
        }),
      },
    }

    const mockRequest = {
      onupgradeneeded: jest.fn(),
      onsuccess: jest.fn(),
      onerror: jest.fn(),
      result: mockDb,
    }

    // Mocking indexedDB.open method
    Object.defineProperty(window, 'indexedDB', {
      value: {
        open: jest.fn().mockReturnValue(mockRequest)
      },
      configurable: true
    })

    service.openOrCreateDatabase().subscribe((db) => {
      expect(db).toBe(mockDb)
    })

    // Simulate the success callback
    setTimeout(() => {
      mockRequest.onsuccess({ target: mockRequest })
    }, 0)

    tick()
  }))

  it('should emit an error if one or both required tables do not exist', fakeAsync(() => {
    jest.spyOn(service, 'isIndexedDBSupported').mockReturnValue(true)

    const mockDb = {
      transaction: jest.fn().mockReturnValue({
        objectStore: jest.fn().mockImplementation((storeName) => {
          if (storeName === 'onlineCourseProgress') {
            return {}
          }
          return null
        }),
      }),
      objectStoreNames: {
        contains: jest.fn().mockImplementation((storeName) => {
          return storeName === 'onlineCourseProgress'
        }),
      },
    }

    const mockRequest = {
      onupgradeneeded: jest.fn(),
      onsuccess: jest.fn(),
      onerror: jest.fn(),
      result: mockDb,
    }

    // Mocking indexedDB.open method
    Object.defineProperty(window, 'indexedDB', {
      value: {
        open: jest.fn().mockReturnValue(mockRequest)
      },
      configurable: true
    })

    service.openOrCreateDatabase().pipe(
      catchError((error) => {
        expect(error).toBe('One or both required tables do not exist')
        return of(null)
      })
    ).subscribe()

    // Simulate the success callback
    setTimeout(() => {
      mockRequest.onsuccess({ target: mockRequest })
    }, 0)

    tick()
  }))

  it('should emit an error if there is an error opening the database', fakeAsync(() => {
    jest.spyOn(service, 'isIndexedDBSupported').mockReturnValue(true)

    const mockRequest = {
      onupgradeneeded: jest.fn(),
      onsuccess: jest.fn(),
      onerror: jest.fn(),
    }

    // Mocking indexedDB.open method
    Object.defineProperty(window, 'indexedDB', {
      value: {
        open: jest.fn().mockReturnValue(mockRequest)
      },
      configurable: true
    })

    service.openOrCreateDatabase().pipe(
      catchError((error) => {
        expect(error).toBe('Failed to open or create IndexedDB')
        return of(null)
      })
    ).subscribe()

    // Simulate the error callback
    setTimeout(() => {
      mockRequest.onerror({ target: { error: 'Failed to open or create IndexedDB' } })
    }, 0)

    tick()
  }))
})
