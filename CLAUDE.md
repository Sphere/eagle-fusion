# Eagle-Fusion — Claude Code Guide

## Project Overview
Angular 21 LMS (Learning Management System) frontend for **Aastrika Sphere**, a healthcare training platform. Built as a multi-library monorepo using Angular CLI workspaces. Integrates Sunbird, Keycloak SSO, and custom content libraries.

**Package manager:** Yarn (`yarn`, not `npm`)

**Node version manager:** NVS — use `nvs use <version>` to switch Node versions before running any commands.
Angular 21 requires **Node 20**. Switch with:
```bash
nvs use 20        # activate Node 20.x for this shell session
nvs add 20        # install Node 20 if not already present (one-time)
```

---

## Key Commands

```bash
# Development
yarn start                  # Dev server on :3000 with proxy to sphere.aastrika.org
yarn run build              # Production build (gzip + brotli compressed)
yarn run build:local        # Production build without compression
yarn run build:fast         # Dev build with vendor chunk (faster iteration)

# Testing
yarn test                   # Jest (single run)
yarn run test-watch         # Jest watch mode
yarn run test-coverage      # Jest with coverage

# Linting
yarn run lint               # ESLint check (angular-eslint)
yarn run lint:fix           # ESLint auto-fix

# Styling
yarn run tailwind           # Watch TailwindCSS
yarn run tailwind:build     # One-time TailwindCSS build
```

---

## Architecture

### Monorepo Structure
```
eagle-fusion/
├── src/app/                        # Shell app (routing, auth, layout)
│   ├── component/                  # Root-level components (header, footer, etc.)
│   ├── routes/                     # App-level route modules
│   └── services/                   # App-level services
├── project/ws/
│   ├── app/src/lib/routes/         # Feature modules (search, toc, viewer, org…)
│   ├── viewer/src/lib/             # Content viewer (PDF, video, quiz…)
│   └── author/                     # Content authoring (rarely touched)
├── library/ws-widget/
│   ├── collection/src/lib/         # Shared widgets & services
│   └── utils/src/lib/              # Utility services (ConfigurationsService, ValueService…)
└── proxy/localhost.proxy.json      # Dev proxy config
```

### Path Aliases (tsconfig.json)
| Alias | Resolves to |
|---|---|
| `@ws-widget/collection` | `library/ws-widget/collection` |
| `@ws-widget/utils` | `library/ws-widget/utils` |
| `@ws-widget/resolver` | `library/ws-widget/resolver` |
| `@ws/app` | `project/ws/app/src/public-api` |
| `@ws/viewer` | `project/ws/viewer` |
| `@ws/author` | `project/ws/author` |
| `@ws/admin` | `project/ws/admin` |
| `@ws/analytics` | `project/ws/analytics` |
| `@ws/learning-hub` | `project/ws/learning-hub` |

### Key Services
- `ConfigurationsService` (`@ws-widget/utils`) — user prefs, locale, feature flags
- `ValueService` (`@ws-widget/utils`) — responsive breakpoints; `isMobile` is a `computed()` signal (< 768px), `isXSmall$` / `isLtMedium$` are Observables — prefer the Observables in non-signal components to avoid CD issues
- `SearchServService` — search API, autocomplete, language index
- `LoggerService` — use instead of `console.log` (TSLint enforces no-console)
- `ConfigCacheService` (`src/app/services/config-cache.service.ts`) — centralized config caching via BehaviorSubject + sessionStorage; use this instead of calling config endpoints directly

### API Endpoint Constants
All API paths are defined in `src/app/constants/apiConstants.ts`. Never hardcode URLs — use these constants:
- `PROTECTED_SLAG_V8 = '/apis/protected/v8'` — authenticated endpoints
- `PROXY_SLAG_V8 = '/apis/proxies/v8'` — proxy endpoints
- `PUBLIC_SLAG_V8 = '/apis/public/v8'` — public endpoints
- `S3_END_POINTS` — S3 asset URLs with cache-busting query params

### HTTP Interceptors (auto-applied — do not add headers manually)
| File | Purpose |
|---|---|
| `src/app/services/app-interceptor.service.ts` | Adds org/rootOrg/locale/userId headers; handles 419 session-expired; skips CORS URLs (S3, CloudFront) |
| `src/app/services/app-retry-interceptor.service.ts` | Exponential backoff retry for 5xx errors (5s, 10s, 15s…) |
| `src/app/services/asset-cache-interceptor.service.ts` | Caches static config/i18n JSON in sessionStorage |
| `project/ws/viewer/src/lib/interceptors/cache-control.interceptor.ts` | Adds 12-hour cache headers for `/hierarchy/` requests |

