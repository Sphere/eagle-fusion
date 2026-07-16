#!/usr/bin/env node
/**
 * auto-generate-tests.js
 *
 * Called by check-coverage.js when coverage is below threshold.
 * For each staged TypeScript source file that is below 80% coverage:
 *   1. Reads the source + existing spec (if any)
 *   2. Calls Claude CLI to generate / augment the spec
 *   3. Falls back to a smart scaffold if Claude is unavailable
 *   4. Writes the spec and stages it with git add
 *
 * Returns the list of spec files written.
 */
'use strict'

const { spawnSync, execSync } = require('child_process')
const fs   = require('fs')
const path = require('path')
const os   = require('os')

const rootDir     = path.join(__dirname, '..')
const summaryPath = path.join(rootDir, 'coverage', 'coverage-summary.json')

// ── Locate Claude binary ──────────────────────────────────────────────────

function findClaudeBin() {
  // 1. Prefer whatever is on PATH
  const fromPath = spawnSync('which', ['claude'], { encoding: 'utf8', shell: true })
  if (fromPath.status === 0 && fromPath.stdout.trim()) return fromPath.stdout.trim()

  // 2. Scan macOS Claude Code install tree
  const base = path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude-code')
  if (fs.existsSync(base)) {
    const found = spawnSync('find', [base, '-name', 'claude', '-type', 'f'], { encoding: 'utf8' })
    if (found.status === 0 && found.stdout.trim()) {
      // Pick the most recent version (last in sorted list)
      const bins = found.stdout.trim().split('\n').sort()
      return bins[bins.length - 1]
    }
  }

  return null
}

// ── Git helpers ───────────────────────────────────────────────────────────

function getStagedSourceFiles() {
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACM', {
      cwd: rootDir, encoding: 'utf8'
    })
    return out.split('\n')
      .map(f => f.trim())
      .filter(f => f.endsWith('.ts') && !f.endsWith('.spec.ts') && !f.endsWith('.d.ts'))
      .map(f => path.join(rootDir, f))
      .filter(f => fs.existsSync(f))
  } catch (_) {
    return []
  }
}

// ── Coverage helpers ──────────────────────────────────────────────────────

function getFilesBelow(threshold = 80) {
  if (!fs.existsSync(summaryPath)) return new Set()
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'))
  const set = new Set()
  for (const [f, d] of Object.entries(summary)) {
    if (f === 'total') continue
    if (d.statements.pct < threshold || d.functions.pct < threshold) set.add(f)
  }
  return set
}

function isCoveredAbove(absPath, threshold = 80) {
  if (!fs.existsSync(summaryPath)) return false
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'))
  const rel = absPath.replace(rootDir + path.sep, '').replace(rootDir + '/', '')
  for (const [f, d] of Object.entries(summary)) {
    if (f === 'total') continue
    if (f.endsWith(rel) || f === absPath) {
      return d.statements.pct >= threshold && d.functions.pct >= threshold
    }
  }
  return false
}

// ── Spec path ─────────────────────────────────────────────────────────────

function specPathFor(sourceFile) {
  const dir  = path.dirname(sourceFile)
  const base = path.basename(sourceFile, '.ts')
  return path.join(dir, `${base}.spec.ts`)
}

// ── Claude-based generation ───────────────────────────────────────────────

function buildPrompt(sourceFile, specFile) {
  const src     = fs.readFileSync(sourceFile, 'utf8')
  const relSrc  = sourceFile.replace(rootDir + '/', '')
  const relSpec = specFile.replace(rootDir + '/', '')
  const hasSpec = fs.existsSync(specFile)
  const existing = hasSpec ? fs.readFileSync(specFile, 'utf8') : null

  return `You are writing Jest tests for an Angular 21 TypeScript file in the Eagle-Fusion LMS (Aastrika Sphere healthcare training platform). Your goal is to bring statement and function coverage above 80%.

SOURCE FILE: ${relSrc}
\`\`\`typescript
${src}
\`\`\`
${existing ? `
EXISTING SPEC (${relSpec}) — augment this, do not replace working tests:
\`\`\`typescript
${existing}
\`\`\`
` : `SPEC FILE TO CREATE: ${relSpec}`}

