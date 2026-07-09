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
const TODAY = new Date().toISOString().split('T')[0]
const PAGE_SIZE = 200
const ID_BATCH = 100
const API_HOST = 'sphere.aastrika.org'
// Two-step generation so the sitemap only lists course pages that actually render content:
//   1. DISCOVERY — the broad Sunbird content search returns every Live Course (the candidates).
//   2. RENDER CHECK — the public course page (PublicTocComponent) loads its data from
//      SEARCH_V7PUBLIC (getCourses) filtered by identifier. A candidate whose id getCourses does
//      NOT return renders as a blank page. So we validate every candidate id against getCourses
//      and keep only those that come back — guaranteeing each sitemap URL has content.
// (Historically the sitemap was built straight from discovery, so ~68% of URLs were blank pages
//  that Google crawled and could not index.)
const DISCOVERY_PATH = '/api/content/v1/search'
const RENDER_CHECK_PATH = '/apis/public/v8/publicSearch/getCourses'
// Match PublicTocComponent's lookup filter exactly (primaryCategory + contentType + status).
const COURSE_FILTERS = { primaryCategory: ['Course'], contentType: ['Course'], status: ['Live'] }

const STATIC_ROUTES = [
  '/public/home',
  '/public/about',
  '/public/contact',
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

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    // Keep Unicode letters/numbers/marks (\p{L}\p{N}\p{M}) so non-Latin names — e.g.
    // Hindi/Devanagari course titles — produce a readable slug instead of being stripped to
    // an empty string. \p{M} preserves combining vowel signs (matras) so words like
    // "सक्रिय" stay intact rather than fragmenting into "सक-र-य". Previously [^a-z0-9] wiped
    // Devanagari entirely, so ~38% of courses fell back to the identifier and emitted ugly
    // /overview/<id>/<id> URLs that hurt CTR and Hindi SEO.
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}

// The slug becomes a single path segment — and, during prerender, a directory name on disk.
// Most filesystems cap one path component at 255 bytes, and Devanagari characters are 3 bytes
// each in UTF-8, so long Hindi titles can blow past that limit and fail the build. Cap the slug
// well under 255 bytes, trimming whole words at hyphen boundaries so it stays readable. The slug
// is purely cosmetic (the page loads by course id), so truncating it has no functional effect.
const MAX_SLUG_BYTES = 180

function truncateSlug(slug) {
  if (Buffer.byteLength(slug, 'utf8') <= MAX_SLUG_BYTES) { return slug }
  let out = ''
  for (const word of slug.split('-')) {
    const candidate = out ? `${out}-${word}` : word
    if (Buffer.byteLength(candidate, 'utf8') > MAX_SLUG_BYTES) { break }
    out = candidate
  }
  // A single word longer than the limit: hard-cut on a character boundary (never mid-codepoint).
  if (!out) {
    for (const ch of slug) {
      if (Buffer.byteLength(out + ch, 'utf8') > MAX_SLUG_BYTES) { break }
      out += ch
    }
  }
  return out.replace(/-+$/g, '')
}

// Single source of truth for a course's public path, so sitemap.xml and prerender-routes.txt
// never drift apart. Falls back to a generic slug (never the raw id) if a name has no
// sluggable characters at all, avoiding the /<id>/<id> duplication.
function coursePath(course) {
  const slug = truncateSlug(slugify(course.name)) || 'course'
  return `/public/toc/overview/${course.identifier}/${slug}`
}

function postJson(apiPath, body) {
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

// Step 1 — discover every Live Course id from the broad Sunbird content search.
async function discoverCandidates() {
  const all = []
  let offset = 0
  while (true) {
    console.log(`[sitemap] Discovering courses offset=${offset} limit=${PAGE_SIZE}...`)
    const res = await postJson(DISCOVERY_PATH, {
      request: {
        filters: { primaryCategory: ['Course'], status: ['Live'] },
        fields: ['identifier', 'name', 'lastUpdatedOn'],
        limit: PAGE_SIZE,
        offset,
        sort_by: { lastUpdatedOn: 'desc' },
      },
    })
    const courses = res?.result?.content || []
    const total = res?.result?.count || 0
    all.push(...courses)
    if (all.length >= total || courses.length < PAGE_SIZE) { break }
    offset += PAGE_SIZE
  }
  return all
}

// Step 2 — keep only candidates that the course page's own data source (getCourses) returns.
// getCourses accepts an identifier array, so we validate in batches. Returned objects carry the
// canonical name/lastUpdatedOn, so we prefer those over the discovery payload.
async function keepRenderable(candidates) {
  const ids = candidates.map(c => c.identifier).filter(Boolean)
  const renderable = new Map()
  for (let i = 0; i < ids.length; i += ID_BATCH) {
    const batch = ids.slice(i, i + ID_BATCH)
    console.log(`[sitemap] Render-checking ${i + 1}-${i + batch.length} of ${ids.length}...`)
    const res = await postJson(RENDER_CHECK_PATH, {
      request: {
        filters: { ...COURSE_FILTERS, identifier: batch },
        query: '',
        limit: ID_BATCH,
        sort: [{ lastUpdatedOn: 'desc' }],
      },
    })
    for (const c of (res?.result?.content || [])) {
      if (c && c.identifier) { renderable.set(c.identifier, c) }
    }
  }
  return [...renderable.values()]
}

async function fetchAllCourses() {
  const candidates = await discoverCandidates()
  console.log(`[sitemap] Discovered ${candidates.length} Live courses`)
  const courses = await keepRenderable(candidates)
  const dropped = candidates.length - courses.length
  console.log(`[sitemap] ${courses.length} render with content; dropped ${dropped} blank/unreachable course(s)`)
  return courses
}

function buildSitemap(courses) {
  const staticUrls = [
    { loc: '/public/home',        priority: '1.0', changefreq: 'daily' },
    { loc: '/public/about',       priority: '0.7', changefreq: 'monthly' },
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
    <loc>${BASE_URL}${u.loc}</loc>
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
      const lastmod = c.lastUpdatedOn
        ? new Date(c.lastUpdatedOn).toISOString().split('T')[0]
        : TODAY
      // encodeURI keeps the path valid per the sitemap spec when the slug contains
      // non-ASCII (e.g. Devanagari) characters; ASCII slugs pass through unchanged.
      return `
  <url>
    <loc>${encodeURI(`${BASE_URL}${coursePath(c)}`)}</loc>
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

function buildRoutesList(courses) {
  const courseRoutes = courses
    .filter(c => c.identifier && c.name)
    .map(c => coursePath(c))

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

  } catch (err) {
    console.error(`[sitemap] Failed: ${err.message}`)
    console.log('[sitemap] Keeping existing sitemap.xml — build will continue')
    console.log('[routes] Writing prerender-routes.txt with static routes only')
    fs.writeFileSync(ROUTES_PATH, STATIC_ROUTES.join('\n'), 'utf8')
  }
}

// Only run when invoked directly (node generate-sitemap.js), not when required by tests.
if (require.main === module) {
  main()
}

module.exports = { slugify, truncateSlug, coursePath, buildSitemap, buildRoutesList, MAX_SLUG_BYTES }
