# Dead-Code Cleanup — July 2026

**Branch:** `feature/ProgramCompetency` · **Dates:** 2026-07-03 → 2026-07-06 · **Status:** verified green (AOT build + full test suite); bulk of deletions pending commit

## Summary

A repo-wide dead-code audit and cleanup removed roughly **390 files (~370 under source control today: 354 uncommitted + ~36 already committed)** of unreachable or never-rendered code across `library/ws-widget`, `project/ws`, and `src/`. Every removal was verified by static reachability analysis and confirmed by three gates: TypeScript compilation, the Angular AOT production build, and the Jest test suite (141/141 suites, 2,482 tests passing). The biggest single win: the entire authoring **editor** feature tree (~226 files) was unreachable because every `loadChildren` in its routing module had been commented out long ago.

## Verification results

| Gate | Result |
|---|---|
| `npx tsc -p tsconfig.app.json --noEmit` | ✅ exit 0 — no dangling imports |
| `yarn run build:local` (AOT production build) | ✅ exit 0, no `NG*` errors, ~44 s |
| `yarn test` (Jest) | ✅ 141/141 suites, 2,482/2,482 tests |
| Dangling-selector sweep (deleted component selectors vs remaining templates) | ✅ zero matches |

## How dead code was identified

1. **Import-graph reachability** — BFS from the app entry points (`src/main.ts`, `src/main.server.ts`, `angular.json` `fileReplacements`) following every static import, `export … from`, and lazy `loadChildren` `import()`, resolving relative paths, tsconfig aliases (`@ws/*`, `@ws-widget/*`), **and baseUrl-relative imports** (`'src/app/…'`, `'project/ws/…'`). Files not reachable from an entry point cannot be bundled — dead by construction.
2. **Render-usage analysis** for reachable code — a component counts as used only if its selector appears in a *live* template, it is routed (`component:` in a route config), opened dynamically (`MatDialog.open`, `snackBar.openFromComponent`, `ViewContainerRef.createComponent`), or registered as a dynamic widget whose `widgetType`/`widgetSubType` key appears in live code or the page-config JSONs under `src/fusion-assets/files/`.
3. **Cascade re-checks** — after each deletion wave, widget keys and selectors were re-evaluated against the shrunken live corpus (e.g. deleting the author channel editor killed the last consumer of the library `picker-content` widget).
4. **Gates** — every wave finished with `tsc`, the AOT production build, and Jest.

> **Pitfall for future audits:** this repo mixes three import styles — relative, tsconfig alias, and **baseUrl-relative** (`import { IndexedDBService } from 'src/app/services/online-indexed-db.service'`). Tooling that misses the third style produces false dead-code positives. This exact bug initially mis-flagged `online-indexed-db.service.ts` (6 importers) and `new-tnc.directive.ts` (declared in `app.module.ts`).

## What was removed

### library/ws-widget — ~90 files

**Wave 1** (committed, `e1448ffa8` — 40 files, −1,350 lines) — widgets registered for dynamic resolution whose keys appear nowhere:

| Removed | Reason |
|---|---|
| `player-amp/` (+ `_services/dynamic-assets-loader.service.ts`, its only consumer) | key `playerAmp` never referenced |
| `release-notes/` | key `userReleaseNotes` never referenced |
| `sliders-mob/` | key `sliderMobBanners` never referenced |
| `tree/`, `tree-catalog/` | keys `tree` / `treeCatalog` never referenced; tree only rendered inside tree-catalog |
| `content-assign/` (model + service, no component) | never injected |
| orphaned `.ws-widget-user-autocomplete` rule in `styles.scss` | component removed |

Also removed around this wave: `_common/locale-translator/`, `_common/user-autocomplete/`, `_common/profile-image/`, `_common/content-picker-v2/`, `_common/display-content-type-icon/` — components never rendered anywhere (some modules were imported by feature modules, but no template ever used the selectors) — plus ~300 commented-out reference lines for the long-gone `BtnContentFeedbackModule`, `BtnContentFeedbackV2Module`, `PlayerBriefModule`, `BtnContentLikeModule`, `BtnGoalsModule`, `BtnPlaylistModule`, `UserContentRatingModule` across 22 viewer module files.

**Wave 2** (staged, 57 files) — dynamic widgets whose keys/selectors have **no static reference in live code or local page configs**:

`content-strip-single/` (+ service), `element-html/`, `embedded-page/`, `gallery-view/`, `image-map-responsive/`, `intranet-selector/` (+ service), `layout-linear/`, `layout-tab/`, `picker-content/` (+ service; its only consumer was the dead author channel editor), `selector-responsive/`, `video-wrapper/`.

`registration.config.ts`, `collection.config.ts`, and `public-api.ts` were updated to drop the corresponding registrations, keys, and exports.

> **Runtime caveat:** dynamic widgets are instantiated from `widgetType`/`widgetSubType` keys that can also arrive in **backend-served page configs** (`/apis/…/page/`). The removed keys (`elementHtml`, `galleryView`, `imageMapResponsive`, `linearLayout`, `tabLayout`, `videoWrapper`, `intranetResponsive`, `selectorResponsive`, `contentStripSingle`, `pageEmbedded`) had zero references in the repo including `src/fusion-assets/files/*.json`, but were **not** verifiable against production page JSON. If a server page config still emits one of these keys, that section will silently not render — restore the widget from git history if that happens.

### project/ws — 287 files