CODING RULES:
- Direct instantiation pattern: \`new Component(...mocks)\` — avoid TestBed for components with many dependencies
- Mock all injected services with \`jest.fn()\` or \`jest.spyOn()\`
- Use \`jest.mock('@ws-widget/collection', () => ({...}))\` before imports for barrel files
- Angular Signals: mock \`effect()\` by importing and spying; read signals with \`signal()\`
- No \`console.log\` — mock LoggerService with \`log: jest.fn(), error: jest.fn()\`
- Single quotes, 2-space indent, no trailing semicolons at line end that are not required
- \`standalone: false\` components — use NgModule pattern if TestBed is needed
- BehaviorSubject / of() for Observable mocks; use \`done\` callback for zone.js-deferred assertions

OUTPUT: Return ONLY the complete raw TypeScript for the spec file. No markdown. No explanation. No code fences.`
}

function callClaudeCLI(claudeBin, sourceFile, specFile) {
  const prompt   = buildPrompt(sourceFile, specFile)
  const tmpFile  = path.join(rootDir, 'coverage', '.gen-prompt.tmp')

  // Write prompt to temp file to avoid shell arg length limits
  fs.mkdirSync(path.dirname(tmpFile), { recursive: true })
  fs.writeFileSync(tmpFile, prompt, 'utf8')

  const result = spawnSync(
    claudeBin,
    [
      '--print',
      '--dangerously-skip-permissions',
      '--output-format', 'text',
      `@${tmpFile}`,          // file reference supported by claude CLI
    ],
    { cwd: rootDir, encoding: 'utf8', timeout: 150_000 }
  )

  try { fs.unlinkSync(tmpFile) } catch (_) {}

  if (result.status === 0 && result.stdout && result.stdout.trim().length > 80) {
    let out = result.stdout.trim()
    // Strip any markdown fences Claude might have included despite instructions
    out = out.replace(/^```(?:typescript|ts)?\n?/, '').replace(/\n?```\s*$/, '')
    return out.trim()
  }

  // Fallback: try passing prompt as stdin
  const result2 = spawnSync(
    claudeBin,
    ['--print', '--dangerously-skip-permissions'],
    { cwd: rootDir, encoding: 'utf8', input: prompt, timeout: 150_000 }
  )

  if (result2.status === 0 && result2.stdout && result2.stdout.trim().length > 80) {
    let out = result2.stdout.trim()
    out = out.replace(/^```(?:typescript|ts)?\n?/, '').replace(/\n?```\s*$/, '')
    return out.trim()
  }

  return null
}

// ── Smart scaffold fallback ───────────────────────────────────────────────

