# Release 4.1.0 — 2026-07-03

|                              |                                              |
| ---------------------------- | -------------------------------------------- |
| **Build branch deployed**    | `release-4.1.0` (Jenkins deploy source)      |
| **Tag**                      | `v4.1.0` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `Release-4.0.1` (2026-06-04)                 |
| **Commits**                  | `60`                                         |
| **Author**                   | Likhith Thammegowda                          |

## Summary

The first release off the `feature/opt2` line since 4.0.1. It makes the course player
reliable end-to-end (learners can move through courses without the Next button sticking,
with correct completion tracking and PDF paging), hardens security by no longer storing
auth tokens in the browser, and moves search fully onto Sunbird while removing the old
recommendation service and a large amount of unused code — leaving the app smaller,
faster, and easier to maintain. Telemetry attribution and certificate verification are
also fixed.

## ✨ Features

- **seo** — proper social share image, `sitemap` lastmod, and removal of the legacy keywords meta tag (`5938ff6c6`)
- **org** — support a per-section `hideCourse` exclusion list on the org home (`6cf3922e9`)

## 🐛 Fixes

- **viewer** — keep the Next button in sync with resource completion so completed resources can advance (`394330709`)
- **viewer** — correct course completion % and mid-course navigation (`c5dd1eb1c`)
- **viewer** — correct View All navigation, PDF paging, and competency passbook (`152cf2dc0`)
- **security** — stop persisting auth tokens in `localStorage` (`ede6bbc01`)
- **search** — send a Sunbird-compatible payload; remove the dead `ENROLLED_USER` path (`0c2e91509`)
- **ratings** — map Sunbird `totalNumberOfRatings` to `totalRatingsCount` (`28c7aff2f`)
- **memory-leaks** — clean up intervals and subscriptions on destroy (`811523be5`)
- **forgot-password** — show the OTP form by running async updates inside `NgZone` (`730b05273`)
- **certificate** — repair the verify flow, layout, contact display, and hide the shell header (`292781e42`)
- **telemetry** — correct `utm_source` attribution capture (`893140329`) and capture the organic referrer when no UTM params are present (`f48250243`)
- **web-dashboard** — align spec with component and pin Node 20 in CI (`e27117df4`)

## 🏗️ Build / CI / Infra

- **build** — reduce bundle/asset size and lazy-load competency (`c99a57ac8`)
- **search** — drop the recommendation-service routes and point search at Sunbird (`21749d3af`)
- **cleanup** — remove unused components and modules across `src`, `project`, and `library`, plus an unused package and shared module; prune duplicate/unused API constants (`0ebca3a75`, `0090a088b`, `677222328`, `22c93bbb3`, `ffb92a304`, `52dfdb001`)

## 📚 Docs / Chore

- **test** — migrate Jest to `jest-preset-angular` and repair spec suites; align notification `getAccessToken` spec with non-persisted tokens (`f5e5dc54d`, `45262a041`)
- **docs** — document release, commit, testing, SCSS, and doc-style conventions; add the release-notes template; add recommendation-service and UI-proxy migration references (`b85515584`, `8651045da`, `77d1fe19e`, `cbcd56ef9`)
- **chore** — remove the drafted-but-unshipped 4.0.2 release notes (`e517d72fd`)

## ⚠️ Deploy notes & risk

- **Config / env / secret changes:** none
- **Backend / API contract dependencies:** search now depends on the **Sunbird search API** (recommendation-service routes removed) — confirm Sunbird search is reachable in prod (`21749d3af`, `0c2e91509`). Ratings now read Sunbird `totalNumberOfRatings` (`28c7aff2f`).
- **Breaking changes:** none for users. Note: auth tokens are no longer stored in `localStorage` (`ede6bbc01`) — any active session simply re-authenticates via Keycloak; no user action required.

## ✅ Pre-deploy checklist

- [ ] Node 20 active (`nvs use 20`)
- [ ] Build verified (`yarn run build`)
- [ ] Unit tests green (`yarn test`)
- [ ] `yarn run lint` — known repo-wide config issue (`ban-types` rule) still present; treated as accepted/documented, not a blocker
- [ ] Smoke-tested on preprod (course player next/prev, PDF paging, search, login, certificate verify)
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `Release-4.0.1`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-4.1.0` (deploy is from a branch, not the tag). This release gets its own new build branch + a `v4.1.0` tag; the previous release stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release (`Release-4.0.1`).

---
_File naming: this file is `RELEASE_NOTES/release-4.1.0.md` — name matches the deploy branch._
