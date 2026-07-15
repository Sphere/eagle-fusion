# ASHA Learning Component Documentation

## Overview

ASHA learning is the competency-based learning experience shown on the mobile home dashboard for users whose designation is included in the competency playlist roles. It presents each mapped competency as a card, shows progress across five levels, and routes the learner to either a self-assessment or the relevant course for the next incomplete level.

The current implementation is centered on:

- `src/app/modules/home/components/competency-course-list/competency-course-list.component.*`
- `src/app/modules/home/components/asha-learning/asha-learning.component.*`
- `src/app/modules/home/components/asha-learning-completed/asha-learning-completed.component.*`
- `src/app/modules/home/services/mobile-dashboard.service.ts`
- `src/app/modules/home/util/home-page.util.ts`
- `src/app/manage-learn/core/guards/self-assessment.guard.ts`
- `src/library/ws-widget/collection/src/lib/_services/content-corodova.service.ts`
- `src/project/ws/viewer/src/lib/plugins/quiz/**`
- `src/project/ws/viewer/src/lib/components/viewer-toc/viewer-toc.component.ts`

## UI Structure

### Dashboard Entry

`CompetencyCourseListComponent` receives role, designation, section, and playlist data from the mobile dashboard/home section. It checks whether the current designation is present in the `COMPETENCY_PLAYLIST` roles and extracts competency IDs and competency level metadata.

When competency data exists, the component renders:

- Loading skeletons while competency/course/progress data is being prepared.
- In-progress ASHA competency cards under the section label from `section.text`.
- A `View All` / `View Less` toggle for the in-progress list.
- Completed competency cards in a separate completed section.

### In-Progress Competency Card

`AshaLearningComponent` renders one competency card.

Visible card elements:

- Header label: `COMPETENCY`
- Competency title: `ashaData.title`
- Progress badge: `COMPLETED <percentage>%` when progress is above 0 and below 100.
- Expand/collapse icon.
- Level stepper with five levels.
- Dynamic note explaining the learner's next action.
- CTA button with either `START_SELF_ASSESSMENT` or `START_COURSE`.

Key inputs:

- `ashaData`: normalized competency/course/progress object.
- `expand`: whether the card is initially expanded.
- `inProgressCoursesCount`: total in-progress competency count.

### Completed Competency Card

`AshaLearningCompletedComponent` renders completed competencies and provides a `VIEW_COURSES` action.

### Stepper State

The level stepper receives:

- `levels = [1, 2, 3, 4, 5]`
- `completedLevels`: progress entries where `passFailStatus === "Pass"`
- `failedLevels`: progress entries where `passFailStatus === "Fail"`
- `currentLevel`: first level not present in completed levels

Admin-granted progress is treated specially. If every progress record has `contentType === "admin"`, the UI shows the card as actionable but does not calculate earned progress from those records.

## Data Preparation Flow

1. `CompetencyCourseListComponent.initData()` starts the flow.
2. `competencyOrgData()` reads competency playlist data passed into the component.
3. `MobiledashboardService.getCompetencyInfo()` calls `playlistCompetencyData()` to find `COMPETENCY_PLAYLIST`, validate the user's designation, and extract:
   - role list
   - competency IDs
   - competency level metadata
4. `MobiledashboardService.getAshaData()` fetches live competency courses for the current language.
5. `getFormattedCompetencyCoursesWithFilter()` maps raw course data into the ASHA card shape and filters it to role-specific competency IDs.
6. `UserService.getAshaProgress(userId)` fetches the learner-path progress.
7. `mergeProgressData()` merges learner progress into each competency card.
8. `setCoursesState()` partitions the cards into completed and in-progress lists and expands the first in-progress card.

## API Endpoints

All endpoint constants live in `src/app/apiConstants.ts`.

