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
const TODAY = new Date().toISOString().split('T')[0]
const PAGE_SIZE = 200
const API_HOST = 'sphere.aastrika.org'
const API_PATH = '/api/content/v1/search'

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

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function postJson(body) {
  return new Promise((resolve, reject) => {
    const raw = JSON.stringify(body)
    const options = {
      hostname: API_HOST,
      path: API_PATH,
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
        fields: ['identifier', 'name', 'lastUpdatedOn'],
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

  const courseBlock = courses
    .filter(c => c.identifier && c.name)
    .map(c => {
      const slug = slugify(c.name) || c.identifier
      const lastmod = c.lastUpdatedOn
        ? new Date(c.lastUpdatedOn).toISOString().split('T')[0]
        : TODAY
      return `
  <url>
    <loc>${BASE_URL}/public/toc/overview/${c.identifier}/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>0.9</priority>
    <changefreq>monthly</changefreq>
  </url>`
    }).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Static public pages and blog -->
${staticBlock}

  <!-- Course overview pages — auto-generated ${TODAY} (${courses.length} courses) -->
${courseBlock}

</urlset>`
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

  } catch (err) {
    console.error(`[sitemap] Failed: ${err.message}`)
    console.log('[sitemap] Keeping existing sitemap.xml — build will continue')
    console.log('[routes] Writing prerender-routes.txt with static routes only')
    fs.writeFileSync(ROUTES_PATH, STATIC_ROUTES.join('\n'), 'utf8')
  }
}

main()
