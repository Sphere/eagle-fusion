# Release 4.2.7 — 2026-07-30

|                              |                                              |
| ---------------------------- | -------------------------------------------- |
| **Build branch deployed**    | `release-4.2.7` (Jenkins deploy source)      |
| **Tag**                      | `v4.2.7` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `v4.2.6` (2026-07-29)                        |
| **Commits**                  | `1`                                          |
| **Author**                   | Likhith Thammegowda                          |

## Summary

Follow-up to the `/uttarpradesh/demo` page shipped in 4.2.6: the page now shows Hindi as
the primary language with English underneath, for the page heading and both video card
titles, since it is shared directly with Uttar Pradesh health workers. No other page or
route is affected.

## ✨ Features

- **uttarpradesh** — `/uttarpradesh/demo` now renders Hindi first with an English
  support line beneath it, for the page heading, subtitle, and each video card title;
  Devanagari uses a looser line-height than the Latin line, and each card's
  "Watch on YouTube" link is pinned to the bottom of the card so both cards align despite
  very different Hindi title lengths (`3becf7654`)

## 🐛 Fixes

_None._

## 🏗️ Build / CI / Infra

_None._

## 📚 Docs / Chore

- Standardized this page's copy on the spelling **ई-क्षमता** (`3becf7654`)

## ⚠️ Deploy notes & risk

- **Config / env / secret changes:** none
- **Backend / API contract dependencies:** none
- **Breaking changes:** none

**Risk: low.** Copy/markup/style change scoped to the single `/uttarpradesh/demo` page
component; no routing or shared-code changes. This release also removes the runtime
ngx-translate seeding that 4.2.6 added for this page (`setTranslation` / `onLangChange`
re-seed) — it's no longer needed now that both languages render unconditionally rather
than switching on locale, so that workaround is gone, not just unused.

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [ ] Build verified (`yarn run build`) — not re-run for this notes-only-adjacent change; see note below
- [ ] `yarn run lint` clean (or documented remaining warnings acceptable) — pre-existing `@typescript-eslint/ban-types` config issue blocks a clean run repo-wide, unrelated to this release
- [ ] Unit tests green (`yarn test`) — not re-run this cycle; 4.2.6 confirmed the only repo-wide failures (`mobile-dashboard.service.spec.ts`, 8 tests) are pre-existing on `master` and unrelated to this page
- [ ] Smoke-tested on preprod: open `/uttarpradesh/demo` on desktop and mobile, confirm Hindi renders above English for the heading and both card titles, and the two "Watch on YouTube" links align
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-4.2.6`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-4.2.7` (deploy is from a branch, not the tag). This release gets its own new build branch + a `v4.2.7` tag; the previous release stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release (`release-4.2.6`).

---
_File naming: this file is `RELEASE_NOTES/release-4.2.7.md` — name matches the deploy branch._
