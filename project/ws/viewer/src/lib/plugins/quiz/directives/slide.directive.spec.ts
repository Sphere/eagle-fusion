import { SlideDirective } from './slide.directive'

describe('SlideDirective', () => {
  let directive: SlideDirective
  let mockElementRef: any
  let mockQuizService: any
  let hideSpy: jest.Mock
  let showSpy: jest.Mock

  beforeEach(() => {
    hideSpy = jest.fn()
    showSpy = jest.fn()
    ;(global as any).$ = jest.fn().mockReturnValue({ hide: hideSpy, show: showSpy })

    mockElementRef = { nativeElement: {} }
    mockQuizService = {}

    directive = new SlideDirective(mockElementRef, mockQuizService)
  })

  it('should create and initialize questionState in constructor', () => {
    expect(directive).toBeTruthy()
    expect(mockQuizService.questionState).toEqual({ slides: [], active_slide_index: 0 })
  })

  it('ngOnInit should register slide and hide it when index !== 0', () => {
    directive.slideIndex = 1
    directive.ngOnInit()
    expect(mockQuizService.questionState.slides[1]).toBe(mockElementRef.nativeElement)
    expect(hideSpy).toHaveBeenCalled()
    expect(showSpy).not.toHaveBeenCalled()
  })

  it('ngOnInit should show slide when index === 0', () => {
    directive.slideIndex = 0
    directive.ngOnInit()
    expect(mockQuizService.questionState.slides[0]).toBe(mockElementRef.nativeElement)
    expect(hideSpy).toHaveBeenCalled()
    expect(showSpy).toHaveBeenCalled()
  })
})
