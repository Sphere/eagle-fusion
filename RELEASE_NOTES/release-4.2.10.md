# Release 4.2.10 — 2026-08-03

|                              |                                              |
| ---------------------------- | -------------------------------------------- |
| **Build branch deployed**    | `release-4.2.10` (Jenkins deploy source)     |
| **Tag**                      | `v4.2.10` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `v4.2.9` (2026-08-03)                        |
| **Commits**                  | `1`                                          |
| **Author**                   | vpPavithra                                   |

## Summary

Fixes the quiz assessment flag default so content with no explicit `isAssessment` value
is treated as an assessment, and corrects the competency label casing on the ASHA
learning-completed card so its translation key resolves correctly.

## 🐛 Fixes

- **quiz** — `isAssessment` now defaults to `true` (was `false`) when `content.isAssessment`
  is not set (`d92e3a965`)
- **asha-learning-completed** — fixed competency label translation key casing so the
  card renders the correct translated text (`d92e3a965`)

## ⚠️ Deploy notes & risk

- **Config / env / secret changes:** none
- **Backend / API contract dependencies:** none
- **Breaking changes:** none — flips the fallback behavior for quiz content with no
  `isAssessment` value from non-assessment to assessment; confirm this matches intended
  behavior for any such content

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] Build verified (`yarn run build`)
- [x] `yarn run lint` clean (or documented remaining warnings acceptable) — pre-existing
      repo-wide `@typescript-eslint/ban-types` rule-not-found error blocks a clean lint run
      (known issue, see CLAUDE.md); no new lint errors introduced by this release
- [x] Unit tests green (`yarn test`) — 8 pre-existing failures in
      `mobile-dashboard.service.spec.ts` reproduce identically on a clean checkout of this
      commit; unrelated to and unaffected by this release's changes
- [ ] Smoke-tested on preprod (key flows)
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-4.2.9`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch**
`release-4.2.10` (deploy is from a branch, not a tag). Each release gets its own new build
branch + a `v4.2.10` tag; the previous `release-4.2.9` branch stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release branch
`release-4.2.9`.
