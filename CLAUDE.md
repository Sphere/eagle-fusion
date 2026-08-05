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

### API response shapes — never trust a field to be a JSON string
Some content fields reach the UI **already deserialized on one environment and as a JSON string on another**, because the Sunbird content-service only deserializes properties its schema declares as objects/arrays (`BaseSchemaValidator.getJsonProps()`), and that differs per deployed build.

Verified for the same content id: `sphere.aastrika.org` returns `competencies_v1` as a **string**, `portal-staging.aastrika.org` returns it as an **array**. Same divergence affects `creatorDetails`, `publisherDetails` and `reviewer`.

`JSON.parse(<array>)` coerces to `"[object Object]"` and throws `SyntaxError`. This has already caused two production-visible bugs (empty competency dialog; dead "Assess" button).

- Use `parseCompetencies()` / `groupCompetenciesByName()` from `project/ws/app/src/lib/routes/app-toc/utils/competency.util.ts` — they handle string / array / keyed-object / malformed input and never throw.
- Never call `JSON.parse` directly on an API field. If you must, guard with `typeof x === 'string'` and wrap in `try/catch`.
- A throw inside an RxJS operator is swallowed by any `.subscribe()` without an `error` callback — the flow dies silently with nothing in the console. Always pass an `error` handler on subscribes that drive navigation or rendering.

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

## Known traps
- **`environment.prod.ts` ships `production: false` — this is load-bearing, do NOT "fix" it.** The env files are effectively inverted: the prod build replaces `environment.ts` → `environment.prod.ts`, so **prod runs with `environment.production === false`**. That flag drives theme injection (`useLinkForThemeInjection` in `init.service.ts`) and config-path resolution (`configurations.service.ts`). Prod has always run this way; flipping it risks breaking config and theme loading. Known consequence: `LoggerService` gates on this flag, so logs print in prod. If you need to fix the logging, do it in the logging layer — don't flip `environment.production`.
- **Do not re-add `@jaguards/material-extended-mde`** (`MdePopoverTrigger`) — removed for Angular 21 incompatibility. Use `MatMenuModule` or a custom tooltip.
- **`/apis/protected/v8/userEnrolledInSource` returns 500** — upstream is broken. Use cached enrolment data from `ConfigurationsService`.
- **Don't mix Signals with `ngOnChanges` in the same component** — it causes change-detection issues. New code in already-migrated areas (`PlaylistService`, `DowntimeConfigService`, `WebPublicContainerComponent`) should use Signals; legacy NgModule components stay on RxJS. Bridge with `toSignal()` / `toObservable()`.
- **Test dark theme whenever touching global or `ViewEncapsulation.None` styles** — Angular 21's encapsulation changes have broken theme-scoped styles more than once.

---

## i18n
- Library: `@ngx-translate/core` v17
- Translation files in `src/assets/i18n/` — `en.json` and `hi.json`
- Always add `| translate` to user-facing strings in templates
- **Every new key goes into BOTH `en.json` and `hi.json`, in the same change.** A key present only in `en.json` renders the raw key string to Hindi users — half-translated UI is a shipped defect, not a cleanup task. This covers error states, empty states, button labels, tooltips and `aria-label`s, not just the happy path.
- Check before adding — many common words (`Close`, `Retry`, `Download`) already exist: `grep -F '"<key>":' src/assets/i18n/en.json`
- Voice search language mapping: `'en' → 'en-IN'`, `'hi' → 'hi-IN'`
- Key naming: use `SCREAMING_CASE` for new keys (e.g. `ENROLL_NOW`, `VIEW_COURSE`); full sentences used as keys for long strings — match the style of nearby keys
- **Dev gotcha:** local `src/assets/i18n` edits do not resolve while running `yarn start` — the proxy serves `/assets/**` from prod. They work in a deployed build; to see them locally, seed the strings via `setTranslation`.

---

