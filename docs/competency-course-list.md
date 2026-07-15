# Competency Course List Component — Flow Documentation

**Component:** `CompetencyCourseListComponent`
**Selector:** `app-competency-course-list`
**Location:** `src/app/modules/home/components/competency-course-list/`

---

## Table of Contents

1. [Overview](#overview)
2. [Entry Point & Inputs](#entry-point--inputs)
3. [Initialization Flow](#initialization-flow)
4. [Data Pipeline](#data-pipeline)
   - [Step 1 — Playlist Guard](#step-1--competencyorgdata)
   - [Step 2 — Competency Context](#step-2--getcompetencydata)
   - [Step 3 — API Chain](#step-3--getashadata)
5. [Template Rendering](#template-rendering)
6. [Complete Flow Diagram](#complete-flow-diagram)
7. [API Reference](#api-reference)
8. [Key Conditions Summary](#key-conditions-summary)

---

## Overview

`CompetencyCourseListComponent` renders a user's **competency-linked learning path**, grouped into two sections:

- **In Progress** — courses where fewer than 5 levels are marked Pass
- **Completed** — courses where all 5 levels are marked Pass

It is only mounted when a program's `type === 'competency'` in the Program Detail Page (`pogram-detail-page.component.html:48`).

---

## Entry Point & Inputs

The component is instantiated by `ProgramDetailPage` which runs a `competencyFlow$()` to build the `playlists` input before mounting.

| Input | Type | Source | Purpose |
|---|---|---|---|
| `playlists` | `any[]` | `competencyFlow$()` result | Wrapped competency playlist with `playlistId: 'COMPETENCY_PLAYLIST'` |
| `role` | `string` | Navigation state | User's role (e.g. `"learner"`) |
| `designation` | `string` | Navigation state (e.g. `"ANM-MP"`) | Drives competency filtering |
| `section` | `any` | Form config section object | Controls UI labels and card count (`tabCardCount`) |
| `autoInit` | `boolean` | Always `true` in this context | Triggers `initData()` on mount |

### How `playlists` is built (parent)

```
ProgramDetailPage.competencyFlow$(program, section, orgData, designation)
  → fetchPlaylists$(playlistService, orgId, designation)
  → getCompetencyPlaylistForLang(playlists, program.playlistConfigId, null)
  → wraps result as: [{ ...playlist, playlistId: 'COMPETENCY_PLAYLIST' }]
  → passes to @Input playlists
```

If the playlist fetch fails or no matching config is found, `playlists = []` and the component renders nothing.

---

## Initialization Flow

```
ngOnInit()
  ├── userId = configSvc.userProfile.userId
  ├── initializeLanguage()
  │     reads userProfile.language → sets defaultLang (default: 'en')
  ├── initializeUpdateValueSubscription()
  │     watches UserService.updateValue$ for profile changes
  └── if (autoInit === true) → initData()
```

### `initializeUpdateValueSubscription()`

Subscribes to `UserService.updateValue$` (a `BehaviorSubject` that emits on every user profile update):

```
updateValue$
  .pipe(
    debounceTime(300),              // coalesce rapid successive emissions
    scan(prev/curr tracker),        // track previous vs current value
    filter(prev !== curr && curr !== null),  // skip no-change and initial null
    tap(curr => userLanguage(curr)) // sync defaultLang + app language
  )
  .subscribe(() => initData())      // re-fetch all competency data
```

**Effect:** If the user changes their language preference mid-session, the entire competency course list re-fetches with the new language filter applied to the courses API.

---

## Data Pipeline

### `initData()`

```
initData()
  isLoading = true
  competencyOrgData()           ← Step 1
    .pipe(concatMap(() =>
      getCompetencyData()       ← Step 2 + Step 3
    ))
  .subscribe({
    next: ({ ashaData, completedCourses, inProgressCourses }) → bind to component
    error: () → isLoading = false
    complete: () → isLoading = false
  })
```

---

### Step 1 — `competencyOrgData()`

**No API call.** Reads directly from `this.playlists` (`@Input`).

```
if (playlists is a non-empty array):
  competencyHomeData = playlists
  showanmHome = true
  return of(competencyHomeData)
else:
  showanmHome = false
  return of(null)
```

**Guard:** If `playlists` is empty or not an array, the `concatMap` downstream still executes but `getCompetencyData()` returns `{ ashaData: [], completedCourses: [], inProgressCourses: [] }` immediately.

---

### Step 2 — `getCompetencyData()`

Resets state (`roleCompetencyData = []`, `competencyLevelsData = []`), then calls:

```
dashboardService.getCompetencyInfo(competencyHomeData, rootOrgId, designation)
  → playlistCompetencyData(playlists, designation)
      1. Find item where playlistId === 'COMPETENCY_PLAYLIST'
      2. Extract rolesInPlaylist  (all role values, lowercased)
      3. isUserDesignationInRoles = rolesInPlaylist.includes(designation.toLowerCase())
      4. competencies = item.dataSource.payload   (array of competency objects)
      5. competencyIds = [comp.id, ...]           (one ID per competency)
      6. competencyLevels = flatMap each competency's
           additionalProperties.competencyLevelDescription
           → [{ competencyId, name, level, levelName, description,
                langHiName, langHiDescription, course: [...] }, ...]
```

**Guard:** If `!isUserDesignationInRoles` OR `!competencies`, returns `null` and the component emits an empty result — **nothing is rendered**.

Sets on component:
- `competencyRoles = isUserDesignationInRoles`
- `roleCompetencyData = competencyIds` (e.g. `["101", "102", "103"]`)
- `competencyLevelsData = competencyLevels`

Then delegates to `dashboardService.getAshaData(defaultLang, competencyLevelsData, roleCompetencyData, userId)`.

---

### Step 3 — `getAshaData()`

The core two-API chain.

#### 3a. Fetch All Competency Courses

**API:** `POST /apis/public/v8/publicSearch/getCourses`

**Request payload:**
```json
{
  "request": {
    "filters": {
      "primaryCategory": ["Course"],
      "contentType": ["Course"],
      "status": ["Live"],
      "competency": [true],
      "lang": "<defaultLang>"
    }
  },
  "sort": [{ "lastUpdatedOn": "desc" }]
}
```

Returns all live courses tagged with a competency, filtered by language.

**Processing pipeline — `getFormattedCompetencyCoursesWithFilter()`:**

```
result.content (raw API courses)
  ↓
prepareCourseDataWithCompetencies(courses, competencyLevelsData)
    For each course:
      competencyID = JSON.parse(course.competencies_v1)[0].competencyId
      levels       = competencyLevelsData.filter(l => l.competencyId === competencyID)
      batchId      = course.batches[0].batchId
  ↓
mapCompetencyCourseData()
    Normalizes shape:
    { title, contentId, contentType, subTitle, description, creator,
      duration, batchId, childContent, competencyID, levels, isAsha, lang }
  ↓
filter(item => roleCompetencyData.includes(item.competencyID))
    ← Only keeps courses whose competencyID is in the user's designation competency list
```

**Guard:** If filtered result is empty → immediately returns `{ ashaData: [], completedCourses: [], inProgressCourses: [] }`.

---

#### 3b. Fetch User Progress

**API:** `GET /apis/public/v8/mobileApp/learnerpath?userId=<userId>`

Returns the user's competency progress records. Each record contains:

| Field | Type | Description |
|---|---|---|
| `levelId` | number | Level number within a competency |
| `competencyId` | string | Which competency this belongs to |
| `passFailStatus` | `'Pass'` \| `'Fail'` | Outcome of the level attempt |
| `completionpercentage` | number | Completion percentage |
| `attemptcount` | number | Number of attempts made |
| `contentType` | `'course'` \| assessment type | Type of content completed |

**Error handling:** Wrapped in `catchError(() => of(null))` — if this call fails, the component continues and shows courses without progress data.

---

#### 3c. `mergeProgressData()` — Enriching Courses with Progress

For each course in `ashaData`:

1. Find progress records matching by `competencyID`
2. Build `courseGroups` map: `courseId → [levelNumbers]`
3. Identify completed courses: records where `passFailStatus === 'Pass'` AND `contentType === 'course'`
4. For each completed course: mark **all its associated levels as Pass** — course completion propagates to every level
5. Merge expanded course progress + original non-course progress
6. Deduplicate by `${levelId}-${contentType}-${passFailStatus}`
7. Attach final `progress[]` array to each course item

Result is sorted by `competencyID` ascending.

---

#### 3d. `setCoursesState()` — Partition Into Lists

```
partitionCompletedAndInProgress(ashaData):
  For each course:
    totalLevels      = 5  (hardcoded)
    completedLevels  = progress.filter(p => p.passFailStatus === 'Pass').length
    totalPercentage  = (completedLevels / 5) * 100  (capped at 100)
    → completed      = totalPercentage === 100
    → inProgress     = all others

setCoursesState():
  Sort inProgress by competencyId ascending
  Set expand = true  on the FIRST inProgress item  (auto-expanded on render)
  Set expand = false on all remaining items
```

**Rule:** A course is "completed" only when **all 5 levels** have `passFailStatus === 'Pass'`. Any partial completion (e.g. 3/5 levels) keeps the course in In Progress.

---

## Template Rendering

### Loading State

While `isLoading === true`, renders 4 skeleton cards (2× `app-skeleton-my-course-card` + 2× `app-skeleton-card`) with tablet-aware flex layout.

### Content State

Rendered only when `ashaData.length > 0`:

```
In Progress section  (shown if inProgressCourses.length > 0)
  Header: section.text | translate  +  count
  Cards:  getVisibleCourses() → <app-asha-learning [ashaData] [inProgressCoursesCount] [expand]>
  Button: VIEW ALL / VIEW LESS toggle

Completed section  (shown if completedCourses.length > 0)
  Header: "COMPLETED (N)"
  Cards:  all completedCourses → <app-asha-learning-completed [ashaData] [completedCount] [expand]=false>
```

### `getVisibleCourses()` — Pagination Logic

| Condition | Courses shown |
|---|---|
| `showAllCourses === true` | All `inProgressCourses` |
| Mobile (`!isTablet`) | `inProgressCourses.slice(0, 4)` |
| Tablet + has completed courses | `slice(0, section.tabCardCount)` |
| Tablet + no completed courses | `slice(0, section.tabCardCount + 1)` |
| Tablet + `tabCardCount` undefined | `slice(0, 5)` |

### `viewAll()` — Scroll Position Preservation

When toggling VIEW ALL / VIEW LESS:

1. Records `window.scrollY` and first card's `getBoundingClientRect().top`
2. Shows loader, toggles `showAllCourses`
3. After 500ms + `requestAnimationFrame`: measures how far the first card moved due to DOM reflow
4. `window.scrollTo({ top: initialScrollY + scrollAdjustment, behavior: 'auto' })` — keeps view anchored at the same card
5. Removes loader

---

## Complete Flow Diagram

```
ProgramDetailPage
  competencyFlow$(program, section, orgData, designation)
    ↓
    fetchPlaylists$(orgId, designation)
    getCompetencyPlaylistForLang(playlists, configId)
    wrap as [{ ...playlist, playlistId: 'COMPETENCY_PLAYLIST' }]
    ↓
  @Input playlists → CompetencyCourseListComponent

CompetencyCourseListComponent.ngOnInit()
  ├── initializeLanguage()          → defaultLang from userProfile
  ├── watchProfileChanges()         → re-run on language change
  └── initData()
        │
        ├── competencyOrgData()
        │     playlists empty?  ──YES──→ render nothing
        │          ↓ NO
        │     competencyHomeData = playlists
        │
        ├── getCompetencyData()
        │     playlistCompetencyData(playlists, designation)
        │       designation in playlist.role[]? ──NO──→ render nothing
        │          ↓ YES
        │       extract competencyIds + competencyLevels
        │
        └── getAshaData(lang, competencyLevels, competencyIds, userId)
              │
              ├── [API 1] POST /publicSearch/getCourses
              │     filter: Live + competency=true + lang
              │     → prepareCourseDataWithCompetencies()
              │         attach levels + competencyID per course
              │     → mapCompetencyCourseData()
              │         normalize shape
              │     → filter by roleCompetencyData
              │         only user's designation competencies
              │     no courses after filter? ──→ render nothing
              │
              ├── [API 2] GET /mobileApp/learnerpath?userId=...
              │     fails? → of(null), continue gracefully
              │
              ├── mergeProgressData()
              │     attach progress[] per course
              │     course-level Pass propagates to all its levels
              │
              └── setCoursesState()
                    5/5 levels Pass → completedCourses[]
                    < 5 levels Pass → inProgressCourses[]
                    first inProgress item gets expand=true
                    ↓
              Component binds ashaData, inProgressCourses, completedCourses
              isLoading = false → template renders
```

---

## API Reference

| # | Method | Endpoint | Auth | Purpose |
|---|---|---|---|---|
| 1 | `POST` | `/apis/public/v8/publicSearch/getCourses` | Public | Fetch all live competency-tagged courses by language |
| 2 | `GET` | `/apis/public/v8/mobileApp/learnerpath?userId=<id>` | Public | Fetch user's competency level progress records |

---

## Key Conditions Summary

| Condition | Effect |
|---|---|
| `playlists` empty or not an array | Component renders nothing; no API calls made |
| User's designation not in `playlist.role[]` | Returns empty; component renders nothing |
| Courses API returns no matching courses after filter | Returns empty; component renders nothing |
| Progress API (`learnerpath`) fails | Graceful continue; courses shown without progress state |
| All 5 levels have `passFailStatus === 'Pass'` | Course moves to Completed section |
| Fewer than 5 levels passing | Course stays in In Progress section |
| First In Progress course | `expand = true` (card auto-opened on render) |
| Mobile (`!isTablet`), `showAllCourses = false` | Shows max 4 in-progress courses |
| Tablet, with completed courses | Shows `section.tabCardCount` courses |
| Tablet, no completed courses | Shows `section.tabCardCount + 1` courses |
| User changes language in profile | Full re-fetch triggered with new `lang` filter |
| `autoInit = false` | `initData()` not called on mount; parent must trigger manually |

---

## Related Files

| File | Role |
|---|---|
| `competency-course-list.component.ts` | Component logic |
| `competency-course-list.component.html` | Template |
| `services/mobile-dashboard.service.ts` | `getAshaData()`, `getCompetencyInfo()`, `getCompetencyCourse()` |
| `services/user.service.ts` | `getAshaProgress()`, `getCompetencyCourseIdentifier()`, `updateValue$` |
| `util/home-page.util.ts` | `playlistCompetencyData()`, `getFormattedCompetencyCoursesWithFilter()`, `mergeProgressData()`, `setCoursesState()` |
| `components/pogram-detail-page/` | Parent — mounts this component for `type === 'competency'` programs |
| `src/app/apiConstants.ts` | `GET_CORUSES`, `GET_ASHA_PROGRESS` endpoint definitions |
