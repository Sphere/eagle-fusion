jest.mock('@ws-widget/collection', () => ({
  NsContent: {
    EMimeTypes: {
      WEB_MODULE: 'application/vnd.ekstep.web-module',
      WEB_MODULE_EXERCISE: 'application/vnd.ekstep.web-module-exercise',
    },
  },
}))

import { WebModuleComponent } from './web-module.component'
import { NsContent } from '@ws-widget/collection'
import { of, Subject } from 'rxjs'

describe('WebModuleComponent (plugin)', () => {
  let component: WebModuleComponent
  let mockEvents: any
  let mockSafeResourceUrlSvc: any
  let mockValueSvc: any
  let mockViewerSvc: any
  let mockConfigurationSvc: any
  let prefChangeNotifier: Subject<any>

  beforeEach(() => {
    prefChangeNotifier = new Subject()
    mockEvents = { raiseInteractTelemetry: jest.fn() }
    mockSafeResourceUrlSvc = {
      trust: jest.fn((url: string) => url),
      trustUrl: jest.fn((url: string) => url),
    }
    mockValueSvc = { isXSmall$: of(false) }
    mockViewerSvc = { realTimeProgressUpdateV3: jest.fn() }
    mockConfigurationSvc = {
      activeFontObject: { baseFontSize: '16px' },
      prefChangeNotifier,
    }

    component = new WebModuleComponent(
      mockEvents,
      mockSafeResourceUrlSvc,
      mockValueSvc,
      mockViewerSvc,
      mockConfigurationSvc,
    )
    component.widgetData = {
      identifier: 'res-1',
      mimeType: NsContent.EMimeTypes.WEB_MODULE,
      artifactUrl: 'http://example.com/path/manifest.json',
    }
    component.webModuleManifest = {
      resources: [
        { artifactUrl: '/slide1.html', title: 'slide1' },
        { artifactUrl: '/slide2.html', title: 'slide2' },
      ],
    }
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('subscribes to isXSmall$ and loads the web module', () => {
      component.ngOnInit()
      expect(component.screenSizeIsXSmall).toBe(false)
      expect(component.currentFontSize).toBe('16px')
      expect(component.defaultFontSize).toBe(16)
      expect(component.slides.length).toBe(2)
    })

    it('calls setTheme when prefChangeNotifier emits', () => {
      component.ngOnInit()
      const spy = jest.spyOn(component, 'setTheme').mockImplementation()
      prefChangeNotifier.next(true)
      expect(spy).toHaveBeenCalled()
    })

    it('skips font size setup when activeFontObject missing', () => {
      mockConfigurationSvc.activeFontObject = null
      component.ngOnInit()
      expect(component.currentFontSize).toBeUndefined()
    })
  })

  describe('ngOnChanges', () => {
    it('fires real time progress when identifier changes and current has entries', () => {
      component.oldIdentifier = 'old-id'
      component.current = ['1']
      component.widgetData = {
        identifier: 'new-id',
        mimeType: NsContent.EMimeTypes.WEB_MODULE,
        artifactUrl: 'http://example.com/dir/manifest.json',
      }
      const spy = jest.spyOn(component, 'fireRealTimeProgress')
      component.ngOnChanges({ widgetData: {} as any })
      expect(spy).toHaveBeenCalledWith('old-id')
      expect(component.oldIdentifier).toBe('new-id')
    })

    it('does not fire progress when identifier unchanged', () => {
      component.oldIdentifier = 'res-1'
      component.current = ['1']
      const spy = jest.spyOn(component, 'fireRealTimeProgress')
      component.ngOnChanges({ widgetData: {} as any })
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('ngOnDestroy', () => {
    it('unsubscribes and clears interval and fires progress', () => {
      component.ngOnInit()
      component.current = ['1']
      component.scrollTimeInterval = setInterval(() => { }, 1000)
      const spy = jest.spyOn(component, 'fireRealTimeProgress')
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalledWith('res-1')
      expect(component.scrollTimeInterval).toBeNull()
    })

    it('handles no widgetData identifier gracefully', () => {
      component.widgetData = null
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('fireRealTimeProgress', () => {
    it('raises progress when current and slides present', () => {
      component.loadWebModule()
      component.current = ['1']
      component.fireRealTimeProgress('res-1')
      expect(mockViewerSvc.realTimeProgressUpdateV3).toHaveBeenCalled()
    })

    it('does nothing when current is empty', () => {
      component.loadWebModule()
      component.current = []
      component.fireRealTimeProgress('res-1')
      expect(mockViewerSvc.realTimeProgressUpdateV3).not.toHaveBeenCalled()
    })
  })

  describe('loadWebModule', () => {
    it('maps resources when webModuleManifest has resources', () => {
      component.loadWebModule()
      expect(component.slides.length).toBe(2)
      expect(component.currentSlideNumber).toBe(1)
    })

    it('maps array manifest when no resources key', () => {
      component.webModuleManifest = [{ URL: '/a.html' }, { URL: '/b.html' }]
      component.loadWebModule()
      expect(component.slides.length).toBe(2)
    })
  })

  describe('setPage', () => {
    beforeEach(() => {
      component.loadWebModule()
    })

    it('sets currentSlideNumber and iframeUrl for valid page', () => {
      const result = component.setPage(2)
      expect(result).toBe(2)
      expect(component.currentSlideNumber).toBe(2)
      expect(component.maxLastPageNumber).toBe(2)
    })

    it('marks isCompleted when at last slide', () => {
      component.setPage(2)
      expect(component.isCompleted).toBe(true)
    })

    it('returns empty string when same page requested again', () => {
      component.setPage(1)
      const result = component.setPage(1)
      expect(result).toBe('')
    })
  })

  describe('setAudio', () => {
    it('sets slideAudioUrl when audio present', () => {
      component.setAudio([{ URL: '/audio.mp3' } as any])
      expect(mockSafeResourceUrlSvc.trustUrl).toHaveBeenCalled()
    })

    it('sets slideAudioUrl to null when no audio', () => {
      component.setAudio([])
      expect(component.slideAudioUrl).toBeNull()
    })
  })

  describe('pageChange', () => {
    beforeEach(() => {
      component.loadWebModule()
    })

    it('moves to next page and raises telemetry', () => {
      const spy = jest.spyOn(component, 'raiseTelemetry')
      component.pageChange(1)
      expect(spy).toHaveBeenCalledWith('next-page', 'collection-details')
      expect(component.currentSlideNumber).toBe(2)
    })

    it('moves to previous page and raises telemetry', () => {
      component.setPage(2)
      const spy = jest.spyOn(component, 'raiseTelemetry')
      component.pageChange(-1)
      expect(spy).toHaveBeenCalledWith('previous-page', 'collection-details')
      expect(component.currentSlideNumber).toBe(1)
    })

    it('does not move beyond bounds', () => {
      component.pageChange(-1)
      expect(component.currentSlideNumber).toBe(1)
    })
  })

  describe('raiseTelemetry', () => {
    it('raises interact telemetry when identifier present', () => {
      component.raiseTelemetry('next-page', 'collection-details')
      expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
    })

    it('resets isScrolled on scroll event', () => {
      component.isScrolled = true
      component.raiseTelemetry('pageScroll', 'scroll')
      expect(component.isScrolled).toBe(false)
    })
  })

  describe('raiseScrollTelemetry', () => {
    it('sets up an interval that raises telemetry when scrolled', () => {
      jest.useFakeTimers()
      const spy = jest.spyOn(component, 'raiseTelemetry').mockImplementation()
      component.isScrolled = true
      component.raiseScrollTelemetry()
      jest.advanceTimersByTime(2 * 60000)
      expect(spy).toHaveBeenCalledWith('pageScroll', 'collection-details')
      jest.useRealTimers()
    })
  })

  describe('setTheme / modifyIframeStyle / getColor', () => {
    it('modifyIframeStyle sets currentFontSize when styleProp is fontSize', () => {
      component.iframeElem = {
        nativeElement: { contentWindow: { document: { body: { style: {} } } } },
      } as any
      component.modifyIframeStyle('fontSize', '20px')
      expect(component.currentFontSize).toBe('20px')
    })

    it('modifyIframeStyle does nothing when no iframeElem available', () => {
      component.iframeElem = null as any
      expect(() => component.modifyIframeStyle('color', 'red')).not.toThrow()
    })

    it('setTheme calls modifyIframeStyle for color and background', () => {
      const spy = jest.spyOn(component, 'modifyIframeStyle').mockImplementation()
      jest.spyOn(component, 'getColor').mockReturnValue('#ffffff')
      component.currentFontSize = '14px'
      component.setTheme()
      expect(spy).toHaveBeenCalledWith('backgroundColor', '#ffffff')
      expect(spy).toHaveBeenCalledWith('color', '#ffffff')
    })

    it('setTheme skips fontSize modification when currentFontSize is falsy', () => {
      const spy = jest.spyOn(component, 'modifyIframeStyle').mockImplementation()
      jest.spyOn(component, 'getColor').mockReturnValue('#000000')
      component.currentFontSize = '' as any
      component.setTheme()
      expect(spy).not.toHaveBeenCalledWith('fontSize', expect.anything())
    })

    it('getColor converts rgb string to hex', () => {
      jest.spyOn(window, 'getComputedStyle').mockReturnValue({ color: 'rgb(255, 0, 0)' } as any)
      expect(component.getColor('color')).toBe('#ff0000')
    })
  })

  describe('setPage null iframeUrl branch', () => {
    it('sets iframeUrl from slides[0] when iframeUrl is explicitly null and page out of bounds', () => {
      component.loadWebModule()
      component.iframeUrl = null as any
      const result = component.setPage(99)
      expect(mockSafeResourceUrlSvc.trust).toHaveBeenCalled()
      expect(result).toBe(component.currentSlideNumber)
    })

    it('calls setAudio with slides[0].audio when present and iframeUrl null', () => {
      component.webModuleManifest = {
        resources: [
          { artifactUrl: '/slide1.html', title: 'slide1', audio: [{ URL: '/a.mp3', title: 't', label: 'l', srclang: 'en' }] },
        ],
      }
      component.loadWebModule()
      component.iframeUrl = null as any
      component.setPage(99)
      expect(mockSafeResourceUrlSvc.trustUrl).toHaveBeenCalled()
    })
  })

  describe('modifyIframeDom', () => {
    it('returns early when iframe has no contentWindow', async () => {
      const iframe = { contentWindow: null } as any
      await component.modifyIframeDom(iframe)
      expect(component.iframeLoadingInProgress).toBe(true)
    })

    it('returns early when contentWindow has no document', async () => {
      const iframe = { contentWindow: {} } as any
      await component.modifyIframeDom(iframe)
      expect(component.iframeLoadingInProgress).toBe(true)
    })

    it('builds dom fragment, wires scroll listener and sets theme after timeout', async () => {
      jest.useFakeTimers()
      const doc = document.implementation.createHTMLDocument('test')
      const iframe = { contentWindow: { document: doc } } as any
      const setThemeSpy = jest.spyOn(component, 'setTheme').mockImplementation()
      component.theme = { className: 'dark-theme' }
      const promise = component.modifyIframeDom(iframe)
      doc.dispatchEvent(new Event('scroll'))
      jest.advanceTimersByTime(1000)
      await promise
      expect(component.iframeLoadingInProgress).toBe(false)
      expect(setThemeSpy).toHaveBeenCalled()
      expect(component.firstScroll).toBe(false)
      jest.useRealTimers()
    })
  })
})
