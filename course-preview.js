/**
 * Link-preview tags for course pages, built at request time.
 *
 * Link-preview bots (WhatsApp, Teams, LinkedIn…) don't run JavaScript, so they only see the
 * tags in the HTML the server sends. Course pages get their own tags from prerendering, but
 * prerendering runs at build time: a course published after the last deploy has no page, and
 * its shared link showed the portal's generic "Free CNE Courses" card — wrong for a non-CNE
 * course. server.js uses this module to look the course up and write its tags into index.html
 * when no prerendered page exists.
 *
 * Wording MUST match PublicTocComponent.updateSeoForToc() so a course previews the same way
 * before and after the next build prerenders it.
 */
const { coursePath } = require('./generate-sitemap')

const DEFAULT_HOST = 'sphere.aastrika.org'
const DEFAULT_OG_IMAGE = `https://${DEFAULT_HOST}/fusion-assets/images/og-image.png`
const COURSE_ID = /^do_[A-Za-z0-9_]{1,100}$/
// Only our own portals; anything else in the Host header falls back to Sphere, so a forged
// Host can never make the server call out to an arbitrary address.
const ALLOWED_HOST = /^([a-z0-9-]+\.)*aastrika\.org$/i
const SEARCH_PATH = '/apis/public/v8/publicSearch/getCourses'
// Same filters the public course page uses to load the course.
const COURSE_FILTERS = { primaryCategory: ['Course'], contentType: ['Course'], status: ['Live'] }

const LOOKUP_TIMEOUT_MS = 2000
const FOUND_TTL_MS = 60 * 60 * 1000
const MISS_TTL_MS = 5 * 60 * 1000
const MAX_CACHE_ENTRIES = 1000

const PREVIEW_BOT = new RegExp([
  'facebookexternalhit', 'facebot', 'twitterbot', 'linkedinbot', 'whatsapp', 'slackbot',
  'telegrambot', 'discordbot', 'skypeuripreview', 'teams', 'microsoftpreview', 'pinterest',
  'redditbot', 'embedly', 'googlebot', 'bingbot', 'applebot',
].join('|'), 'i')

function isPreviewBot(userAgent) {
  return PREVIEW_BOT.test(userAgent || '')
}

function isCourseId(id) {
  return typeof id === 'string' && COURSE_ID.test(id)
}

