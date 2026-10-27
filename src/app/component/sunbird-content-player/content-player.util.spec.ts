import {
  archiveFolderFromArtifact, buildHtmlArchivePlayerConfig, HTML_ARCHIVE_MIME_TYPE, IArchiveLocation, isHtmlContentPlayerEnabled,
  isSafeIdentifier, measureContentHeight, normalizePackageEvent, normalizePackageMessage, normalizePlayerEvent, resolveArchiveLocation,
  resolveContentLocation, toProxyPath, whiteListFor,
} from './content-player.util'

/** A same-origin location, as resolveContentLocation returns for content served through the proxy. */
const proxied: IArchiveLocation = { host: '', s3ContentHost: '/apis/proxies/v8/getContents/content/', status: 'Live' }

describe('content-player.util', () => {
  describe('isSafeIdentifier', () => {
    it('accepts plain content ids', () => {
      expect(isSafeIdentifier('do_asha_induction_s1')).toBe(true)
      expect(isSafeIdentifier('do_1.2-a')).toBe(true)
    })

    it('rejects empty ids and anything that could change the path', () => {
      expect(isSafeIdentifier('')).toBe(false)
      expect(isSafeIdentifier(null)).toBe(false)
      expect(isSafeIdentifier('../etc')).toBe(false)
      expect(isSafeIdentifier('a/b')).toBe(false)
      expect(isSafeIdentifier('a..b')).toBe(false)
    })
  })

  describe('resolveArchiveLocation', () => {
    const id = 'do_123'

    it('splits a -latest streamingUrl into the host prefix', () => {
      expect(resolveArchiveLocation('https://cdn.example.org/content/html/do_123-latest', id))
        .toEqual({ host: '', s3ContentHost: 'https://cdn.example.org/content/', status: 'Live' })
    })

    it('tolerates a trailing slash or index.html', () => {
      expect(resolveArchiveLocation('https://cdn.example.org/content/html/do_123-latest/', id)?.s3ContentHost)
        .toBe('https://cdn.example.org/content/')
      expect(resolveArchiveLocation('https://cdn.example.org/content/html/do_123-latest/index.html', id)?.status)
        .toBe('Live')
    })

    it('maps a -snapshot folder to Draft', () => {
      expect(resolveArchiveLocation('/c/html/do_123-snapshot', id)).toEqual({ host: '', s3ContentHost: '/c/', status: 'Draft' })
    })

    it('returns null for urls the player cannot be pointed at', () => {
      expect(resolveArchiveLocation('https://cdn.example.org/ecar/do_123.zip', id)).toBeNull()
      expect(resolveArchiveLocation('https://cdn.example.org/content/html/do_999-latest', id)).toBeNull()
      expect(resolveArchiveLocation(undefined, id)).toBeNull()
      expect(resolveArchiveLocation('/c/html/x-latest', '../x')).toBeNull()
    })
  })

  describe('whiteListFor', () => {
    it('allows only self for same-origin packages', () => {
      expect(whiteListFor(proxied)).toEqual(['self'])
    })

    it('adds the origin of a remote package host', () => {
      expect(whiteListFor({ host: '', s3ContentHost: 'https://cdn.example.org/content/', status: 'Live' }))
        .toEqual(['self', 'https://cdn.example.org/**'])
    })
  })

  describe('buildHtmlArchivePlayerConfig', () => {
    it('fills defaults for context, overlay, mimeType, status and pkgVersion', () => {
      const cfg = buildHtmlArchivePlayerConfig({ identifier: 'do_a', name: 'A' }, proxied)
      expect(cfg.context.contentId).toBe('do_a')
      expect(cfg.context.mode).toBe('play')
      expect(cfg.context.uid).toBe('anonymous')
      expect(cfg.config.host).toBe('')
      expect(cfg.config.s3ContentHost).toBe('/apis/proxies/v8/getContents/content/')
      expect(cfg.config.showEndPage).toBe(false)
      expect(cfg.config.overlay.showNext).toBe(false)
      expect(cfg.metadata).toEqual({ identifier: 'do_a', name: 'A', mimeType: HTML_ARCHIVE_MIME_TYPE, status: 'Live', pkgVersion: 1 })
      // an undefined body makes the player refetch metadata from /action/content/v3/read
      expect(cfg.data).toEqual({})
    })

    it('passes the caller context through and lets status follow the location', () => {
      const cfg = buildHtmlArchivePlayerConfig(
        { identifier: 'do_a', status: 'Live', pkgVersion: 3 },
        { host: '', s3ContentHost: '/c/', status: 'Draft' },
        { uid: 'u1', sid: 's1', did: 'd1', channel: 'ch', pdata: { id: 'p', ver: '2' }, cdata: [{ id: 'c', type: 't' }] },
        true,
      )
      expect(cfg.context).toEqual(expect.objectContaining({ uid: 'u1', sid: 's1', did: 'd1', channel: 'ch' }))
      expect(cfg.context.pdata).toEqual({ id: 'p', ver: '2' })
      expect(cfg.context.cdata).toEqual([{ id: 'c', type: 't' }])
      expect(cfg.config.showEndPage).toBe(true)
      expect(cfg.metadata.status).toBe('Draft')
      expect(cfg.metadata.pkgVersion).toBe(3)
    })
  })

  describe('normalizePlayerEvent', () => {
    it('accepts an event object or its JSON string', () => {
      const event = { eid: 'END', ets: 5, edata: { duration: 2 } }
      expect(normalizePlayerEvent(event)).toEqual({ source: 'player', eid: 'END', ets: 5, edata: { duration: 2 } })
      expect(normalizePlayerEvent(JSON.stringify(event))).toEqual({ source: 'player', eid: 'END', ets: 5, edata: { duration: 2 } })
    })

    it('defaults edata and ets', () => {
      expect(normalizePlayerEvent({ eid: 'START' }, 9)).toEqual({ source: 'player', eid: 'START', ets: 9, edata: {} })
    })

    it('ignores anything that is not an event', () => {
      expect(normalizePlayerEvent('not json')).toBeNull()
      expect(normalizePlayerEvent({ foo: 1 })).toBeNull()
      expect(normalizePlayerEvent(null)).toBeNull()
    })
  })

  describe('normalizePackageEvent', () => {
    it('maps interact({ type, id, extra }) to an event', () => {
      expect(normalizePackageEvent({ type: 'ASSESS', id: 'asha-s1', extra: { qindex: 0, correct: true } }, 7))
        .toEqual({ source: 'package', eid: 'ASSESS', ets: 7, edata: { id: 'asha-s1', qindex: 0, correct: true } })
      expect(normalizePackageEvent({ type: 'PING' }, 7)?.edata).toEqual({ id: undefined })
    })

    it('ignores calls without a type', () => {
      expect(normalizePackageEvent({ id: 'x' })).toBeNull()
      expect(normalizePackageEvent(undefined)).toBeNull()
    })
  })

  describe('normalizePackageMessage', () => {
    it('unwraps html-archive telemetry messages only', () => {
      expect(normalizePackageMessage({ type: 'html-archive:telemetry', event: { type: 'PROGRESS', extra: { pct: 9 } } }, 3))
        .toEqual({ source: 'package', eid: 'PROGRESS', ets: 3, edata: { id: undefined, pct: 9 } })
      expect(normalizePackageMessage({ type: 'other', event: { type: 'X' } })).toBeNull()
      expect(normalizePackageMessage('string')).toBeNull()
      expect(normalizePackageMessage(null)).toBeNull()
    })
  })

  describe('measureContentHeight', () => {
    const el = (bottom: number, height: number, position = 'static') => ({ getBoundingClientRect: () => ({ bottom, height }), position })
    const fakeDoc = (els: any[], scrollY = 0) => ({
      body: { querySelectorAll: () => els },
      defaultView: { scrollY, getComputedStyle: (e: any) => ({ position: e.position }) },
    }) as unknown as Document

    it('returns the lowest visible element plus a margin', () => {
      expect(measureContentHeight(fakeDoc([el(300, 100), el(462, 40)]), 700)).toBe(478)
    })

    it('skips wrappers as tall as the frame, fixed/sticky elements and empty boxes', () => {
      const doc = fakeDoc([el(700, 700), el(690, 40, 'fixed'), el(650, 30, 'sticky'), el(500, 0), el(400, 50)])
      expect(measureContentHeight(doc, 700)).toBe(416)
    })

    it('adds the document scroll offset, and clamps to the min and max', () => {
      expect(measureContentHeight(fakeDoc([el(500, 50)], 200), 600)).toBe(716)
      expect(measureContentHeight(fakeDoc([el(50, 20)]), 600)).toBe(320)
      expect(measureContentHeight(fakeDoc([el(9000, 20)]), 600)).toBe(4000)
    })

    it('returns null when nothing can be measured', () => {
      expect(measureContentHeight(fakeDoc([]), 600)).toBeNull()
      expect(measureContentHeight({ body: null, defaultView: {} } as unknown as Document, 600)).toBeNull()
    })
  })

  describe('isHtmlContentPlayerEnabled', () => {
    const content = { identifier: 'do_a', mimeType: HTML_ARCHIVE_MIME_TYPE }
    it('uses the new player for listed IDs or mimeTypes only', () => {
      expect(isHtmlContentPlayerEnabled(content, { contentIds: ['do_a'] })).toBe(true)
      expect(isHtmlContentPlayerEnabled(content, { mimeTypes: [HTML_ARCHIVE_MIME_TYPE] })).toBe(true)
      expect(isHtmlContentPlayerEnabled(content, { contentIds: ['do_b'], mimeTypes: [] })).toBe(false)
      expect(isHtmlContentPlayerEnabled(content, {})).toBe(false)
    })
    it('is off without content or config', () => {
      expect(isHtmlContentPlayerEnabled(null, { contentIds: ['do_a'] })).toBe(false)
      expect(isHtmlContentPlayerEnabled(content, undefined)).toBe(false)
      expect(isHtmlContentPlayerEnabled({}, { contentIds: ['do_a'], mimeTypes: [HTML_ARCHIVE_MIME_TYPE] })).toBe(false)
    })
  })

  describe('toProxyPath', () => {
    it('serves absolute content URLs through the same-origin proxy', () => {
      expect(toProxyPath('https://static.sphere.aastrika.org/content/html/do_a-latest'))
        .toBe('/apis/proxies/v8/getContents/content/html/do_a-latest')
    })
    it('leaves relative paths alone', () => {
      expect(toProxyPath('/content/html/do_a-latest')).toBe('/content/html/do_a-latest')
    })
  })

  describe('archiveFolderFromArtifact', () => {
    const zip = 'https://static.sphere.aastrika.org/content/do_a/artifact/asha-section1-html.zip'
    it('derives the unpacked folder from the artifact zip', () => {
      expect(archiveFolderFromArtifact(zip, 'do_a', 'Live')).toBe('https://static.sphere.aastrika.org/content/html/do_a-latest')
      expect(archiveFolderFromArtifact(zip, 'do_a')).toBe('https://static.sphere.aastrika.org/content/html/do_a-latest')
      expect(archiveFolderFromArtifact(zip, 'do_a', 'Draft')).toBe('https://static.sphere.aastrika.org/content/html/do_a-snapshot')
    })
    it('returns null for other URLs', () => {
      expect(archiveFolderFromArtifact('https://x/content/do_a/artifact/file.pdf', 'do_a')).toBeNull()
      expect(archiveFolderFromArtifact('https://x/content/do_b/artifact/file.zip', 'do_a')).toBeNull()
      expect(archiveFolderFromArtifact(undefined, 'do_a')).toBeNull()
      expect(archiveFolderFromArtifact(zip, '../a')).toBeNull()
    })
  })

  describe('resolveContentLocation (from the API response, like other players)', () => {
    it('prefers streamingUrl, through the proxy', () => {
      expect(resolveContentLocation({ identifier: 'do_a', streamingUrl: 'https://cdn.x/content/html/do_a-latest' }))
        .toEqual({ host: '', s3ContentHost: '/apis/proxies/v8/getContents/content/', status: 'Live' })
    })
    it('falls back to the folder derived from artifactUrl', () => {
      expect(resolveContentLocation({ identifier: 'do_a', status: 'Live', artifactUrl: 'https://cdn.x/content/do_a/artifact/a.zip' }))
        .toEqual({ host: '', s3ContentHost: '/apis/proxies/v8/getContents/content/', status: 'Live' })
    })
    it('can skip the proxy, and returns null when nothing fits', () => {
      expect(resolveContentLocation({ identifier: 'do_a', streamingUrl: 'https://cdn.x/content/html/do_a-latest' }, false)?.s3ContentHost)
        .toBe('https://cdn.x/content/')
      expect(resolveContentLocation({ identifier: 'do_a', artifactUrl: 'https://cdn.x/a.pdf' })).toBeNull()
    })
  })
})
