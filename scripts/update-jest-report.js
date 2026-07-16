#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')

const rootDir = path.join(__dirname, '..')
const summaryPath = path.join(rootDir, 'coverage', 'coverage-summary.json')
const resultsPath = path.join(rootDir, 'coverage', 'jest-results.json')
const htmlPath = path.join(rootDir, 'docs', 'jest-coverage-progress.html')

if (!fs.existsSync(summaryPath)) {
  console.warn('[update-jest-report] No coverage-summary.json found — run yarn test first.')
  process.exit(0)
}

const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'))
const total = summary.total

// Test counts from jest JSON output
let numTests = 0, numSuites = 0, numFailing = 0
if (fs.existsSync(resultsPath)) {
  try {
    const r = JSON.parse(fs.readFileSync(resultsPath, 'utf8'))
    numTests = r.numPassedTests || 0
    numSuites = r.numPassedTestSuites || 0
    numFailing = r.numFailedTests || 0
  } catch (_) { }
}

// Human-readable date
const now = new Date()
const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

// Coverage tier helper
const tier = v => v >= 90 ? 'high' : v >= 75 ? 'medium' : 'low'
const colorVar = v => v >= 90 ? 'var(--green)' : v >= 75 ? 'var(--amber)' : 'var(--red)'

// Collect per-file data for the tracked components
const trackedNames = [
  'root.component.ts',
  'app-nav-bar.component.ts',
  'web-public-container.component.ts',
  'public-login.component.ts',
  'downtime-banner.component.ts',
  'downtime-full.component.ts',
  'almost-done.component.ts',
  'login.component.ts',
  'app-footer.component.ts',
  'web-dashboard.component.ts',
  'bnrc-register.component.ts',
  'upsmf-register.component.ts',
  'create-account.component.ts',
  'my-courses.component.ts',
  'personal-detail-edit.component.ts',
]

const fileMap = {}
Object.entries(summary).forEach(([filePath, data]) => {
  if (filePath === 'total') return
  const base = path.basename(filePath)
  if (trackedNames.includes(base) && !fileMap[base]) {
    const relDir = path.dirname(filePath).replace(rootDir + '/', '').replace(rootDir + path.sep, '')
    fileMap[base] = { data, relDir }
  }
})

// Build updated rows literal
const rowLines = trackedNames.map(name => {
  const entry = fileMap[name]
  if (!entry) return null
  const { data, relDir } = entry
  const s = data.statements.pct
  const b = data.branches.pct
  const f = data.functions.pct
  const l = data.lines.pct
  const t = tier(s)
  return `    ['${name}', '${relDir}', '${t}', ${s}, ${b}, ${f}, ${l}],`
}).filter(Boolean).join('\n')

let html = fs.readFileSync(htmlPath, 'utf8')

// Replace value inside an element with a known id
const replaceId = (doc, id, value) => doc.replace(
  new RegExp(`(<[^>]*\\bid="${id}"[^>]*>)[^<]*(</)`),
  `$1${value}$2`
)

if (numTests > 0) html = replaceId(html, 'kpi-tests', numTests)
if (numSuites > 0) html = replaceId(html, 'kpi-suites', numSuites)
html = replaceId(html, 'kpi-func', `${total.functions.pct.toFixed(1)}%`)
html = replaceId(html, 'kpi-stmts', `${total.statements.pct.toFixed(1)}%`)
html = replaceId(html, 'overall-stmts', `${total.statements.pct.toFixed(1)}%`)
html = replaceId(html, 'overall-branch', `${total.branches.pct.toFixed(1)}%`)
html = replaceId(html, 'overall-func', `${total.functions.pct.toFixed(1)}%`)
html = replaceId(html, 'overall-lines', `${total.lines.pct.toFixed(1)}%`)
html = replaceId(html, 'last-updated', dateStr)
html = replaceId(html, 'report-date', dateStr)

if (numFailing === 0 && numSuites > 0) {
  html = replaceId(html, 'kpi-suites-sub', `0 failing &nbsp;·&nbsp; 0 skipped`)
}

// Update data-pct on the overall bar fills
const updateBarPct = (doc, id, pct) => doc.replace(
  new RegExp(`(id="${id}"[^>]*data-pct=")[^"]*(")`),
  `$1${pct}$2`
).replace(
  new RegExp(`(data-pct="${pct.toFixed ? pct : pct}"[^>]*id="${id}")`),
  `data-pct="${pct}" id="${id}"`
)

html = html.replace(
  new RegExp(`(id="bar-stmts"[^>]*data-pct=")[^"]*(")`),
  `$1${total.statements.pct}$2`
).replace(
  new RegExp(`(id="bar-branch"[^>]*data-pct=")[^"]*(")`),
  `$1${total.branches.pct}$2`
).replace(
  new RegExp(`(id="bar-func"[^>]*data-pct=")[^"]*(")`),
  `$1${total.functions.pct}$2`
).replace(
  new RegExp(`(id="bar-lines"[^>]*data-pct=")[^"]*(")`),
  `$1${total.lines.pct}$2`
)

// Replace the rows block between sentinel comments
if (rowLines) {
  html = html.replace(
    /\/\* @jest-rows-start[\s\S]*?@jest-rows-end \*\//,
    `/* @jest-rows-start — updated by scripts/update-jest-report.js on each commit */\n  const rows = [\n${rowLines}\n  ];\n  /* @jest-rows-end */`
  )
}

fs.writeFileSync(htmlPath, html)

console.log(`[update-jest-report] ✅ Report updated — ${dateStr}`)
console.log(`  Statements: ${total.statements.pct.toFixed(1)}%  Branches: ${total.branches.pct.toFixed(1)}%  Functions: ${total.functions.pct.toFixed(1)}%  Lines: ${total.lines.pct.toFixed(1)}%`)
if (numTests > 0) console.log(`  Tests: ${numTests} passing across ${numSuites} suites`)