| Area | Files | What |
|---|---|---|
| `author` | 226 | The entire unreachable **editor** tree: [editor-routing.module.ts](../project/ws/author/src/lib/routing/modules/editor/editor-routing.module.ts) had every `loadChildren` commented out, orphaning `channel/` (page editor incl. all input/view/v2 widgets), `collection/`, `curate/`, `iap-assessment/`, `quiz/`, `web-page/`, plus stranded support files (`editor-content-v2.service.ts`, `auth-config.service.ts`, `auth-init.resolver.service.ts`, `constants/depth-rule.ts`, `constants/init.ts`, `interface/initialSetup.ts`) and never-rendered shared components (`course-rating-dialog`, `auth-editor-steps`). The my-content and create flows remain live. |
| `viewer` | 16 | `plugins/html-picker/` and `route-view-container/html-picker/` (both generations), the two orphaned `html-routing.module.ts` files (routing is central in `viewer-routing.module.ts`), `interceptors/cache-control.interceptor.ts` (**documented in CLAUDE.md but registered nowhere**), `services/course-hierarchy-cache.service.ts`, `services/indexeddb-cache.service.ts` |
| `app` | 45 | Never-loaded `org/org.module.ts` + `org-routing.module.ts` + `all-courses/` (only `OrgComponent`/`OrgServiceService`/`OrgSelectiveCourseModule` are used individually); app-toc: `create-batch-dialog/`, `app-toc-analytics.model.ts`, `components/app-toc-overview/` (dynamic host was commented out, loader service unreachable), `app-toc-discussion/`, `app-toc-overview.directive.ts` + `.service.ts`; app-event: `card-details/`, `event-banner/`, `interfaces/` models; person-profile: `last-learnt/`, `user-goals/`, `userdetailall.module.ts`; profile: `course-pending-card/`, `calendar-module/`; search: `components/search-input/`; user-profile: `resolvers/config-resolver.service.ts` |

### src — 11 files

`route-org-details.module.ts`, `competency.service.ts`, `header-service.service.ts`, `navigation-history.service.ts`, `performance.service.ts` (+ their spec files), `discuss.model.ts`, and `sampleData.ts` (1,172 lines, removed in `dea5c88dd`).

### Reference cleanups (modified files)

24 files were edited to drop imports/`providers`/declarations of removed code — key ones: `viewer.module.ts`, `viewer-routing.module.ts`, `app-toc.module.ts`, `person-profile.module.ts` (+ `person-profile.component.ts` in `ce0a421bf`), `app-event.module.ts` + routing, `profile.module.ts`, `dashboard.module.ts`, author `create.module.ts` / `editor.module.ts` / both `shared.module.ts`, `app-routing.module.ts`, `root.component.ts`, `registration.config.ts`, `public-api.ts`. Jest specs for touched files were updated in `dea5c88dd`.

## False positives caught & kept alive

| File | Why it looked dead | Why it is alive |
|---|---|---|
| `src/app/services/online-indexed-db.service.ts` | baseUrl-import resolver gap | 6 importers (viewer quiz/SCORM/util/toc, app-toc desktop & home-page) |
| `src/app/routes/new-tnc/new-tnc.directive.ts` | same | declared in `app.module.ts` |
| `src/app/routes/competency/competency.config.ts` | same | imported by `app.module.ts` (restored — also relevant to this branch's feature) |
| `viewer/src/lib/plugins/resource-collection/` (9 files) | only its model file was dead; folder was over-deleted | rendered by the routed resource-collection viewer — see incident below |
| `NotificationComponent` (author) | no selector usage | opened via `snackBar.openFromComponent` |
| `AppTocHomePageComponent` | no selector usage | created dynamically via `app-toc-home.service` + `ViewContainerRef.createComponent` |
| `AppTocOverviewComponent` (routes/) | no selector usage | routed at path `overview` |
| Route resolvers (`AppTocResolverService`, `ProfileResolverService`, `EventResolverService`, `InitResolver`, `ContentTOCResolver`, `ContentAndDataReadMultiLangTOCResolver`) & `AuthoringErrorHandler` | referenced only in `*.module.ts` | used in route `resolve:` blocks / `ErrorHandler` provider |

> **Incident (resolved):** deleting `plugins/resource-collection/` wholesale broke the AOT build with `NG8001: 'viewer-plugin-resource-collection' is not a known element` — `tsc` stayed green because the module import had been removed by hand while the template still used the element. The folder and the `PluginResourceCollectionModule` import were restored, and the build went green. **Lesson: `tsc` cannot see template-level breakage; always finish a cleanup wave with the AOT production build.**

## Commits

| Commit | Content |
|---|---|
| `e1448ffa8` | Wave-1 library removals (40 files, −1,350 lines) |
| `ce0a421bf` | `person-profile.component.ts` reference cleanup (−43 lines) |
| `dea5c88dd` | Jest spec updates for touched files; `sampleData.ts` removal (14 files) |
| *(pending)* | 354 deletions (95 staged + 259 unstaged) + 24 modified files — the project/ws trees and wave-2 library widgets |

## Remaining follow-ups

1. **Commit the pending work** (354 deletions + 24 modifications are in the working tree as of 2026-07-06).
2. **`UploadService`** (`author/…/editor/shared/services/upload.service.ts`) — zero injectors remain; delete it plus its import + `providers:` entries in [create.module.ts](../project/ws/author/src/lib/routing/modules/create/create.module.ts) and [editor/shared/shared.module.ts](../project/ws/author/src/lib/routing/modules/editor/shared/shared.module.ts) in one pass.
3. **`project/ws/viewer/src/public-api.ts`** — orphaned barrel (no `index.ts` backs the `@ws/viewer` alias; nothing imports bare `'@ws/viewer'`). Safe to delete.
4. **`src/app/workers/performance.worker.ts`** — its consumer (`performance.service.ts`) is gone. Safe to delete.
5. **Update CLAUDE.md** — remove the `cache-control.interceptor.ts` row from the HTTP-interceptors table; the file no longer exists.
6. After the release ships, spot-check production pages that previously used the removed dynamic widgets (see runtime caveat above).
