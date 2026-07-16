#!/usr/bin/env node
/**
 * Pre-commit coverage gate — two-pass with auto test generation.
 *
 * Pass 1 ── Run Jest.
 *   • Thresholds met  → update HTML report → stage → commit proceeds.
 *   • Below threshold → call auto-generate-tests.js.
 *
 * Pass 2 ── Re-run Jest after generated specs are staged.
 *   • Thresholds met  → update HTML report → stage everything → commit proceeds.
 *   • Still failing   → generated specs are already staged; block commit with hint.
 *
 * Skip once:  SKIP_COVERAGE=1 git commit -m "…"
 * Skip always in CI: the CI workflow runs its own yarn test step independently.
 */
'use strict'

const { spawnSync, execSync } = require('child_process')
const fs   = require('fs')
const path = require('path')

const rootDir     = path.join(__dirname, '..')
const summaryPath = path.join(rootDir, 'coverage', 'coverage-summary.json')

// ── Guard: allow bypass ───────────────────────────────────────────────────

if (process.env.SKIP_COVERAGE === '1' || process.env.CI === 'true') {
  console.log('[coverage-gate] Skipped (SKIP_COVERAGE=1 or CI environment).')
  process.exit(0)
}

// ── Helpers ───────────────────────────────────────────────────────────────

function runJest(label) {
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`🧪  ${label}`)
  console.log('─'.repeat(60) + '\n')

  return spawnSync(
    'yarn',
    ['test', '--json', '--outputFile=coverage/jest-results.json', '--forceExit'],
    { cwd: rootDir, stdio: 'inherit', shell: true }
  )
}

function readSummary() {
  if (!fs.existsSync(summaryPath)) return null
  try { return JSON.parse(fs.readFileSync(summaryPath, 'utf8')) } catch (_) { return null }
}

function printCoverage(label) {
  const summary = readSummary()
  if (!summary) return
  const t = summary.total
  console.log(`\n📊  ${label}`)
  console.log(`  Statements : ${t.statements.pct.toFixed(1)}%`)
  console.log(`  Branches   : ${t.branches.pct.toFixed(1)}%`)
  console.log(`  Functions  : ${t.functions.pct.toFixed(1)}%`)
  console.log(`  Lines      : ${t.lines.pct.toFixed(1)}%`)
}

function printLowFiles() {
  const summary = readSummary()
  if (!summary) return
  const low = Object.entries(summary)
    .filter(([f]) => f !== 'total')
    .filter(([, d]) => d.statements.pct < 80 || d.functions.pct < 80)
    .sort(([, a], [, b]) => a.statements.pct - b.statements.pct)

  if (!low.length) return
  console.error(`\n⚠️   ${low.length} file(s) still below 80%:`)
  low.slice(0, 15).forEach(([f, d]) => {
    const rel = f.replace(rootDir + path.sep, '').replace(rootDir + '/', '')
    console.error(`\n  ${rel}`)
    console.error(`    stmts: ${d.statements.pct.toFixed(1)}%  funcs: ${d.functions.pct.toFixed(1)}%`)
  })
  if (low.length > 15) console.error(`\n  … and ${low.length - 15} more`)
}

function updateReport() {
  try { require('./update-jest-report.js') } catch (_) {}
  try {
    execSync('git add docs/jest-coverage-progress.html', { cwd: rootDir, stdio: 'pipe' })
  } catch (_) {}
}

// ── Pass 1 ────────────────────────────────────────────────────────────────

let result = runJest('Pass 1 — running Jest coverage check…')

if (result.status === 0) {
  printCoverage('Coverage (passing)')
  console.log('\n✅  All thresholds met. Proceeding with commit.\n')
  updateReport()
  process.exit(0)
}

// ── Coverage failed — attempt auto-generation ─────────────────────────────

printCoverage('Coverage (below threshold)')
console.log('\n⚡  Attempting to auto-generate tests for low-coverage files…')

const { generateTestsForLowCoverageFiles } = require('./auto-generate-tests.js')
const generated = generateTestsForLowCoverageFiles()

if (generated.length === 0) {
  printLowFiles()
  console.error('\n❌  No files targeted for generation (no staged source files with gaps).')
  console.error('    Write tests for the files above, then commit again.')
  console.error('    To bypass once: SKIP_COVERAGE=1 git commit -m "…"\n')
  process.exit(1)
}

console.log(`\n✏️   Generated ${generated.length} spec file(s) and staged them.`)

// ── Pass 2 ────────────────────────────────────────────────────────────────

result = runJest(`Pass 2 — re-running Jest after generating ${generated.length} spec(s)…`)

if (result.status === 0) {
  printCoverage('Coverage (after generation)')
  console.log('\n✅  Thresholds met after auto-generation.')
  console.log('   Generated specs are staged and will be included in the commit.\n')
  updateReport()
  process.exit(0)
}

// ── Still failing ─────────────────────────────────────────────────────────

printCoverage('Coverage (still below after generation)')
printLowFiles()

console.error('\n⚠️   Generated specs are staged but coverage is still below threshold.')
console.error('    The generated specs may need manual refinement — they are already staged,')
console.error('    so edit them, then re-commit.')
console.error('\n    To bypass once: SKIP_COVERAGE=1 git commit -m "…"\n')

process.exit(1)
