import {
  Component, ElementRef, EventEmitter, Input, NgZone, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild,
} from '@angular/core'
import { SafeResourceUrl } from '@angular/platform-browser'
import { LoggerService, SafeResourceUrlService } from '@ws-widget/utils'
import {
  buildHtmlArchivePlayerConfig, CONTENT_END_EVENT, CONTENT_PLAYER_PREVIEW_PATH, PLAYER_LIFECYCLE_EVENTS,
  FIT_HEIGHT_MEDIA, HTML_ARCHIVE_RESUME_MESSAGE, IContentPlayerContext, IContentPlayerMetadata, IPlayerTelemetryEvent, measureContentHeight,
  normalizePackageMessage, normalizePlayerEvent, resolveContentLocation,
} from './content-player.util'

const PREVIEW_PAGE = new URL(CONTENT_PLAYER_PREVIEW_PATH, 'http://x').pathname

export type TPlayerStatus = 'loading' | 'ready' | 'error'

/**
 * Renders an ekstep/Sunbird html-archive package with @project-sunbird/content-player.
 *
 * The player (preview.html) runs in an iframe; it opens the package's index.html in a second,
 * nested iframe. The package's htmlInterface.js reaches the renderer through `window.top`, which is
 * this app's window, so the player's EkstepRendererAPI is bridged onto it while the player is mounted.
 *
 * Telemetry: the player's V3 events (START, END, INTERACT/HEARTBEAT...) are read from its
 * browser-preview sink `telemetry_web.send`. The package's own events (PROGRESS, ASSESS...) arrive as a
 * postMessage `{ type: 'html-archive:telemetry', event }` to the top window, accepted only from frames
 * inside this player — which also works when the package is served from another origin.
 */
@Component({
  standalone: false,
  selector: 'ws-app-sunbird-content-player',
  templateUrl: './sunbird-content-player.component.html',
  styleUrls: ['./sunbird-content-player.component.scss'],
})
export class SunbirdContentPlayerComponent implements OnChanges, OnDestroy {
  @Input() metadata: IContentPlayerMetadata | null = null
  @Input() context: IContentPlayerContext = {}
  /**
   * The player's own end page (Congratulations, Replay, a feedback form that posts nowhere).
   * Off by default: Sphere decides what follows. END telemetry and contentEnd fire either way.
   */
  @Input() showEndPage = false
  /**
   * On small screens (FIT_HEIGHT_MEDIA) size the frame to the content's own height, screen by screen,
   * so there is no empty block under short screens and no scrolling inside the frame on tall ones.
   * Needs same-origin content; otherwise the CSS height applies.
   */
  @Input() fitHeight = true
  /**
   * Where the learner left off (the package's last STATE snapshot). Sent to the package once it starts
   * (MODULE_START); a package that does not support resume ignores it.
   */
  @Input() resumeState: unknown = null
  @Output() readonly contentEnd = new EventEmitter<string>()
  @Output() readonly playerError = new EventEmitter<string>()
  @Output() readonly telemetry = new EventEmitter<IPlayerTelemetryEvent>()

  @ViewChild('playerFrame', { static: false }) playerFrame?: ElementRef<HTMLIFrameElement>

  readonly previewUrl: SafeResourceUrl | null
  status: TPlayerStatus = 'loading'
  private previewLoaded = false
  private bridged = false
  private previousRendererApi: unknown
  private telemetryHooked = false
  private readonly onMessage = (message: MessageEvent) => this.receivePackageMessage(message)
  private readonly onResize = () => this.scheduleFit()
  private fitObservers: MutationObserver[] = []
  private fitFrame: HTMLIFrameElement | null = null
  private fitPending = false
  private fitTimers: ReturnType<typeof setTimeout>[] = []
  private packageWindow: MessageEventSource | null = null
  private resumeSent = false

