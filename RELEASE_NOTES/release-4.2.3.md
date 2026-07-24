# Release 4.2.3 — 2026-07-22

|                              |                                              |
| ---------------------------- | -------------------------------------------- |
| **Build branch deployed**    | `release-4.2.3` (Jenkins deploy source)      |
| **Tag**                      | `v4.2.3` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `v4.2.2` (2026-07-22)                        |
| **Commits**                  | `2`                                          |
| **Author**                   | Pavithra                                     |

## Summary

This is a small patch release on top of 4.2.2. It fixes the "My Courses" card grid
(`.responsiveDiv`) so course cards no longer overflow or overlap across mobile, tablet,
and desktop breakpoints.

## ✨ Features

_None — patch release._

## 🐛 Fixes

- **my-courses** — `.responsiveDiv` combined a percentage/full width with fixed-pixel margins under default `content-box` sizing, making cards render wider than their container and overflow off-screen on mobile. Added `box-sizing: border-box` and adjusted width per breakpoint (`e690f1671`)
- **my-courses** — fixed pixel `height` on the card wrapper clipped/overflowed when card content (org badge, rating, 2-line titles) needed more vertical space, visually overlapping the row below; floated cards also had no clearfix, letting the "Show More" button ride up underneath. Changed to `min-height` per breakpoint (200px mobile / 240px tablet / 280px desktop) and added `clear: both` on the trailing container (`8db628c24`)

## 🏗️ Build / CI / Infra

_None._

## 📚 Docs / Chore

_None._

## ⚠️ Deploy notes & risk

- **Config / env / secret changes:** none
- **Backend / API contract dependencies:** none — CSS-only change
- **Breaking changes:** none. Low risk; smoke-test the "My Courses" tabs (Started / For You / Completed) on mobile, tablet, and desktop viewport widths, checking for card overlap or off-screen cards, especially with courses that have 2-line titles.

## ✅ Pre-deploy checklist

- [ ] Node 20 active (`nvs use 20`)
- [ ] Build verified (`yarn run build`)
- [ ] `yarn run lint` clean (or documented remaining warnings acceptable)
- [ ] Unit tests green (`yarn test`)
- [ ] Smoke-tested on preprod: My Courses card grid at mobile (<768px), tablet (768–1279px), and desktop (≥1280px) widths
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-4.2.2`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-4.2.3` (deploy is from a branch, not the tag). This release gets its own new build branch + a `v4.2.3` tag; the previous release stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release (`release-4.2.2`).

---
_File naming: this file is `RELEASE_NOTES/release-4.2.3.md` — name matches the deploy branch._
