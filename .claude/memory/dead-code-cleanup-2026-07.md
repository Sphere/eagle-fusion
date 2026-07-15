---
name: dead-code-cleanup-2026-07
description: Ongoing dead-code cleanup on feature/ProgramCompetency — verified dead trees in project/ws and library/ws-widget (July 2026)
metadata:
  type: project
---

As of 2026-07-03, user is removing dead code on `feature/ProgramCompetency`. Verified by import-graph reachability from src/main.ts + widget-key analysis:

- **Author editor sub-features are dead**: `editor-routing.module.ts` has all `loadChildren` commented out, killing the channel/collection/curate/iap-assessment/quiz/web-page trees (~95 files). This cascade also killed the library `picker-content` widget (its only consumer).
- **CLAUDE.md is wrong about `cache-control.interceptor.ts`** (viewer): it documents it as an active interceptor but it is registered nowhere — dead file, along with `course-hierarchy-cache.service.ts` and `indexeddb-cache.service.ts`.
- Library dynamic widgets with zero static key usage (elementHtml, galleryView, imageMapResponsive, linearLayout, tabLayout, videoWrapper, intranetResponsive, selectorResponsive, contentStripSingle) may still be referenced by **backend-served page configs** (`/apis/.../page/`) — verify server JSON before deleting.
- `components/app-toc-overview` (AppTocOverviewComponent, selector `ws-app-app-toc-overview`) is never rendered (its host directive usage is commented, its loader service unreachable) but user edited its template on 2026-07-03 — may be mid-revival, ask before deleting.
- Audit scripts + full JSON results were in session scratchpad (audit-ws-widget.js, audit-project-ws.js) — regenerate if needed; method: BFS over import/export/dynamic-import specifiers from src/main.ts with tsconfig path aliases, plus selector/widget-key checks against live-only templates.
- **Pitfall: this repo uses baseUrl-relative imports** (`import ... from 'src/app/services/x'` or `'project/ws/...'`) alongside relative and alias imports — any import-graph tooling must resolve those from repo root or it produces false dead-code positives (e.g. `online-indexed-db.service.ts` looked dead but has 6 importers; `new-tnc.directive.ts` is declared in app.module).
- Bulk deletion executed 2026-07-03 (~350 files: library widget group, author editor trees, viewer caches/html-picker, never-rendered components incl. components/app-toc-overview). Final state verified green: tsc clean, `yarn run build:local` (AOT) exit 0, 141/141 test suites pass.
- **`viewer/src/lib/plugins/resource-collection/` is LIVE** — rendered by the routed route-view-container/resource-collection viewer. It was over-deleted during cleanup (only its model file was dead), broke the AOT build (NG8001), and was restored. tsc alone misses template-level breaks — always finish cleanup verification with the production build.
