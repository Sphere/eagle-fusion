# Release 4.2.15 — 2026-09-28

|                              |                                               |
| ---------------------------- | --------------------------------------------- |
| **Build branch deployed**    | `release-4.2.15` (Jenkins deploy source)      |
| **Tag**                      | `v4.2.15` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `v4.2.14` (2026-09-28)                        |
| **Commits**                  | `2`                                           |
| **Author**                   | Pavithra Prakash                              |

## Summary

Two follow-up fixes for "Match the Following" (MTF) questions. Submitting an assessment could
fail with "Converting circular structure to JSON" when an MTF answer had not been processed
before submit. And when an MTF was the last question, its connector lines stayed painted over
the result screen after submit.

## 🐛 Fixes

- **viewer/quiz-service** — `createAssessmentSubmitRequest` now resolves any MTF answer still
  stored as raw jsPlumb connections (via the new `resolveMtfOptions`, reusing `checkMtfAnswer`)
  before building the request. Those connections reference the jsPlumb instance and back, so an
  unresolved MTF — skipped by the assessment modal's `qslideIndex`-only resolution, and never
  resolved in `quiz.component` — made `JSON.stringify` throw in the IndexedDB progress save and
  the submit `POST`. Already-resolved and unanswered MTF answers are left unchanged (`f2360e5ed`)
- **viewer/view-assesment-questions** — jsPlumb is now created with `Container` set to the
  question's own wrapper (`[id="<questionId>"]`, now `position: relative`), porting the fix
  `view-quiz-question` got in `976e80512`. Without it the connector SVGs were appended to
  `document.body` and outlived the question slide, staying over the result tab when MTF was the
  last question. `ngOnDestroy` now also runs `destroyJsPlumb()` (`b5a654f49`)

## 🏗️ Build/CI

- None.

## 📚 Docs/Chore

- Added `quiz.service.spec.ts` (5 tests) and `view-assesment-questions.component.spec.ts`
  (4 tests) covering both fixes and the 4.2.14 MTF changes (`f2360e5ed`, `b5a654f49`)

## ⚠️ Deploy notes & risk

- **Config / env / secret changes:** none
- **Backend / API contract dependencies:** none — MTF options in the submit payload now always
  have the resolved shape (`text`, `match`, `response`, `isCorrect`) that the normal Next/Check
  path already sent
- **Breaking changes:** none
- **Risk note:** low. Changes are confined to MTF handling in the quiz/assessment viewer.
  Connector lines are now positioned relative to the question wrapper — verify they still
  track the boxes when scrolling inside an MTF question

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [ ] Build verified — pre-push production build (runs on push of this branch)
- [ ] `yarn run lint` clean — pre-existing repo-wide `@typescript-eslint/ban-types`
      rule-not-found error blocks a clean lint run (known issue, see CLAUDE.md); no new lint
      errors introduced by this release
- [ ] Unit tests green (`yarn test`) — `yarn test` ignores `project/`, so this release's specs
      don't run there; run directly with
      `npx jest project/ws/viewer/src/lib/plugins/quiz --testPathIgnorePatterns=/node_modules/`
      (9/9 new tests passing). Baseline `yarn test`: 2515/2523, the 8 pre-existing
      `mobile-dashboard.service.spec.ts` failures
- [ ] Smoke-tested on preprod (key flows) — take a self-assessment with MTF as the last
      question and submit: no console error, submit succeeds, no connector lines on the result
      screen; scroll inside an MTF question and confirm the lines follow the boxes
- [x] Rollback ref confirmed (re-runnable in Jenkins): `release-4.2.14`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch**
`release-4.2.15` (deploy is from a branch, not a tag). Each release gets its own new build
branch + a `v4.2.15` tag; the previous `release-4.2.14` branch stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release branch
`release-4.2.14`.
