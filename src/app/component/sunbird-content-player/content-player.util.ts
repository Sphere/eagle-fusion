/**
 * Pure helpers for rendering ekstep/Sunbird html-archive content through
 * @project-sunbird/content-player (the GenieCanvas "preview" build).
 *
 * The player's HTML renderer, in browser-preview mode, ignores streamingUrl and
 * builds the package URL itself:
 *   host + s3ContentHost + 'html/' + identifier + ('-latest' | '-snapshot') + '/index.html'
 * so every location we hand it has to be expressed in that shape.
 */

/** Copied from node_modules by the angular.json assets entry. */
export const CONTENT_PLAYER_PREVIEW_PATH = '/content-player/preview.html?webview=true'
export const HTML_ARCHIVE_MIME_TYPE = 'application/vnd.ekstep.html-archive'
export const CONTENT_END_EVENT = 'renderer:content:end'

/**
 * Player lifecycle events (EkstepRendererAPI) forwarded as telemetry. For HTML content the player never
 * fires renderer:content:start (ECML only); launch:html and splash:hide mark the start instead.
 * They are the only progress signal for content that sends no progress of its own.
 */
export const PLAYER_LIFECYCLE_EVENTS = [
  'renderer:launch:html',     // the player starts launching the HTML content
  'renderer:splash:hide',     // index.html was found; the content is about to show
  CONTENT_END_EVENT,          // the content called showEndPage()
  'renderer:endpage:show',
  'renderer:content:replay',
  'renderer:content:close',   // the player page unloaded mid-session
  'renderer:telemetry:end',   // session closed by a relaunch or exit
]

export type TArchiveStatus = 'Live' | 'Draft'

export interface IContentPlayerMetadata {
  identifier: string
  name?: string
  mimeType?: string
  status?: string
  pkgVersion?: number | string
  streamingUrl?: string
  [key: string]: any
}

export interface IContentPlayerContext {
  uid?: string
  sid?: string
  did?: string
  channel?: string
  pdata?: { id: string, ver: string, pid?: string }
  cdata?: { id: string, type: string }[]
}

export interface IArchiveLocation {
  host: string
  s3ContentHost: string
  status: TArchiveStatus
}

export interface IContentPlayerConfig {
  context: { [key: string]: any }
  config: { [key: string]: any }
  metadata: IContentPlayerMetadata
  /** Content body. Must be defined: when it is undefined the player ignores `metadata` and calls /action/content/v3/read. */
  data: Record<string, never>
}

const SAFE_IDENTIFIER = /^[\w.-]+$/

/** Identifiers end up in URL paths, so only plain ids are accepted (no '/', '..', etc). */
export function isSafeIdentifier(id: string | null | undefined): id is string {
  return !!id && SAFE_IDENTIFIER.test(id) && !id.includes('..')
}

/** Same-origin proxy for published content files (the current HTML player uses it too). */
export const CONTENT_PROXY_PREFIX = '/apis/proxies/v8/getContents'

/**
 * Which content plays in the new player instead of the current HTML player, from site config
 * (`htmlContentPlayer` in site.config.json): listed content IDs, or whole mimeTypes. Change it any time.
 */
export interface IHtmlContentPlayerConfig {
  contentIds?: string[]
  mimeTypes?: string[]
}

export function isHtmlContentPlayerEnabled(
  content: { identifier?: string, mimeType?: string } | null | undefined,
  config: IHtmlContentPlayerConfig | null | undefined,
): boolean {
  if (!content || !config) {
    return false
  }
  return (!!content.identifier && (config.contentIds ?? []).includes(content.identifier))
    || (!!content.mimeType && (config.mimeTypes ?? []).includes(content.mimeType))
}

/** Absolute content URL -> same-origin proxy path (`/apis/proxies/v8/getContents/<path>`); relative URLs pass through. */
export function toProxyPath(url: string): string {
  if (!/^https?:\/\//i.test(url)) {
    return url
  }
  const { pathname } = new URL(url)
  return `${CONTENT_PROXY_PREFIX}${pathname.startsWith('/') ? '' : '/'}${pathname}`
}

