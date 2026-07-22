# Release 4.2.2 — 2026-07-22

|                              |                                              |
| ---------------------------- | -------------------------------------------- |
| **Build branch deployed**    | `release-4.2.2` (Jenkins deploy source)      |
| **Tag**                      | `v4.2.2` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `v4.2.1` (2026-07-20)                        |
| **Commits**                  | `3`                                          |
| **Author**                   | Pavithra                                     |

## Summary

This is a small patch release on top of 4.2.1. It fixes a blank desktop elective course
card on the org-selective-course page, and corrects the org stats block to count courses
across all sections instead of skipping "continue learning" and "completed" courses.

## ✨ Features

_None — patch release._

## 🐛 Fixes

- **org** — desktop elective course card (`ws-web-course-card`) rendered blank on `org-selective-course`. The component was declared only in `AppModule` and exported nowhere, so `OrgSelectiveCourseModule` (which imports `PublicHomeModule`) could not resolve it — `CUSTOM_ELEMENTS_SCHEMA` silently masked it as an empty custom element. Moved `WebCourseCardComponent` into the shared `PublicHomeModule` (declare + export) so it resolves the same way the mobile card already did (`48defb129`)
- **org** — `totalCourseCount` in the org stats block excluded `continueLearning` and `completed` sections, undercounting the total. Now sums courses across all sections (`049bd0616`)

## 🏗️ Build / CI / Infra

_None._

## 📚 Docs / Chore

- Document branch-first workflow and lint-hook bypass in CLAUDE.md (`eda32e169`)

## ⚠️ Deploy notes & risk

- **Config / env / secret changes:** none
- **Backend / API contract dependencies:** none — both fixes are frontend-only (module wiring and a stats calculation)
- **Breaking changes:** none. Low risk; smoke-test the desktop view of `org-selective-course` (elective course cards render) and the org stats total course count on any org with completed/continue-learning courses.

## ✅ Pre-deploy checklist

- [ ] Node 20 active (`nvs use 20`)
- [ ] Build verified (`yarn run build`)
- [ ] `yarn run lint` clean (or documented remaining warnings acceptable)
- [ ] Unit tests green (`yarn test`)
- [ ] Smoke-tested on preprod: `org-selective-course` desktop card renders; org stats total course count includes all sections
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-4.2.1`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-4.2.2` (deploy is from a branch, not the tag). This release gets its own new build branch + a `v4.2.2` tag; the previous release stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release (`release-4.2.1`).

---
_File naming: this file is `RELEASE_NOTES/release-4.2.2.md` — name matches the deploy branch._
