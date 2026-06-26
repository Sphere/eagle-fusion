import { PerformanceService } from './performance.service'

describe('PerformanceService', () => {
  let service: PerformanceService
  let appendChildSpy: jest.SpyInstance

  beforeEach(() => {
    appendChildSpy = jest.spyOn(document.head, 'appendChild').mockImplementation(jest.fn())
    service = new PerformanceService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('preloadCriticalResources appends link elements to head', () => {
    service.preloadCriticalResources()
    expect(appendChildSpy).toHaveBeenCalled()
  })

  it('preloadCriticalResources appends a font preload link', () => {
    service.preloadCriticalResources()
    const calls = appendChildSpy.mock.calls
    const fontLink = calls.find((args: any[]) => {
      const el = args[0] as HTMLLinkElement
      return el.as === 'font'
    })
    expect(fontLink).toBeTruthy()
  })

  it('optimizeBundleLoading does not throw', () => {
    expect(() => service.optimizeBundleLoading()).not.toThrow()
  })

  it('optimizeMemoryUsage does not throw', () => {
    expect(() => service.optimizeMemoryUsage()).not.toThrow()
  })
})
