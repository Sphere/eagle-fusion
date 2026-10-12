# Release 5.0.0 — 2026-10-09

|                              |                                                |
| ---------------------------- | ---------------------------------------------- |
| **Build branch deployed**    | `release-5.0.0` (Jenkins deploy source)        |
| **Tag**                      | `v5.0.0` (immutable marker + GitHub Release)   |
| **Baseline (previous prod)** | `v4.2.17`                                      |
| **Commits**                  | 141 (non-merge), from `sunbird-spark/upgradeV2` |
| **Author**                   | Likhith Thammegowda                            |

## Summary

The learner portal (Sphere and Ekshamata) now runs on the new Sunbird Spark platform, which went live on 9 October 2026. Learners keep their accounts, courses, progress and certificates; around 5.2 lakh earlier certificates were moved to the new certificate service and can be viewed and downloaded as before. This release also adds a copy-link option when sharing a course, sharper link previews, more accurate course descriptions for search engines, and a tester bypass for planned downtime.

## ✨ Features

- **share** — Share dialog gets a "Copy link" box with the course's public page; social buttons and the QR code share that same link (`fdcb92f`)
- **downtime** — Testers can log in and use the portal during a full downtime with `?downtimeBypass=<code>`; route guard honours the bypass (`a722f90`)
- **seo** — CNE courses hub at `/public/cne-courses` (`d809107`)
- **i18n** — Discussion validation strings in English and Hindi (`5bb7746`)
- **dev** — Switch between Sphere and Ekshamata locally with `?portal=` (`0cb8e1f`)

## 🐛 Fixes

**Sunbird Spark compatibility**
- **auth** — User roles read from `organisations[].roles` and userId from `id`/`identifier`, as Spark returns them (`ba3932d`, `5b0fae7`)
- **competency** — Support both legacy and current competency payload shapes; parse `competencies_v1` safely (`aabbcc2`, `605e288`, `ac1cea6`)
- **toc** — Keep open-ended batches so enrolment always gets a batch id (`db98e86`)
- **discussion** — Send a usable `pid` so course forums can be created; discussions-ui-v8 5.0.4 (`2dac256`, `713c43b`)

**Certificates**
- **certificate** — Render migrated certificates and on-the-fly Sunbird RC certificates instead of a broken image; thumbnails and previews fixed (`059100f`, `d30f348`, `1159a88`, `5776bc7`)
- **profile** — One failed certificate no longer hides the others (`061700b`)
- **toc** — Certificate SVG preview, download file name, and recovery from certificate load failures (`5f65bd4`, `2400e43`)

**Learning and assessment**
- **viewer** — Assessment completion only after a recorded score; PDF full height in fullscreen; quiz match-the-following stabilised (`24fac30`, `60bf1da`, `960ff8a`)
- **toc/viewer** — No stale navigate-back on slow course responses; quiz Done/close restored (`809c7d5`)
- **my-courses** — Responsive card grid, correct counts and "for you" section (`39b751f`, `24d65bb`, `4ea9936`)
- **program-home / competency** — Correct in-progress counts, next-course navigation in the competency flow (`8c95c59`, `eb1caab`, `4ea9936`)

**Account and terms**
- **tnc** — Terms prompt shown whenever terms are not accepted; Hindi text fixed (`393e493`, `5fd3578`, `da5f3e5`)
- **create-account** — "User already exists" only for real duplicates (`2656d41`, `3af8124`)
- **auth** — `/password-reset-success` redirects to the home page (`0ff2b74`)

**Search, sharing and SEO**
- **seo** — Public pages keep their trailing slash and stop redirecting; canonicals, sitemap and robots point at indexable URLs; course descriptions claim INC/CNE and certificates only when the course has them (`d2d8d0a`, `84656d4`, `bc57f4f`, `1c0e885`)
- **share** — Link previews use the full-size poster image; preview bots get the course page for `/app/toc` links (`fdcb92f`)
- **search** — Mobile search fixed (`c220831`)

**UI**
- **ekshamata** — Reported Ekshamata portal issues fixed; logo sizes, dark-theme mobile styles, form alignment (`7e60e44`, `bcd52db`)
- **discussion-forum** — Missing text input restored (`3694302`)
- **nav** — Desktop top menu shown whenever menu items are configured (`b3be039`)
- **downtime** — Close icon and z-index of the downtime banner (`4e20a6a`, `d12918c`)
- **i18n** — Missing English/Hindi translation keys added (`be1834e`)

## 🏗️ Build / CI / Infra

- Yarn install and Node 20 pinned in CI; lodash imports resolved to lodash-es (`70fe6e4`)
- Self-hosted SonarQube scan instead of SonarCloud (`dbc860c`)
- Prerender: public API responses cached across routes; no browser timers during SSR; telemetry guarded during prerender (`4dec2f1`, `c5ff9f9`, `fc3a6fd`)
- Zone-based change detection restored (`bebcf49`)
- Dependency: `@aastrika_npmjs/comptency` 2.1.0 (`a7c79e2`)

## 📚 Docs / Chore

- SonarQube reliability, maintainability and security-hotspot fixes across `src/`, `project/` and `library/`; unused and dead code removed (multiple commits, e.g. `8728950`, `6a7776f`, `021150f`)
- Jest coverage raised for the `src` folder (`553f1e8`, `92e3d6a`)
- CLAUDE.md: i18n, API-shape, release, deploy and multi-portal conventions (`bdc6eae`, `ac5fe77`)
- Blog CNE credit claims corrected (`69975f6`)

## ⚠️ Deploy notes & risk

- **Config / env / secret changes:** none in this repo. The portal relies on the Spark cluster's `ui-static`, `ui-proxies` and lern configuration (prod domains, `sunbirdcontent` bucket), which was set up at go-live.
- **Backend / API contract dependencies:** Sunbird Spark backend (lern, knowlg, Sunbird RC certificates) as deployed on the new prod cluster on 2026-10-09.
- **Breaking changes:** none for users. This build only works against the Spark backend; it must not be deployed to the old (pre-Spark) prod.
- **Already live:** this code has been running on prod since go-live as `upgradeV2_d12918c_2056`. This release records it on `master`.

## ✅ Pre-deploy checklist

- [ ] Node 20 active (`nvs use 20`)
- [ ] Build verified (`yarn run build`)
- [ ] `yarn run lint` clean (or documented remaining warnings acceptable)
- [ ] Unit tests green (`yarn test`)
- [x] Smoke-tested on prod after go-live (login, search, course play, certificates, share, downtime bypass)
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-4.2.17` (pre-Spark; only valid together with the old backend)

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-5.0.0` (deploy is from a branch, not a tag). Each release gets its own new build branch + a `v5.0.0` tag; the previous `release-4.2.17` branch stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release branch. Note that `release-4.2.17` targets the pre-Spark backend, so after go-live a rollback means redeploying the previous Spark build (`upgradeV2_a722f90_2055`) rather than 4.2.17.

---
_File naming: this file is `RELEASE_NOTES/release-5.0.0.md` — name matches the deploy branch._