/**
 * The unpacked folder of an html-archive from its artifactUrl. Sunbird unpacks a published zip at
 * `<base>/<id>/artifact/<file>.zip` into `<base>/html/<id>-latest` (`-snapshot` before publishing).
 */
export function archiveFolderFromArtifact(artifactUrl: string | null | undefined, identifier: string, status?: string): string | null {
  if (!artifactUrl || !isSafeIdentifier(identifier)) {
    return null
  }
  const marker = `/${identifier}/artifact/`
  const at = artifactUrl.indexOf(marker)
  if (at < 0 || !/\.zip(\?.*)?$/i.test(artifactUrl)) {
    return null
  }
  return `${artifactUrl.slice(0, at)}/html/${identifier}-${status === 'Live' || !status ? 'latest' : 'snapshot'}`
}

/**
 * Where the player should load content from the API response, like any other player: the unpacked
 * folder from streamingUrl, else derived from artifactUrl (the zip), served through the same-origin proxy
 * so the content's htmlInterface.js can reach the player.
 */
export function resolveContentLocation(
  content: { identifier: string, streamingUrl?: string, artifactUrl?: string, status?: string },
  useProxy = true,
): IArchiveLocation | null {
  const candidates = [content.streamingUrl, archiveFolderFromArtifact(content.artifactUrl, content.identifier, content.status)]
  for (const url of candidates) {
    if (!url) {
      continue
    }
    const location = resolveArchiveLocation(useProxy ? toProxyPath(url) : url, content.identifier)
    if (location) {
      return location
    }
  }
  return null
}

/**
 * Splits a Sunbird streamingUrl (".../html/<id>-latest") into the host prefix the player expects.
 * Returns null when the URL does not follow that layout, because the player cannot be pointed at it.
 */
export function resolveArchiveLocation(streamingUrl: string | null | undefined, identifier: string): IArchiveLocation | null {
  if (!streamingUrl || !isSafeIdentifier(identifier)) {
    return null
  }
  const clean = streamingUrl.trim().replace(/\/index\.html$/, '').replace(/\/+$/, '')
  const suffixLatest = `html/${identifier}-latest`
  const suffixSnapshot = `html/${identifier}-snapshot`
  if (clean.endsWith(`/${suffixLatest}`)) {
    return { host: '', s3ContentHost: clean.slice(0, -suffixLatest.length), status: 'Live' }
  }
  if (clean.endsWith(`/${suffixSnapshot}`)) {
    return { host: '', s3ContentHost: clean.slice(0, -suffixSnapshot.length), status: 'Draft' }
  }
  return null
}

/** The player blocks any URL not whitelisted; 'self' covers same-origin packages. */
export function whiteListFor(location: IArchiveLocation): string[] {
  const list = ['self']
  const base = `${location.host}${location.s3ContentHost}`
  if (/^https?:\/\//i.test(base)) {
    list.push(`${new URL(base).origin}/**`)
  }
  return list
}

/** Builds the object passed to the player's window.initializePreview(). */
export function buildHtmlArchivePlayerConfig(
  metadata: IContentPlayerMetadata,
  location: IArchiveLocation,
  context: IContentPlayerContext = {},
  showEndPage = false,
): IContentPlayerConfig {
  return {
    context: {
      mode: 'play',
      contentId: metadata.identifier,
      uid: context.uid ?? 'anonymous',
      sid: context.sid ?? '',
      did: context.did ?? '',
      channel: context.channel ?? '',
      pdata: context.pdata ?? { id: 'sphere.portal', ver: '1.0', pid: 'sphere-portal' },
      cdata: context.cdata ?? [],
    },
    config: {
      host: location.host,
      s3ContentHost: location.s3ContentHost,
      whiteListUrl: whiteListFor(location),
      showEndPage,
      overlay: {
        enableUserSwitcher: false,
        showUser: false,
        showOverlay: false,
        showNext: false,
        showPrevious: false,
        showSubmit: false,
        showReload: false,
      },
    },
    metadata: {
      ...metadata,
      mimeType: metadata.mimeType ?? HTML_ARCHIVE_MIME_TYPE,
      status: location.status,
      pkgVersion: metadata.pkgVersion ?? 1,
    },
    data: {},
  }
}