---

## Coding Conventions

### TypeScript / Angular
- **No semicolons** — enforced by ESLint
- **Single quotes** for strings
- **2-space indent**
- Max line length: **140 characters**
- `strict: false` — null checks are lenient but write defensive code anyway
- Use typed `FormControl<T>` — `UntypedFormControl` is no longer needed (typed forms are stable since Angular 14)
- Component selector prefix: **`ws-app-`** (e.g. `ws-app-search-input-home`)
- Directive selector prefix: **`ws`** (camelCase attribute)
- Components use `standalone: false` — the codebase still uses NgModule-based architecture
- No `console.log` — use `this.logger.log(...)` or add `// eslint-disable-next-line no-console`
- Angular Signals (`signal()`, `computed()`, `effect()`) are stable in Angular 21 — use them for reactive state; prefer `toObservable()` / `toSignal()` from `@angular/core/rxjs-interop` to bridge signals and RxJS
- Prefer new template control flow (`@if`, `@for`, `@switch`) in new code; legacy `*ngIf` / `*ngFor` still works

### SCSS
- Import shared vars: `@import 'ws-vars'; @import 'ws-mixins'; @import 'ws-common';`
- Use `$size-*` variables for spacing (defined in ws-vars)
- Use `@include breakpoint-xs`, `breakpoint-s`, `breakpoint-gt-xs` mixins for responsiveness
- Mobile breakpoint for cards: `500px` (matches `ws-mobile-course-view`)
- Encapsulation is `ViewEncapsulation.None` on some search components — scope styles with host selector
- **Don't fight a global utility `!important` with a component `!important`** — global styles (`styles.scss`, utility files, Tailwind) are injected into `<head>` *after* component styles, so the global wins regardless of specificity. Remove the utility class and add a custom class without `!important`, or move spacing to the parent via `gap`.
- **Angular Material MDC overrides:** if an MDC component (`mat-form-field`, `mat-checkbox`…) has uncontrollable height/spacing, replace it with a native HTML element instead of fighting it with `::ng-deep` / `--mdc-*` tokens / `!important`. `formControlName` and `[(ngModel)]` work identically on native elements.

### HTML Templates
- Use `| translate` pipe for all user-visible strings (ngx-translate)
- Use `| async` pipe over manual subscriptions where possible
- `trackBy` function required on all `*ngFor` with large lists
- Use Angular Material components (`mat-card`, `mat-icon`, `mat-spinner`, etc.)
- TailwindCSS utility classes are available (`flex`, `items-center`, `w-full`, etc.)

---

## Mobile vs Desktop
- `isXSmall` / `isMobile()` from `ValueService` controls mobile layout
- Mobile uses `ws-mobile-course-view` component (card with full-width image on top)
- Desktop uses `ws-app-learning-card` (horizontal thumbnail + text)
- Always implement shimmer for **both** layouts when adding loading states

## Shimmer Pattern
When adding shimmer/skeleton loading:
1. Show when `searchRequestStatus === 'fetching' && !content.length`
2. Clear `content = []` at the start of every new search/fetch to allow shimmer to appear
3. Match skeleton structure to the real card layout (image dimensions, text line widths)
4. Use shared `shimmer-anim` keyframes — do not duplicate the animation

---

## Design & Styling Tasks
When a task is "apply this design system" / "use these tokens" / "make this modern":
1. Restyle the **existing** component(s) in place — update SCSS (colors, radius, spacing, shadows, font) and only the HTML strictly needed to apply them.
2. Do **not** scaffold new reusable components, modules, or page sections (stats cards, activity widgets, etc.) unless explicitly asked for "a reusable X" or "extract into a shared component".
3. If a design memo describes net-new sections, treat that as a separate feature — flag and confirm scope before building; don't bundle it into a token/style update.

Principle: **enhance, don't invent.** A visual/token update restyles what exists.

---

## Authentication
- **Keycloak** via `keycloak-angular` — routes are guarded by `KeycloakAuthGuard`
- Multiple OAuth callback handlers: `sashakt-callback`, `tnai-callback`, `tnnmc-callback`, `maternity-callback`
- Public routes do not require auth; check `app-routing.module.ts` for guard setup

## Proxy (Dev)
`proxy/localhost.proxy.json` routes:
- `/apis/*` → `https://sphere.aastrika.org` (prod API, uses hardcoded auth cookie — update when cookie expires)
- `/content-api/*` → `localhost:3004`
- `/assets/*` → `https://sphere.aastrika.org`

---

