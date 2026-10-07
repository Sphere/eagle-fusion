# Release 4.2.17 — 2026-10-07

|                              |                                               |
| ---------------------------- | --------------------------------------------- |
| **Build branch deployed**    | `release-4.2.17` (Jenkins deploy source)      |
| **Tag**                      | `v4.2.17` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `v4.2.16` (2026-10-06)                        |
| **Commits**                  | `1`                                           |
| **Author**                   | Pavithra Prakash                              |

## Summary

Fixes the downtime / service-notification banner. Its close (✕) button showed no icon, so
users could not see how to dismiss the banner. The banner's status icon had the same problem.
Both icons now display correctly.

## ✨ Features

- None.

## 🐛 Fixes

- **downtime-banner** — `DowntimeBannerComponent` is standalone but imported only
  `CommonModule`, so `<mat-icon>` and `mat-icon-button` were treated as unknown elements and
  the `close` ligature never rendered as an icon. The component now imports `MatIconModule`
  and `MatButtonModule`; a spec renders the banner and asserts the close icon gets the
  Material icon classes (`36aa3dbb9`)

## 🏗️ Build/CI

- None.

## 📚 Docs/Chore

- Release notes for 4.2.17.

## ⚠️ Deploy notes & risk

- **Config / env / secret changes:** none
- **Backend / API contract dependencies:** none
- **Breaking changes:** none
- **Risk note:** low. One component's imports changed; the close button now picks up
  Material icon-button styling (hover ripple), with the existing 28px sizing overrides kept

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] Unit tests for the changed component green (`downtime-banner.component.spec.ts`, 47/47)
- [x] Production build — run by the pre-push hook on this branch
- [ ] `yarn run lint` clean — pre-existing repo-wide `@typescript-eslint/ban-types`
      rule-not-found error blocks a clean lint run (known issue, see CLAUDE.md)
- [ ] Smoke-tested after deploy — enable a partial-downtime config and confirm the banner
      shows its status icon and a visible ✕ that dismisses it, in light and dark theme
- [x] Rollback ref confirmed (re-runnable in Jenkins): `release-4.2.16`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch**
`release-4.2.17` (deploy is from a branch, not a tag). Each release gets its own new build
branch + a `v4.2.17` tag; the previous `release-4.2.16` branch stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release branch
`release-4.2.16`.
