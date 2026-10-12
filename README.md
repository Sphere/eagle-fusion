# Eagle-Fusion

**Aastrika Sphere** — Angular 21 Learning Management System frontend for a healthcare training platform offering free CNE courses with INC certification.

- **Live platform:** https://sphere.aastrika.org
- **Angular:** 21.2.7 | **Node:** 20 (managed via NVS) | **Package manager:** Yarn

---

## Quick Start

```bash
# 1. Switch to Node 20 (required)
nvs use 20

# 2. Install dependencies
yarn install

# 3. Start dev server (localhost:3000)
yarn start
```

> The dev proxy in `proxy/localhost.proxy.json` routes `/apis/**` to the production backend at `sphere.aastrika.org`. Update the hardcoded auth cookie in `proxy/localhost.proxy.json` when it expires.

---

## Commands

| Command | Description |
|---|---|
| `yarn start` | Dev server on `:3000`, proxied to **Sphere** |
| `yarn start:ekshamata` | Dev server on `:3000`, proxied to **Ekshamata** ([see below](#running-sphere-vs-ekshamata-locally)) |
| `yarn run build` | Production build (gzip + brotli compressed) |
| `yarn run build:local` | Production build without compression |
| `yarn run build:fast` | Dev build with vendor chunk (faster iteration) |
| `yarn test` | Jest single run |
| `yarn run test-watch` | Jest watch mode |
| `yarn run test-coverage` | Jest with coverage report |
| `yarn run lint` | ESLint check |
| `yarn run lint:fix` | ESLint auto-fix |
| `yarn run tailwind` | Watch TailwindCSS and recompile |
| `yarn run tailwind:build` | One-time TailwindCSS build |

---

## Monorepo Structure

```
eagle-fusion/
├── src/
│   ├── app/
│   │   ├── component/              # Root-level UI components
│   │   │   ├── root/               # RootComponent — app shell, layout orchestrator
│   │   │   ├── app-nav-bar/        # Authenticated top & bottom navbar
│   │   │   ├── app-public-nav-bar/ # Pre-login public navigation
│   │   │   ├── app-footer/         # Footer
│   │   │   ├── login/              # Login UI
│   │   │   ├── downtime-banner/    # Maintenance banner
│   │   │   ├── downtime-full/      # Full-screen maintenance page
│   │   │   └── my-courses/         # Enrolled courses tab
│   │   ├── routes/                 # Feature modules (lazy-loaded)
│   │   │   ├── app-toc/            # Course Table of Contents
│   │   │   ├── web-course-view/    # Course viewing
│   │   │   ├── search/             # Search module
│   │   │   ├── profile-view/       # User profile
│   │   │   ├── organisations/      # Org-specific pages
│   │   │   ├── public/             # Public pages (home, about, blog, FAQ)
│   │   │   └── [15+ more...]
│   │   ├── guards/                 # Route guards (auth, feature flags)
│   │   ├── services/               # App-level services (28 total)
│   │   ├── constants/              # API endpoint constants
│   │   └── models/                 # Shared TypeScript models
│   ├── assets/                     # i18n translation files
│   ├── fusion-assets/              # Images, icons, fonts
│   ├── styles/                     # Shared SCSS (ws-vars, ws-mixins, ws-common)
│   ├── main.ts                     # Bootstrap entry point
│   └── index.html
│
├── project/ws/
│   ├── app/src/lib/routes/         # Feature modules (search, toc, org, profile...)
│   ├── viewer/src/lib/             # Content viewers (PDF, video, SCORM, quiz)
│   └── author/src/lib/             # Content authoring (rarely modified)
│
├── library/ws-widget/
│   ├── collection/src/lib/         # Shared widgets and reusable components
│   ├── resolver/src/lib/           # Widget resolution engine
│   └── utils/src/lib/              # Core utility services
│
└── proxy/localhost.proxy.json      # Dev proxy configuration
```

---

## Architecture Overview

### Bootstrap Flow

```
index.html
  └── main.ts  →  platformBrowserDynamic().bootstrapModule(AppModule)
                       │
                       ├── APP_INITIALIZER (3 tokens, run in parallel)
                       │     ├── initializeCompetencyConfig()  — loads from localStorage
                       │     ├── appInitializer(InitService)   — auth + config fetch
                       │     └── initTranslate(TranslateService) — loads i18n
                       │
                       └── bootstraps RootComponent (<ws-root>)
                                 │
                                 ├── constructor  — platform check, domain detection,
                                 │                  router events subscription, SSO setup
                                 ├── ngOnInit     — route subscriptions, SEO, telemetry,
                                 │                  downtime init, layout flags
                                 └── router-outlet — lazy-loaded feature routes
```

See [docs/ROOT_COMPONENT.md](docs/ROOT_COMPONENT.md) for the full bootstrapping flow and template reference.

### Key Services

| Service | Location | Responsibility |
|---|---|---|
| `ConfigurationsService` | `@ws-widget/utils` | User profile, locale, feature flags — global state |
| `ValueService` | `@ws-widget/utils` | Responsive breakpoints; `isMobile()` signal, `isXSmall$` observable |
| `InitService` | `src/app/services/` | Auth init, config fetch, user data loading at startup |
| `ThemeService` | `src/app/services/` | Dark/light mode toggle, org color variables (signal-based) |
| `SeoService` | `src/app/services/` | Updates page title, meta tags, OG tags on every navigation |
| `PlaylistService` | `src/app/services/` | Fetches home page config, org details, footer config |
| `DowntimeConfigService` | `src/app/services/` | Maintenance windows and theme overrides |
| `UserDataCacheService` | `src/app/services/` | Session-storage cache for user profile (6-hour TTL) |
| `TelemetryService` | `@ws-widget/utils` | Impression, audit, event tracking (Sunbird telemetry) |
| `AuthKeycloakService` | `@ws-widget/utils` | Keycloak SSO authentication |

### Path Aliases (tsconfig.json)

| Alias | Resolves to |
|---|---|
| `@ws-widget/collection` | `library/ws-widget/collection` |
| `@ws-widget/utils` | `library/ws-widget/utils` |
| `@ws-widget/resolver` | `library/ws-widget/resolver` |
| `@ws/app` | `project/ws/app/src/public-api` |
| `@ws/viewer` | `project/ws/viewer` |

---

## Coding Conventions

- **No semicolons** — enforced by ESLint
- **Single quotes** for strings
- **2-space indent**, max line length **140 characters**
- Component selector prefix: **`ws-app-`** | Directive prefix: **`ws`** (camelCase)
- `standalone: false` — NgModule-based architecture throughout
- No `console.log` — use `this.logger.log(...)` from `LoggerService`
- Use Angular Signals (`signal()`, `computed()`, `effect()`) for reactive state
- Prefer new template control flow (`@if`, `@for`, `@switch`) in new code
- Use `| translate` pipe for all user-facing strings (ngx-translate)

### SCSS

```scss
@import 'ws-vars';    // $size-* spacing, $color-* palette
@import 'ws-mixins';  // @include breakpoint-xs, breakpoint-s, breakpoint-gt-xs
@import 'ws-common';  // shared utility classes
```

### Mobile vs Desktop

- Mobile breakpoint: `768px` — use `isMobile()` signal or `isXSmall$` observable from `ValueService`
- Mobile card: `ws-mobile-course-view` (full-width image on top)
- Desktop card: `ws-app-learning-card` (horizontal thumbnail + text)
- Always add shimmer for **both** layouts when adding loading states

---

## Authentication

- **Keycloak** via `keycloak-angular` — `KeycloakAuthGuard` protects authenticated routes
- OAuth callback routes: `/openid/keycloak`, `/openid/sashakt`, `/openid/maternity`, `/openid/tnnmc`, `/openid/mnc`, `/openid/tnai`, `/google/callback`
- Public routes: `/public/**` — no auth required
- Route guard: `GeneralGuard` verifies authentication and feature permissions before activating protected routes

---

## Multi-Domain Support

The app renders two distinct UI branches detected at runtime from `window.location.hostname`:

| Domain | Branch | Layout |
|---|---|---|
| `sphere.aastrika.org` (default) | Sphere | Full layout: public nav, featured courses, footer |
| `*.ekshamata.*` | Ekshamata | Simplified layout: logged-in nav only, no public featured section |

### Running Sphere vs Ekshamata locally

Which portal you get is decided by **two independent things**, and they must be set together:

1. **Where the data comes from** — the dev proxy. `assets/configurations/host.config.json` is fetched as a relative URL and supplies `rootOrg` / `org`, which then ride on every API call, so the proxy target decides the org config, branding and content.
2. **What the frontend thinks it is** — `window.location.hostname`, read in `app-routing.module.ts` (titles), `root.component.ts` (`isEkshamata`, drives the whole layout) and `app-nav-bar.component.ts`. On localhost that is always `localhost`, so without an override the app can only ever be Sphere.

**Sphere** (default):

```bash
yarn start
# then, if you previously switched: http://localhost:3000/page/home?portal=reset
```

**Ekshamata:**

```bash
yarn start:ekshamata
# then open once: http://localhost:3000/page/home?portal=ekshamata
```

The `?portal=` value is stored in `localStorage` (`devPortalHost`), so pass it once and browse normally afterwards.

| Param | Effect |
|---|---|
| `?portal=ekshamata` | Treat the app as `ekshamata.aastrika.org` |
| `?portal=sphere` | Treat the app as `sphere.aastrika.org` |
| `?portal=reset` | Clear the override, fall back to the real hostname |

**Gotcha:** the two halves are independent. Running `yarn start` while the `?portal=ekshamata` override is still set renders Ekshamata's layout over Sphere's content — it looks like a bug but isn't. Always pair the command with the matching param.

**Production is unaffected.** `getPortalHost()` ([`src/app/constants/portal.ts`](src/app/constants/portal.ts)) returns `window.location.hostname` immediately unless the host is `localhost` / `127.0.0.1` / `::1`, so the query param does nothing on a deployed domain. Proxy files are an `ng serve` concern only and are never part of a build.

---

## Feature Flags & Runtime Config

Config is fetched from `/apis/...` at app init. Access via `ConfigurationsService`:

```typescript
configSvc.activeLocale        // current language
configSvc.userPreference      // user's saved preferences
configSvc.isIntranetAllowed   // intranet content visibility
configSvc.isAuthenticated     // authentication state
```

---

## Dev Proxy

Two proxy files route API calls during local development — one per portal:

| File | Used by | `/apis/**` and `/assets/**` target |
|---|---|---|
| `proxy/localhost.proxy.json` | `yarn start` | `https://sphere.aastrika.org` (hardcoded auth cookie — update when it expires) |
| `proxy/ekshamata.proxy.json` | `yarn start:ekshamata` | `https://ekshamata.aastrika.org` (hardcoded auth cookie — update when it expires) |

Both route the local service paths identically (`/content-api/**` → `:3004`, `/content-store/**` → `:3005`, `/chat-bot/**` → `:3006`, `/mobile-apps/**` → `:3007`, `/LA/**` → `:3008`).

> `.gitignore` excludes the whole `/proxy` directory — `localhost.proxy.json` is only tracked because it predates that rule. Create `proxy/ekshamata.proxy.json` locally by copying `localhost.proxy.json` and repointing the `/apis/**` and `/assets/**` targets at `https://ekshamata.aastrika.org`.

---

## Testing

- **Framework:** Jest 29 with `jest-preset-angular`
- Test files: `*.spec.ts` alongside source files
- Integration style preferred — no mocking of real HTTP/database calls
- Run `yarn run jest-cache` if tests behave unexpectedly after dependency changes

---

## Third-Party Integrations

| Integration | Package | Purpose |
|---|---|---|
| Keycloak SSO | `keycloak-angular` | Authentication |
| Sunbird | `@project-sunbird/client-services` | LMS content APIs |
| Telemetry | `@project-sunbird/telemetry-sdk` | Event tracking |
| Competency framework | `@aastrika_npmjs/comptency` | Competency assessment UI |
| Discussion forum | `@aastrika_npmjs/discussions-ui-v8` | Forum/chat |
| Micro surveys | `@sunbird-cb/micro-surveys` | Feedback collection |
| Capacitor | `@capacitor/*` | Native mobile app wrapper |
| FreshChat | `window.fcWidget` (CDN) | Live chat support widget |

---

## Documentation

- [Root Component Flow](docs/ROOT_COMPONENT.md) — detailed bootstrapping and layout orchestration
