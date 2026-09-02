import { of } from 'rxjs'
import { ValueService } from './value.service'

describe('ValueService', () => {
  let service: ValueService
  let breakpointObserver: any
  let observeSpy: jest.Mock

  const build = (matches = false) => {
    observeSpy = jest.fn().mockReturnValue(of({ matches, breakpoints: {} }))
    breakpointObserver = { observe: observeSpy }
    return new ValueService(breakpointObserver)
  }

  beforeEach(() => {
    service = build()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('should seed the width from the current window width', () => {
    expect(service.width()).toBe(window.innerWidth)
  })

  describe('isMobile / isTabOrWeb', () => {
    it('should report mobile below the 768px breakpoint', () => {
      service.updateWidth(767)
      expect(service.isMobile()).toBe(true)
      expect(service.isTabOrWeb()).toBe(false)
    })

    it('should report tab-or-web at exactly 768px', () => {
      service.updateWidth(768)
      expect(service.isMobile()).toBe(false)
      expect(service.isTabOrWeb()).toBe(true)
    })

    it('should report tab-or-web above the breakpoint', () => {
      service.updateWidth(1440)
      expect(service.isMobile()).toBe(false)
      expect(service.isTabOrWeb()).toBe(true)
    })
  })

  describe('updateWidth', () => {
    it('should push the new width into the signal', () => {
      service.updateWidth(1024)
      expect(service.width()).toBe(1024)
    })
  })

  it('should track the window resize event', () => {
    const original = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true, writable: true })
    window.dispatchEvent(new Event('resize'))
    expect(service.width()).toBe(400)
    expect(service.isMobile()).toBe(true)
    Object.defineProperty(window, 'innerWidth', { value: original, configurable: true, writable: true })
  })

  describe('breakpoint observables', () => {
    it('should map the XSmall breakpoint state to a boolean', done => {
      const matching = build(true)
      matching.isXSmall$.subscribe(isXSmall => {
        expect(isXSmall).toBe(true)
        done()
      })
    })

    it('should map the less-than-medium breakpoint state to a boolean', done => {
      const notMatching = build(false)
      notMatching.isLtMedium$.subscribe(isLtMedium => {
        expect(isLtMedium).toBe(false)
        done()
      })
    })

    it('should observe both the XSmall and Small breakpoints for isLtMedium$', () => {
      expect(observeSpy).toHaveBeenCalledTimes(2)
      expect(observeSpy.mock.calls[1][0]).toHaveLength(2)
    })
  })
})
