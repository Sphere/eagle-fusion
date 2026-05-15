#!/usr/bin/env node
/**
 * Dynamic sitemap generator — fetches ALL live courses and writes src/sitemap.xml.
 *
 * Runs automatically before `yarn prerender` via the package.json script.
 * If the API is unreachable the existing sitemap is kept and the build continues.
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

const BASE_URL = 'https://sphere.aastrika.org'
const SITEMAP_PATH = path.join(__dirname, 'src', 'sitemap.xml')
const TODAY = new Date().toISOString().split('T')[0]
const PAGE_SIZE = 200
const API_HOST = 'sphere.aastrika.org'
const API_PATH = '/api/content/v1/search'

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
    { loc: '/public/contact',     priority: '0.6', changefreq: 'monthly' },
    { loc: '/public/faq/general', priority: '0.6', changefreq: 'monthly' },
    { loc: '/public/tnc',         priority: '0.3', changefreq: 'yearly' },
    { loc: '/public/login',       priority: '0.5', changefreq: 'monthly' },
  ]

  const staticBlock = staticUrls.map(u => `
  <url>
    <loc>${BASE_URL}${u.loc}</loc>
    <priority>${u.priority}</priority>
    <changefreq>${u.changefreq}</changefreq>
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

  <!-- Static public pages -->
${staticBlock}

  <!-- Course overview pages — auto-generated ${TODAY} (${courses.length} courses) -->
${courseBlock}

</urlset>`
}

async function main() {
  console.log('[sitemap] Starting sitemap generation...')
  try {
    const courses = await fetchAllCourses()
    if (courses.length === 0) {
      console.warn('[sitemap] API returned 0 courses — keeping existing sitemap.xml')
      return
    }
    const xml = buildSitemap(courses)
    fs.writeFileSync(SITEMAP_PATH, xml, 'utf8')
    console.log(`[sitemap] Written ${SITEMAP_PATH} with ${courses.length} course URLs`)
  } catch (err) {
    console.error(`[sitemap] Failed: ${err.message}`)
    console.log('[sitemap] Keeping existing sitemap.xml — build will continue')
  }
}

main()
