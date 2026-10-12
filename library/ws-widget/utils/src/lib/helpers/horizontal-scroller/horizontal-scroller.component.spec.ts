import { HorizontalScrollerComponent } from './horizontal-scroller.component'

describe('HorizontalScrollerComponent', () => {
  let component: HorizontalScrollerComponent
  let ngZone: any
  let cdr: any
  let nativeElement: any

  const buildElem = (props: Partial<Record<string, any>> = {}) => {
    const listeners: Record<string, ((e: any) => void)[]> = {}
    return {
      scrollLeft: 0,
      scrollWidth: 1000,
      clientWidth: 500,
      scrollTo: jest.fn(),
      addEventListener: jest.fn((type: string, cb: any) => {
        listeners[type] = listeners[type] || []
        listeners[type].push(cb)
      }),
      removeEventListener: jest.fn(),
      __listeners: listeners,
      ...props,
    }
  }

  let observe: jest.Mock
  let disconnect: jest.Mock
  let mutationCallback: () => void
  const realMutationObserver = global.MutationObserver

  beforeEach(() => {
    jest.useFakeTimers()
    ngZone = {
      run: jest.fn((fn: () => void) => fn()),
      runOutsideAngular: jest.fn((fn: () => void) => fn()),
    }
    cdr = { detectChanges: jest.fn() }
    nativeElement = buildElem()

    // The host element is a plain stub, so the real MutationObserver would reject it.
    observe = jest.fn()
    disconnect = jest.fn()
    mutationCallback = () => undefined
    ;(global as any).MutationObserver = jest.fn((cb: () => void) => {
      mutationCallback = cb
      return { observe, disconnect }
    })

    component = new HorizontalScrollerComponent(ngZone, cdr)
    component.horizontalScrollElem = { nativeElement } as any
  })

  afterEach(() => {
    jest.useRealTimers()
    ;(global as any).MutationObserver = realMutationObserver
    jest.clearAllMocks()
  })

  it('should create with the documented defaults', () => {
    expect(component).toBeTruthy()
    expect(component.loadStatus).toBe('none')
    expect(component.onHover).toBe(false)
    expect(component.enablePrev).toBe(false)
    expect(component.enableNext).toBe(false)
  })

  describe('ngOnInit', () => {
    it('should subscribe to the scroll event on the host element', () => {
      component.ngOnInit()
      expect(nativeElement.addEventListener).toHaveBeenCalledTimes(1)
      const [eventName, handler] = nativeElement.addEventListener.mock.calls[0]
      expect(eventName).toBe('scroll')
      expect(typeof handler).toBe('function')
    })

    it('should do nothing when there is no host element', () => {
      component.horizontalScrollElem = null
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  describe('ngAfterViewInit', () => {
    it('should run an initial status check and observe mutations', () => {
      component.ngAfterViewInit()
      jest.runAllTimers()
      expect(cdr.detectChanges).toHaveBeenCalled()
      expect(ngZone.runOutsideAngular).toHaveBeenCalled()
      expect(component.enablePrev).toBe(false)
      expect(component.enableNext).toBe(true)
    })

    it('should re-check inside the zone when the observed subtree mutates', () => {
      component.ngAfterViewInit()
      jest.runAllTimers()
      cdr.detectChanges.mockClear()
      mutationCallback()

      expect(ngZone.run).toHaveBeenCalled()
      expect(cdr.detectChanges).toHaveBeenCalled()
      expect(observe).toHaveBeenCalledWith(nativeElement, { childList: true, subtree: true })
    })

    it('should do nothing when there is no host element', () => {
      component.horizontalScrollElem = null
      expect(() => component.ngAfterViewInit()).not.toThrow()
    })
  })

  describe('ngOnChanges', () => {
    it('should re-evaluate the navigation buttons after the debounce', () => {
      nativeElement.scrollLeft = 100
      component.ngOnChanges()
      jest.advanceTimersByTime(100)
      expect(component.enablePrev).toBe(true)
    })

    it('should do nothing when there is no host element', () => {
      component.horizontalScrollElem = null
      component.ngOnChanges()
      expect(() => jest.advanceTimersByTime(100)).not.toThrow()
    })
  })

  describe('ngOnDestroy', () => {
    it('should release the scroll subscription and mutation observer', () => {
      component.ngOnInit()
      component.ngAfterViewInit()
      jest.runAllTimers()

      component.ngOnDestroy()
      expect(disconnect).toHaveBeenCalled()
    })

    it('should be safe when nothing was ever set up', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('showPrev / showNext', () => {
    it('should scroll back by one viewport width', () => {
      nativeElement.scrollLeft = 800
      component.showPrev()
      expect(nativeElement.scrollTo).toHaveBeenCalledWith({ left: 300, behavior: 'smooth' })
    })

    it('should scroll forward by one viewport width less the peek offset', () => {
      nativeElement.scrollLeft = 0
      component.showNext()
      expect(nativeElement.scrollTo).toHaveBeenCalledWith({ left: 455, behavior: 'smooth' })
    })

    it('should do nothing when there is no host element', () => {
      component.horizontalScrollElem = null
      expect(() => component.showPrev()).not.toThrow()
      expect(() => component.showNext()).not.toThrow()
    })
  })

  describe('navigation button state', () => {
    const check = () => {
      component.ngOnChanges()
      jest.advanceTimersByTime(100)
    }

    it('should disable prev at the start of the strip', () => {
      nativeElement.scrollLeft = 0
      check()
      expect(component.enablePrev).toBe(false)
      expect(component.enableNext).toBe(true)
    })

    it('should enable prev once scrolled', () => {
      nativeElement.scrollLeft = 50
      check()
      expect(component.enablePrev).toBe(true)
    })

    it('should disable next at the end of the strip', () => {
      nativeElement.scrollLeft = 500
      nativeElement.scrollWidth = 1000
      nativeElement.clientWidth = 500
      check()
      expect(component.enableNext).toBe(false)
    })

    it('should emit loadNext at the end when more pages remain', () => {
      const emitted = jest.fn()
      component.loadNext.subscribe(emitted)
      component.loadStatus = 'hasMore'
      nativeElement.scrollLeft = 500
      check()
      expect(emitted).toHaveBeenCalled()
      expect(component.enableNext).toBe(true)
    })
  })
})
