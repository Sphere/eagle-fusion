import { ValueService } from '@ws-widget/utils'
import { BehaviorSubject } from 'rxjs'
import { RetainScrollDirective } from './retain-scroll.directive'

const isXSmallSubject = new BehaviorSubject<boolean>(false)

const mockValueSvc: Partial<ValueService> = {
  isXSmall$: isXSmallSubject.asObservable() as any,
}

function createDirective(): RetainScrollDirective {
  return new RetainScrollDirective(mockValueSvc as ValueService)
}

describe('RetainScrollDirective', () => {
  let directive: RetainScrollDirective

  beforeEach(() => {
    jest.clearAllMocks()
    isXSmallSubject.next(false)
    directive = createDirective()
  })

  it('should create', () => {
    expect(directive).toBeTruthy()
  })

  it('should subscribe to isXSmall$ in ngOnInit and update isXSmall', () => {
    directive.ngOnInit()
    isXSmallSubject.next(true)
    expect(directive.isXSmall).toBe(true)
    isXSmallSubject.next(false)
    expect(directive.isXSmall).toBe(false)
  })

  it('should scroll to saved position when isXSmall and currentPosition is non-zero', () => {
    directive.ngOnInit()
    isXSmallSubject.next(true)
    directive.currentPosition = 200
    const matNav = document.createElement('div')
    matNav.id = 'mat-nav'
    document.body.appendChild(matNav)
    const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    directive.clicking()
    expect(scrollToSpy).toHaveBeenCalledWith(0, 200)
    document.body.removeChild(matNav)
  })

  it('should scroll matNav into view when isXSmall and currentPosition is zero', () => {
    jest.useFakeTimers()
    directive.ngOnInit()
    isXSmallSubject.next(true)
    directive.currentPosition = 0
    const matNav = document.createElement('div')
    matNav.id = 'mat-nav'
    document.body.appendChild(matNav)
    const scrollIntoViewSpy = jest.fn()
    matNav.scrollIntoView = scrollIntoViewSpy
    directive.clicking()
    jest.runAllTimers()
    expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    document.body.removeChild(matNav)
    jest.useRealTimers()
  })

  it('should scroll to default position when not isXSmall', () => {
    directive.ngOnInit()
    isXSmallSubject.next(false)
    const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    directive.clicking()
    expect(scrollToSpy).toHaveBeenCalledWith(0, 600)
  })

  it('should scroll to default position when matNav is not present', () => {
    directive.ngOnInit()
    isXSmallSubject.next(true)
    const existing = document.getElementById('mat-nav')
    if (existing) {
      existing.remove()
    }
    const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    directive.clicking()
    expect(scrollToSpy).toHaveBeenCalledWith(0, 600)
  })
})
