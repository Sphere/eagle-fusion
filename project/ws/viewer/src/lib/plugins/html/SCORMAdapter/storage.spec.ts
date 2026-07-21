import { Storage, IScromData } from './storage'

describe('Storage', () => {
  let storage: Storage

  beforeEach(() => {
    window.localStorage.clear()
    storage = new Storage()
  })

  it('should create', () => {
    expect(storage).toBeTruthy()
  })

  it('defaults contentKey to scormData', () => {
    expect(storage.contentKey).toBe('scormData')
  })

  it('sets and gets contentKey via key setter/getter', () => {
    storage.contentKey = 'my-content'
    expect(storage.contentKey).toBe('my-content')
    expect(storage.key).toBe('my-content')
  })

  it('returnKey returns the current contentKey', () => {
    storage.contentKey = 'abc'
    expect(storage.returnKey()).toBe('abc')
  })

  describe('setItem/getItem', () => {
    it('creates a fresh object in localStorage on first setItem', () => {
      storage.contentKey = 'k1'
      storage.setItem('foo', 'bar')
      expect(JSON.parse(window.localStorage.getItem('k1')!)).toEqual({ foo: 'bar' })
    })

    it('merges into an existing object on subsequent setItem calls', () => {
      storage.contentKey = 'k2'
      storage.setItem('foo', 'bar')
      storage.setItem('baz', 'qux')
      expect(JSON.parse(window.localStorage.getItem('k2')!)).toEqual({ foo: 'bar', baz: 'qux' })
    })

    it('getItem returns null when nothing stored for the key', () => {
      storage.contentKey = 'missing'
      expect(storage.getItem('foo')).toBeNull()
    })

    it('getItem returns the stored value for an element', () => {
      storage.contentKey = 'k3'
      storage.setItem('foo', 'bar')
      expect(storage.getItem('foo')).toBe('bar')
    })
  })

  describe('getAll/setAll/clearAll', () => {
    it('getAll returns null when nothing stored', () => {
      storage.contentKey = 'empty'
      expect(storage.getAll()).toBeNull()
    })

    it('setAll stores the full data object and getAll retrieves it', () => {
      storage.contentKey = 'full'
      const data: IScromData = { Initialized: true, 'cmi.core.lesson_status': 'completed' }
      storage.setAll(data)
      expect(storage.getAll()).toEqual(data)
    })

    it('setAll does nothing when passed falsy data', () => {
      storage.contentKey = 'noop'
      storage.setAll(undefined as any)
      expect(window.localStorage.getItem('noop')).toBeNull()
    })

    it('clearAll removes the stored data for the current key', () => {
      storage.contentKey = 'clearme'
      storage.setAll({ Initialized: true })
      storage.clearAll()
      expect(window.localStorage.getItem('clearme')).toBeNull()
    })
  })
})
