import { LoggerService } from './logger.service'

describe('LoggerService', () => {
  let configSvc: any
  let service: LoggerService
  let originalConsole: Record<string, any>

  beforeEach(() => {
    originalConsole = {
      error: console.error,
      info: console.info,
      log: console.log,
      warn: console.warn,
    }
    configSvc = { isProduction: false }
    service = new LoggerService(configSvc)
  })

  afterEach(() => {
    Object.assign(console, originalConsole)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('should always expose the real console.error', () => {
    expect(service.error).toBe(originalConsole.error)
    configSvc.isProduction = true
    expect(service.error).toBe(originalConsole.error)
  })

  describe('outside production', () => {
    it('should expose the real console functions', () => {
      expect(service.info).toBe(originalConsole.info)
      expect(service.log).toBe(originalConsole.log)
      expect(service.warn).toBe(originalConsole.warn)
    })
  })

  describe('in production', () => {
    beforeEach(() => {
      configSvc.isProduction = true
    })

    it('should silence info, log and warn', () => {
      expect(service.info).not.toBe(originalConsole.info)
      expect(service.log).not.toBe(originalConsole.log)
      expect(service.warn).not.toBe(originalConsole.warn)
      expect(service.info('x')).toBeUndefined()
      expect(service.log('x')).toBeUndefined()
      expect(service.warn('x')).toBeUndefined()
    })
  })

  describe('removeConsoleAccess', () => {
    it('should leave the console untouched in production', () => {
      configSvc.isProduction = true
      service.removeConsoleAccess()
      expect(console.warn).toBe(originalConsole.warn)
      expect(console.info).toBe(originalConsole.info)
      expect(console.error).toBe(originalConsole.error)
    })

    it('should make warn, info and error throw outside production', () => {
      service.removeConsoleAccess()
      expect(() => console.warn('x')).toThrow('Console Functions Usage Are Not Allowed.')
      expect(() => console.info('x')).toThrow('Console Functions Usage Are Not Allowed.')
      expect(() => console.error('x')).toThrow('Console Functions Usage Are Not Allowed.')
    })

    it('should leave console.log usable', () => {
      service.removeConsoleAccess()
      expect(() => console.log('x')).not.toThrow()
    })
  })
})