/** Below this width the player frame is sized to its content (phones, phone landscape, tablet portrait). */
export const FIT_HEIGHT_MEDIA = '(max-width: 1023px)'
export const MIN_FIT_HEIGHT = 320
export const MAX_FIT_HEIGHT = 4000

/**
 * Height the content actually needs, in CSS px, or null if nothing can be measured.
 * HTML content usually stretches its page to the frame (html/body height 100%), so the frame height
 * cannot be read from the document. Instead: the lowest bottom edge of any visible element, skipping
 * elements as tall as the frame (stretching wrappers) and fixed/sticky ones (pinned to the frame's edges),
 * which would otherwise make the frame grow forever.
 */
export function measureContentHeight(doc: Document, frameHeight: number, margin = 16): number | null {
  const view = doc.defaultView
  if (!doc.body || !view) {
    return null
  }
  let lowest = 0
  const elements = doc.body.querySelectorAll('*')
  const count = Math.min(elements.length, 3000)
  for (let i = 0; i < count; i += 1) {
    const el = elements[i]
    const rect = el.getBoundingClientRect()
    if (!rect.height || rect.height >= frameHeight - 1) {
      continue
    }
    const position = view.getComputedStyle(el).position
    if (position === 'fixed' || position === 'sticky') {
      continue
    }
    lowest = Math.max(lowest, rect.bottom + view.scrollY)
  }
  if (!lowest) {
    return null
  }
  return Math.min(MAX_FIT_HEIGHT, Math.max(MIN_FIT_HEIGHT, Math.ceil(lowest + margin)))
}

/** Who raised a telemetry event: the content-player itself, or the html-archive package inside it. */
export type TTelemetrySource = 'player' | 'package'

export interface IPlayerTelemetryEvent {
  source: TTelemetrySource
  /** V3 eid for player events (START, END, INTERACT...), the package's own type otherwise (ASSESS...). */
  eid: string
  edata: { [key: string]: any }
  /** Epoch milliseconds */
  ets: number
}

/**
 * The player's browser-preview telemetry sink (`telemetry_web.send`) receives each V3 event,
 * sometimes as a JSON string. Returns null for anything that is not an event.
 */
export function normalizePlayerEvent(raw: unknown, now = Date.now()): IPlayerTelemetryEvent | null {
  let event: any = raw
  if (typeof raw === 'string') {
    try {
      event = JSON.parse(raw)
    } catch {
      return null
    }
  }
  if (!event || typeof event.eid !== 'string') {
    return null
  }
  return { source: 'player', eid: event.eid, edata: event.edata ?? {}, ets: typeof event.ets === 'number' ? event.ets : now }
}

/** postMessage type an html-archive package uses to send its own events to the host page. */
export const HTML_ARCHIVE_TELEMETRY_MESSAGE = 'html-archive:telemetry'
/** postMessage type the host sends back to the package to reopen a saved position. */
export const HTML_ARCHIVE_RESUME_MESSAGE = 'html-archive:resume'

/** Unwraps `{ type: 'html-archive:telemetry', event: { type, id, extra } }`; null for any other message. */
export function normalizePackageMessage(data: any, now = Date.now()): IPlayerTelemetryEvent | null {
  return data?.type === HTML_ARCHIVE_TELEMETRY_MESSAGE ? normalizePackageEvent(data.event, now) : null
}

/** Package events have the `TelemetryService.interact({ type, id, extra })` shape (the ASHA module's). */
export function normalizePackageEvent(raw: any, now = Date.now()): IPlayerTelemetryEvent | null {
  if (!raw || typeof raw.type !== 'string') {
    return null
  }
  return { source: 'package', eid: raw.type, edata: { id: raw.id, ...(raw.extra ?? {}) }, ets: now }
}
