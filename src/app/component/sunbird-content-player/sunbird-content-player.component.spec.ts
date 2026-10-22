jest.mock('@ws-widget/utils', () => ({
  LoggerService: class { log = jest.fn(); warn = jest.fn(); error = jest.fn() },
  SafeResourceUrlService: class { trust = jest.fn(url => url) },
}))

import { NgZone, SimpleChange } from '@angular/core'
import { SunbirdContentPlayerComponent } from './sunbird-content-player.component'
import { CONTENT_PLAYER_PREVIEW_PATH, localArchiveLocation } from './content-player.util'

describe('SunbirdContentPlayerComponent', () => {
  let component: SunbirdContentPlayerComponent
  let logger: any
  let listeners: Record<string, () => void>
  let api: any
  let playerWindow: any
  const zone = { run: (fn: () => void) => fn(), runOutsideAngular: (fn: () => void) => fn() } as unknown as NgZone

  beforeEach(() => {
    delete (window as any).EkstepRendererAPI
    listeners = {}
    // like the real EkstepRendererAPI, an event may have several listeners; listeners[name]() runs them all
    const callbacks: Record<string, (() => void)[]> = {}
    api = {
      addEventListener: jest.fn((name: string, cb: () => void) => {
        callbacks[name] = [...(callbacks[name] ?? []), cb]
        listeners[name] = () => callbacks[name].forEach(fn => fn())
      }),
    }
    playerWindow = {
      initializePreview: jest.fn(), EkstepRendererAPI: api,
      location: { href: 'http://localhost:3000/content-player/preview.html?webview=true' },
    }
    logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    component = new SunbirdContentPlayerComponent({ trust: jest.fn(url => url) } as any, zone, logger)
    component.playerFrame = { nativeElement: { contentWindow: playerWindow } } as any
    component.metadata = { identifier: 'do_a', name: 'A' }
  })

  afterEach(() => {
    component.ngOnDestroy()
    delete (window as any).EkstepRendererAPI
  })

  it('trusts the bundled preview url', () => {
    expect(component.previewUrl).toBe(CONTENT_PLAYER_PREVIEW_PATH)
    expect(component.status).toBe('loading')
  })

  it('initialises the player with the explicit location and bridges the renderer api', () => {
    component.location = localArchiveLocation()
    component.onPreviewLoad()
    expect(playerWindow.initializePreview).toHaveBeenCalledTimes(1)
    const cfg = playerWindow.initializePreview.mock.calls[0][0]
    expect(cfg.config.s3ContentHost).toBe('/html-archive/')
    expect(cfg.metadata.identifier).toBe('do_a')
    expect(cfg.config.showEndPage).toBe(false)
    expect((window as any).EkstepRendererAPI).toBe(api)
    expect(component.status).toBe('ready')
  })

  it('passes showEndPage through when a host wants the player end page', () => {
    component.location = localArchiveLocation()
    component.showEndPage = true
    component.onPreviewLoad()
    expect(playerWindow.initializePreview.mock.calls[0][0].config.showEndPage).toBe(true)
  })

  it('derives the location from streamingUrl when none is given, through the same-origin proxy', () => {
    component.metadata = { identifier: 'do_a', streamingUrl: 'https://cdn.example.org/content/html/do_a-latest' }
    component.onPreviewLoad()
    const cfg = playerWindow.initializePreview.mock.calls[0][0]
    expect(cfg.config.s3ContentHost).toBe('/apis/proxies/v8/getContents/content/')
  })

  it('derives the location from artifactUrl (the zip) when there is no streamingUrl', () => {
    component.metadata = { identifier: 'do_a', status: 'Live', artifactUrl: 'https://cdn.example.org/content/do_a/artifact/a.zip' }
    component.onPreviewLoad()
    const cfg = playerWindow.initializePreview.mock.calls[0][0]
    expect(cfg.config.s3ContentHost).toBe('/apis/proxies/v8/getContents/content/')
  })

  it('emits contentEnd when the renderer ends the content', () => {
    component.location = localArchiveLocation()
    const ended = jest.fn()
    component.contentEnd.subscribe(ended)
    component.onPreviewLoad()
    listeners['renderer:content:end']()
    expect(ended).toHaveBeenCalledWith('do_a')
  })

  it('forwards player lifecycle events as telemetry', () => {
    component.location = localArchiveLocation()
    const events: any[] = []
    component.telemetry.subscribe(e => events.push(e))
    component.onPreviewLoad()
    expect(Object.keys(listeners)).toEqual(expect.arrayContaining(['renderer:launch:html', 'renderer:splash:hide', 'renderer:content:close']))
    listeners['renderer:splash:hide']()
    expect(events).toEqual([expect.objectContaining({ source: 'player', eid: 'renderer:splash:hide', edata: {} })])
  })

  it('registers the end listener only once across relaunches', () => {
    component.location = localArchiveLocation()
    component.onPreviewLoad()
    const registered = api.addEventListener.mock.calls.length
    component.ngOnChanges({ metadata: new SimpleChange(null, component.metadata, false) })
    expect(playerWindow.initializePreview).toHaveBeenCalledTimes(2)
    expect(api.addEventListener).toHaveBeenCalledTimes(registered)
  })

  it('does not relaunch on changes before the preview has loaded', () => {
    component.ngOnChanges({ metadata: new SimpleChange(null, component.metadata, true) })
    expect(playerWindow.initializePreview).not.toHaveBeenCalled()
  })

  it('ignores the synchronous load of the initial about:blank document', () => {
    component.location = localArchiveLocation()
    playerWindow.location = { href: 'about:blank' }
    component.onPreviewLoad()
    expect(playerWindow.initializePreview).not.toHaveBeenCalled()
    expect(component.status).toBe('loading')
  })

  it('ignores a load for any document other than preview.html', () => {
    component.location = localArchiveLocation()
    playerWindow.location = { href: 'http://localhost:3000/html-content-player' }
    component.onPreviewLoad()
    expect(playerWindow.initializePreview).not.toHaveBeenCalled()
  })

  it('treats an unreadable location as a real document', () => {
    component.location = localArchiveLocation()
    Object.defineProperty(playerWindow, 'location', { get: () => { throw new Error('cross-origin') } })
    component.onPreviewLoad()
    expect(playerWindow.initializePreview).toHaveBeenCalled()
  })

  it('does nothing without metadata', () => {
    component.metadata = null
    component.onPreviewLoad()
    expect(playerWindow.initializePreview).not.toHaveBeenCalled()
    expect(component.status).toBe('loading')
  })

  it('reports an error when preview.html did not load', () => {
    const errors = jest.fn()
    component.playerError.subscribe(errors)
    component.playerFrame = { nativeElement: { contentWindow: { location: playerWindow.location } } } as any
    component.onPreviewLoad()
    expect(component.status).toBe('error')
    expect(errors).toHaveBeenCalledWith('content-player preview.html did not load')
  })

  it('reports an error when no location can be resolved', () => {
    component.onPreviewLoad()
    expect(component.status).toBe('error')
    expect(playerWindow.initializePreview).not.toHaveBeenCalled()
  })

  it('reports an error when initializePreview throws', () => {
    component.location = localArchiveLocation()
    playerWindow.initializePreview.mockImplementation(() => { throw new Error('boom') })
    component.onPreviewLoad()
    expect(component.status).toBe('error')
    expect(logger.error).toHaveBeenCalled()
  })

  it('launches without a bridge when the player exposes no renderer api', () => {
    component.location = localArchiveLocation()
    delete playerWindow.EkstepRendererAPI
    component.onPreviewLoad()
    expect(component.status).toBe('ready')
    expect((window as any).EkstepRendererAPI).toBeUndefined()
  })

  it('removes the bridge on destroy', () => {
    component.location = localArchiveLocation()
    component.onPreviewLoad()
    component.ngOnDestroy()
    expect((window as any).EkstepRendererAPI).toBeUndefined()
  })

  it('restores a renderer api that existed before it was mounted', () => {
    const existing = { mine: true };
    (window as any).EkstepRendererAPI = existing
    component.location = localArchiveLocation()
    component.onPreviewLoad()
    component.ngOnDestroy()
    expect((window as any).EkstepRendererAPI).toBe(existing)
  })

  it('destroy before launch leaves the window untouched', () => {
    component.ngOnDestroy()
    expect((window as any).EkstepRendererAPI).toBeUndefined()
  })

  describe('telemetry', () => {
    let events: any[]
    let originalSend: jest.Mock
    const packageFrame = { name: 'package-window' }
    const message = (data: any, source: any) => window.dispatchEvent(new MessageEvent('message', { data, source }))
    const packageEvent = { type: 'html-archive:telemetry', event: { type: 'PROGRESS', id: 'p', extra: { pct: 27 } } }

    beforeEach(() => {
      originalSend = jest.fn(() => 'sent')
      playerWindow.telemetry_web = { send: originalSend }
      playerWindow.frames = { length: 1, 0: packageFrame }
      component.location = localArchiveLocation()
      events = []
      component.telemetry.subscribe(e => events.push(e))
    })

    it('wraps the player sink before launch and still forwards to it', () => {
      playerWindow.initializePreview.mockImplementation(() => {
        expect(playerWindow.telemetry_web.send(JSON.stringify({ eid: 'START', ets: 1, edata: {} }))).toBe('sent')
      })
      component.onPreviewLoad()
      expect(originalSend).toHaveBeenCalled()
      expect(events).toEqual([{ source: 'player', eid: 'START', ets: 1, edata: {} }])
    })

    it('drops sink payloads that are not events', () => {
      component.onPreviewLoad()
      playerWindow.telemetry_web.send('garbage')
      expect(events).toEqual([])
      expect(originalSend).toHaveBeenCalledWith('garbage')
    })

    it('hooks the sink only once across relaunches', () => {
      component.onPreviewLoad()
      const wrapped = playerWindow.telemetry_web.send
      component.launch()
      expect(playerWindow.telemetry_web.send).toBe(wrapped)
    })

    it('launches when the player has no telemetry sink', () => {
      delete playerWindow.telemetry_web
      component.onPreviewLoad()
      expect(component.status).toBe('ready')
    })

    it('emits package events posted from a frame inside the player', () => {
      component.onPreviewLoad()
      message(packageEvent, packageFrame as any)
      expect(events).toEqual([expect.objectContaining({ source: 'package', eid: 'PROGRESS', edata: { id: 'p', pct: 27 } })])
    })

    it('accepts events posted by the player window itself', () => {
      component.onPreviewLoad()
      message(packageEvent, playerWindow)
      expect(events.length).toBe(1)
    })

    it('ignores messages from other windows, without a source, or of another type', () => {
      component.onPreviewLoad()
      message(packageEvent, { name: 'stranger' } as any)
      message(packageEvent, null)
      message({ type: 'something-else' }, packageFrame as any)
      expect(events).toEqual([])
    })

    it('ignores messages when the player window has no frames list', () => {
      delete playerWindow.frames
      message(packageEvent, packageFrame as any)
      expect(events).toEqual([])
    })

    it('ignores messages when the player frame is gone', () => {
      component.playerFrame = undefined
      message(packageEvent, packageFrame as any)
      expect(events).toEqual([])
    })

    it('sends the saved position to the package once it starts (MODULE_START)', () => {
      const postMessage = jest.fn()
      const pkgWindow: any = { postMessage }
      playerWindow.frames = { length: 1, 0: pkgWindow }
      component.resumeState = { si: 1 }
      component.onPreviewLoad()
      message({ type: 'html-archive:telemetry', event: { type: 'MODULE_START', extra: {} } }, pkgWindow)
      expect(postMessage).toHaveBeenCalledWith({ type: 'html-archive:resume', state: { si: 1 } }, '*')
      message({ type: 'html-archive:telemetry', event: { type: 'MODULE_START', extra: {} } }, pkgWindow)
      expect(postMessage).toHaveBeenCalledTimes(1)
    })

    it('sends a position that arrives after the package started', () => {
      const postMessage = jest.fn()
      const pkgWindow: any = { postMessage }
      playerWindow.frames = { length: 1, 0: pkgWindow }
      component.onPreviewLoad()
      message({ type: 'html-archive:telemetry', event: { type: 'MODULE_START', extra: {} } }, pkgWindow)
      expect(postMessage).not.toHaveBeenCalled()
      component.resumeState = { si: 2 }
      component.ngOnChanges({ resumeState: new SimpleChange(null, { si: 2 }, false) })
      expect(postMessage).toHaveBeenCalledWith({ type: 'html-archive:resume', state: { si: 2 } }, '*')
    })

    it('resends after a relaunch with new content', () => {
      const postMessage = jest.fn()
      const pkgWindow: any = { postMessage }
      playerWindow.frames = { length: 1, 0: pkgWindow }
      component.resumeState = { si: 1 }
      component.onPreviewLoad()
      message({ type: 'html-archive:telemetry', event: { type: 'MODULE_START', extra: {} } }, pkgWindow)
      component.ngOnChanges({ metadata: new SimpleChange(null, component.metadata, false) })
      message({ type: 'html-archive:telemetry', event: { type: 'MODULE_START', extra: {} } }, pkgWindow)
      expect(postMessage).toHaveBeenCalledTimes(2)
    })

    it('stops listening on destroy', () => {
      component.onPreviewLoad()
      component.ngOnDestroy()
      message(packageEvent, packageFrame as any)
      expect(events).toEqual([])
    })
  })

  describe('fit to content height', () => {
    let matches: boolean
    let rafs: (() => void)[]
    const host: any = { style: { height: '' }, clientHeight: 700 }

    beforeEach(() => {
      jest.useFakeTimers()
      matches = true
      rafs = []
      ;(window as any).matchMedia = jest.fn(() => ({ matches }))
      jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: any) => { rafs.push(cb); return rafs.length })
      host.style.height = ''
      component.playerFrame = { nativeElement: Object.assign(host, { contentWindow: playerWindow }) } as any
      component.location = localArchiveLocation()
    })

    afterEach(() => {
      jest.useRealTimers()
      jest.restoreAllMocks()
    })

    const contentDoc = (bottom: number) => {
      const listeners: Record<string, any> = {}
      return {
        body: { querySelectorAll: () => [{ getBoundingClientRect: () => ({ bottom, height: 40 }) }] },
        defaultView: { scrollY: 0, getComputedStyle: () => ({ position: 'static' }) },
        addEventListener: jest.fn((n: string, cb: any) => { listeners[n] = cb }),
        fonts: { ready: Promise.resolve() },
        listeners,
      }
    }

    const launchWithContent = (doc: any) => {
      // records every MutationObserver created: [0] finds the content iframe, [1] watches its screens
      const observers: any[] = []
      const Tracking = class {
        cb: any
        observe = jest.fn()
        disconnect = jest.fn()
        constructor(cb: any) { this.cb = cb; observers.push(this) }
      }
      playerWindow.document = { body: {} }
      playerWindow.MutationObserver = Tracking
      component.onPreviewLoad()
      const frame: any = { nodeName: 'IFRAME', clientHeight: 700, contentDocument: doc, contentWindow: { MutationObserver: Tracking }, handlers: {} as any }
      frame.addEventListener = (n: string, cb: any) => { frame.handlers[n] = cb }
      observers[0].cb([{ addedNodes: [frame] }])
      frame.handlers.load()
      return { frame, observers }
    }

    it('sizes the frame to the content on small screens', () => {
      launchWithContent(contentDoc(462))
      rafs.forEach(cb => cb())
      expect(host.style.height).toBe('478px')
    })

    it('re-fits when the content changes, and again after it settles', () => {
      const doc = contentDoc(462)
      const { observers } = launchWithContent(doc)
      rafs.splice(0).forEach(cb => cb())
      doc.body.querySelectorAll = () => [{ getBoundingClientRect: () => ({ bottom: 620, height: 40 }) }]
      observers[1].cb([])
      jest.advanceTimersByTime(1000)
      rafs.splice(0).forEach(cb => cb())
      expect(host.style.height).toBe('636px')
    })

    it('keeps the CSS height on desktop', () => {
      launchWithContent(contentDoc(462))
      matches = false
      host.style.height = '478px'
      rafs.forEach(cb => cb())
      expect(host.style.height).toBe('')
    })

    it('leaves the height alone when the content cannot be measured (another origin)', () => {
      const { frame } = launchWithContent(contentDoc(462))
      Object.defineProperty(frame, 'contentDocument', { get: () => { throw new Error('cross-origin') } })
      frame.handlers.load()
      host.style.height = ''
      component.fitToContent()
      expect(host.style.height).toBe('')
    })

    it('does nothing when fitHeight is off', () => {
      component.fitHeight = false
      playerWindow.document = { body: {} }
      playerWindow.MutationObserver = jest.fn()
      component.onPreviewLoad()
      expect(playerWindow.MutationObserver).not.toHaveBeenCalled()
      component.fitToContent()
      expect(host.style.height).toBe('')
    })
  })
})
