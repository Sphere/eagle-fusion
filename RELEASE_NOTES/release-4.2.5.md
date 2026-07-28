# Release 4.2.5 — 2026-07-27

|                              |                                              |
| ---------------------------- | -------------------------------------------- |
| **Build branch deployed**    | `release-4.2.5` (Jenkins deploy source)      |
| **Tag**                      | `v4.2.5` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `v4.2.4` (2026-07-25)                        |
| **Commits**                  | `2`                                          |
| **Author**                   | Pavithra                                     |

## Summary

This patch release fixes competency assessment artifact URLs for non-preview content,
initializes the user's UI language on app load, and corrects a mobile competency
dashboard bug where an empty course search could wipe out previously loaded progress
data. It also fixes a crash introduced during development when a user's profile
language preference isn't set yet.

## ✨ Features

_None — patch release._

## 🐛 Fixes

- **assessment-detail** — non-preview competency assessment artifact URLs now resolve via `getCompetencyAuthoringUrl` instead of the raw artifact URL, fixing quiz content that failed to load for competency courses (`01f84d600`)
- **root** — `RootComponent` now initializes `LanguageService` from the user's saved language preference, falling back to the org's default locale or `hi` (`01f84d600`); guarded against a crash when the user's profile isn't loaded yet (`f66c3e568`)
- **mobile-dashboard** — competency course enrichment on the mobile dashboard no longer drops previously merged progress data when the course search API returns nothing (`01f84d600`)

## 🏗️ Build / CI / Infra

- Bumped `@aastrika_npmjs/comptency` to `^2.1.1` (`01f84d600`)

## 📚 Docs / Chore

_None._

## ⚠️ Deploy notes & risk

- **Config / env / secret changes:** none
- **Backend / API contract dependencies:** none
- **Breaking changes:** none. Low risk; smoke-test competency assessment/quiz content loading, initial UI language on first load (with and without a saved user language preference), and the mobile competency dashboard when the course search returns no results.

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] Build verified (`yarn run build`)
- [ ] `yarn run lint` clean (or documented remaining warnings acceptable) — pre-existing `@typescript-eslint/ban-types` config issue blocks a clean run repo-wide, unrelated to this release
- [x] Unit tests green (`yarn test`)
- [ ] Smoke-tested on preprod: competency assessment/quiz loading, initial language on load, mobile dashboard empty-search behavior
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-4.2.4`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-4.2.5` (deploy is from a branch, not the tag). This release gets its own new build branch + a `v4.2.5` tag; the previous release stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release (`release-4.2.4`).

---
_File naming: this file is `RELEASE_NOTES/release-4.2.5.md` — name matches the deploy branch._