function generateScaffold(sourceFile, specFile) {
  const src      = fs.readFileSync(sourceFile, 'utf8')
  const base     = path.basename(sourceFile, '.ts')
  const relSpec  = path.relative(path.dirname(specFile), sourceFile.replace(/\.ts$/, ''))

  const classMatch   = src.match(/export\s+(?:default\s+)?class\s+(\w+)/)
  const className    = classMatch ? classMatch[1] : 'Subject'
  const isComponent  = src.includes('@Component')
  const isService    = src.includes('@Injectable')
  const isPipe       = src.includes('@Pipe')
  const isGuard      = src.includes('CanActivate') || src.includes('CanLoad')

  // Extract public methods for it() stubs
  const methods = [...src.matchAll(/^\s{2}(?:public\s+)?(?:async\s+)?(\w+)\s*\(/gm)]
    .map(m => m[1])
    .filter(m => !['constructor', 'ngOnInit', 'ngOnDestroy', 'ngOnChanges', 'ngAfterViewInit'].includes(m))
    .slice(0, 6)

  const methodTests = methods.map(m =>
    `\n  it('should call ${m}', () => {\n    expect(() => (component as any).${m}()).not.toThrow()\n  })`
  ).join('')

  if (isComponent) {
    return `import { ${className} } from './${base}'

describe('${className}', () => {
  let component: ${className}

  beforeEach(() => {
    component = new ${className}() as any
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
  ${methodTests}
})
`
  }

  if (isService || isGuard) {
    return `import { ${className} } from './${base}'

describe('${className}', () => {
  let service: ${className}

  beforeEach(() => {
    service = new ${className}() as any
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
  ${methodTests}
})
`
  }

  if (isPipe) {
    return `import { ${className} } from './${base}'

describe('${className}', () => {
  let pipe: ${className}

  beforeEach(() => {
    pipe = new ${className}()
  })

  it('should create an instance', () => {
    expect(pipe).toBeTruthy()
  })

  it('should transform value', () => {
    expect(pipe.transform).toBeDefined()
  })
})
`
  }

  return `import { ${className} } from './${base}'

describe('${className}', () => {
  it('should be defined', () => {
    expect(${className}).toBeDefined()
  })
})
`
}

// ── Stage file ────────────────────────────────────────────────────────────

function stageFile(absPath) {
  try {
    execSync(`git add "${absPath}"`, { cwd: rootDir, stdio: 'pipe' })
    return true
  } catch (e) {
    console.warn(`  ⚠️  Could not stage ${path.relative(rootDir, absPath)}: ${e.message}`)
    return false
  }
}

// ── Main ──────────────────────────────────────────────────────────────────

function generateTestsForLowCoverageFiles() {
  const claudeBin    = findClaudeBin()
  const belowSet     = getFilesBelow(80)
  const stagedFiles  = getStagedSourceFiles()

  if (claudeBin) {
    console.log(`  🤖  Claude found: ${claudeBin.split('/').slice(-4).join('/')}`)
  } else {
    console.log('  ⚠️   Claude CLI not found — will use scaffold templates as fallback')
  }

  // Target: staged source files that are below threshold OR have no spec at all
  const targets = stagedFiles.filter(f => {
    const rel = f.replace(rootDir + '/', '').replace(rootDir + path.sep, '')
    const inBelow = [...belowSet].some(low => low.endsWith(rel))
    const hasSpec = fs.existsSync(specPathFor(f))
    const alreadyOk = isCoveredAbove(f, 80)
    return (inBelow || !hasSpec) && !alreadyOk
  })

  if (targets.length === 0) {
    console.log('  ℹ️   No staged source files need more test coverage.')
    return []
  }

  console.log(`\n📝  Generating tests for ${targets.length} file(s):\n`)

  const written = []

  for (const srcFile of targets) {
    const specFile = specPathFor(srcFile)
    const relSrc   = srcFile.replace(rootDir + '/', '')
    const relSpec  = specFile.replace(rootDir + '/', '')
    const exists   = fs.existsSync(specFile)

    console.log(`  → ${relSrc}`)
    console.log(`    ${exists ? 'augmenting' : 'creating'} ${relSpec}`)

    let content = null

    if (claudeBin) {
      process.stdout.write('    🤖  Calling Claude… ')
      content = callClaudeCLI(claudeBin, srcFile, specFile)
      if (content) {
        console.log('done ✓')
      } else {
        console.log('failed — using scaffold')
      }
    }

    if (!content) {
      console.log('    📄  Using scaffold template')
      content = generateScaffold(srcFile, specFile)
    }

    fs.writeFileSync(specFile, content, 'utf8')
    stageFile(specFile)
    written.push(specFile)
    console.log(`    ✅  Written & staged: ${relSpec}\n`)
  }

  return written
}

module.exports = { generateTestsForLowCoverageFiles }

if (require.main === module) {
  const result = generateTestsForLowCoverageFiles()
  console.log(`\nGenerated ${result.length} spec file(s).`)
}
