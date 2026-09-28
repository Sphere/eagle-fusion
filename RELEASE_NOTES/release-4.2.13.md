# Release 4.2.13 — 2026-09-01

|                              |                                               |
| ---------------------------- | --------------------------------------------- |
| **Build branch deployed**    | `release-4.2.13` (Jenkins deploy source)      |
| **Tag**                      | `v4.2.13` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `v4.2.12` (2026-08-06)                        |
| **Commits**                  | `4`                                           |
| **Author**                   | Pavithra Prakash                              |

## Summary

Fixes a race between course-completion flows: finishing a SCORM resource could close the
congrats/rating dialog out from under the user before they could submit a rating. The
assessment "View Answers" flow is also reworked so the button's visibility and label are
driven by one consistent check, the correct-answer options are actually fetched and populated
before the dialog opens, and retaking a quiz no longer duplicates that same check with logic
that could disagree with it.

## 🐛 Fixes

- **viewer/course-completion** — a shared `isCourseCompletionFlowActive` flag on
  `ViewerDataService` now stops the SCORM-driven completion check from navigating away or
  closing dialogs while the congrats/rating flow (triggered by `currentMessage`) still has its
  own dialog open, so the rating is no longer abandoned mid-flow (`d028c5455`)
- **app-toc/rating-summary** — `lastRatingSubmittedCourseId` is set the instant a rating is
  confirmed and consumed by `AppTocDesktopComponent` to force a fresh rating-summary fetch for
  that exact course, instead of relying only on the component always remounting on navigation
  (`d028c5455`)
- **viewer/assessment-modal** — "View Answers" now actually fetches the quiz artifact JSON and
  copies the correct-answer options onto the matching question by `questionId` before opening
  the answers dialog; previously the user's own answer set (always `isCorrect: false`) drove
  the dialog with no correct answers to show (`fa9689ecb`)
- **viewer/assessment-modal** — `canShowViewAnswers()` simplified to also honor
  `assesmentdata.generalData.isCorrectAnswerPopUp` and gate on `passPercentage`/`result`,
  replacing the previous organization-name-based check; the button is now always rendered,
  with only its label switching between "View Answers" and "Retake Assessment" based on that
  one check (`a581224ba`)
- **viewer/assessment-modal** — `retakeQuiz()` now branches solely on `canShowViewAnswers()`
  instead of duplicating a separate `result`/`passPercentage` check that could disagree with it
  and leave a button labeled "View Answers" wired to no matching branch (`715e937de`)

## 🏗️ Build/CI

- None.

## 📚 Docs/Chore

- None.

## ⚠️ Deploy notes & risk

- **Config / env / secret changes:** none
- **Backend / API contract dependencies:** the "View Answers" fix adds a `GET` to the quiz
  artifact URL (`assesmentdata.generalData.artifactUrl`) on retake-with-answers-shown; no new
  backend endpoint, this URL was already used elsewhere for the same content
- **Breaking changes:** none. `canShowViewAnswers()`'s new gating only changes behavior for
  content relying on the previous organization-name-based branch (removed) — verify View
  Answers still shows/hides as expected across the orgs that used to depend on that check
- **Risk note:** low-to-moderate. The completion-flow guard changes control flow shared by both
  the SCORM and quiz-completion paths in `viewer-toc.component.ts` and `quiz.component.ts` —
  a stuck-`true` `isCourseCompletionFlowActive` (e.g. an unhandled error path that never resets
  it) would block course-completion navigation entirely, so watch for users reporting they
  can't leave a completed course

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] Build verified (`yarn run build:local`)
- [ ] `yarn run lint` clean — pre-existing repo-wide `@typescript-eslint/ban-types`
      rule-not-found error blocks a clean lint run (known issue, see CLAUDE.md); no new lint
      errors introduced by this release
- [ ] Unit tests green (`yarn test`) — 2515/2523 passing. The 8 failures are the same
      pre-existing `mobile-dashboard.service.spec.ts` timeout/error-path failures noted in the
      4.2.12 release notes, with no overlap with this release's diff. No new tests were added
      for this release's changes — a known gap, follow up recommended before/soon after deploy
- [ ] Smoke-tested on preprod (key flows) — complete a SCORM resource and a quiz-based course
      to confirm the rating dialog is no longer skipped, and check "View Answers" on a passed
      assessment shows the correct answers
- [x] Rollback ref confirmed (re-runnable in Jenkins): `release-4.2.12`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch**
`release-4.2.13` (deploy is from a branch, not a tag). Each release gets its own new build
branch + a `v4.2.13` tag; the previous `release-4.2.12` branch stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release branch
`release-4.2.12`.
