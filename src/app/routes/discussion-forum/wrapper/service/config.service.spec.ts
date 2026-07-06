jest.mock('@aastrika_npmjs/discussions-ui-v8', () => ({
  AbstractConfigService: class {
    constructor() {}
  },
}))

import { ConfigService } from './config.service'

describe('ConfigService', () => {
  let service: ConfigService

  beforeEach(() => {
    localStorage.clear()
    service = new ConfigService()
  })

  afterEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('getConfig returns null when key does not exist', () => {
    expect(service.getConfig('nonexistent')).toBeNull()
  })

  it('getConfig returns value from localStorage', () => {
    localStorage.setItem('myKey', 'myValue')
    expect(service.getConfig('myKey')).toBe('myValue')
  })

  it('getConfig returns null after localStorage is cleared', () => {
    localStorage.setItem('someKey', 'someValue')
    localStorage.clear()
    expect(service.getConfig('someKey')).toBeNull()
  })
})
