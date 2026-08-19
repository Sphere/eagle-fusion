#!/usr/bin/env node
/**
 * Runs automatically before `yarn prerender` via the package.json script.
 *
 * Does two things:
 *  1. Fetches all live courses and writes src/sitemap.xml
 *  2. Writes prerender-routes.txt with all public routes (static + blog + courses)
 *     so Angular prerender knows exactly which URLs to generate static HTML for.
 *
 * If the API is unreachable the existing sitemap is kept and the build continues.
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

const BASE_URL = 'https://sphere.aastrika.org'
const SITEMAP_PATH = path.join(__dirname, 'src', 'sitemap.xml')
const ROUTES_PATH = path.join(__dirname, 'prerender-routes.txt')
const CNE_COURSES_PATH = path.join(
  __dirname, 'src', 'app', 'routes', 'public', 'public-cne', 'cne-courses.generated.ts'
)
const TODAY = new Date().toISOString().split('T')[0]
const PAGE_SIZE = 200
const API_HOST = 'sphere.aastrika.org'
const API_PATH = '/api/content/v1/search'
const FORM_API_PATH = '/apis/v1/form/read'
// The home page's "CNE COURSES" section is driven by this playlist config id.
const CNE_PLAYLIST_CONFIG_ID = 'CNE_COURSE_PLAYLIST'

const STATIC_ROUTES = [
  '/public/home',
  '/public/about',
  '/public/contact',
  '/public/cne-courses',
  '/public/blog',
  '/public/blog/how-to-earn-cne-points-online',
  '/public/blog/inc-certification-guide-for-nurses',
  '/public/blog/free-courses-for-anm-gnm-staff-nurses',
  '/public/blog/what-is-amtsl-guide-for-healthcare-workers',
  '/public/blog/maternal-health-training-online-india',
]

// Org landing pages — kept in sync with the form API org_config source list
const ORG_NAMES = [
  'Aastrika Foundation',
  'Fernandez Foundation',
  'Maternity Foundation',
  'Indian Nursing Council',
  'State Institute of Health and Family Welfare, UP',
  'Manyata (FOGSI-MSD)',
  'LaQshya',
  'UNFPA',
  'WHO',
  'ICM',
  'NQOCN',
  'I Love 9 Months',
  'Noora Health',
  'IPE Global',
  'MoHFW',
  'Ministry of Health and Family Welfare',
  'KAHER Institute of Nursing Sciences',
  'Jhpiego',
  'The White Ribbon Alliance, India',
  'The White Ribbon Alliance',
  'Pronto India Foundation',
  'White Ribbon Alliance India',
  'UPTSU',
  'C-Safe',
  'Path',
  'KLE Institute of Physiotherapy,Belgavi',
  'IHAT',
  'Wonder4Health',
  'EngenderHealth',
  'Tamil Nadu Nurses and Midwives Council',
  'TRAINED NURSES\' ASSOCIATION OF INDIA (TNAI)',
  'Tamil Nadu Nurses and Midwives Council (TNNMC)',
  'Maharashtra Nursing Council',
  'Market Access 360',
  'Madhya Pradesh - National Health Mission',
  'Goa Nursing Council',
]

/**
 * The CDN 301-redirects extension-less paths to their trailing-slash form, so a
 * sitemap listing `/public/home` submits a redirect rather than a page. Google
 * reports those as "Page with redirect" and drops them from the index. Query-string
 * URLs (org landing pages) are served as-is and must not get a slash.
 */
function servedUrl(pathname) {
  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

// Devanagari -> Latin, enough for readable keyword slugs (not scholarly IAST).
const DEVANAGARI_VOWELS = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'ॲ': 'a', 'ऑ': 'o',
}
const DEVANAGARI_MATRAS = {
  'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ॉ': 'o', 'ॅ': 'a',
}
const DEVANAGARI_CONSONANTS = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'ळ': 'l', 'व': 'v',
  'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क़': 'q', 'ख़': 'kh', 'ग़': 'g', 'ज़': 'z', 'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f',
}
const NASALS = { 'ं': 'n', 'ँ': 'n', 'ः': 'h' }
const HALANT = '्'

/**
 * Transliterates Devanagari so Hindi course titles produce keyword-bearing slugs.
 * Without it `slugify` strips every character and the caller falls back to the
 * content id, which is why 189 of 497 course URLs read
 * `/public/toc/overview/do_1145.../do_1145.../` — the id repeated, carrying no
 * search signal at all. A consonant carries an inherent 'a' unless a matra or a
 * halant follows it.
 */
