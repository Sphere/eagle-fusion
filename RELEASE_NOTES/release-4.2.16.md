# Release 4.2.16 — 2026-10-05

|                              |                                               |
| ---------------------------- | --------------------------------------------- |
| **Build branch deployed**    | `release-4.2.16` (Jenkins deploy source)      |
| **Tag**                      | `v4.2.16` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `v4.2.15` (2026-09-28)                        |
| **Commits**                  | `3`                                           |
| **Author**                   | Pavithra Prakash                              |

## Summary

Three small fixes. After resetting a forgotten password, users now land on the public home page
instead of a "page not found" screen. Course card images on the home and My Courses pages are
sharper, because the cards now prefer the course thumbnail over the low-resolution app icon. In the
course player's table of contents, the per-resource download button is removed and the
resource-type icons are cleaned up.

## 🐛 Fixes

- **auth/routing** — added a `password-reset-success` → `public/home` redirect. Keycloak's
  forgot-password action token redirects to `/password-reset-success` after the new password is
  set (the redirect URI is configured server-side). The portal had no such route, so users hit the
  `**` not-found page (`6fd7f7c03`)
- **web-course-card** — the card image now falls back `posterImage` → `thumbnail` → `appIcon`.
  It used to skip `thumbnail`, so cards without a poster image rendered the small `appIcon`
  upscaled and blurry (`631cf6afd`)
- **viewer/viewer-toc** — removed the download button from TOC resource rows (PDF, lecture,
  video). The `ngSwitch` icon block is replaced by a `contentTypeIcons` lookup with `alt` text
  for each icon, and the duration now always uses `margin-left-xxs` (`c02c95666`)

## 🏗️ Build/CI

- None.

## 📚 Docs/Chore

- Added these release notes.

## ⚠️ Deploy notes & risk

- **Config / env / secret changes:** none
- **Backend / API contract dependencies:** none. The reset-password redirect URI stays as
  Keycloak sets it. This release only makes the portal handle it.
- **Breaking changes:** none
- **Behaviour change:** learners can no longer download PDF, lecture or video resources from the
  course player's table of contents, even when `showDownloadBtn` is `Yes`.
  `ViewerTocComponent.downloadResource()` is now unused. Confirm with product that this is intended.
- **Risk note:** low. The changes are a route redirect, an image `src` fallback and a TOC
  template change.

## ✅ Pre-deploy checklist

- [ ] Node 20 active (`nvs use 20`)
- [ ] Build verified: the pre-push production build runs on push of this branch
- [ ] `yarn run lint` clean: the pre-existing repo-wide `@typescript-eslint/ban-types`
      rule-not-found error blocks a clean lint run (known issue, see CLAUDE.md)
- [ ] Unit tests green (`yarn test`). No spec changes: the route is config-only, and the
      viewer-toc change is under `project/`, which Jest ignores
- [ ] Smoke-tested on preprod (key flows):
  - Forgot password → open the reset link from the email → set a new password → you land on `/public/home`
  - Course cards on the home and My Courses pages show a sharp image
  - Course player TOC shows the PDF/video/link icons, with no download button
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-4.2.15`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch**
`release-4.2.16` (deploy is from a branch, not a tag). Each release gets its own new build
branch + a `v4.2.16` tag; the previous `release-4.2.15` branch stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release branch
`release-4.2.15`.
