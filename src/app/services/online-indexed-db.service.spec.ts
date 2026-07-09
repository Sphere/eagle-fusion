jest.mock('@ws-widget/utils', () => ({
  LoggerService: class {
    log = jest.fn()
    warn = jest.fn()
    error = jest.fn()
  },
}))

import { IndexedDBService } from './online-indexed-db.service'

class FakeIDBRequest {
  onsuccess: ((event: any) => void) | null = null
  onerror: ((event: any) => void) | null = null
  onupgradeneeded: ((event: any) => void) | null = null
  result: any

  triggerSuccess(result?: any) {
    this.result = result
    if (this.onsuccess) {
      this.onsuccess({ target: { result } })
    }
  }

  triggerError(error?: any) {
    if (this.onerror) {
      this.onerror({ target: { error } })
    }
  }

  triggerUpgrade(result: any) {
    this.result = result
    if (this.onupgradeneeded) {
      this.onupgradeneeded({ target: { result } })
    }
  }
}

const makeFakeStore = () => {
  const requests: { [method: string]: FakeIDBRequest } = {}
  const store: any = { requests }
  const methods = ['get', 'put', 'delete', 'getAll', 'openCursor']
  methods.forEach(method => {
    store[method] = jest.fn(() => {
      const req = new FakeIDBRequest()
      requests[method] = req
      return req
    })
  })
  store.createIndex = jest.fn()
  store.index = jest.fn(() => store)
  return store
}

const makeFakeDb = (storeNames: string[] = ['onlineCourseProgress', 'userEnrollCourse']) => {
  const store = makeFakeStore()
  const transaction: any = {
    objectStore: jest.fn(() => store),
    oncomplete: null,
  }
  const db: any = {
    objectStoreNames: { contains: jest.fn((name: string) => storeNames.indexOf(name) !== -1) },
    transaction: jest.fn(() => transaction),
    createObjectStore: jest.fn(() => store),
  }
  return { db, store, transaction }
}

const flushPromises = () => new Promise<void>(resolve => setTimeout(resolve, 0))

