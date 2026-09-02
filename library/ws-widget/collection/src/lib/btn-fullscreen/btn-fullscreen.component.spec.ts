import { BtnFullscreenComponent } from './btn-fullscreen.component'
import * as fullscreenUtil from './fullscreen.util'

describe('BtnFullscreenComponent', () => {
  let component: BtnFullscreenComponent
  let mockRouter: any
  let mockLogger: any

  beforeEach(() => {
    mockRouter = { url: '/page/home' }
    mockLogger = { log: jest.fn() }
    component = new BtnFullscreenComponent(mockRouter, mockLogger)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set containsQuizAssessment to true when url includes quiz', () => {
    mockRouter = { url: '/quiz/1' }
    component = new BtnFullscreenComponent(mockRouter, mockLogger)
    expect(component.containsQuizAssessment).toBe(true)
  })

  it('should set containsQuizAssessment to false when url does not include quiz', () => {
    expect(component.containsQuizAssessment).toBe(false)
  })

  describe('ngOnInit', () => {
    it('should return early when widgetData.fsContainer is not set', () => {
      component.widgetData = { fsContainer: null }
      component.ngOnInit()
      expect(component.fsChangeSubs).toBeNull()
    })

    it('should subscribe to fullscreenchange event and update isInFs on emit', () => {
      component.widgetData = { fsContainer: document.createElement('div') }
      jest.spyOn(fullscreenUtil, 'getFullScreenElement').mockReturnValue(null)
      const emitSpy = jest.spyOn(component.fsState, 'emit')
      component.ngOnInit()
      expect(component.isInFs).toBe(false)
      expect(component.fsChangeSubs).toBeTruthy()

      jest.spyOn(fullscreenUtil, 'getFullScreenElement').mockReturnValue(document.createElement('div'))
      document.dispatchEvent(new Event('fullscreenchange'))
      expect(component.isInFs).toBe(true)
      expect(emitSpy).toHaveBeenCalledWith(true)
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe when fsChangeSubs exists', () => {
      component.widgetData = { fsContainer: document.createElement('div') }
      component.ngOnInit()
      const unsubSpy = jest.spyOn(component.fsChangeSubs as any, 'unsubscribe')
      component.ngOnDestroy()
      expect(unsubSpy).toHaveBeenCalled()
    })

    it('should do nothing when fsChangeSubs is null', () => {
      component.fsChangeSubs = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('toggleFs', () => {
    it('should request exit fullscreen and emit false when currently in fullscreen', () => {
      jest.spyOn(fullscreenUtil, 'getFullScreenElement').mockReturnValue(document.createElement('div'))
      const exitSpy = jest.spyOn(fullscreenUtil, 'requestExitFullScreen').mockImplementation(() => { })
      const emitSpy = jest.spyOn(component.fsState, 'emit')
      component.toggleFs()
      expect(exitSpy).toHaveBeenCalled()
      expect(emitSpy).toHaveBeenCalledWith(false)
    })

    it('should request fullscreen and emit true, and add mat-app-background class', () => {
      jest.spyOn(fullscreenUtil, 'getFullScreenElement').mockReturnValue(null)
      const reqSpy = jest.spyOn(fullscreenUtil, 'requestFullScreen').mockImplementation(() => { })
      const elem = document.createElement('div')
      component.widgetData = { fsContainer: elem }
      const emitSpy = jest.spyOn(component.fsState, 'emit')
      component.toggleFs()
      expect(reqSpy).toHaveBeenCalledWith(elem)
      expect(emitSpy).toHaveBeenCalledWith(true)
      expect(elem.classList.contains('mat-app-background')).toBe(true)
    })

    it('should catch error thrown when adding class fails', () => {
      jest.spyOn(fullscreenUtil, 'getFullScreenElement').mockReturnValue(null)
      jest.spyOn(fullscreenUtil, 'requestFullScreen').mockImplementation(() => { })
      const elem = document.createElement('div')
      jest.spyOn(elem.classList, 'add').mockImplementation(() => { throw new Error('fail') })
      component.widgetData = { fsContainer: elem }
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { })
      component.toggleFs()
      expect(alertSpy).toHaveBeenCalled()
    })

    it('should do nothing when not in fullscreen and no fsContainer', () => {
      jest.spyOn(fullscreenUtil, 'getFullScreenElement').mockReturnValue(null)
      component.widgetData = { fsContainer: null }
      expect(() => component.toggleFs()).not.toThrow()
    })
  })
})