## Testing
- Framework: **Jest** with `jest-preset-angular`. Config: `jest.config.js`, `setup-jest.ts`, `tsconfig.spec.json`.
- Test files: `*.spec.ts` alongside source files.
- **Ship tests with every change.** New/changed component, service, pipe, guard, or util → add/extend its `*.spec.ts` covering the new logic and touched branches, in the **same** change (not a follow-up). Don't let new code create coverage debt; keep the coverage floor satisfied and raise it as coverage climbs.
- Conventions: `jest.spyOn`; for heavy components prefer direct instantiation with mocked deps over brittle full `TestBed` rendering; use `NO_ERRORS_SCHEMA` / `CUSTOM_ELEMENTS_SCHEMA` + `provideHttpClient` / `provideHttpClientTesting` where needed.
- Run `yarn run jest-cache` if tests behave unexpectedly after dependency changes.
- Always run `nvs use 20` before `yarn test` / builds (Node 20 required).
- **Run the full suite and the production build at commit time, not after every edit.** `yarn test` and `yarn run build:local` each take minutes and stall the diagnose → fix → verify loop. During iteration a `node_modules/.bin/tsc --noEmit -p tsconfig.json` check is cheap and catches most breakage; batch the suite and the build into the commit step, where the build is the real gate anyway (the pre-commit lint hook is broken — see Commit & Branch Conventions).
- Exception: if a change breaks an **existing** spec (e.g. adding a constructor argument), repair that spec in the same change. Leaving the suite red is not deferring work, it's handing over broken work.

---

## Commit & Branch Conventions
- **Branch first**: cut a branch from `master` **before** you start editing — never work on or commit directly to `master`. Name it `feature/<short-desc>` or `fix/<short-desc>`. Every change merges back to `master` via PR.
- **Conventional Commits**: `type(scope): summary` — `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`. Example: `fix(search): send Sunbird-compatible payload`.
- **No AI attribution**: never add `Co-Authored-By: Claude …` or "Generated with Claude Code" to commit messages, PRs, or docs. Commits are attributed only to the author.
- **One PR = one branch = one purpose**: keep unrelated changes (e.g. a local `proxy/localhost.proxy.json` cookie edit) out of the commit — stage only the files that belong to the change.
- A pre-commit hook runs `lint:fix` and a pre-push hook runs a production build. Known issue: the repo-wide ESLint config references the removed `@typescript-eslint/ban-types` rule, so the **pre-commit lint hook fails/hangs** until that's fixed. Until then, commit with `git commit --no-verify` to bypass the broken lint hook, and let the **pre-push production build** be the real gate (do not skip that one).

---

## Release Process
- **Release notes** live in `RELEASE_NOTES/`; start from `RELEASE_NOTES/TEMPLATE.md`. File name: `RELEASE_NOTES/release-X.Y.Z.md`.
- **Tag**: `vX.Y.Z` (immutable marker + GitHub Release). **Build/deploy branch**: `release-X.Y.Z` (Jenkins deploy source). Branch and tag names always differ.
- Flow: verify green (`nvs use 20` → lint + `yarn test` + `yarn run build`) → write release notes + version on a branch → PR into `master` → **wait for the merge** → cut `release-X.Y.Z` + tag `vX.Y.Z` **from `master`** → publish the GitHub Release from the tag (`gh release create vX.Y.Z --notes-file RELEASE_NOTES/release-X.Y.Z.md --title "Release-X.Y.Z"`) → manual Jenkins deploy from the **branch**.
- **`release-X.Y.Z` and `vX.Y.Z` are always cut from `master`, never from the feature/fix branch.** The release branch must point at the merged trunk commit, so what deploys is what `master` contains and what reviewers approved. Cutting from the fix branch produces a release that isn't reachable from `master` and silently diverges the deployed artifact from the trunk:

  ```bash
  git fetch origin
  git branch release-X.Y.Z origin/master
  git tag    vX.Y.Z        origin/master
  ```