| Purpose | Caller | Endpoint |
| --- | --- | --- |
| Role-wise competency asset | `UserService.getRoleWiseData()` | `GET /apis/public/v8/competencyAssets/roleWiseCompetencyData` |
| Competency course search | `UserService.getCompetencyCourseIdentifier()` / `ContentCorodovaService.getAshaCompetencyCorses()` | `POST /apis/public/v8/ratingsSearch/getCourses` |
| ASHA learner-path progress read | `UserService.getAshaProgress(userId)` | `GET /apis/public/v8/mobileApp/learnerpath?userId=<userId>` |
| ASHA learner-path progress update | `QuizService.updateAshaAssessment()` | `POST /apis/public/v8/mobileApp/learnerpath` |
| Competency assessment submit | `QuizService.competencySubmitQuizV2()` | `POST /apis/public/v8/mobileApp/v1/competencyAssessment/submit` |
| Course hierarchy | `SelfAssessmentGuard.getContent()` | `GET /apis/public/v8/mobileApp/kong/course/v2/hierarchy/<contentId>` |
| User enrollment list | `SelfAssessmentGuard.getEnrolledCourseList()` | `GET /apis/public/v8/mobileApp/kong/course/v1/user/enrollment/list/<userId>...` |
| Course batch list | `SelfAssessmentGuard.getCourseBatch()` | `POST /apis/public/v8/mobileApp/kong/course/v1/batch/list` |
| Course enrollment | `SelfAssessmentGuard.enrollUser()` | `POST /apis/public/v8/mobileApp/kong/course/v1/enrol` |
| Content state/progress | `SelfAssessmentGuard.navigateToplayer()` | `POST /api/course/v1/content/state/read` |

## Core Data Contracts

### ASHA Card Data

After formatting, each card uses this shape:

```ts
{
  title: string;
  contentId: string;
  contentType: string;
  description?: string;
  batchId?: string;
  competencyID: string;
  levels: Array<{
    competencyId: string | number;
    level: number;
    levelName?: string;
    description?: string;
    course: Array<{
      id: string;
      lang?: string;
    }>;
  }>;
  isAsha: 'true';
  lang: string;
  progress?: AshaProgressItem[];
  expand?: boolean;
}
```

### Learner-Path Progress Item

`ProgressData()` normalizes learner-path records into:

```ts
{
  levelId: number;
  competencyId: string;
  completionpercentage: number;
  passFailStatus: 'Pass' | 'Fail';
  attemptcount: number;
  contentType: 'selfAssessment' | 'course' | 'admin';
}
```

### Learner-Path Update Payload

Self-assessment and course completion both update the same learner-path endpoint:

```ts
{
  userid: string;
  courseid: string;
  batchid: string;
  contentid: string;
  competencylevel: number;
  completionpercentage: number;
  contentType: 'selfAssessment' | 'course';
  competencyid: string;
}
```

For self-assessment, `completionpercentage` is set to `100` when the learner's score is at or above the pass percentage, otherwise `0`.

For course completion, `completionpercentage` is sent as `100` when the course is completed.

## Competency Flow

### First-Time Learner

1. ASHA card has no learner-path progress.
2. CTA shows `START_SELF_ASSESSMENT`.
3. User taps the CTA.
4. `AshaLearningComponent.startSelfAssesment()` stores the current card through `ContentCorodovaService.setAshaCardData()`.
5. The router navigates to `app/user/self-assessment` with the card data as query params.
6. `SelfAssessmentGuard` fetches/enrolls the self-assessment content and routes to the player.
7. Quiz submission calls `competencySubmitQuizV2()`.
8. If ASHA mode is active, `AssesmentModalComponent` also calls `updateAshaAssessment()` with `contentType: 'selfAssessment'`.

### Assessment Passed

1. Learner-path progress has `contentType: 'selfAssessment'` and `passFailStatus: 'Pass'`.
2. CTA remains `START_SELF_ASSESSMENT` for the next incomplete level.
3. The learner can continue the competency path from the next self-assessment level.

### Assessment Failed

