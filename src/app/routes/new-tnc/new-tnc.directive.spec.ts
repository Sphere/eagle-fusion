import { LoggerService } from '@ws-widget/utils'
import { ScrollDetectorDirective } from './new-tnc.directive'

function makeScrollEvent(scrollHeight: number, scrollTop: number, clientHeight: number) {
  return {
    target: { scrollHeight, scrollTop, clientHeight } as HTMLElement,
  } as unknown as Event
}

describe('ScrollDetectorDirective', () => {
  let directive: ScrollDetectorDirective
  let mockLogger: any

  beforeEach(() => {
    mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn() }
    directive = new ScrollDetectorDirective(mockLogger)
  })

  it('should create', () => {
    expect(directive).toBeTruthy()
  })

  it('emits true when user has scrolled to the bottom', done => {
    directive.scrolled.subscribe((value: boolean) => {
      expect(value).toBe(true)
      done()
    })
    directive.onScroll(makeScrollEvent(300, 200, 100))
  })

  it('emits false when user has not reached the bottom', done => {
    directive.scrolled.subscribe((value: boolean) => {
      expect(value).toBe(false)
      done()
    })
    directive.onScroll(makeScrollEvent(300, 50, 100))
  })

  it('emits true when scrollHeight equals scrollTop + clientHeight exactly', done => {
    directive.scrolled.subscribe((value: boolean) => {
      expect(value).toBe(true)
      done()
    })
    directive.onScroll(makeScrollEvent(500, 400, 100))
  })

  it('scrolled is an EventEmitter', () => {
    expect(typeof directive.scrolled.subscribe).toBe('function')
    expect(typeof directive.scrolled.emit).toBe('function')
  })
})
