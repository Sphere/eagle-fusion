import { Subject } from 'rxjs'
import { ImageResponsiveDirective } from './image-responsive.directive'

const BREAKPOINTS = {
  xs: '(max-width: 450px)',
  s: '(min-width: 450.001px) and (max-width: 768px)',
  m: '(min-width: 768.001px) and (max-width: 1024px)',
  l: '(min-width: 1024.001px) and (max-width: 1400px)',
  xl: '(min-width: 1400.001px) and (max-width: 1920px)',
  xxl: '(min-width: 1920.001px)',
}

describe('ImageResponsiveDirective', () => {
  let directive: ImageResponsiveDirective
  let breakpointObserver: any
  let state$: Subject<any>

  const emit = (size: keyof typeof BREAKPOINTS | null) => {
    const breakpoints: Record<string, boolean> = {}
    Object.values(BREAKPOINTS).forEach(q => { breakpoints[q] = false })
    if (size) {
      breakpoints[BREAKPOINTS[size]] = true
    }
    state$.next({ matches: Boolean(size), breakpoints })
  }

  const srcMap = {
    xs: 'xs.png', s: 's.png', m: 'm.png', l: 'l.png', xl: 'xl.png', xxl: 'xxl.png',
  }

  beforeEach(() => {
    state$ = new Subject<any>()
    breakpointObserver = { observe: jest.fn().mockReturnValue(state$) }
    directive = new ImageResponsiveDirective(breakpointObserver)
    directive.src = { ...srcMap }
  })

  it('should create with empty defaults', () => {
    const fresh = new ImageResponsiveDirective(breakpointObserver)
    expect(fresh).toBeTruthy()
    expect(fresh.src).toBeNull()
    expect(fresh.srcBindUrl).toBe('')
    expect(fresh.currentSize).toBe('')
    expect(fresh.breakpointSubscription).toBeNull()
  })

  describe('ngOnInit', () => {
    it('should observe all six custom breakpoints', () => {
      directive.ngOnInit()
      expect(breakpointObserver.observe).toHaveBeenCalledWith(Object.values(BREAKPOINTS))
    })

    const sizes: (keyof typeof BREAKPOINTS)[] = ['xs', 's', 'm', 'l', 'xl', 'xxl']
    sizes.forEach(size => {
      it(`should pick the ${size} source when the ${size} breakpoint matches`, () => {
        directive.ngOnInit()
        emit(size)
        expect(directive.currentSize).toBe(size)
        expect(directive.srcBindUrl).toBe(srcMap[size])
      })
    })

    it('should default to xl when no breakpoint matches', () => {
      directive.ngOnInit()
      emit(null)
      expect(directive.currentSize).toBe('xl')
      expect(directive.srcBindUrl).toBe('xl.png')
    })

    it('should leave the bound url alone when the map has no entry for the size', () => {
      directive.src = { xs: 'xs.png' }
      directive.ngOnInit()
      emit('l')
      expect(directive.currentSize).toBe('l')
      expect(directive.srcBindUrl).toBe('')
    })

    it('should leave the bound url alone when there is no source map', () => {
      directive.src = null
      directive.ngOnInit()
      emit('m')
      expect(directive.srcBindUrl).toBe('')
    })
  })

  describe('ngOnChanges', () => {
    it('should re-resolve the source for the current size', () => {
      directive.ngOnInit()
      emit('m')
      directive.src = { ...srcMap, m: 'm-updated.png' }
      directive.ngOnChanges()
      expect(directive.srcBindUrl).toBe('m-updated.png')
    })

    it('should do nothing when there is no source map', () => {
      directive.src = null
      expect(() => directive.ngOnChanges()).not.toThrow()
      expect(directive.srcBindUrl).toBe('')
    })

    it('should do nothing before a breakpoint has resolved', () => {
      directive.ngOnChanges()
      expect(directive.srcBindUrl).toBe('')
    })
  })

  describe('ngOnDestroy', () => {
    it('should stop reacting to breakpoint changes', () => {
      directive.ngOnInit()
      emit('m')
      directive.ngOnDestroy()
      emit('xs')
      expect(directive.currentSize).toBe('m')
    })

    it('should be safe when init never ran', () => {
      expect(() => directive.ngOnDestroy()).not.toThrow()
    })
  })
})
