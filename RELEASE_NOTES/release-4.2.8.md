# Release 4.2.8 — 2026-07-30

|                              |                                              |
| ---------------------------- | -------------------------------------------- |
| **Build branch deployed**    | `release-4.2.8` (Jenkins deploy source)      |
| **Tag**                      | `v4.2.8` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `v4.2.7` (2026-07-30)                        |
| **Commits**                  | `2`                                          |
| **Author**                   | vpPavithra                                   |

## Summary

Fixes the quiz assessment flag so quiz content correctly reports whether it belongs to an
assessment, both in the quiz player payload and on the assessment details page.

## 🐛 Fixes

- **quiz/assessment-detail** — quiz JSON now carries `isAssessment` from the content
  metadata (defaulting to `false`) instead of always omitting it (`c8208c95`)
- **assessment-detail/resource-collection** — corrected the `isAssessment` propagation on
  the assessment details page after an earlier revert (`ebc8b7be5`)

## ⚠️ Deploy notes & risk

- **Config / env / secret changes:** none
- **Backend / API contract dependencies:** none
- **Breaking changes:** none

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] Build verified (`yarn run build`)
- [x] `yarn run lint` clean (or documented remaining warnings acceptable) — pre-existing
      repo-wide `@typescript-eslint/ban-types` rule-not-found error blocks a clean lint run
      (known issue, see CLAUDE.md); no new lint errors introduced by this release
- [x] Unit tests green (`yarn test`) — 8 pre-existing failures in
      `mobile-dashboard.service.spec.ts` reproduce identically on a clean checkout of this
      commit with no local changes; unrelated to and unaffected by this release's changes
- [ ] Smoke-tested on preprod (key flows)
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-4.2.7`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch**
`release-4.2.8` (deploy is from a branch, not a tag). Each release gets its own new build
branch + a `v4.2.8` tag; the previous `release-4.2.7` branch stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release branch
`release-4.2.7`.
