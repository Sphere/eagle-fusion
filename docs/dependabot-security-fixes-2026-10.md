# Dependabot Security Fixes — October 2026

Scope: GitHub Dependabot alerts for `Sphere/eagle-fusion` · Date: 2026-10-26 · Branch: `fix/dependabot-vulnerabilities` (cut from `master` @ `bd7c14153`)

## Summary

GitHub reported **306 open security alerts** on this repository. All of them came from third-party
packages recorded in `yarn.lock`, not from our own code. This change upgrades, pins or removes those packages so that
**289 of the 306 alerts are resolved, including all 17 critical ones**. The remaining 17 sit inside one
Sunbird library we do not control and cannot be fixed from this repo.

**No application source code was changed.** No `.ts`, `.html` or `.scss` file is touched. The change is limited to
dependency versions (`package.json`, `yarn.lock`) and the removal of one unused global script from `angular.json`.
The unit tests, the production build and the production prerender (the step the Docker image runs) all pass.

## Results

| Severity | Open before | Resolved | Still open |
|---|---|---|---|
| Critical | 17 | **17** | 0 |
| High | 135 | 126 | 9 |
| Medium | 125 | 119 | 6 |
| Low | 29 | 27 | 2 |
| **Total** | **306** | **289** | **17** |

"Resolved" means the lockfile now contains only versions outside the advisory's vulnerable range (244 alerts),
or the vulnerable package is no longer installed at all (45 alerts). GitHub closes these alerts automatically
once the branch is merged into `master`.

## What changed

Three files changed: [package.json](../package.json), [yarn.lock](../yarn.lock) and [angular.json](../angular.json).

### 1. Packages upgraded