- **`master` requires 2 approving reviews and cannot be merged programmatically** (the API returns `405`). Automate up to opening the PR, then stop and wait for the approvals. Do not create the branch/tag/Release early to unblock a deploy — that is what produces off-trunk releases.
- Each release gets its own new `release-X.Y.Z`; never advance a previous/frozen release branch. Rollback = redeploy the previous release branch.
- Release notes structure: header table, plain-language Summary, ✨ Features, 🐛 Fixes, 🏗️ Build/CI, 📚 Docs/Chore, ⚠️ Deploy notes & risk, ✅ Pre-deploy checklist, Release & rollback. Each bullet ends with its short commit SHA.
- **One PR per release, never two.** Write `RELEASE_NOTES/release-X.Y.Z.md` on the **same** feature/fix branch as the code and commit it *before* that branch's PR opens. Do not merge the code PR and then follow up with a separate release-notes PR — that's two review cycles for one release. A standalone `chore: write release notes for X.Y.Z` branch is a recovery path only (when the code was already merged before the release was called), not the default.
- **GitHub Release title is `Release-X.Y.Z`** — not the tag name, not a descriptive title. Pass `--title "Release-X.Y.Z"` explicitly, since `gh release create` otherwise defaults to the tag.
- **`master` is branch-protected: 2 approving reviews required.** The merge cannot be automated (the API returns `405`). A release run can open the PR and cut the tag/branch/GitHub Release, then must stop and wait for human approvals. Deploy does not depend on the merge — Jenkins deploys from the `release-X.Y.Z` branch, so a release can ship while the PR waits.
- **Never `git commit` while checked out on `master`**, even for a notes-only change. Branch protection rejects the push (`GH006`), and the commit then has to be moved off `master` with `git branch <name>` + `git reset --hard origin/master`. Create and check out the branch *before* writing any files.

---

## Deploying to Sunbird Spark (staging)
`Jenkinsfile-sun` **builds only** (checkout → assets-pull → `build.sh` → push image). It does **not** deploy — the rollout is a manual kubectl step.

Run from the Jenkins bastion `jenkins@ip-10-0-19-95` (local machines do not have cluster access).

- **Cluster:** `aastar-stage-new` (ap-south-1) — the only context on the bastion, already current
- **Namespace:** `sunbird` · **Deployment/container:** `ui-static` · **Registry:** `aastardev1`
- **Image tag:** `<branch-last-segment>_<shortSHA>_<jenkinsBuildNumber>` — e.g. `upgrade_605e288_2004` = branch `sunbird-spark/upgrade`, commit `605e288`, Jenkins build #2004

```bash
# 1. record the current image first — this is the rollback tag
kubectl get deploy ui-static -n sunbird -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
# 2. roll out
kubectl set image deployment/ui-static ui-static=aastardev1/ui-static:<build_tag> -n sunbird
kubectl rollout status deployment/ui-static -n sunbird
# rollback
kubectl rollout undo deployment/ui-static -n sunbird
```

Healthy rollout = new ReplicaSet pod `1/1 Running`, old pod `Terminating`. `ImagePullBackOff` means that Jenkins build never pushed the tag to `aastardev1` — check the build log rather than retrying.

---

## Documentation
- Project docs live in **`docs/`**; follow **[docs/DOC_STYLEGUIDE.md](docs/DOC_STYLEGUIDE.md)** for format and brand styling.
- For substantial/shared docs, ship a Markdown source **and** a self-contained Word-compatible HTML companion (brand colors: navy `#17283C`, teal `#1E8F8E`, gold `#F0A500`). Reference example: `docs/recommendation-api-migration.{md,html}`.
- Reference code with repo-relative links and include short SHAs when documenting commits/releases.

---

## Branches
Main branch is **`master`**. Feature work happens on `feature/*` branches and merges back to `master` via PR.
