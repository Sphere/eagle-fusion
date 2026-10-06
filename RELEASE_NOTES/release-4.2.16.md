# Release 4.2.16 — 2026-10-06

|                              |                                               |
| ---------------------------- | --------------------------------------------- |
| **Build branch deployed**    | `release-4.2.16` (Jenkins deploy source)      |
| **Tag**                      | `v4.2.16` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `v4.2.15` (2026-09-28)                        |
| **Commits**                  | `1`                                           |
| **Author**                   | Pavithra Prakash                              |

## Summary

Restores mobile deep linking. Links to the portal (for example a course page) should open the
Sphere or Ekshamata app when it is installed, but have been opening in the browser instead.
Android and iOS only hand a link to the app after checking two small verification files on the
website, and those files stopped being served after a cleanup in December 2025. This release
puts them back and serves them the way Android and iOS expect.

## 🐛 Fixes

- **deeplink/well-known** — `assetlinks.json` (Android App Links) and
  `apple-app-site-association` (iOS Universal Links) were only ever committed inside `dist/`
  and were deleted with it in `946055603` (2025-12-15); the current `server.js` also had no
  `.well-known` route, so verification requests fell through to the SPA `index.html`. Both
  files are restored unchanged under `src/.well-known/`, copied to `dist/www/fusion/.well-known/`
  by an `angular.json` asset entry, and served by a new `/.well-known/:file` route in
  `server.js` as `application/json` (required by Apple; the AASA file has no extension), with
  a `404` instead of the SPA fallback for unknown files (`fcaf882bc`)

## 🏗️ Build/CI

- `angular.json` asset entry for `src/.well-known` → `.well-known` (`fcaf882bc`)

## 📚 Docs/Chore

- None.

## ⚠️ Deploy notes & risk

- **Config / env / secret changes:** none
- **Backend / API contract dependencies:** none
- **Breaking changes:** none
- **Content to confirm with the mobile team:** the files are restored as they were in 2025 —
  Android `sha256_cert_fingerprints` for `com.aastrika.sphere` and `org.aastrika.ekshamata`
  must match the current Play App Signing / upload keys; iOS Team ID is `C3CX772ND3`; iOS
  paths are limited to `/public/toc/*`, `/public/toc/overview` and `/app/`
- **Ingress/CDN:** if an ingress or CDN sits in front of the pod, it must pass `/.well-known/*`
  through to the app without a redirect
- **Risk note:** low. Additive server route and two static files; no app code changes

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] Build verified (`yarn run build:local`) — both files present in `dist/www/fusion/.well-known/`
- [x] `server.js` verified locally — both URLs return `200` `application/json`, unknown file `404`
- [ ] `yarn run lint` clean — pre-existing repo-wide `@typescript-eslint/ban-types`
      rule-not-found error blocks a clean lint run (known issue, see CLAUDE.md); no TS/HTML
      changes in this release
- [ ] Unit tests green (`yarn test`) — no app code changed; baseline 2515/2523 with the 8
      pre-existing `mobile-dashboard.service.spec.ts` failures
- [ ] Smoke-tested after deploy — on both `sphere.aastrika.org` and `ekshamata.aastrika.org`:
      `curl -I https://<domain>/.well-known/assetlinks.json` and
      `curl -I https://<domain>/.well-known/apple-app-site-association` return `200` with
      `Content-Type: application/json`; validate with Google's Digital Asset Links tool and
      Apple's AASA validator; tap a `/public/toc/...` link on a device with the app installed
- [x] Rollback ref confirmed (re-runnable in Jenkins): `release-4.2.15`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch**
`release-4.2.16` (deploy is from a branch, not a tag). Each release gets its own new build
branch + a `v4.2.16` tag; the previous `release-4.2.15` branch stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release branch
`release-4.2.15`.