function portalHost(host) {
  const name = String(host || '').split(':')[0].toLowerCase()
  return ALLOWED_HOST.test(name) ? name : DEFAULT_HOST
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function issuesCertificate(course) {
  return course.issueCertification === true || course.issueCertification === 'Yes'
}

function cneHours(course) {
  return String(course.cneName ?? '').trim()
}

function titleTag(course) {
  if (cneHours(course)) {
    return 'Free CNE Course'
  }
  return issuesCertificate(course) ? 'Free Certificate Course' : 'Free Online Course'
}

function offerLine(course, providerName) {
  const hours = cneHours(course)
  if (hours) {
    const earn = issuesCertificate(course)
      ? `Earn ${hours} CNE credit hours and a certificate on completion.`
      : `Earn ${hours} CNE credit hours.`
    return `Free INC-approved course by ${providerName}. ${earn} No fees, self-paced.`
  }
  const certLine = issuesCertificate(course) ? ' Get a certificate on completion.' : ''
  return `Free online course by ${providerName}.${certLine} No fees, self-paced.`
}

function courseText(course) {
  return String(course.description || course.name || '')
    .replace(/<[^>]{0,1000}>/g, '')
    .slice(0, 160)
    .trim()
}

/** Title, description, image and canonical URL for one course, as the public page sets them. */
function buildPreview(course, host) {
  const providerName = course.sourceName || 'Aastrika Sphere'
  const offer = offerLine(course, providerName)
  const text = courseText(course)
  return {
    title: `${course.name} | ${titleTag(course)} — ${providerName} | Aastrika Sphere`,
    description: `${text.slice(0, Math.max(0, 257 - offer.length)).trim()} — ${offer}`,
    image: course.posterImage || course.appIcon || DEFAULT_OG_IMAGE,
    url: `https://${portalHost(host)}${coursePath(course)}/`,
  }
}

// Tags the SPA's index.html ships with that describe the portal, not the course. They are
// removed so a bot can't read the generic card first; og:site_name and og:locale stay.
const GENERIC_TAGS = [
  /<title\b[^>]*>[\s\S]*?<\/title>/gi,
  /<meta\b[^>]*\bname=["']description["'][^>]*>/gi,
  /<meta\b[^>]*\bproperty=["']og:(title|description|url|type|image(:[a-z_]+)?)["'][^>]*>/gi,
  /<meta\b[^>]*\bname=["']twitter:(card|title|description|image(:[a-z_]+)?)["'][^>]*>/gi,
  /<link\b[^>]*\brel=["']canonical["'][^>]*>/gi,
]

/** index.html with the portal's generic tags replaced by the course's own. */
function injectPreviewTags(html, preview) {
  const title = escapeHtml(preview.title)
  const description = escapeHtml(preview.description)
  const image = escapeHtml(preview.image)
  const url = escapeHtml(preview.url)
  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}">`,
    `<link rel="canonical" href="${url}">`,
    '<meta property="og:type" content="article">',
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${image}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${description}">`,
    `<meta name="twitter:image" content="${image}">`,
  ].join('\n')

  const cleaned = GENERIC_TAGS.reduce((out, pattern) => out.replace(pattern, ''), html)
  // Course tags go first in <head> so they lead even if a generic tag survives in a form
  // these patterns don't recognise.
  const headOpen = /<head\b[^>]*>/i
  return headOpen.test(cleaned)
    ? cleaned.replace(headOpen, open => `${open}\n${tags}`)
    : `${tags}\n${cleaned}`
}

/**
 * Looks a Live course up by id on the portal's public search API. Resolves to the course, or
 * null when it isn't found, the call fails or it exceeds LOOKUP_TIMEOUT_MS — never rejects,
 * so a preview problem can only ever fall back to the generic page.
 */
function createCourseLookup({ fetchImpl = globalThis.fetch, now = Date.now } = {}) {
  const cache = new Map()

  function remember(key, course) {
    if (cache.size >= MAX_CACHE_ENTRIES) {
      cache.delete(cache.keys().next().value)
    }
    cache.set(key, { course, expires: now() + (course ? FOUND_TTL_MS : MISS_TTL_MS) })
  }

  async function fetchCourse(id, host) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS)
    try {
      const res = await fetchImpl(`https://${host}${SEARCH_PATH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          request: { filters: { ...COURSE_FILTERS, identifier: [id] }, query: '', limit: 1 },
        }),
        signal: controller.signal,
      })
      if (!res.ok) {
        throw new Error(`course lookup returned ${res.status}`)
      }
      const body = await res.json()
      const course = (body?.result?.content || []).find(c => c?.identifier === id)
      return course?.name ? course : null
    } finally {
      clearTimeout(timer)
    }
  }

  return async function lookupCourse(id, requestHost) {
    if (!isCourseId(id) || typeof fetchImpl !== 'function') {
      return null
    }
    const host = portalHost(requestHost)
    const key = `${host}|${id}`
    const hit = cache.get(key)
    if (hit && hit.expires > now()) {
      return hit.course
    }
    try {
      const course = await fetchCourse(id, host)
      remember(key, course)
      return course
    } catch (err) {
      // Not cached: a timeout or an outage shouldn't pin the generic card for minutes.
      console.error(`Course preview lookup failed for ${id}:`, err.message)
      return null
    }
  }
}

module.exports = {
  buildPreview,
  createCourseLookup,
  escapeHtml,
  injectPreviewTags,
  isCourseId,
  isPreviewBot,
  portalHost,
  DEFAULT_HOST,
  MAX_CACHE_ENTRIES,
  MISS_TTL_MS,
  FOUND_TTL_MS,
}