| Package | Before | After | Notes |
|---|---|---|---|
| `@angular/*` (core, common, compiler, forms, router, platform-*, animations, localize) | 21.2.7 | 21.2.25 | Patch releases on the same minor. Security fixes in sanitization, SSR and router. The `overrides` pins were moved to match. |
| `@angular/cdk`, `@angular/material` | 21.2.5 | 21.2.14 | Patch releases. |
| `@angular-devkit/build-angular`, `@angular/cli`, `@angular/ssr` | 21.2.6–21.2.7 | **21.2.27 (exact)** | Pinned exactly. See [Watch-outs](#watch-outs). |
| `@capacitor/core`, `@capacitor/app` | 6.x | 8.x | We only use `App.addListener('backButton')`, and that API is unchanged. |
| `pdfjs-dist` | 3.4.120 | 5.4.296 | Only its `pdf_viewer.css` is used. It now matches the pdf.js 5.4 bundled inside the PDF player. |
| `uuid` | 8.3.2 | 11.1.1 | We only call `v4()`, and the import is unchanged. |
| `compression` | 1.7.x | 1.8.2 | Patch release. Used by `server.js`. |
| `moment` | 2.30.1 | 2.31.0 | Patch release. |

### 2. Unused packages removed

| Package | Why it was safe to remove |
|---|---|
| `jspdf`, `jspdf-autotable` | Not imported anywhere. Their last user, the certificate download in `app-toc-analytics`, was deleted in April 2023 (`498ef11c1`). The PDF player (`ngx-extended-pdf-viewer`) does **not** depend on them. Its only dependency is `tslib`. |
| `@project-sunbird/telemetry-sdk` 0.0.26 | Not imported anywhere. Telemetry is loaded from our own copy, `src/fusion-assets/telemetry.min.js`. This old version pulled in karma 3, grunt-karma and socket.io 2, which accounted for most of the critical alerts. `client-services` still brings in its own clean telemetry-sdk 1.3.0. |
| `@capacitor/android`, `@capacitor/cli` | This repo has no native Android project and no `capacitor.config`. Capacitor CLI 8 also requires Node 22+, which would fail our Node 20 builds. |
| `@types/uuid` | `uuid` 11 ships its own type definitions. |

The `jspdf-autotable` script entry was also removed from the global `scripts` list in `angular.json`.

### 3. Nested packages forced to patched versions

The lockfile was refreshed so that indirect dependencies move to their latest compatible patch releases.
Where a parent package pins an old version, a scoped `resolutions` entry forces the patched one.
Each entry targets one parent only, so nothing else is affected:

`undici`, `vite`, `ip-address`, `ws`, `qs`, `form-data`, `tough-cookie`, `moment` (under `vis-util`),
`uuid` (under `sockjs` and `gzipper`), `postcss-selector-parser` (under Tailwind) and `@modelcontextprotocol/sdk`.

Most of these are build-time tools (Angular CLI, webpack dev server, Tailwind, Jest) that never reach the browser.

## Why application flows are unaffected

| Area / flow | What changed underneath | How it was verified |
|---|---|---|
| Login, signup, create account | `uuid` 8 → 11 (`v4()` only) | Unit tests for `signup.service`, `public-login`, `create-account` and `init.service` pass |
| Mobile back button (Capacitor) | `@capacitor/app` 6 → 8 | Same `addListener('backButton')` API. It still does nothing in a browser. `root.component` tests pass. |
| PDF player | Global `pdf_viewer.css` from pdfjs 3.4 → 5.4 | The player itself (`ngx-extended-pdf-viewer` 26) is unchanged. **Manual check recommended**, see below. |
| Course discussion tab | `client-services` unchanged. Only its nested `qs` was bumped (same major version). | Build passes. The package's public API is untouched. |
| Styling (Tailwind) | `postcss-selector-parser` 6 → 7 | Generated Tailwind CSS is **byte-identical** before and after |
| Public pages / SEO prerender | Angular SSR patch release | `ng run fusion:prerender:production` renders `/public/home`, `/about` and `/contact` |
| Everything else | Angular 21.2.7 → 21.2.25 (patch releases only) | Full Jest suite and production build pass |

### Verification performed

| Check | Result |
|---|---|
| `tsc --noEmit -p tsconfig.app.json` | Pass (0 errors) |
| `yarn test` (full Jest suite) | **309 / 309 suites, 6,794 / 6,794 tests pass** |
| `yarn run build:local` (production build) | Pass. Same warnings as before (autoprefixer, Sass `@import` deprecation). |
| `ng run fusion:prerender:production` (Docker deploy path) | Pass. All prerender routes rendered. |
| Tailwind output, old vs new selector parser | Byte-identical |
| Per-alert re-check of all 306 alerts against the new `yarn.lock` | 289 resolved, 17 open (listed below) |
| `yarn audit` | Only `client-services` dependencies remain (listed below) |

## Still open (17) and why

| Package | Alerts | Comes from | Why it is not fixed here |
|---|---|---|---|
| `node-forge` 0.10.0 | 14 (9 high, 3 medium, 2 low) | `@project-sunbird/client-services` → `jsonld-signatures`, `crypto-ld` | Unchanged from `master`. The Sunbird library's dependencies are built on 0.10.x, and node-forge 1.x is not compatible with our server-side prerender. One advisory also has no fixed version at all. Needs a `client-services` upgrade upstream. |
| `request` 2.88.2 | 1 (medium) | `client-services` → `jsonld` | Deprecated package with no fix available. `jsonld` excludes it from the browser bundle, so it never runs in the app. |
| `uuid` 3.4.0 | 1 (medium) | `request` (above) | `request` loads `uuid/v4`, which newer `uuid` versions removed, so forcing an upgrade would break it. |
| `decode-uri-component` 0.2.2 | 1 (medium) | The existing `stylus` 0.55.0 pin | The fixed 0.5.0 is ESM-only and would break the CommonJS chain. Build-time only. Nothing in the app imports `stylus`. |

**Recommended follow-up:** raise these with the `@project-sunbird/client-services` maintainers (an upgrade to
`jsonld-signatures` / `crypto-ld` / `node-forge` 1.x), and dismiss these alerts on GitHub as *"Risk is tolerable"*
with a link to this document.

## Watch-outs

- **Do not upgrade `@angular-devkit/build-angular` or `@angular/cli` to 21.2.28.** That release moves webpack from
  5.105 to 5.112, which keeps type-only imports (`SimpleChanges`, `HttpEvent`, `Signal`, `ModuleWithProviders`) in the
  output and fails the build with 18 "export not found" errors. 21.2.27 has all the security fixes and builds cleanly.
  The versions are pinned exactly (no `^`) on purpose. Ignore Dependabot PRs that bump them until this is resolved,
  either by a later Angular release or by switching those imports to `import type`.
- The Docker image still runs `yarn add @angular/localize@21` and `yarn add moment vis-util` after install. These steps
  existed before this change and are unchanged, but they resolve versions outside the lockfile at image build time.

## Manual check before release

1. Open any course with a **PDF** resource and confirm the toolbar, zoom and page rendering look as before
   (because of the `pdf_viewer.css` 3.4 → 5.4 change).
2. Smoke-test login and signup, and open one course's **Discussion** tab.
3. Load `/public/home` with JavaScript disabled to confirm the prerendered HTML is served.

## Rollback

All changes are confined to `package.json`, `yarn.lock` and `angular.json`. Rolling back means reverting the merge
commit, or redeploying the previous `release-X.Y.Z` branch.
