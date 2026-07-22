import { Router } from '@angular/router'
import { EventService } from '../../../../utils/src/public-api'
import { SlidersComponent } from './sliders.component'

function createComponent(url = '/page/home'): SlidersComponent {
  const mockEvents: Partial<EventService> = {
    raiseInteractTelemetry: jest.fn(),
  }
  const mockRouter: Partial<Router> = {
    url,
  }
  return new SlidersComponent(mockEvents as EventService, mockRouter as Router)
}

describe('SlidersComponent', () => {
  let component: SlidersComponent

  beforeEach(() => {
    jest.useFakeTimers()
    component = createComponent()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default widgetData when not provided and screenSize less on narrow window (page/home)', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 })
    component.widgetData = ''
    component.ngOnInit()
    expect(component.widgetData).toBeTruthy()
    expect(JSON.parse(component.widgetData).length).toBe(3)
    expect(component.screenSize).toBe('less')
  })

  it('should set screenSize medium on wide window (page/home)', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1200 })
    component.widgetData = JSON.stringify([{ banners: {} }, { banners: {} }])
    component.ngOnInit()
    expect(component.screenSize).toBe('medium')
  })

  it('should set screenSize medium on public/home narrow window', () => {
    component = createComponent('/public/home')
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 })
    component.widgetData = JSON.stringify([{ banners: {} }])
    component.ngOnInit()
    expect(component.screenSize).toBe('medium')
  })

  it('should not touch screenSize for other routes', () => {
    component = createComponent('/some/other')
    component.widgetData = JSON.stringify([{ banners: {} }])
    component.ngOnInit()
    expect(component.screenSize).toBe('medium')
  })

  describe('onResize', () => {
    it('should set less on narrow resize for page/home', () => {
      component = createComponent('/page/home')
      component.widgetData = JSON.stringify([{ banners: {} }])
      component.onResize({ target: { innerWidth: 400 } })
      expect(component.screenSize).toBe('less')
    })

    it('should set medium on wide resize for page/home', () => {
      component = createComponent('/page/home')
      component.onResize({ target: { innerWidth: 900 } })
      expect(component.screenSize).toBe('medium')
    })

    it('should set medium on narrow resize for public/home', () => {
      component = createComponent('/public/home')
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 400 })
      component.onResize({ target: { innerWidth: 400 } })
      expect(component.screenSize).toBe('medium')
    })

    it('should do nothing for other routes', () => {
      component = createComponent('/other')
      component.onResize({ target: { innerWidth: 400 } })
      expect(component.screenSize).toBe('medium')
    })
  })

  describe('reInitiateSlideInterval', () => {
    it('should not start interval when widgetData has 1 or fewer items', () => {
      component.widgetData = [{ banners: {} }]
      component.reInitiateSlideInterval()
      expect(component.slideInterval).toBeNull()
    })

    it('should start interval and advance currentIndex when multiple items', () => {
      component.widgetData = [{ banners: {} }, { banners: {} }]
      component.reInitiateSlideInterval()
      expect(component.slideInterval).toBeTruthy()
      jest.advanceTimersByTime(8000)
      expect(component.currentIndex).toBe(1)
      jest.advanceTimersByTime(8000)
      expect(component.currentIndex).toBe(0)
    })

    it('should unsubscribe existing interval before creating a new one', () => {
      component.widgetData = [{ banners: {} }, { banners: {} }]
      component.reInitiateSlideInterval()
      const firstInterval = component.slideInterval
      const unsubscribeSpy = jest.spyOn(firstInterval as any, 'unsubscribe')
      component.reInitiateSlideInterval()
      expect(unsubscribeSpy).toHaveBeenCalled()
    })
  })

  describe('slideTo', () => {
    beforeEach(() => {
      component.widgetData = [{ banners: {} }, { banners: {} }, { banners: {} }]
    })

    it('should set currentIndex within range', () => {
      component.slideTo(1)
      expect(component.currentIndex).toBe(1)
    })

    it('should wrap to 0 when index equals length', () => {
      component.slideTo(3)
      expect(component.currentIndex).toBe(0)
    })

    it('should wrap from the end for negative index', () => {
      component.slideTo(-1)
      expect(component.currentIndex).toBe(2)
    })
  })

  describe('isOpenInNewTab', () => {
    it('should return true when redirectUrl includes mailto', () => {
      component.widgetData = [{ redirectUrl: 'mailto:test@test.com' }]
      component.currentIndex = 0
      expect(component.isOpenInNewTab).toBe(true)
    })

    it('should return true when openInNewTab flag is set', () => {
      component.widgetData = [{ redirectUrl: '/a', openInNewTab: true }]
      component.currentIndex = 0
      expect(component.isOpenInNewTab).toBe(true)
    })

    it('should return false otherwise', () => {
      component.widgetData = [{ redirectUrl: '/a' }]
      component.currentIndex = 0
      expect(component.isOpenInNewTab).toBe(false)
    })
  })

  describe('openInNewTab', () => {
    it('should open window when mailto url', () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
      component.widgetData = [{ redirectUrl: 'mailto:test@test.com' }]
      component.currentIndex = 0
      component.openInNewTab()
      expect(openSpy).toHaveBeenCalledWith('mailto:test@test.com')
      openSpy.mockRestore()
    })

    it('should not open window otherwise', () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
      component.widgetData = [{ redirectUrl: '/a' }]
      component.currentIndex = 0
      component.openInNewTab()
      expect(openSpy).not.toHaveBeenCalled()
      openSpy.mockRestore()
    })
  })

  describe('raiseTelemetry', () => {
    it('should call openInNewTab and raise interact telemetry', () => {
      const openSpy = jest.spyOn(component, 'openInNewTab').mockImplementation(() => { })
      component.widgetData = [{ redirectUrl: '/a' }]
      component.currentIndex = 0
      component.raiseTelemetry('banner-url')
      expect(openSpy).toHaveBeenCalled()
      expect((component as any).events.raiseInteractTelemetry).toHaveBeenCalledWith(
        'click',
        'banner',
        'slider',
        expect.objectContaining({ bannerRedirectUrl: 'banner-url' }),
      )
    })
  })
})
