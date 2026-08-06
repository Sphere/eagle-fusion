# Release 4.2.12 — 2026-08-06

|                              |                                               |
| ---------------------------- | --------------------------------------------- |
| **Build branch deployed**    | `release-4.2.12` (Jenkins deploy source)      |
| **Tag**                      | `v4.2.12` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `v4.2.11` (2026-08-03)                        |
| **Commits**                  | `2`                                           |
| **Author**                   | Pavithra Prakash, Likhith Thammegowda         |

## Summary

Restarting a quiz/assessment no longer replays stale, in-memory questions — it now re-fetches
and re-derives them from the artifact JSON, same as the first attempt. Assessments whose
content doesn't explicitly say otherwise are now treated as assessments (previously defaulted
to a plain quiz), matching the authoring intent. Also includes a docs-only correction to the
release runbook itself.

## 🐛 Fixes

- **viewer/quiz** — clicking "Yes, Restart" on the assessment overview now re-fetches the
  artifact JSON and re-applies question-type derivation before reopening the assessment/quiz
  dialog, instead of reusing the questions already in memory from the previous attempt
  (`7b6e5330f`)
- **app-toc/assessment-detail** — `quizJSON.isAssessment` now defaults to `true` when the
  content doesn't specify the flag, instead of defaulting to `false` (`7b6e5330f`)

## 🏗️ Build/CI

- None.

## 📚 Docs/Chore

- **release runbook** — `CLAUDE.md` corrected to consistently say the release branch and tag
  are always cut from `master`, never from the feature/fix branch — the previous wording
  contradicted itself and had produced 4.2.9 and 4.2.11 release branches pointing at fix-branch
  commits (`ffe0848d0`, shipped in 4.2.11's window but noted here for completeness of the diff
  since `v4.2.11`)

## ⚠️ Deploy notes & risk

- **Config / env / secret changes:** none
- **Backend / API contract dependencies:** none. Both changes are client-side quiz/assessment
  plugin logic; no API contract changes
- **Breaking changes:** none. The `isAssessment` default flip only affects content that never
  set the flag explicitly — any content already setting it (true or false) is unaffected
- **Risk note:** low-to-moderate. The restart re-fetch adds a network call and an `await` in the
  overview-close flow; on fetch failure `transformQuiz` resolves to `undefined` (caught, not
  thrown), so a failed restart re-fetch could leave `quizJson.questions` `undefined` — this is a
  known follow-up, not new behavior introduced by this release (the previous code never
  re-fetched on restart at all). The `isAssessment` default change intentionally changes
  behavior for any content that omits the flag — verify no untagged quiz content unexpectedly
  starts requiring a pass percentage / gating

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] Build verified (`yarn run build:local`)
- [ ] `yarn run lint` clean — pre-existing repo-wide `@typescript-eslint/ban-types`
      rule-not-found error blocks a clean lint run (known issue, see CLAUDE.md); no new lint
      errors introduced by this release
- [ ] Unit tests green (`yarn test`) — 2515/2523 passing. The 8 failures are in
      `mobile-dashboard.service.spec.ts` (pre-existing timeout/error-path failures, last touched
      weeks before this change, no file overlap with this release's diff). New tests added for
      this release (`quiz.component.spec.ts`, `assessment-detail.component.spec.ts`) are
      currently excluded from the `yarn test` run by the existing `testPathIgnorePatterns` in
      `jest.config.js` (`project/` and `library/` are temporarily blocked — see CLAUDE.md); their
      logic was verified manually against a locally-adjusted jest config
- [ ] Smoke-tested on preprod (key flows) — restart-quiz and default-assessment flows should be
      smoke-tested before/at deploy
- [x] Rollback ref confirmed (re-runnable in Jenkins): `release-4.2.11`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch**
`release-4.2.12` (deploy is from a branch, not a tag). Each release gets its own new build
branch + a `v4.2.12` tag; the previous `release-4.2.11` branch stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release branch
`release-4.2.11`.
