# Eagle-Fusion — Claude Code Guide

## Project Overview
Angular 16 LMS (Learning Management System) frontend for **Aastrika Sphere**, a healthcare training platform. Built as a multi-library monorepo using Angular CLI workspaces. Integrates Sunbird, Keycloak SSO, and custom content libraries.

**Package manager:** Yarn (`yarn`, not `npm`)

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
yarn run lint               # TSLint check
yarn run lint:fix           # TSLint auto-fix

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

### Key Services
- `ConfigurationsService` (`@ws-widget/utils`) — user prefs, locale, feature flags
- `ValueService` (`@ws-widget/utils`) — responsive breakpoints (`isMobile()`, `isLtMedium$`)
- `SearchServService` — search API, autocomplete, language index
- `LoggerService` — use instead of `console.log` (TSLint enforces no-console)

---

## Coding Conventions

### TypeScript / Angular
- **No semicolons** — enforced by TSLint
- **Single quotes** for strings
- **2-space indent**
- Max line length: **140 characters**
- `strict: false` — null checks are lenient but write defensive code anyway
- Use `UntypedFormControl` (Angular 16 migration pattern used throughout)
- Component selector prefix: **`ws-app-`** (e.g. `ws-app-search-input-home`)
- Directive selector prefix: **`ws`** (camelCase attribute)
- No `console.log` — use `this.logger.log(...)` or add `// tslint:disable-next-line:no-console`

### SCSS
- Import shared vars: `@import 'ws-vars'; @import 'ws-mixins'; @import 'ws-common';`
- Use `$size-*` variables for spacing (defined in ws-vars)
- Use `@include breakpoint-xs`, `breakpoint-s`, `breakpoint-gt-xs` mixins for responsiveness
- Mobile breakpoint for cards: `500px` (matches `ws-mobile-course-view`)
- Encapsulation is `ViewEncapsulation.None` on some search components — scope styles with host selector

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
- Library: `@ngx-translate/core` v16
- Translation files in `src/assets/i18n/`
- Always add `| translate` to user-facing strings in templates
- Voice search language mapping: `'en' → 'en-IN'`, `'hi' → 'hi-IN'`

---

## Testing
- Framework: **Jest 29** with `jest-preset-angular`
- Test files: `*.spec.ts` alongside source files
- No mocking of real HTTP/database calls — integration style preferred
- Run `yarn run jest-cache` if tests behave unexpectedly after dependency changes

---

## Current Branch
`feature/downtime` — active development branch. Main branch is `master`.
