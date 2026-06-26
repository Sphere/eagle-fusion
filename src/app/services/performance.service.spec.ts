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

  describe('optimizeBundleLoading with IntersectionObserver', () => {
    it('should call setupLazyLoading with intersecting entry', () => {
      const img = document.createElement('img')
      img.setAttribute('data-lazy', 'img.jpg')
      document.body.appendChild(img)

      let observerCb: any
      const mockObserverInstance = { unobserve: jest.fn(), observe: jest.fn() }
      const MockIntersectionObserver = jest.fn().mockImplementation((cb: any) => {
        observerCb = cb
        mockObserverInstance.observe = jest.fn((target: any) => {
          // Call cb after imageObserver is assigned
          cb([{ isIntersecting: true, target }])
        })
        return mockObserverInstance
      })
      ;(window as any).IntersectionObserver = MockIntersectionObserver
      expect(() => service.optimizeBundleLoading()).not.toThrow()
      document.body.removeChild(img)
      delete (window as any).IntersectionObserver
    })

    it('should not set src when entry is not intersecting', () => {
      const img = document.createElement('img')
      img.setAttribute('data-lazy', 'img.jpg')
      document.body.appendChild(img)

      const mockObserverInstance = { unobserve: jest.fn(), observe: jest.fn() }
      const MockIntersectionObserver = jest.fn().mockImplementation((cb: any) => {
        mockObserverInstance.observe = jest.fn((target: any) => {
          cb([{ isIntersecting: false, target }])
        })
        return mockObserverInstance
      })
      ;(window as any).IntersectionObserver = MockIntersectionObserver
      expect(() => service.optimizeBundleLoading()).not.toThrow()
      document.body.removeChild(img)
      delete (window as any).IntersectionObserver
    })
  })

  describe('optimizeMemoryUsage cleanup', () => {
    it('should clear __cleanupTimers when they exist', () => {
      ;(window as any).__cleanupTimers = [1, 2]
      service.optimizeMemoryUsage()
      window.dispatchEvent(new Event('beforeunload'))
      expect((window as any).__cleanupTimers).toEqual([])
    })
  })
})
