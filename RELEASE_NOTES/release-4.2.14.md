# Release 4.2.14 — 2026-09-28

|                              |                                               |
| ---------------------------- | --------------------------------------------- |
| **Build branch deployed**    | `release-4.2.14` (Jenkins deploy source)      |
| **Tag**                      | `v4.2.14` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `v4.2.13` (2026-09-01)                        |
| **Commits**                  | `2`                                           |
| **Author**                   | Pavithra Prakash                              |

## Summary

Fixes "Match the Following" (MTF) questions in assessments. Learners' matches were always
recorded as wrong, so correct answers failed validation. The question could also throw an
error and stop responding after moving between questions, and the "Your Response" column on
the results page could come back empty. Extra spaces in authored option text no longer make
a correct match fail.

## 🐛 Fixes

- **viewer/quiz-service** — `checkMtfAnswer` now sets `isCorrect` on each option from the
  learner's actual connection (`true` only when a response exists and equals the expected
  `match`, case-insensitive); previously the learner's option set carried `isCorrect: false`
  for every pair, so correct matches were never validated as correct (`84392e796`)
- **viewer/quiz-service** — `checkMtfAnswer` is now idempotent. `questionAnswerHash[questionId]`
  holds the raw jsPlumb connections on the first call but is overwritten with the resolved
  option list by `nextQuestion()`; a second call (Next pressed again while `qslideIndex` still
  points at the MTF slide) treated an option object as the connections list, throwing
  `find is not a function` or blanking every `response`. An already-resolved answer is now
  returned as-is (`84392e796`)
- **viewer/quiz-service** — `text`, `match`, `matchForView` and `response` are
  whitespace-normalized before comparison, so double/trailing spaces in authored content no
  longer fail against the CSS-collapsed `innerText` of the learner's connection (`84392e796`)
- **viewer/view-assesment-questions** — leaving an MTF question now runs a new
  `destroyJsPlumb()` (`deleteEveryConnection` → `unmakeEverySource` → `unmakeEveryTarget` →
  `reset`) instead of `reset()` alone, which left stale `mousedown` listeners that threw on
  `sourceEndpointDefinitions[id].default` of `undefined` on the next click and stacked
  duplicate listeners on re-entry (`84392e796`)
- **viewer/view-assesment-questions** — dropped the `.trim()` added to the shuffled
  `matchForView`, which would throw on an option with no `match`; normalization now happens
  in the service (`67fc83ef0`)

## 🏗️ Build/CI

- None.

## 📚 Docs/Chore

- None.

## ⚠️ Deploy notes & risk

- **Config / env / secret changes:** none
- **Backend / API contract dependencies:** none — scoring payload shape is unchanged; only the
  per-option `isCorrect` / `response` values the frontend computes for MTF questions change
- **Breaking changes:** none
- **Risk note:** low. Changes are confined to MTF handling in the assessment viewer. Because
  `isCorrect` is now computed from the learner's matches, MTF results on the results page will
  differ from before (correct matches now show as correct) — expected, but worth telling support

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] Build verified — pre-push production build passed on `fix/quiz-mtf-matching`
- [ ] `yarn run lint` clean — pre-existing repo-wide `@typescript-eslint/ban-types`
      rule-not-found error blocks a clean lint run (known issue, see CLAUDE.md); no new lint
      errors introduced by this release
- [ ] Unit tests green (`yarn test`) — 2515/2523 passing. The 8 failures are the same
      pre-existing `mobile-dashboard.service.spec.ts` timeout/error-path failures noted in the
      4.2.12 and 4.2.13 release notes, with no overlap with this release's diff. No new tests were added for this
      release's changes — a known gap, follow up recommended
- [ ] Smoke-tested on preprod (key flows) — take an assessment with an MTF question followed
      by a non-MTF question: move forward/back and click options (no console errors), match
      all pairs correctly and confirm the results page shows them correct with the Response
      column populated
- [x] Rollback ref confirmed (re-runnable in Jenkins): `release-4.2.13`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch**
`release-4.2.14` (deploy is from a branch, not a tag). Each release gets its own new build
branch + a `v4.2.14` tag; the previous `release-4.2.13` branch stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release branch
`release-4.2.13`.
