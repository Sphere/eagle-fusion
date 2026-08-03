# Release 4.2.6 — 2026-07-29

|                              |                                              |
| ---------------------------- | -------------------------------------------- |
| **Build branch deployed**    | `release-4.2.6` (Jenkins deploy source)      |
| **Tag**                      | `v4.2.6` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `v4.2.5` (2026-07-27)                        |
| **Commits**                  | `1`                                          |
| **Author**                   | Likhith Thammegowda                          |

## Summary

Adds a new public page at `/uttarpradesh/demo` that hosts the two eKshamata how-to
videos — registering on eKshamata, and using the app after registration. The page is a
standalone landing page carrying only the Aastrika Foundation and Government of Uttar
Pradesh logos, so it can be shared directly with Uttar Pradesh health workers without the
rest of the portal chrome around it. Nothing on any existing page changes.

## ✨ Features

- **uttarpradesh** — new public route `/uttarpradesh/demo` listing the two eKshamata
  how-to videos as cards (YouTube thumbnail + title) that open the video on YouTube in a
  new tab; the page renders its own Aastrika + Government of Uttar Pradesh logo header and
  suppresses the app header, footer and nav bars, and is responsive from mobile up
  (two columns on desktop, single column below 960px) (`213db53ef`)

## 🐛 Fixes

_None — no existing behaviour changed._

## 🏗️ Build / CI / Infra

_None._

## 📚 Docs / Chore

_None._

## ⚠️ Deploy notes & risk

- **Config / env / secret changes:** none
- **Backend / API contract dependencies:** none — the page is fully static; video links point at YouTube and thumbnails at `img.youtube.com`
- **Breaking changes:** none

**Risk: low.** The change is additive — one new route plus one new component. The only edit
to shared code is in `RootComponent`, which now also matches `/uttarpradesh/demo` when
deciding whether to hide the app header/footer; every other route's behaviour is unchanged.

**Note on page copy:** this page's English and Hindi strings are seeded into the ngx-translate
store by the component itself rather than living in `src/assets/i18n/*.json`. This is
deliberate — the dev proxy serves `/assets/**` from the production host, so i18n additions
never resolve locally, and in production they would not resolve until the i18n bundle ships.
Seeding keeps the page correct in both. Future copy edits for this page go in
`help-videos.component.ts`, not the i18n files.

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] Build verified (`yarn run build`)
- [ ] `yarn run lint` clean (or documented remaining warnings acceptable) — pre-existing `@typescript-eslint/ban-types` config issue blocks a clean run repo-wide, unrelated to this release
- [ ] Unit tests green (`yarn test`) — 2508 of 2516 pass; the 8 failures are in `mobile-dashboard.service.spec.ts` and were verified to fail identically on a clean `master`, so they are pre-existing and not introduced here
- [ ] Smoke-tested on preprod: open `/uttarpradesh/demo` on desktop and mobile, confirm both logos render, both video cards open the correct YouTube video, and no app header/footer/bottom nav appears
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-4.2.5`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-4.2.6` (deploy is from a branch, not the tag). This release gets its own new build branch + a `v4.2.6` tag; the previous release stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release (`release-4.2.5`).

---
_File naming: this file is `RELEASE_NOTES/release-4.2.6.md` — name matches the deploy branch._