describe('IndexedDBService', () => {
  let service: IndexedDBService
  const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
  let openRequests: FakeIDBRequest[]
  let alertSpy: jest.SpyInstance

  const lastOpenRequest = () => openRequests[openRequests.length - 1]

  beforeEach(() => {
    service = new IndexedDBService(mockLogger as any)
    openRequests = []
    ;(window as any).indexedDB = {
      open: jest.fn(() => {
        const req = new FakeIDBRequest()
        openRequests.push(req)
        return req
      }),
    }
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => undefined)
  })

  afterEach(() => {
    alertSpy.mockRestore()
    delete (window as any).indexedDB
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

  describe('openOrCreateDatabase', () => {
    it('errors when indexedDB is not supported', () => {
      delete (window as any).indexedDB
      const error = jest.fn()
      service.openOrCreateDatabase().subscribe({ error })
      expect(error).toHaveBeenCalledWith('IndexedDB is not supported')
    })

    it('emits the database when both tables exist', () => {
      const { db } = makeFakeDb()
      const next = jest.fn()
      const complete = jest.fn()
      service.openOrCreateDatabase().subscribe({ next, complete })
      lastOpenRequest().triggerSuccess(db)
      expect(db.transaction).toHaveBeenCalledWith(['onlineCourseProgress', 'userEnrollCourse'], 'readonly')
      expect(next).toHaveBeenCalledWith(db)
      expect(complete).toHaveBeenCalled()
    })

    it('errors when an object store lookup returns null', () => {
      const { db, transaction } = makeFakeDb()
      transaction.objectStore.mockReturnValue(null)
      const error = jest.fn()
      service.openOrCreateDatabase().subscribe({ error })
      lastOpenRequest().triggerSuccess(db)
      expect(error).toHaveBeenCalledWith('One or both required tables do not exist')
    })

    it('errors when only the second object store lookup returns null', () => {
      const { db, transaction, store } = makeFakeDb()
      transaction.objectStore.mockReturnValueOnce(store).mockReturnValueOnce(null)
      const error = jest.fn()
      service.openOrCreateDatabase().subscribe({ error })
      lastOpenRequest().triggerSuccess(db)
      expect(error).toHaveBeenCalledWith('One or both required tables do not exist')
    })

    it('creates both object stores and indexes on upgrade when missing', () => {
      const { db, store } = makeFakeDb([])
      service.openOrCreateDatabase().subscribe({ error: jest.fn() })
      lastOpenRequest().triggerUpgrade(db)
      expect(db.createObjectStore).toHaveBeenCalledWith('onlineCourseProgress', { keyPath: 'courseId', autoIncrement: true })
      expect(db.createObjectStore).toHaveBeenCalledWith('userEnrollCourse', { keyPath: 'courseId', autoIncrement: true })
      expect(store.createIndex).toHaveBeenCalledWith('courseIdIndex', 'courseId', { unique: false })
      expect(store.createIndex).toHaveBeenCalledTimes(2)
    })

    it('does not recreate object stores on upgrade when they already exist', () => {
      const { db } = makeFakeDb()
      service.openOrCreateDatabase().subscribe({ error: jest.fn() })
      lastOpenRequest().triggerUpgrade(db)
      expect(db.createObjectStore).not.toHaveBeenCalled()
    })

    it('does not emit anything when the open request errors', () => {
      const next = jest.fn()
      const error = jest.fn()
      service.openOrCreateDatabase().subscribe({ next, error })
      lastOpenRequest().triggerError('open failed')
      expect(next).not.toHaveBeenCalled()
      expect(error).not.toHaveBeenCalled()
    })
  })

  describe('getRecordFromTable', () => {
    it('emits the record when the userID matches', () => {
      const { db, store } = makeFakeDb()
      const next = jest.fn()
      const complete = jest.fn()
      service.getRecordFromTable('onlineCourseProgress', 'user1', 'c1').subscribe({ next, complete })
      lastOpenRequest().triggerSuccess(db)
      expect(store.get).toHaveBeenCalledWith('c1')
      store.requests['get'].triggerSuccess({ userID: 'user1', courseId: 'c1' })
      expect(next).toHaveBeenCalledWith({ userID: 'user1', courseId: 'c1' })
      expect(complete).toHaveBeenCalled()
    })

    it('errors when the record userID does not match', () => {
      const { db, store } = makeFakeDb()
      const error = jest.fn()
      service.getRecordFromTable('onlineCourseProgress', 'user1', 'c1').subscribe({ error })
      lastOpenRequest().triggerSuccess(db)
      store.requests['get'].triggerSuccess({ userID: 'someone-else' })
      expect(error).toHaveBeenCalledWith('Record with key c1 not found in onlineCourseProgress')
    })

    it('errors when no record is found', () => {
      const { db, store } = makeFakeDb()
      const error = jest.fn()
      service.getRecordFromTable('onlineCourseProgress', 'user1', 'c1').subscribe({ error })
      lastOpenRequest().triggerSuccess(db)
      store.requests['get'].triggerSuccess(undefined)
      expect(error).toHaveBeenCalledWith('Record with key c1 not found in onlineCourseProgress')
    })

    it('errors when the get request fails', () => {
      const { db, store } = makeFakeDb()
      const error = jest.fn()
      service.getRecordFromTable('onlineCourseProgress', 'user1', 'c1').subscribe({ error })
      lastOpenRequest().triggerSuccess(db)
      store.requests['get'].triggerError('boom')
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to retrieve record with key c1 from onlineCourseProgress:', 'boom')
      expect(error).toHaveBeenCalledWith('Failed to retrieve record with key c1 from onlineCourseProgress')
    })

    it('alerts and errors when opening the database fails', () => {
      delete (window as any).indexedDB
      const error = jest.fn()
      service.getRecordFromTable('onlineCourseProgress', 'user1', 'c1').subscribe({ error })
      expect(alertSpy).toHaveBeenCalledWith('IndexedDB is not supported')
      expect(mockLogger.error).toHaveBeenCalledWith('Error opening database:', 'IndexedDB is not supported')
      expect(error).toHaveBeenCalledWith('Error opening database')
    })
  })

  describe('openDatabase', () => {
    it('resolves with the database on success', async () => {
      const { db } = makeFakeDb()
      const promise = service.openDatabase()
      lastOpenRequest().triggerSuccess(db)
      await expect(promise).resolves.toBe(db)
      expect(mockLogger.log).toHaveBeenCalledWith('IndexedDB opened successfully:', db)
    })

    it('rejects when the open request fails', async () => {
      const promise = service.openDatabase()
      lastOpenRequest().triggerError('nope')
      await expect(promise).rejects.toBe('Failed to open IndexedDB')
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to open IndexedDB:', 'nope')
    })

    it('creates missing object stores on upgrade and resolves', async () => {
      const { db, store } = makeFakeDb([])
      const promise = service.openDatabase()
      lastOpenRequest().triggerUpgrade(db)
      await expect(promise).resolves.toBe(db)
      expect(db.createObjectStore).toHaveBeenCalledWith('onlineCourseProgress', { keyPath: 'courseId', autoIncrement: true })
      expect(db.createObjectStore).toHaveBeenCalledWith('userEnrollCourse', { keyPath: 'courseId', autoIncrement: true })
      expect(store.createIndex).toHaveBeenCalledTimes(2)
      expect(mockLogger.log).toHaveBeenCalledWith('IndexedDB upgrade needed')
    })

    it('skips object store creation on upgrade when stores exist', async () => {
      const { db } = makeFakeDb()
      const promise = service.openDatabase()
      lastOpenRequest().triggerUpgrade(db)
      await expect(promise).resolves.toBe(db)
      expect(db.createObjectStore).not.toHaveBeenCalled()
    })
  })

  describe('checkDatabaseTablesExists', () => {
    it('resolves true when both tables exist', async () => {
      const { db } = makeFakeDb()
      const promise = service.checkDatabaseTablesExists()
      lastOpenRequest().triggerSuccess(db)
      await expect(promise).resolves.toBe(true)
    })

    it('resolves false when a table is missing', async () => {
      const { db } = makeFakeDb(['onlineCourseProgress'])
      const promise = service.checkDatabaseTablesExists()
      lastOpenRequest().triggerSuccess(db)
      await expect(promise).resolves.toBe(false)
    })

    it('throws when opening the database fails', async () => {
      const promise = service.checkDatabaseTablesExists()
      lastOpenRequest().triggerError('nope')
      await expect(promise).rejects.toThrow('Error checking database, tables, and data in IndexedDB')
    })
  })

  describe('checkDatabaseTablesAndDataExists', () => {
    it('resolves true when both tables contain data', async () => {
      const { db, store } = makeFakeDb()
      const promise = service.checkDatabaseTablesAndDataExists()
      lastOpenRequest().triggerSuccess(db)
      await flushPromises()
      store.requests['openCursor'].triggerSuccess({ value: { courseId: 'c1' } })
      await flushPromises()
      store.requests['openCursor'].triggerSuccess({ value: { courseId: 'c2' } })
      await expect(promise).resolves.toBe(true)
    })

    it('resolves false when a table has no data', async () => {
      const { db, store } = makeFakeDb()
      const promise = service.checkDatabaseTablesAndDataExists()
      lastOpenRequest().triggerSuccess(db)
      await flushPromises()
      store.requests['openCursor'].triggerSuccess({ value: { courseId: 'c1' } })
      await flushPromises()
      store.requests['openCursor'].triggerSuccess(null)
      await expect(promise).resolves.toBe(false)
    })

    it('throws when the cursor request fails', async () => {
      const { db, store } = makeFakeDb()
      const promise = service.checkDatabaseTablesAndDataExists()
      lastOpenRequest().triggerSuccess(db)
      await flushPromises()
      store.requests['openCursor'].triggerError('cursor failed')
      await expect(promise).rejects.toThrow('Error checking database, tables, and data in IndexedDB')
    })
  })

  describe('checkProgressDatabaseTablesAndDataExists', () => {
    it('resolves true when progress data exists', async () => {
      const { db, store } = makeFakeDb()
      const promise = service.checkProgressDatabaseTablesAndDataExists()
      lastOpenRequest().triggerSuccess(db)
      await flushPromises()
      store.requests['openCursor'].triggerSuccess({ value: { courseId: 'c1' } })
      await expect(promise).resolves.toBe(true)
    })

    it('resolves false when the progress table is empty', async () => {
      const { db, store } = makeFakeDb()
      const promise = service.checkProgressDatabaseTablesAndDataExists()
      lastOpenRequest().triggerSuccess(db)
      await flushPromises()
      store.requests['openCursor'].triggerSuccess(null)
      await expect(promise).resolves.toBe(false)
    })

    it('throws when opening the database fails', async () => {
      const promise = service.checkProgressDatabaseTablesAndDataExists()
      lastOpenRequest().triggerError('nope')
      await expect(promise).rejects.toThrow('Error checking database, tables, and data in IndexedDB')
    })
  })

  describe('deleteRecordByKey', () => {
    it('emits and completes when the delete succeeds', () => {
      const { db, store } = makeFakeDb()
      const next = jest.fn()
      const complete = jest.fn()
      service.deleteRecordByKey('userEnrollCourse', 'c1').subscribe({ next, complete })
      lastOpenRequest().triggerSuccess(db)
      expect(store.delete).toHaveBeenCalledWith('c1')
      store.requests['delete'].triggerSuccess()
      expect(next).toHaveBeenCalledWith('string')
      expect(complete).toHaveBeenCalled()
    })

    it('errors when the delete request fails', () => {
      const { db, store } = makeFakeDb()
      const error = jest.fn()
      service.deleteRecordByKey('userEnrollCourse', 'c1').subscribe({ error })
      lastOpenRequest().triggerSuccess(db)
      store.requests['delete'].triggerError('delete failed')
      expect(error).toHaveBeenCalledWith({ target: { error: 'delete failed' } })
    })

    it('propagates database open errors', () => {
      delete (window as any).indexedDB
      const error = jest.fn()
      service.deleteRecordByKey('userEnrollCourse', 'c1').subscribe({ error })
      expect(error).toHaveBeenCalledWith('IndexedDB is not supported')
    })
  })

  describe('deleteRecordByKeyValue', () => {
    it('emits and completes when the record exists', () => {
      const { db, store } = makeFakeDb()
      const next = jest.fn()
      const complete = jest.fn()
      service.deleteRecordByKeyValue('userEnrollCourse', 'c1').subscribe({ next, complete })
      lastOpenRequest().triggerSuccess(db)
      expect(store.get).toHaveBeenCalledWith('c1')
      store.requests['get'].triggerSuccess({ courseId: 'c1' })
      expect(next).toHaveBeenCalledWith(undefined)
      expect(complete).toHaveBeenCalled()
    })

    it('errors when the record is not found', () => {
      const { db, store } = makeFakeDb()
      const error = jest.fn()
      service.deleteRecordByKeyValue('userEnrollCourse', 'c1').subscribe({ error })
      lastOpenRequest().triggerSuccess(db)
      store.requests['get'].triggerSuccess(undefined)
      expect(mockLogger.log).toHaveBeenCalledWith('No record found with key: c1')
      expect(error).toHaveBeenCalledWith('Record not found')
    })

    it('errors when the get request fails', () => {
      const { db, store } = makeFakeDb()
      const error = jest.fn()
      service.deleteRecordByKeyValue('userEnrollCourse', 'c1').subscribe({ error })
      lastOpenRequest().triggerSuccess(db)
      store.requests['get'].triggerError('fail')
      expect(error).toHaveBeenCalledWith('Failed to retrieve record for deletion')
    })

    it('propagates database open errors', () => {
      delete (window as any).indexedDB
      const error = jest.fn()
      service.deleteRecordByKeyValue('userEnrollCourse', 'c1').subscribe({ error })
      expect(error).toHaveBeenCalledWith('IndexedDB is not supported')
    })
  })

  describe('insertProgressData', () => {
    it('serializes data, stores it and completes', () => {
      const { db, store, transaction } = makeFakeDb()
      const next = jest.fn()
      const complete = jest.fn()
      const dataArray = [{ progress: 50 }]
      service.insertProgressData('u1', 'c1', 'ct1', 'onlineCourseProgress', 'http://x', dataArray).subscribe({ next, complete })
      lastOpenRequest().triggerSuccess(db)
      expect(store.put).toHaveBeenCalledWith({
        userID: 'u1',
        courseId: 'c1',
        contentId: 'ct1',
        url: 'http://x',
        data: JSON.stringify(dataArray),
      })
      store.requests['put'].triggerSuccess()
      expect(next).toHaveBeenCalledWith('Data inserted successfully')
      expect(complete).toHaveBeenCalled()
      transaction.oncomplete()
      expect(mockLogger.log).toHaveBeenCalledWith('Transaction completed')
    })

    it('errors when the put request fails', () => {
      const { db, store } = makeFakeDb()
      const error = jest.fn()
      service.insertProgressData('u1', 'c1', 'ct1', 'onlineCourseProgress', 'http://x').subscribe({ error })
      lastOpenRequest().triggerSuccess(db)
      store.requests['put'].triggerError('store failed')
      expect(mockLogger.error).toHaveBeenCalledWith('Error storing data for courseId:', 'c1', 'store failed')
      expect(error).toHaveBeenCalledWith('Error storing data')
    })

    it('errors when creating the transaction throws', () => {
      const { db, transaction } = makeFakeDb()
      db.transaction.mockImplementation((names: any) => {
        if (typeof names === 'string') {
          throw new Error('tx fail')
        }
        return transaction
      })
      const error = jest.fn()
      service.insertProgressData('u1', 'c1', 'ct1', 'onlineCourseProgress', 'http://x').subscribe({ error })
      lastOpenRequest().triggerSuccess(db)
      expect(error).toHaveBeenCalledWith(new Error('tx fail'))
    })

    it('propagates database open errors', () => {
      delete (window as any).indexedDB
      const error = jest.fn()
      service.insertProgressData('u1', 'c1', 'ct1', 'onlineCourseProgress', 'http://x').subscribe({ error })
      expect(error).toHaveBeenCalledWith('IndexedDB is not supported')
    })
  })

  describe('insertData', () => {
    it('serializes data, stores it and completes', () => {
      const { db, store, transaction } = makeFakeDb()
      const next = jest.fn()
      const complete = jest.fn()
      const dataArray = [{ enrolled: true }]
      service.insertData('u1', 'c1', 'userEnrollCourse', dataArray).subscribe({ next, complete })
      lastOpenRequest().triggerSuccess(db)
      expect(store.put).toHaveBeenCalledWith({ userID: 'u1', courseId: 'c1', data: JSON.stringify(dataArray) })
      store.requests['put'].triggerSuccess()
      expect(next).toHaveBeenCalledWith('Data inserted successfully')
      expect(complete).toHaveBeenCalled()
      transaction.oncomplete()
      expect(mockLogger.log).toHaveBeenCalledWith('Transaction completed')
    })

    it('errors when the put request fails', () => {
      const { db, store } = makeFakeDb()
      const error = jest.fn()
      service.insertData('u1', 'c1', 'userEnrollCourse').subscribe({ error })
      lastOpenRequest().triggerSuccess(db)
      store.requests['put'].triggerError('store failed')
      expect(error).toHaveBeenCalledWith('Error storing data')
    })

    it('errors when creating the transaction throws', () => {
      const { db, transaction } = makeFakeDb()
      db.transaction.mockImplementation((names: any) => {
        if (typeof names === 'string') {
          throw new Error('tx fail')
        }
        return transaction
      })
      const error = jest.fn()
      service.insertData('u1', 'c1', 'userEnrollCourse').subscribe({ error })
      lastOpenRequest().triggerSuccess(db)
      expect(error).toHaveBeenCalledWith(new Error('tx fail'))
    })

    it('propagates database open errors', () => {
      delete (window as any).indexedDB
      const error = jest.fn()
      service.insertData('u1', 'c1', 'userEnrollCourse').subscribe({ error })
      expect(error).toHaveBeenCalledWith('IndexedDB is not supported')
    })
  })

  describe('getData', () => {
    it('resolves with all rows from the table', async () => {
      const { db, store } = makeFakeDb()
      const rows = [{ courseId: 'c1' }, { courseId: 'c2' }]
      const promise = service.getData('onlineCourseProgress')
      lastOpenRequest().triggerSuccess(db)
      await flushPromises()
      store.requests['getAll'].triggerSuccess(rows)
      await expect(promise).resolves.toEqual(rows)
    })

    it('rejects when the getAll request fails', async () => {
      const { db, store } = makeFakeDb()
      const promise = service.getData('onlineCourseProgress')
      lastOpenRequest().triggerSuccess(db)
      await flushPromises()
      store.requests['getAll'].triggerError('boom')
      await expect(promise).rejects.toBe('Error fetching data from IndexedDB: boom')
    })

    it('throws when opening the database fails', async () => {
      const promise = service.getData('onlineCourseProgress')
      lastOpenRequest().triggerError('nope')
      await expect(promise).rejects.toThrow('Error fetching data from IndexedDB')
    })
  })

  describe('updateValue', () => {
    it('updates the record when data is found', async () => {
      const { db, store } = makeFakeDb()
      const promise = service.updateValue('onlineCourseProgress', 'c1', 'newValue')
      lastOpenRequest().triggerSuccess(db)
      await promise
      expect(store.get).toHaveBeenCalledWith('c1')
      store.requests['get'].triggerSuccess({ courseId: 'c1' })
      expect(store.put).toHaveBeenCalledWith({ courseId: 'c1', valueToUpdate: 'newValue' })
      store.requests['put'].triggerSuccess()
      expect(mockLogger.log).toHaveBeenCalledWith('Value updated successfully')
    })

    it('throws from the put error handler', async () => {
      const { db, store } = makeFakeDb()
      const promise = service.updateValue('onlineCourseProgress', 'c1', 'newValue')
      lastOpenRequest().triggerSuccess(db)
      await promise
      store.requests['get'].triggerSuccess({ courseId: 'c1' })
      expect(() => store.requests['put'].triggerError('put failed')).toThrow('Error updating value in IndexedDB: put failed')
    })

    it('throws when no data is found for the key', async () => {
      const { db, store } = makeFakeDb()
      const promise = service.updateValue('onlineCourseProgress', 'c1', 'newValue')
      lastOpenRequest().triggerSuccess(db)
      await promise
      expect(() => store.requests['get'].triggerSuccess(undefined)).toThrow('No data found with the specified key')
    })

    it('throws from the get error handler', async () => {
      const { db, store } = makeFakeDb()
      const promise = service.updateValue('onlineCourseProgress', 'c1', 'newValue')
      lastOpenRequest().triggerSuccess(db)
      await promise
      expect(() => store.requests['get'].triggerError('get failed')).toThrow('Error retrieving data from IndexedDB: get failed')
    })

    it('rejects when opening the database fails', async () => {
      const promise = service.updateValue('onlineCourseProgress', 'c1', 'newValue')
      lastOpenRequest().triggerError('nope')
      await expect(promise).rejects.toThrow('Error updating value in IndexedDB')
    })
  })

  describe('getDataByCourseIdFromIndexedDB', () => {
    beforeEach(() => {
      ;(window as any).IDBKeyRange = { only: jest.fn((value: any) => value) }
    })

    afterEach(() => {
      delete (window as any).IDBKeyRange
    })

    it('errors when the database has not been initialised', () => {
      const error = jest.fn()
      service.getDataByCourseIdFromIndexedDB('onlineCourseProgress', 'c1').subscribe({ error })
      expect(error).toHaveBeenCalled()
    })

    it('emits each row for the courseId and completes', () => {
      const { db, store } = makeFakeDb()
      ;(service as any).db = db
      const next = jest.fn()
      const complete = jest.fn()
      service.getDataByCourseIdFromIndexedDB('onlineCourseProgress', 'c1').subscribe({ next, complete })
      expect(store.index).toHaveBeenCalledWith('courseIdIndex')
      const cursor = { value: { courseId: 'c1', progress: 10 }, continue: jest.fn() }
      store.requests['openCursor'].triggerSuccess(cursor)
      expect(next).toHaveBeenCalledWith({ courseId: 'c1', progress: 10 })
      expect(cursor.continue).toHaveBeenCalled()
      store.requests['openCursor'].triggerSuccess(null)
      expect(complete).toHaveBeenCalled()
    })

    it('errors when the cursor request fails', () => {
      const { db, store } = makeFakeDb()
      ;(service as any).db = db
      const error = jest.fn()
      service.getDataByCourseIdFromIndexedDB('onlineCourseProgress', 'c1').subscribe({ error })
      store.requests['openCursor'].triggerError('cursor failed')
      expect(mockLogger.error).toHaveBeenCalledWith('Error retrieving data for courseId:', 'c1', 'cursor failed')
      expect(error).toHaveBeenCalledWith('cursor failed')
    })
  })

  describe('getRowByCourseId', () => {
    it('resolves the row found via the courseId index', async () => {
      const { db, store } = makeFakeDb()
      const promise = service.getRowByCourseId('onlineCourseProgress', 'c1')
      lastOpenRequest().triggerSuccess(db)
      await flushPromises()
      expect(store.index).toHaveBeenCalledWith('courseIdIndex')
      expect(store.get).toHaveBeenCalledWith('c1')
      store.requests['get'].triggerSuccess({ courseId: 'c1', progress: 42 })
      await expect(promise).resolves.toEqual({ courseId: 'c1', progress: 42 })
    })

    it('rejects when the index get request fails', async () => {
      const { db, store } = makeFakeDb()
      const promise = service.getRowByCourseId('onlineCourseProgress', 'c1')
      lastOpenRequest().triggerSuccess(db)
      await flushPromises()
      store.requests['get'].triggerError('bad index')
      await expect(promise).rejects.toBe('Error fetching row details from IndexedDB: bad index')
    })

    it('throws when opening the database fails', async () => {
      const promise = service.getRowByCourseId('onlineCourseProgress', 'c1')
      lastOpenRequest().triggerError('nope')
      await expect(promise).rejects.toThrow('Error fetching row details from IndexedDB')
    })
  })

  describe('updateRowField', () => {
    it('updates the field when the row is found', async () => {
      const { db, store } = makeFakeDb()
      const promise = service.updateRowField('onlineCourseProgress', 'c1', 'progress', 80)
      lastOpenRequest().triggerSuccess(db)
      await promise
      expect(store.index).toHaveBeenCalledWith('courseIdIndex')
      store.requests['get'].triggerSuccess({ courseId: 'c1', progress: 20 })
      expect(store.put).toHaveBeenCalledWith({ courseId: 'c1', progress: 80 })
      store.requests['put'].triggerSuccess()
      expect(mockLogger.log).toHaveBeenCalledWith('Field updated successfully')
    })

    it('logs an error when the put request fails', async () => {
      const { db, store } = makeFakeDb()
      const promise = service.updateRowField('onlineCourseProgress', 'c1', 'progress', 80)
      lastOpenRequest().triggerSuccess(db)
      await promise
      store.requests['get'].triggerSuccess({ courseId: 'c1', progress: 20 })
      store.requests['put'].triggerError('put failed')
      expect(mockLogger.error).toHaveBeenCalledWith('Error updating field in IndexedDB:', 'put failed')
    })

    it('logs an error when no row is found', async () => {
      const { db, store } = makeFakeDb()
      const promise = service.updateRowField('onlineCourseProgress', 'c1', 'progress', 80)
      lastOpenRequest().triggerSuccess(db)
      await promise
      store.requests['get'].triggerSuccess(undefined)
      expect(mockLogger.error).toHaveBeenCalledWith('No row found with the specified key')
    })

    it('logs an error when the row lacks the field to update', async () => {
      const { db, store } = makeFakeDb()
      const promise = service.updateRowField('onlineCourseProgress', 'c1', 'progress', 80)
      lastOpenRequest().triggerSuccess(db)
      await promise
      store.requests['get'].triggerSuccess({ courseId: 'c1' })
      expect(store.put).not.toHaveBeenCalled()
      expect(mockLogger.error).toHaveBeenCalledWith('No row found with the specified key')
    })

    it('logs an error when the get request fails', async () => {
      const { db, store } = makeFakeDb()
      const promise = service.updateRowField('onlineCourseProgress', 'c1', 'progress', 80)
      lastOpenRequest().triggerSuccess(db)
      await promise
      store.requests['get'].triggerError('get failed')
      expect(mockLogger.error).toHaveBeenCalledWith('Error retrieving data from IndexedDB:', 'get failed')
    })

    it('logs an error when opening the database fails', async () => {
      const promise = service.updateRowField('onlineCourseProgress', 'c1', 'progress', 80)
      lastOpenRequest().triggerError('nope')
      await promise
      expect(mockLogger.error).toHaveBeenCalledWith('Error updating field in IndexedDB:', 'Failed to open IndexedDB')
    })
  })
})