function transliterateDevanagari(text) {
  let out = ''
  let pendingInherentA = false

  for (const ch of text) {
    if (DEVANAGARI_CONSONANTS[ch]) {
      if (pendingInherentA) { out += 'a' }
      out += DEVANAGARI_CONSONANTS[ch]
      pendingInherentA = true
    } else if (DEVANAGARI_MATRAS[ch]) {
      out += DEVANAGARI_MATRAS[ch]
      pendingInherentA = false
    } else if (ch === HALANT) {
      pendingInherentA = false
    } else if (DEVANAGARI_VOWELS[ch]) {
      if (pendingInherentA) { out += 'a' }
      out += DEVANAGARI_VOWELS[ch]
      pendingInherentA = false
    } else if (NASALS[ch]) {
      // The anusvara sits after the inherent vowel: संक्रमण is "sankraman", not "snkraman".
      if (pendingInherentA) { out += 'a' }
      out += NASALS[ch]
      pendingInherentA = false
    } else if (ch === '़') {
      // bare nukta — already folded into the consonant map where it matters
    } else {
      // Word boundary. Hindi deletes the word-final inherent vowel (schwa deletion),
      // so रक्त is "rakt", not "rakta" — which is also how people type it in search.
      pendingInherentA = false
      out += ch
    }
  }

  return out
}

// Long slugs get truncated in the SERP and add nothing after the first few keywords.
// Transliterated Hindi titles reach 230+ characters, so cap on a word boundary.
const MAX_SLUG_LENGTH = 80

function slugify(text) {
  const slug = transliterateDevanagari(text)
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (slug.length <= MAX_SLUG_LENGTH) { return slug }
  const cut = slug.slice(0, MAX_SLUG_LENGTH)
  const lastDash = cut.lastIndexOf('-')
  return (lastDash > 0 ? cut.slice(0, lastDash) : cut).replace(/-+$/, '')
}

function postJson(body, apiPath = API_PATH) {
  return new Promise((resolve, reject) => {
    const raw = JSON.stringify(body)
    const options = {
      hostname: API_HOST,
      path: apiPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(raw),
        'Accept': 'application/json',
      },
      timeout: 30000,
    }
    const req = https.request(options, res => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(new Error(`JSON parse error: ${e.message}`)) }
      })
    })
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')) })
    req.on('error', reject)
    req.write(raw)
    req.end()
  })
}

