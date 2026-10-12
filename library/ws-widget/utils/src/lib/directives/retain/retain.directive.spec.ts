import { of } from 'rxjs'
import { RetainScrollDirective } from './retain.directive'

describe('RetainScrollDirective', () => {
  let directive: RetainScrollDirective
  let valueSvc: any

  beforeEach(() => {
    jest.useFakeTimers()
    valueSvc = { isXSmall$: of(false) }
    directive = new RetainScrollDirective(valueSvc)
    document.body.innerHTML = ''
  })

  afterEach(() => {
    jest.useRealTimers()
    document.body.innerHTML = ''
    jest.restoreAllMocks()
  })

  it('should create with the documented defaults', () => {
    expect(directive).toBeTruthy()
    expect(directive.currentPosition).toBe(0)
    expect(directive.isXSmall).toBe(false)
  })

  describe('ngOnInit', () => {
    it('should track the extra-small breakpoint', () => {
      valueSvc.isXSmall$ = of(true)
      directive.ngOnInit()
      expect(directive.isXSmall).toBe(true)
    })

    it('should keep the flag false on wider viewports', () => {
      directive.ngOnInit()
      expect(directive.isXSmall).toBe(false)
    })
  })

  describe('clicking', () => {
    it('should smooth-scroll the scroll-height anchor into view', () => {
      const anchor = document.createElement('div')
      anchor.id = 'scroll-height'
      anchor.scrollIntoView = jest.fn()
      document.body.appendChild(anchor)

      directive.clicking()
      jest.runAllTimers()

      expect(anchor.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    })

    it('should fall back to scrolling the window when the anchor is absent', () => {
      const scrollTo = jest.fn()
      Object.defineProperty(window, 'scrollTo', { value: scrollTo, configurable: true, writable: true })

      directive.clicking()

      expect(scrollTo).toHaveBeenCalledWith(0, window.outerHeight)
    })
  })
})
