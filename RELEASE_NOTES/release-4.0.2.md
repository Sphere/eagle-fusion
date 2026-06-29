# Release 4.0.2 — 2026-06-29

|                              |                                              |
| ---------------------------- | -------------------------------------------- |
| **Build branch deployed**    | `release-4.0.2` (Jenkins deploy source)      |
| **Tag**                      | `v4.0.2` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `Release-4.0.1` (2026-06-04)                 |
| **Commits**                  | `14`                                         |
| **Author**                   | Likhith Thammegowda                          |

## Summary

Course search is moved off the (now-decommissioned) recommendation service onto Sunbird search, with no loss of search facets or course ratings. This release also brings SEO/telemetry attribution fixes, a certificate verify-flow repair, a forgot-password fix, memory-leak cleanup, per-section course exclusion for org pages, and the Jest test-runner migration.

## ✨ Features

- **org** — support per-section `hideCourse` exclusion list so a course can be hidden from specific landing-page sections (`6cf3922e9`)

## 🐛 Fixes

- **search** — send a Sunbird-compatible request payload so global search returns results instead of an endless loading shimmer (`0c2e91509`)
- **ratings** — map Sunbird `totalNumberOfRatings` → `totalRatingsCount` so the "(N ratings)" count renders on public course/TOC pages (`28c7aff2f`)
- **memory-leaks** — clean up intervals and subscriptions on component destroy (`811523be5`)
- **forgot-password** — show the OTP form by running async updates inside `NgZone` (`730b05273`)
- **forgot-password** — UI fix on the forgot-password page (`09df437f9`)
- **telemetry** — correct `utm_source` attribution capture (`893140329`)
- **telemetry** — capture organic referrer when no UTM params are present (`f48250243`)
- **certificate** — repair verify flow, layout, contact display, and hide the shell header (`292781e42`)
- **org** — course-page loading and filtering corrections (`0c1b43db3`)

## 🏗️ Build / CI / Infra

- **test** — migrate the test runner to `jest-preset-angular`; fix spec suites (`f5e5dc54d`)

## 📚 Docs / Chore

- **refactor(search)** — drop all recommendation-service routes; point search at the Sunbird `publicSearch/getCourses` route (`21749d3af`)
- **docs** — add recommendation-service API usage reference (`77d1fe19e`)
- **docs** — add recommendation-API → Sunbird migration write-up + UI-proxy verification findings (`cbcd56ef9`)

## ⚠️ Deploy notes & risk

- **Config / env / secret changes:** none.
- **Backend / API contract dependencies:** search now targets the Sunbird `publicSearch/getCourses` route (→ `content/v1/search`) instead of the recommendation service. Confirm the recommendation service can be retired in the target environment. Ratings and facets verified present from the Sunbird index via the live proxy.
- **Breaking changes:** none. Recommendation ranking and the unused CBP "recommended for you" wrappers are removed (the point of the decommission).

## ✅ Pre-deploy checklist

- [ ] Node 20 active (`nvs use 20`)
- [ ] Build verified (`yarn run build`)
- [ ] `yarn run lint` clean (note: repo-wide ESLint `ban-types` config issue is pre-existing)
- [ ] Unit tests green (`yarn test`)
- [ ] Smoke-tested on preprod: global search, org landing pages, public TOC/blog rating display
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `Release-4.0.1`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-4.0.2` (deploy is from a branch, not a tag). Each release gets its own new build branch + a `v4.0.2` tag; the previous release stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release (`Release-4.0.1`).