## Feature Flags & Config
Runtime config is fetched from `/apis/...` on app init. Access via `ConfigurationsService`:
- `configSvc.activeLocale` — current language
- `configSvc.userPreference` — user's saved preferences
- `configSvc.isIntranetAllowed` — intranet content visibility

---

## i18n
- Library: `@ngx-translate/core` v17
- Translation files in `src/assets/i18n/` — `en.json` and `hi.json`
- Always add `| translate` to user-facing strings in templates
- Voice search language mapping: `'en' → 'en-IN'`, `'hi' → 'hi-IN'`
- Key naming: use `SCREAMING_CASE` for new keys (e.g. `ENROLL_NOW`, `VIEW_COURSE`); full sentences used as keys for long strings — match the style of nearby keys

---

## Testing
- Framework: **Jest** with `jest-preset-angular`. Config: `jest.config.js`, `setup-jest.ts`, `tsconfig.spec.json`.
- Test files: `*.spec.ts` alongside source files.
- **Ship tests with every change.** New/changed component, service, pipe, guard, or util → add/extend its `*.spec.ts` covering the new logic and touched branches, in the **same** change (not a follow-up). Don't let new code create coverage debt; keep the coverage floor satisfied and raise it as coverage climbs.
- Conventions: `jest.spyOn`; for heavy components prefer direct instantiation with mocked deps over brittle full `TestBed` rendering; use `NO_ERRORS_SCHEMA` / `CUSTOM_ELEMENTS_SCHEMA` + `provideHttpClient` / `provideHttpClientTesting` where needed.
- Run `yarn run jest-cache` if tests behave unexpectedly after dependency changes.
- Always run `nvs use 20` before `yarn test` / builds (Node 20 required).

---

## Commit & Branch Conventions
- **Conventional Commits**: `type(scope): summary` — `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`. Example: `fix(search): send Sunbird-compatible payload`.
- **No AI attribution**: never add `Co-Authored-By: Claude …` or "Generated with Claude Code" to commit messages, PRs, or docs. Commits are attributed only to the author.
- **Branches**: cut feature/fix branches from `master`; name them `feature/<short-desc>` or `fix/<short-desc>`.
- A pre-commit hook runs `lint:fix` and a pre-push hook runs a production build. (Note: the repo-wide ESLint config currently references the removed `@typescript-eslint/ban-types` rule, so the lint hook fails until that's fixed — a known issue.)

---

## Release Process
- **Release notes** live in `RELEASE_NOTES/`; start from `RELEASE_NOTES/TEMPLATE.md`. File name: `RELEASE_NOTES/release-X.Y.Z.md`.
- **Tag**: `vX.Y.Z` (immutable marker + GitHub Release). **Build/deploy branch**: `release-X.Y.Z` (Jenkins deploy source). Branch and tag names always differ.
- Flow: verify green (`nvs use 20` → lint + `yarn test` + `yarn run build`) → write release notes + version on a branch → PR into the trunk → cut `release-X.Y.Z` + tag `vX.Y.Z` → publish the GitHub Release from the tag (`gh release create vX.Y.Z --notes-file RELEASE_NOTES/release-X.Y.Z.md`) → manual Jenkins deploy from the **branch**.
- Each release gets its own new `release-X.Y.Z`; never advance a previous/frozen release branch. Rollback = redeploy the previous release branch.
- Release notes structure: header table, plain-language Summary, ✨ Features, 🐛 Fixes, 🏗️ Build/CI, 📚 Docs/Chore, ⚠️ Deploy notes & risk, ✅ Pre-deploy checklist, Release & rollback. Each bullet ends with its short commit SHA.

---

## Documentation
- Project docs live in **`docs/`**; follow **[docs/DOC_STYLEGUIDE.md](docs/DOC_STYLEGUIDE.md)** for format and brand styling.
- For substantial/shared docs, ship a Markdown source **and** a self-contained Word-compatible HTML companion (brand colors: navy `#17283C`, teal `#1E8F8E`, gold `#F0A500`). Reference example: `docs/recommendation-api-migration.{md,html}`.
- Reference code with repo-relative links and include short SHAs when documenting commits/releases.

---

## Branches
Main branch is **`master`**. Feature work happens on `feature/*` branches and merges back to `master` via PR.

---

## Agent Memory (in-repo)
Durable working notes for AI-assisted sessions live in **`.claude/memory/`** (one topic per file, markdown with frontmatter). Read them at the start of related work and update them there — do not keep repo knowledge in machine-local memory. Current notes: `.claude/memory/dead-code-cleanup-2026-07.md` (dead-code audit method, baseUrl-import pitfall, verified-alive false positives, backend page-config caveat).