  constructor(
    safeUrlSvc: SafeResourceUrlService,
    private readonly zone: NgZone,
    private readonly logger: LoggerService,
  ) {
    this.previewUrl = safeUrlSvc.trust(CONTENT_PLAYER_PREVIEW_PATH)
    // Most messages are not ours; only a matching package event re-enters the zone (emitTelemetry).
    this.zone.runOutsideAngular(() => {
      window.addEventListener('message', this.onMessage)
      window.addEventListener('resize', this.onResize)
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.metadata && this.previewLoaded) {
      this.resumeSent = false
      this.packageWindow = null
      this.launch()
    }
    if (changes.resumeState) {
      // saved progress may arrive after the package has already started
      this.sendResumeIfReady()
    }
  }

  ngOnDestroy() {
    this.removeBridge()
    window.removeEventListener('message', this.onMessage)
    window.removeEventListener('resize', this.onResize)
    this.fitObservers.forEach(o => o.disconnect())
    this.fitObservers = []
    this.fitTimers.forEach(t => clearTimeout(t))
    this.fitTimers = []
  }

  onPreviewLoad() {
    // A same-origin iframe fires `load` synchronously for its initial blank document, before
    // preview.html has been fetched; launching then would report a false error.
    if (this.isBlankDocument()) {
      return
    }
    this.previewLoaded = true
    this.launch()
  }

  launch() {
    const playerWindow = this.playerFrame?.nativeElement.contentWindow as any
    if (!this.metadata) {
      return
    }
    if (!playerWindow || typeof playerWindow.initializePreview !== 'function') {
      this.fail('content-player preview.html did not load')
      return
    }
    // like other players: from the API's streamingUrl / artifactUrl, via the same-origin content proxy
    const location = resolveContentLocation(this.metadata)
    if (!location) {
      this.fail(`no playable location for ${this.metadata.identifier}`)
      return
    }
    try {
      this.bridge(playerWindow)
      this.hookTelemetry(playerWindow)
      this.watchContentHeight(playerWindow)
      playerWindow.initializePreview(
        buildHtmlArchivePlayerConfig(this.metadata, location, this.context, this.showEndPage),
      )
      this.status = 'ready'
    } catch (err) {
      this.logger.error('content-player initializePreview failed', err)
      this.fail('content-player failed to start')
    }
  }

  private isBlankDocument(): boolean {
    try {
      const href = this.playerFrame?.nativeElement.contentWindow?.location?.href
      return !href || href === 'about:blank' || !new URL(href).pathname.endsWith(PREVIEW_PAGE)
    } catch {
      return false
    }
  }

  private bridge(playerWindow: any) {
    const api = playerWindow.EkstepRendererAPI
    if (!api) {
      return
    }
    if (!this.bridged) {
      this.previousRendererApi = (window as any).EkstepRendererAPI
      this.bridged = true
      api.addEventListener(CONTENT_END_EVENT, () => {
        // Fired from inside the player iframe, outside Angular's zone.
        this.zone.run(() => this.contentEnd.emit(this.metadata?.identifier ?? ''))
      })
      PLAYER_LIFECYCLE_EVENTS.forEach(name => api.addEventListener(name, () => {
        this.emitTelemetry({ source: 'player', eid: name, edata: {}, ets: Date.now() })
      }))
    }
    (window as any).EkstepRendererAPI = api
  }

  /** Must run before initializePreview, which logs START straight away. */
  private hookTelemetry(playerWindow: any) {
    if (this.telemetryHooked) {
      return
    }
    this.telemetryHooked = true
    const sink = playerWindow.telemetry_web
    if (sink && typeof sink.send === 'function') {
      const send = sink.send.bind(sink)
      sink.send = (raw: unknown) => {
        this.emitTelemetry(normalizePlayerEvent(raw))
        return send(raw)
      }
    }
  }

  /** Finds the content iframe the player inserts, then re-fits whenever its screen changes. */
  private watchContentHeight(playerWindow: any) {
    if (!this.fitHeight || this.fitObservers.length) {
      return
    }
    const doc: Document | undefined = playerWindow.document
    const Observer = playerWindow.MutationObserver
    if (!doc?.body || typeof Observer !== 'function') {
      return
    }
    const attach = (node: Node) => {
      if (node.nodeName !== 'IFRAME') {
        return
      }
      const frame = node as HTMLIFrameElement
      frame.addEventListener('load', () => this.observeContent(frame))
    }
    const finder = new Observer((mutations: MutationRecord[]) => mutations.forEach(m => m.addedNodes.forEach(attach)))
    finder.observe(doc.body, { childList: true, subtree: true })
    this.fitObservers.push(finder)
  }

  private observeContent(frame: HTMLIFrameElement) {
    let doc: Document | null = null
    try {
      doc = frame.contentDocument
    } catch {
      doc = null   // another origin: cannot be measured, the CSS height stays
    }
    const Observer = (frame.contentWindow as any)?.MutationObserver
    if (!doc?.body || typeof Observer !== 'function') {
      return
    }
    this.fitFrame = frame
    // a new screen (innerHTML swap), and media/images that change size once they load
    const changes = new Observer(() => this.fitSoon())
    changes.observe(doc.body, { childList: true, subtree: true })
    this.fitObservers.push(changes)
    doc.addEventListener('load', this.onResize, true)
    doc.addEventListener('loadedmetadata', this.onResize, true)
    // text reflows once web fonts arrive (the Devanagari font), with no DOM change to observe
    ;(doc as any).fonts?.ready?.then(() => this.scheduleFit())
    this.fitSoon()
  }

  /** A new screen settles over a moment (layout, fonts, transitions): measure now and twice more. */
  private fitSoon() {
    this.scheduleFit()
    this.fitTimers.forEach(t => clearTimeout(t))
    this.fitTimers = [300, 1000].map(ms => setTimeout(() => this.scheduleFit(), ms))
  }

  /** One measurement per animation frame, however many changes arrive. */
  private scheduleFit() {
    if (this.fitPending) {
      return
    }
    this.fitPending = true
    requestAnimationFrame(() => {
      this.fitPending = false
      this.fitToContent()
    })
  }

  fitToContent() {
    const host = this.playerFrame?.nativeElement
    if (!host) {
      return
    }
    if (!this.fitHeight || !window.matchMedia(FIT_HEIGHT_MEDIA).matches) {
      host.style.height = ''   // desktop: the CSS height
      return
    }
    let doc: Document | null = null
    try {
      doc = this.fitFrame?.contentDocument ?? null
    } catch {
      doc = null
    }
    const needed = doc ? measureContentHeight(doc, this.fitFrame?.clientHeight || host.clientHeight) : null
    if (needed && Math.abs(needed - host.clientHeight) > 2) {
      host.style.height = `${needed}px`
    }
  }

  private receivePackageMessage(message: MessageEvent) {
    if (!this.isFromThisPlayer(message.source)) {
      return
    }
    const event = normalizePackageMessage(message.data)
    if (event?.eid === 'MODULE_START') {
      this.packageWindow = message.source
      this.sendResumeIfReady()
    }
    this.emitTelemetry(event)
  }

  /** Once per launch: post the saved position to the package that has just started. */
  private sendResumeIfReady() {
    if (this.resumeSent || !this.resumeState || !this.packageWindow) {
      return
    }
    this.resumeSent = true
    ;(this.packageWindow as Window).postMessage({ type: HTML_ARCHIVE_RESUME_MESSAGE, state: this.resumeState }, '*')
  }

  /** True for the player window or any frame nested in it (the package iframe). */
  private isFromThisPlayer(source: MessageEventSource | null): boolean {
    const playerWindow = this.playerFrame?.nativeElement.contentWindow
    if (!source || !playerWindow) {
      return false
    }
    if (source === playerWindow) {
      return true
    }
    const frames = playerWindow.frames
    for (let i = 0; i < (frames?.length ?? 0); i += 1) {
      if (frames[i] === source) {
        return true
      }
    }
    return false
  }

  private emitTelemetry(event: IPlayerTelemetryEvent | null) {
    if (event) {
      this.zone.run(() => this.telemetry.emit(event))
    }
  }

  private removeBridge() {
    if (!this.bridged) {
      return
    }
    if (this.previousRendererApi === undefined) {
      delete (window as any).EkstepRendererAPI
    } else {
      (window as any).EkstepRendererAPI = this.previousRendererApi
    }
    this.bridged = false
  }

  private fail(reason: string) {
    this.logger.warn(reason)
    this.status = 'error'
    this.playerError.emit(reason)
  }
}