1. Learner-path progress has `contentType: 'selfAssessment'` and `passFailStatus: 'Fail'`.
2. CTA changes to `START_COURSE`.
3. `getCourseId(competencyID, levelId, ashaData)` finds the course mapped to the failed level and selected language.
4. `ContentCorodovaService.getAshaCompetencyCorses()` fetches the live course by identifier.
5. `ContentCorodovaService.setAshaData()` stores ASHA course context for the player.
6. The router navigates to `/app/toc/<courseIdentifier>/overview` with query params including `batchId`, `competencyid`, `levelId`, `courseid`, and `isAsha=true`.

### Course Completed

1. The course player detects completion.
2. `viewer-toc.component.ts` or `quiz.component.ts` calls `updateAsha(100)`.
3. `QuizService.updateAshaAssessment()` posts learner-path progress with `contentType: 'course'`.
4. `mergeProgressData()` expands course completion across all levels mapped to the same course ID, so unified courses can mark multiple competency levels as complete.
5. Once all five levels are passed, the competency moves to the completed list.

### Completed Competency

If all five levels are passed, `partitionCompletedAndInProgress()` classifies the card as completed. The completed card is rendered by `AshaLearningCompletedComponent`.

## Routing Summary

| Route | Purpose |
| --- | --- |
| `app/user/self-assessment` | Guarded self-assessment entry. Uses `SelfAssessmentGuard`. |
| `/app/toc/<identifier>/overview` | Course overview/player entry for the selected ASHA course. |
| `app/user/competency` | Competency dashboard route from `@aastrika_npmjs/comptency/competency`. |

`SelfAssessmentGuard` also writes `competency_meta_data` into local storage using course hierarchy children and `competencies_v1`. This metadata is used by the competency assessment/player flow.

## Shared State

`ContentCorodovaService` is the bridge between home cards, assessment modals, and course/player code.

- `setAshaCardData(data)` stores the selected competency card.
- `getAshaCardData()` retrieves the selected competency card, especially when assessment result actions need to open relevant ASHA courses.
- `setAshaData(data)` stores the currently active ASHA course/player context.
- `getAshaData()` is read by player completion code before updating learner-path progress.

## Important UI Labels

These labels are translation keys from the i18n JSON files:

- `COMPETENCY`
- `LEVELS`
- `COMPLETED`
- `START_SELF_ASSESSMENT`
- `START_COURSE`
- `VIEW_ALL`
- `VIEW_LESS`
- `VIEW_COURSES`
- `LEVEL_NOTE`
- `YOU_CLEAR_ALL_LEVELS`
- `NOTE_CLEAR_COURSE`
- `NOTE_CLEAR_ASSESSMENT`
- `COMPLETE_LEVEL_COURSE`
- `COMPLETE_LEVEL_ASSESSMENT`
- `CLEAR_LEVEL_COURSE`
- `CLEAR_LEVEL_ASSESSMENT`

## Edge Cases and Current Behavior

- If learner-path progress fetch fails, the dashboard logs telemetry and continues without progress data.
- If no ASHA competency courses match the user's language and role competency IDs, no ASHA cards are shown.
- If progress records are all `admin`, the card ignores those records for earned progress and starts from self-assessment.
- If multiple levels map to the same course ID, completing that course marks all mapped levels as passed during `mergeProgressData()`.
- If the selected level has no matching progress entry, the card falls back to the nearest completed level when calculating CTA and notes.
- The first in-progress card is expanded by default.

## Quick Maintenance Checklist

When changing this flow, verify:

- `COMPETENCY_PLAYLIST` role and competency metadata still map to the user's designation.
- The selected language is passed consistently through course search, card data, and self-assessment query params.
- Learner-path update payloads include `userid`, `courseid`, `batchid`, `contentid`, `competencylevel`, `contentType`, and `competencyid`.
- `ContentCorodovaService.setAshaData()` is called before routing into an ASHA course.
- Course completion still calls `updateAsha(100)`.
- Self-assessment pass/fail still updates learner-path with `contentType: 'selfAssessment'`.
