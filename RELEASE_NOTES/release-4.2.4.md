# Release 4.2.4 — 2026-07-25

|                              |                                              |
| ---------------------------- | -------------------------------------------- |
| **Build branch deployed**    | `release-4.2.4` (Jenkins deploy source)      |
| **Tag**                      | `v4.2.4` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `v4.2.3` (2026-07-22)                        |
| **Commits**                  | `2`                                          |
| **Author**                   | Pavithra                                     |

## Summary

This is a small patch release on top of 4.2.3. It corrects the in-progress course
count on the Program Home page, adds a missing `UNITS` translation key, and hides
the "View All" button on the competency course list when there are 4 or fewer
in-progress courses.

## ✨ Features

_None — patch release._

## 🐛 Fixes

- **program-home** — in-progress course count only matched courses at exactly 0% completion, undercounting any course with partial (1-99%) progress. Now counts any course not at 100% completion. Also added the missing `UNITS` translation key to `en.json` and `hi.json` (`761cddaf4`)
- **competency-course-list** — the "View All / View Less" button always rendered even when there were 4 or fewer in-progress courses, with nothing extra to show. Added a condition to hide it in that case (`e1c4dab79`)

## 🏗️ Build / CI / Infra

_None._

## 📚 Docs / Chore

_None._

## ⚠️ Deploy notes & risk

- **Config / env / secret changes:** none
- **Backend / API contract dependencies:** none
- **Breaking changes:** none. Low risk; smoke-test Program Home in-progress course counts with courses at various completion percentages, the `UNITS` string on English and Hindi locales, and the competency course list view-all button with both <=4 and >4 in-progress courses.

## ✅ Pre-deploy checklist

- [ ] Node 20 active (`nvs use 20`)
- [ ] Build verified (`yarn run build`)
- [ ] `yarn run lint` clean (or documented remaining warnings acceptable)
- [ ] Unit tests green (`yarn test`)
- [ ] Smoke-tested on preprod: Program Home in-progress counts, UNITS translation, competency course list view-all button
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-4.2.3`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-4.2.4` (deploy is from a branch, not the tag). This release gets its own new build branch + a `v4.2.4` tag; the previous release stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release (`release-4.2.3`).

---
_File naming: this file is `RELEASE_NOTES/release-4.2.4.md` — name matches the deploy branch._
