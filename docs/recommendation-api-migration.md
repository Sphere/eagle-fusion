# Recommendation API → Sunbird Search Migration

**Scope:** Aastrika Sphere web frontend (eagle-fusion) — removal of the recommendation-service dependency and repoint of all course-search traffic to Sunbird.
**Date:** 2026-06-29 · **Branch:** `feature/remove-recommendation-service` · **Commits:** `21749d3af`, `0c2e91509` (+ rating-count fix pending)

> **Summary:** The backend **recommendation service** (`RECOMMENDATION_API_BASE_V2`) is being decommissioned. Every frontend call that depended on it has been removed or repointed to the surviving pure-Sunbird route `publicSearch/getCourses` (→ `content/v1/search`). After this change the frontend has **zero runtime or code references to the recommendation service**. Search facets are preserved, and course ratings continue to work because the Sunbird index now returns them natively.

---

## 1. Background & motivation

The frontend used the recommendation service through several course-search routes (see the companion `recommendation-service-api-usage.html` for the original mapping). With the service being retired, those routes would either disappear or silently fail, so all usage had to be moved off it.

A UI-proxy investigation established the backend routing that drove the migration plan:

- `publicSearch/getCourses` → Sunbird `content/v1/search` — **survives** (pure Sunbird, not the recommendation service).
- `ratingsSearch/getCourses` → **hybrid**: search is Sunbird, but ratings are injected from `RECOMMENDATION_API_BASE_V2/bulkRatingLookup`.
- `ratingsSearch/recommendation/publicSearch/getcourse` → recommendation service (its primary search is the rec service itself).

> ⚠️ **Critical failure mode found:** when the recommendation service is down, the proxy's `ratingsSearch/getCourses` *browse* branch returns HTTP 200 with valid `facets` and a real `count` but an **empty `content: []`** — silent total data loss, not graceful degradation. Nearly all frontend call sites are browse-style (`{ filters, query: '', sort }`), so without this migration those pages would silently go blank once the service is removed. This made the repoint an **availability fix**, not just a cleanup.

---

## 2. API mapping — before → after

| Constant | Old route (recommendation service) | New route | Status |
|---|---|---|---|
| `SEARCH_V8PUBLIC` | `ratingsSearch/recommendation/publicSearch/getcourse` | `publicSearch/getCourses` (`SEARCH_V7PUBLIC`) | **REPOINTED** + constant deleted |
| `SEARCH_V6PUBLIC` | `ratingsSearch/getCourses` | `publicSearch/getCourses` (`SEARCH_V7PUBLIC`) | **REPOINTED** + constant deleted |
| `PUBLIC_CONTENT_SEARCH` | `ratingsSearch/getCourses` | `publicSearch/getCourses` (`SEARCH_V7PUBLIC`) | **REPOINTED** + constant deleted |
| `COURSE_RECOMENDATION` | `mobileApp/courseRemommendationv2` | — | **REMOVED** (dead wrapper) |
| `COURSE_RECOMMENDATION_V2` | `mobileApp/publicSearch/courseRecommendationCbp` | — | **REMOVED** (dead wrapper) |
| `ENROLLED_USER` | `protected/v8/userEnrolledInSource` | — | **REMOVED** (test-only, no prod caller) |

All traffic now lands on `SEARCH_V7PUBLIC` → `/apis/public/v8/publicSearch/getCourses` → Sunbird `content/v1/search`.

---

## 3. Changes by area

### 3.1 Repoint search calls (Tier 1 + Tier 2)

All course-search calls moved from the recommendation routes to `SEARCH_V7PUBLIC`. The request/response shape is compatible — both target Sunbird `content/v1/search` and return `res.result.content` + `res.result.facets`.

- `search-api.service.ts` — `getSearchV7Results()` (V8→V7), `getSearchV6Results()` and `getSearchCompetencyCourses()` (V6→V7).
- `org-service.service.ts` — 4 section-search methods (V6→V7).
- `org-home-service.service.ts` — org-home landing search (V6→V7).
- `widget-content.service.ts` — content-strip search `searchV6()` / `publicContentSearch()` (PUBLIC_CONTENT_SEARCH→V7).

### 3.2 Remove dead recommendation code

- Deleted wrappers `fetchCourseRemommendations()` and `COURSE_RECOMMENDATION_V2()` from `widget-content.service.ts` (no callers).
- Deleted `getEnroledUserForCourses()` from `org-service.service.ts` and its references in `org.component.spec.ts` (only the spec used it).
- Deleted 6 now-orphaned constants from `apiConstants.ts`: `SEARCH_V8PUBLIC`, `SEARCH_V6PUBLIC`, `PUBLIC_CONTENT_SEARCH`, `COURSE_RECOMENDATION`, `COURSE_RECOMMENDATION_V2`, `ENROLLED_USER`.