async function fetchAllCourses() {
  const all = []
  let offset = 0

  while (true) {
    console.log(`[sitemap] Fetching courses offset=${offset} limit=${PAGE_SIZE}...`)
    const res = await postJson({
      request: {
        filters: { primaryCategory: ['Course'], status: ['Live'] },
        // cneName carries the CNE credit hours and is the only marker of a CNE-accredited
        // course — see buildCneCourses(). The rest feed the CNE hub's course cards.
        fields: [
          'identifier', 'name', 'lastUpdatedOn',
          'cneName', 'sourceName', 'subTitle', 'description',
          'averageRating', 'totalNumberOfRatings',
        ],
        limit: PAGE_SIZE,
        offset,
        sort_by: { lastUpdatedOn: 'desc' },
      },
    })

    const courses = res?.result?.content || []
    const total = res?.result?.count || 0
    all.push(...courses)
    console.log(`[sitemap] Got ${courses.length} courses (${all.length} / ${total} total)`)

    if (all.length >= total || courses.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return all
}

function buildSitemap(courses) {
  const staticUrls = [
    { loc: '/public/home',        priority: '1.0', changefreq: 'daily' },
    { loc: '/public/about',       priority: '0.7', changefreq: 'monthly' },
    { loc: '/public/cne-courses', priority: '0.9', changefreq: 'weekly' },
    { loc: '/public/blog',        priority: '0.8', changefreq: 'weekly' },
    { loc: '/public/blog/how-to-earn-cne-points-online',              priority: '0.8', changefreq: 'monthly', lastmod: '2026-05-01' },
    { loc: '/public/blog/inc-certification-guide-for-nurses',         priority: '0.8', changefreq: 'monthly', lastmod: '2026-05-01' },
    { loc: '/public/blog/free-courses-for-anm-gnm-staff-nurses',      priority: '0.8', changefreq: 'monthly', lastmod: '2026-05-01' },
    { loc: '/public/blog/what-is-amtsl-guide-for-healthcare-workers', priority: '0.8', changefreq: 'monthly', lastmod: '2026-05-01' },
    { loc: '/public/blog/maternal-health-training-online-india',      priority: '0.8', changefreq: 'monthly', lastmod: '2026-05-01' },
    { loc: '/public/contact',     priority: '0.6', changefreq: 'monthly' },
    { loc: '/public/faq/general', priority: '0.6', changefreq: 'monthly' },
    { loc: '/public/tnc',         priority: '0.3', changefreq: 'yearly' },
  ]

  const staticBlock = staticUrls.map(u => `
  <url>
    <loc>${BASE_URL}${servedUrl(u.loc)}</loc>
    <priority>${u.priority}</priority>
    <changefreq>${u.changefreq}</changefreq>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`).join('')

  const orgBlock = ORG_NAMES.map(name => `
  <url>
    <loc>${BASE_URL}/app/org-details?orgId=${encodeURIComponent(name)}</loc>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>`).join('')

  const courseBlock = courses
    .filter(c => c.identifier && c.name)
    .map(c => {
      const slug = slugify(c.name) || c.identifier
      const lastmod = c.lastUpdatedOn
        ? new Date(c.lastUpdatedOn).toISOString().split('T')[0]
        : TODAY
      return `
  <url>
    <loc>${BASE_URL}${servedUrl(`/public/toc/overview/${c.identifier}/${slug}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>0.9</priority>
    <changefreq>monthly</changefreq>
  </url>`
    }).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Static public pages and blog -->
${staticBlock}

  <!-- Organisation landing pages -->
${orgBlock}

  <!-- Course overview pages — auto-generated ${TODAY} (${courses.length} courses) -->
${courseBlock}

</urlset>`
}

/**
 * Fetches the curated CNE course ids from the same web_layout form config that drives
 * the home page's "CNE COURSES" section, so the hub lists exactly what the product
 * already presents as its CNE catalogue. The endpoint is public — no auth needed.
 *
 * Returns null if the config can't be read or the section has no payload, which tells
 * buildCneCourses() to fall back to filtering the catalogue on cneName.
 */
async function fetchCuratedCneIds() {
  try {
    const res = await postJson({
      request: { type: 'web_layout', subtype: 'v1', action: 'get', component: 'web', rootOrgId: '*' },
    }, FORM_API_PATH)

    const layout = res?.result?.form?.data?.LAYOUT_BODY || []
    const section = layout.find(s => s?.playlistConfigId === CNE_PLAYLIST_CONFIG_ID)
    const payload = section?.payload

    if (!Array.isArray(payload) || payload.length === 0) {
      console.warn(`[cne] ${CNE_PLAYLIST_CONFIG_ID} has no payload — falling back to cneName`)
      return null
    }
    console.log(`[cne] Curated playlist has ${payload.length} course ids`)
    return payload
  } catch (err) {
    console.warn(`[cne] Could not read the layout form config (${err.message}) — falling back to cneName`)
    return null
  }
}

/**
 * Builds the course list for the CNE hub at /public/cne-courses.
 *
 * Two sources agree on what a CNE course is, and both are used:
 *
 *  - `cneName` on the course itself holds the credit hours as a string ("2.5", "5",
 *    "7.5", "15") and is absent on every course that awards no CNE credit. It is the
 *    factual marker, and where the credit figures on the page come from.
 *  - CNE_COURSE_PLAYLIST in the web_layout config is the curated subset the product
 *    actually presents as its CNE catalogue. It is a strict subset of the above —
 *    every curated id has a cneName — so it never introduces a false claim.
 *
 * The curated list wins when available, so the hub and the home page can't disagree.
 * Names, credits and ratings always come from the live catalogue, so no figure on the
 * page can drift from it. Hand-maintaining this list is what produced a first draft
 * that claimed credits for two courses that award none.
 */
function buildCneCourses(courses, curatedIds) {
  const byId = new Map(courses.map(c => [c.identifier, c]))

  // Curated order is deliberate — it keeps each course adjacent to its Hindi twin.
  const selected = curatedIds
    ? curatedIds.map(id => byId.get(id)).filter(Boolean)
    : courses.filter(c => String(c.cneName ?? '').trim() !== '')

  const cneCourses = selected
    .filter(c => c.identifier && c.name && String(c.cneName ?? '').trim() !== '')
    .map(c => ({
      identifier: c.identifier,
      name: String(c.name).trim(),
      route: `/public/toc/overview/${c.identifier}/${slugify(c.name) || c.identifier}`,
      credits: String(c.cneName).trim(),
      sourceName: (c.sourceName || '').trim(),
      blurb: (c.subTitle || c.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
      averageRating: typeof c.averageRating === 'number' ? Number(c.averageRating.toFixed(2)) : null,
      ratingCount: c.totalNumberOfRatings || 0,
    }))

  // Only impose an order when falling back; the curated payload's own order is intentional.
  if (!curatedIds) {
    cneCourses.sort((a, b) => parseFloat(b.credits) - parseFloat(a.credits) || b.ratingCount - a.ratingCount)
  }

  const body = cneCourses
    .map(c => `  ${JSON.stringify(c, null, 2).split('\n').join('\n  ')},`)
    .join('\n')

  return `/* eslint-disable */
/**
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Written by generate-sitemap.js (run via \`yarn prerender\`) from the live course
 * catalogue. A course appears here if and only if it has a \`cneName\` value, which is
 * the credit hours the Indian Nursing Council or another accrediting body awards for it.
 *
 * Generated ${TODAY} — ${cneCourses.length} CNE-accredited courses of ${courses.length} live courses,
 * sourced from ${curatedIds ? `the ${CNE_PLAYLIST_CONFIG_ID} layout config` : 'a cneName filter over the catalogue'}.
 */

export interface ICneCourse {
  identifier: string
  name: string
  /** Router path — no trailing slash, so it matches \`overview/:courseId/:slug\`. */
  route: string
  /** CNE credit hours, from the catalogue's cneName field. */
  credits: string
  sourceName: string
  blurb: string
  averageRating: number | null
  ratingCount: number
}

export const CNE_COURSES: ICneCourse[] = [
${body}
]
`
}

function buildRoutesList(courses) {
  const courseRoutes = courses
    .filter(c => c.identifier && c.name)
    .map(c => `/public/toc/overview/${c.identifier}/${slugify(c.name) || c.identifier}`)

  return [...STATIC_ROUTES, ...courseRoutes].join('\n')
}

async function main() {
  console.log('[sitemap] Starting sitemap + prerender routes generation...')
  try {
    const courses = await fetchAllCourses()

    if (courses.length === 0) {
      console.warn('[sitemap] API returned 0 courses — keeping existing sitemap.xml')
      console.log('[routes] Writing prerender-routes.txt with static routes only')
      fs.writeFileSync(ROUTES_PATH, STATIC_ROUTES.join('\n'), 'utf8')
      return
    }

    // Write sitemap.xml
    const xml = buildSitemap(courses)
    fs.writeFileSync(SITEMAP_PATH, xml, 'utf8')
    console.log(`[sitemap] Written ${SITEMAP_PATH} with ${courses.length} course URLs`)

    // Write prerender-routes.txt
    const routes = buildRoutesList(courses)
    fs.writeFileSync(ROUTES_PATH, routes, 'utf8')
    const totalRoutes = STATIC_ROUTES.length + courses.length
    console.log(`[routes] Written ${ROUTES_PATH} with ${totalRoutes} routes (${STATIC_ROUTES.length} static + ${courses.length} courses)`)

    // Write the CNE hub's course list
    const curatedCneIds = await fetchCuratedCneIds()
    const cneFile = buildCneCourses(courses, curatedCneIds)
    fs.writeFileSync(CNE_COURSES_PATH, cneFile, 'utf8')
    const cneCount = (cneFile.match(/"identifier":/g) || []).length
    console.log(`[cne] Written ${CNE_COURSES_PATH} with ${cneCount} CNE-accredited courses`)
    if (cneCount === 0) {
      console.warn('[cne] No course carried a cneName value — check the field is still populated upstream')
    }

  } catch (err) {
    console.error(`[sitemap] Failed: ${err.message}`)
    console.log('[sitemap] Keeping existing sitemap.xml — build will continue')
    console.log('[routes] Writing prerender-routes.txt with static routes only')
    fs.writeFileSync(ROUTES_PATH, STATIC_ROUTES.join('\n'), 'utf8')
  }
}

main()
