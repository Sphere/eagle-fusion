import { ScrollService } from './scroll.service'

describe('ScrollService', () => {
  let service: ScrollService

  beforeEach(() => {
    service = new ScrollService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('scrollToDivEvent is an EventEmitter that can emit and subscribe', () => {
    let emitted: string | undefined
    service.scrollToDivEvent.subscribe(v => emitted = v)
    service.scrollToDivEvent.emit('section-1')
    expect(emitted).toBe('section-1')
  })

  it('scrollToElement calls window.scrollTo with smooth behavior', () => {
    const mockScrollTo = jest.fn()
    jest.spyOn(window, 'scrollTo').mockImplementation(mockScrollTo)
    const el = {
      getBoundingClientRect: jest.fn().mockReturnValue({ top: 200 }),
    } as unknown as HTMLElement
    service.scrollToElement(el)
    expect(mockScrollTo).toHaveBeenCalledWith({ top: expect.any(Number), behavior: 'smooth' })
  })

  it('scrollToElement does not throw when element is falsy', () => {
    expect(() => service.scrollToElement(null as any)).not.toThrow()
  })

  it('scrollToElement computes scrollTop as window.scrollY + rect.top - 80', () => {
    const mockScrollTo = jest.fn()
    jest.spyOn(window, 'scrollTo').mockImplementation(mockScrollTo)
    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true })
    const el = {
      getBoundingClientRect: jest.fn().mockReturnValue({ top: 200 }),
    } as unknown as HTMLElement
    service.scrollToElement(el)
    expect(mockScrollTo).toHaveBeenCalledWith({ top: 100 + 200 - 80, behavior: 'smooth' })
  })
})
