/* eslint-disable @typescript-eslint/no-var-requires */
// Unit tests for the request-time course link-preview tags used by server.js.
const {
  buildPreview,
  createCourseLookup,
  injectPreviewTags,
  isCourseId,
  isPreviewBot,
  portalHost,
  MAX_CACHE_ENTRIES,
  MISS_TTL_MS,
  FOUND_TTL_MS,
} = require('./course-preview')

const INDEX_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Aastrika Sphere - Free CNE Courses | INC Certified | Healthcare Training</title>
  <meta name="description" content="Earn CNE points and INC certification">
  <meta property="og:site_name" content="Aastrika Sphere" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Aastrika Sphere - Free CNE Courses | INC Certified | Healthcare Training" />
  <meta property="og:description" content="Earn CNE points" />
  <meta property="og:url" content="https://sphere.aastrika.org/" />
  <meta property="og:image" content="https://sphere.aastrika.org/fusion-assets/images/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="en_IN" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Aastrika Sphere - Free Certified Courses" />
  <meta name="twitter:image"
    content="https://sphere.aastrika.org/fusion-assets/images/og-image.png" />
  <meta name="twitter:image:alt" content="Aastrika Sphere" />
  <link rel="canonical" href="https://sphere.aastrika.org/">
</head>
<body><ws-root></ws-root></body>
</html>`

const TB_COURSE = {
  identifier: 'do_2146938432070123521566',
  name: 'Training Module on Cough Syrup Surveillance for Reducing Diagnosis Delays of TB',
  sourceName: 'Jhpiego',
  issueCertification: true,
  posterImage: 'https://s3.example/poster.png',
  appIcon: 'https://s3.example/icon.thumb.png',
}

function okResponse(content: any[]) {
  return { ok: true, status: 200, json: async () => ({ result: { content, count: content.length } }) }
}

describe('course-preview', () => {
  describe('isPreviewBot', () => {
    it('recognises link-preview crawlers', () => {
      expect(isPreviewBot('WhatsApp/2.23.20.0 A')).toBe(true)
      expect(isPreviewBot('facebookexternalhit/1.1')).toBe(true)
      expect(isPreviewBot('LinkedInBot/1.0')).toBe(true)
    })

    it('leaves browsers and a missing user agent alone', () => {
      expect(isPreviewBot('Mozilla/5.0 (Windows NT 10.0) Chrome/130.0 Safari/537.36')).toBe(false)
      expect(isPreviewBot(undefined)).toBe(false)
    })
  })

  describe('isCourseId', () => {
    it('accepts content ids only', () => {
      expect(isCourseId('do_2146938432070123521566')).toBe(true)
      expect(isCourseId('../etc/passwd')).toBe(false)
      expect(isCourseId(['do_1'])).toBe(false)
      expect(isCourseId(undefined)).toBe(false)
    })
  })

  describe('portalHost', () => {
    it('keeps our own portals and drops the port', () => {
      expect(portalHost('ekshamata.aastrika.org')).toBe('ekshamata.aastrika.org')
      expect(portalHost('sphere.aastrika.org:443')).toBe('sphere.aastrika.org')
    })

    it('falls back to Sphere for any other host', () => {
      expect(portalHost('evil.example.com')).toBe('sphere.aastrika.org')
      expect(portalHost('aastrika.org.evil.com')).toBe('sphere.aastrika.org')
      expect(portalHost('localhost:3002')).toBe('sphere.aastrika.org')
      expect(portalHost(undefined)).toBe('sphere.aastrika.org')
    })
  })

  describe('buildPreview', () => {
    it('describes a certificate course without claiming CNE', () => {
      const p = buildPreview(TB_COURSE, 'sphere.aastrika.org')
      expect(p.title).toBe(`${TB_COURSE.name} | Free Certificate Course — Jhpiego | Aastrika Sphere`)
      expect(p.description).toContain('Get a certificate on completion. No fees, self-paced.')
      expect(p.title + p.description).not.toMatch(/CNE|INC/)
      expect(p.image).toBe('https://s3.example/poster.png')
      expect(p.url).toBe(`https://sphere.aastrika.org/public/toc/overview/${TB_COURSE.identifier}/`
        + 'training-module-on-cough-syrup-surveillance-for-reducing-diagnosis-delays-of-tb/')
    })

    it('uses CNE wording only when the course carries CNE hours', () => {
      const p = buildPreview({ ...TB_COURSE, cneName: ' 2.5 ' }, 'sphere.aastrika.org')
      expect(p.title).toContain('| Free CNE Course —')
      expect(p.description).toContain('Earn 2.5 CNE credit hours and a certificate on completion.')
      const noCert = buildPreview({ ...TB_COURSE, cneName: '5', issueCertification: 'No' }, 'sphere.aastrika.org')
      expect(noCert.description).toContain('Earn 5 CNE credit hours. No fees')
    })

    it('says "Free Online Course" when there is no certificate', () => {
      const p = buildPreview({ ...TB_COURSE, issueCertification: false, sourceName: '' }, 'x')
      expect(p.title).toContain('| Free Online Course — Aastrika Sphere |')
      expect(p.description).toContain('Free online course by Aastrika Sphere. No fees, self-paced.')
    })

    it('strips markup from the description and keeps the offer intact', () => {
      const p = buildPreview({ ...TB_COURSE, description: `<p>${'Long text '.repeat(40)}</p>` }, 'x')
      expect(p.description).not.toContain('<p>')
      expect(p.description.endsWith('No fees, self-paced.')).toBe(true)
      expect(p.description.length).toBeLessThanOrEqual(260)
    })

    it('falls back to the app icon, then the portal card image', () => {
      expect(buildPreview({ ...TB_COURSE, posterImage: '' }, 'x').image).toBe('https://s3.example/icon.thumb.png')
      expect(buildPreview({ ...TB_COURSE, posterImage: '', appIcon: '' }, 'x').image)
        .toBe('https://sphere.aastrika.org/fusion-assets/images/og-image.png')
    })

    it('builds the canonical URL on the requesting portal', () => {
      expect(buildPreview(TB_COURSE, 'ekshamata.aastrika.org').url).toMatch(/^https:\/\/ekshamata\.aastrika\.org\//)
    })
  })

  describe('injectPreviewTags', () => {
    const preview = buildPreview(TB_COURSE, 'sphere.aastrika.org')
    const html = injectPreviewTags(INDEX_HTML, preview)

    it('removes every generic portal tag', () => {
      expect(html).not.toContain('Free CNE Courses')
      expect(html).not.toContain('og-image.png')
      expect(html).not.toContain('og:image:width')
      expect(html).not.toContain('twitter:image:alt')
      expect(html.match(/<title>/g)).toHaveLength(1)
      expect(html.match(/property="og:title"/g)).toHaveLength(1)
      expect(html.match(/rel="canonical"/g)).toHaveLength(1)
    })

    it('writes the course tags at the top of <head> and keeps the rest of the page', () => {
      expect(html).toMatch(/<head>\n<title>Training Module on Cough Syrup/)
      expect(html).toContain(`<meta property="og:image" content="${TB_COURSE.posterImage}">`)
      expect(html).toContain(`<meta property="og:url" content="${preview.url}">`)
      expect(html).toContain('<meta property="og:site_name" content="Aastrika Sphere" />')
      expect(html).toContain('<meta charset="utf-8">')
      expect(html).toContain('<ws-root></ws-root>')
    })

    it('escapes course text so it cannot break out of the attribute', () => {
      const out = injectPreviewTags(INDEX_HTML, { ...preview, title: 'A "quoted" <b>name</b> & more' })
      expect(out).toContain('content="A &quot;quoted&quot; &lt;b&gt;name&lt;/b&gt; &amp; more"')
      expect(out).not.toContain('<b>name</b>')
    })

    it('still adds the tags when there is no <head>', () => {
      expect(injectPreviewTags('<body></body>', preview)).toMatch(/^<title>/)
    })
  })

  describe('createCourseLookup', () => {
    let errorSpy: jest.SpyInstance

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => errorSpy.mockRestore())

    it('asks the portal\'s public search for one Live course', async () => {
      const fetchImpl = jest.fn().mockResolvedValue(okResponse([TB_COURSE]))
      const lookup = createCourseLookup({ fetchImpl })
      await expect(lookup(TB_COURSE.identifier, 'ekshamata.aastrika.org')).resolves.toEqual(TB_COURSE)
      const [url, init] = fetchImpl.mock.calls[0]
      expect(url).toBe('https://ekshamata.aastrika.org/apis/public/v8/publicSearch/getCourses')
      const body = JSON.parse(init.body)
      expect(body.request.filters).toEqual({
        primaryCategory: ['Course'], contentType: ['Course'], status: ['Live'], identifier: [TB_COURSE.identifier],
      })
      expect(init.signal).toBeDefined()
    })

    it('never calls a host outside our portals', async () => {
      const fetchImpl = jest.fn().mockResolvedValue(okResponse([TB_COURSE]))
      await createCourseLookup({ fetchImpl })(TB_COURSE.identifier, 'attacker.example')
      expect(fetchImpl.mock.calls[0][0]).toMatch(/^https:\/\/sphere\.aastrika\.org\//)
    })

    it('rejects a bad id without calling the API', async () => {
      const fetchImpl = jest.fn()
      await expect(createCourseLookup({ fetchImpl })('../../x', 'sphere.aastrika.org')).resolves.toBeNull()
      expect(fetchImpl).not.toHaveBeenCalled()
    })

    it('caches a found course for an hour', async () => {
      let clock = 0
      const fetchImpl = jest.fn().mockResolvedValue(okResponse([TB_COURSE]))
      const lookup = createCourseLookup({ fetchImpl, now: () => clock })
      await lookup(TB_COURSE.identifier, 'sphere.aastrika.org')
      clock = FOUND_TTL_MS - 1
      await lookup(TB_COURSE.identifier, 'sphere.aastrika.org')
      expect(fetchImpl).toHaveBeenCalledTimes(1)
      clock = FOUND_TTL_MS + 1
      await lookup(TB_COURSE.identifier, 'sphere.aastrika.org')
      expect(fetchImpl).toHaveBeenCalledTimes(2)
    })

    it('returns null for an unknown or nameless course and caches the miss briefly', async () => {
      let clock = 0
      const fetchImpl = jest.fn()
        .mockResolvedValueOnce(okResponse([]))
        .mockResolvedValueOnce(okResponse([{ identifier: TB_COURSE.identifier }]))
      const lookup = createCourseLookup({ fetchImpl, now: () => clock })
      await expect(lookup(TB_COURSE.identifier, 'sphere.aastrika.org')).resolves.toBeNull()
      await lookup(TB_COURSE.identifier, 'sphere.aastrika.org')
      expect(fetchImpl).toHaveBeenCalledTimes(1)
      clock = MISS_TTL_MS + 1
      await expect(lookup(TB_COURSE.identifier, 'sphere.aastrika.org')).resolves.toBeNull()
      expect(fetchImpl).toHaveBeenCalledTimes(2)
    })

    it('ignores a different course in the response', async () => {
      const fetchImpl = jest.fn().mockResolvedValue(okResponse([{ ...TB_COURSE, identifier: 'do_other' }]))
      await expect(createCourseLookup({ fetchImpl })(TB_COURSE.identifier, 'sphere.aastrika.org')).resolves.toBeNull()
    })

    it('returns null without caching on an error status, a network failure or a timeout', async () => {
      const fetchImpl = jest.fn()
        .mockResolvedValueOnce({ ok: false, status: 502, json: async () => ({}) })
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValueOnce(okResponse([TB_COURSE]))
      const lookup = createCourseLookup({ fetchImpl })
      await expect(lookup(TB_COURSE.identifier, 'sphere.aastrika.org')).resolves.toBeNull()
      await expect(lookup(TB_COURSE.identifier, 'sphere.aastrika.org')).resolves.toBeNull()
      await expect(lookup(TB_COURSE.identifier, 'sphere.aastrika.org')).resolves.toEqual(TB_COURSE)
      expect(fetchImpl).toHaveBeenCalledTimes(3)
    })

    it('returns null when no fetch implementation is available', async () => {
      await expect(createCourseLookup({ fetchImpl: null })(TB_COURSE.identifier, 'x')).resolves.toBeNull()
    })

    it('evicts the oldest entry once the cache is full', async () => {
      const fetchImpl = jest.fn((_url: string, init: any) =>
        Promise.resolve(okResponse([{ identifier: JSON.parse(init.body).request.filters.identifier[0], name: 'n' }])))
      const lookup = createCourseLookup({ fetchImpl })
      for (let i = 0; i <= MAX_CACHE_ENTRIES; i += 1) {
        await lookup(`do_${i}`, 'sphere.aastrika.org')
      }
      await lookup(`do_${MAX_CACHE_ENTRIES}`, 'sphere.aastrika.org')
      expect(fetchImpl).toHaveBeenCalledTimes(MAX_CACHE_ENTRIES + 1)
      await lookup('do_0', 'sphere.aastrika.org')
      expect(fetchImpl).toHaveBeenCalledTimes(MAX_CACHE_ENTRIES + 2)
    })
  })
})