### 3.3 Fix the global-search payload (the bug)

The global search results page (`/app/search/learning`) broke after the repoint: it stuck on a perpetual loading shimmer. Root cause: the search wrapper sent a bare body, which Sunbird's route rejects.

| Request body | Endpoint response |
|---|---|
| `{ "query": "" }` (old wrapper) | `{ "message": "Error while public search" }` → 5xx → retry-interceptor backoff loop → endless shimmer |
| `{ request: { filters, query }, query, sort }` (fixed) | `{ responseCode: "OK", result: { content[…], count, facets } }` |

The recommendation endpoint tolerated a bare `{ query }` because it applied its own course filtering. Sunbird's `content/v1/search` requires a `request.filters` object. Fixed in `search-serv.service.ts` `searchV7Wrapper()`:

```ts
const v7Request: any = {
  request: {
    query: request.query || '',
    filters: { primaryCategory: ['Course'], contentType: ['Course'], status: ['Live'] },
  },
  query: request.query || '',
  sort: [{ lastUpdatedOn: 'desc' }],
}
if (request.language) { v7Request.request.filters.lang = request.language }
```

### 3.4 Fix the rating-count field

Sunbird `content/v1/search` returns the rating count as `totalNumberOfRatings`, but two SEO/public components read `totalRatingsCount` (used by the recommendation enrichment). The star value (`averageRating`) was unaffected; only the secondary "(N ratings)" count would have been blank. Normalized at the data-assignment point (templates + JSON-LD untouched):

```ts
this.course.totalRatingsCount  ??= this.course.totalNumberOfRatings   // public-course-blog
this.tocData.totalRatingsCount ??= this.tocData.totalNumberOfRatings  // public-toc
```

`public-toc` already used `SEARCH_V7PUBLIC` before this work, so this also fixes a latent pre-existing blank count there.

---

## 4. Files changed

| File | Change |
|---|---|
| `src/app/constants/apiConstants.ts` | Removed 6 recommendation-service constants |
| `project/ws/app/.../search/apis/search-api.service.ts` | 3 search methods repointed to V7 |
| `project/ws/app/.../search/services/search-serv.service.ts` | `searchV7Wrapper()` sends full Sunbird payload |
| `project/ws/app/.../org/org-service.service.ts` | 4 search methods repointed; removed `getEnroledUserForCourses()` |
| `project/ws/app/.../org/components/org/org.component.spec.ts` | Removed ENROLLED_USER test + mock + orphaned var |
| `src/organisations/org-home-service.service.ts` | 2 search methods repointed to V7 |
| `library/ws-widget/collection/.../widget-content.service.ts` | 2 search methods repointed; removed 2 dead wrappers |
| `src/app/routes/public/public-course-blog/public-course-blog.component.ts` | Rating-count field normalization |
| `src/app/routes/public/public-toc/public-toc.component.ts` | Rating-count field normalization |

9 files · ~33 insertions / ~75 deletions (net reduction).

---

## 5. Functional impact

| Area | Result |
|---|---|
| Course search (org pages, search grid, content strips, home) | ✅ Works — now served by Sunbird directly; no longer fails when the rec service is down |
| Search filter sidebar (facets) | ✅ Preserved — `publicSearch/getCourses` returns `result.facets[]` |
| Star ratings on cards (`averageRating`) | ✅ Preserved — Sunbird index now returns ratings natively |
| "(N ratings)" count on public pages | ✅ Fixed — mapped `totalNumberOfRatings` → `totalRatingsCount` |
| Recommendation ranking / CBP "recommended for you" | ➖ Removed (was the point of the decommission; the dead wrappers were never wired) |

---

## 6. Verification

- Production build (`yarn run build:local`) green after each change set.
- Live proxy checks of `publicSearch/getCourses`: empty query → `count 160`, 160 items, facets present, `averageRating` + `totalNumberOfRatings` present per item; text query `"breast"` → `count 13`.
- Grep confirms zero remaining references to any removed constant/route (`SEARCH_V8PUBLIC`, `SEARCH_V6PUBLIC`, `PUBLIC_CONTENT_SEARCH`, `COURSE_RECOM*`, `ENROLLED_USER`, `userEnrolledInSource`).

---

## 7. Follow-ups (out of scope for this repo)

- **UI-proxy repo:** fix the `[]`-on-failure bug in `ratingsSearch.ts` `getCombinedRatingsResult()` — return `sourceCourses` in the `catch` so the route degrades gracefully instead of dropping all content.
- **Code smell:** in `org-service.service.ts`, the V6/V7 method pairs now hit the same endpoint and are literal duplicates (SonarLint S4144). A later cleanup could collapse each pair and update callers.
- **Search scope:** the global-search V7 path now hardcodes the `Course` filter (matching prior behaviour). If `/app/search/learning` should search other content types, that is a separate enhancement.
