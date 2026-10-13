# Release 5.1.0 — 2026-10-13

|                              |                                                       |
| ---------------------------- | ----------------------------------------------------- |
| **Build branch deployed**    | `release-5.1.0` (Jenkins deploy source)               |
| **Tag**                      | `v5.1.0` (immutable marker + GitHub Release)          |
| **Baseline (previous prod)** | `v5.0.0`                                              |
| **Commits**                  | 6 (non-merge), from `feature/rc-certificate-verify`   |
| **Author**                   | Likhith Thammegowda                                   |

## Summary

Scanning the QR code on a certificate now confirms it straight away. The verification page looks the certificate up in the new certificate service and shows the learner's name, the course, the date and the certificate itself, with no access code to type. This works for certificates issued since go-live, for the 5.2 lakh certificates moved over at go-live, and for certificates printed before the move. Revoked or unrecognisable certificates get a clear "could not be verified" message, and anything the new service does not know still falls back to the old access-code check.

## ✨ Features

- **certificate** — QR verification without an access code: `/certs/:id` checks Sunbird RC by certificate id, then by the old certificate id (`oldId`) for certificates printed before the migration, and shows a verified card with the certificate image (`db095be`)
- **certificate** — "Could not be verified" state for revoked or malformed ids; unknown ids keep the access-code check unless `certificateMigrationCompleted` is set in `host.config.json` (`db095be`)

## 🐛 Fixes

- **certificate** — Verification screen showed a broken loader image (the gif never existed in the repo or on prod); replaced with a spinner (`8487fcf`)
- **certificate** — The access-code illustration no longer appears next to the "could not be verified" message (`8f8e40f`)
- **certificate** — "Issued by" line removed: batch certificate templates carry a placeholder issuer (`in`), sealed into every signed certificate; the certificate image already shows the issuing organisations (`e493d0c`)

## 🏗️ Build / CI / Infra

_None._

## 📚 Docs / Chore

- English and Hindi strings for the verified and invalid states (`db095be`)
- **test** — 9 specs left stale by 5.0.0 updated: share dialog now expects the public course link, and the profile and certificate-modal mocks gain `toImageSource()`. Test files only (`7116720`)
- Release notes for 5.1.0

## ⚠️ Deploy notes & risk

- **Backend / API contract dependency — deploy ui-proxies first.** The page calls the new ui-proxies route `GET /apis/public/v8/certificate/verify/:id` (Sphere/sunbird-cb-uiproxy, branch `feature/rc-certificate-verify`, `f85d987` + `2274d42`). Without it the call fails and the page falls back to today's access-code box, so nothing breaks, but QR scans keep asking for a code.
- **ui-proxies config:** new env `SUNBIRD_RC_REGISTRY_BASE`, default `http://registry-service:8081/api/v1`, which matches the Spark cluster. No change needed unless RC runs elsewhere.
- **Portal config:** `certificateMigrationCompleted` in `host.config.json` stays unset (off). Turn it on only after old event certificates are migrated and the old verify VM is retired.
- **Breaking changes:** none. The access-code check is unchanged and still used as the fallback.
- **Tested on staging:** new, migrated and old-id certificates verify; course name read from the signed credential (`2274d42`).

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] Build verified (`yarn run build:local`, plus the pre-push production build on every commit)
- [x] `yarn run lint`: no new errors in the touched files; the remaining ones are pre-existing (constructor injection, legacy `*ngIf`)
- [x] Unit tests green (`yarn test`): 305 suites, 6586 tests
- [ ] ui-proxies with the verify route deployed to prod
- [ ] Smoke test on prod: scan a new certificate's QR, a migrated one, and an unknown id
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-5.0.0`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-5.1.0` (deploy is from a branch, not a tag). Each release gets its own new build branch + a `v5.1.0` tag; the previous `release-5.0.0` branch stays frozen.

**Rollback** — re-run the same manual Jenkins job against `release-5.0.0`. The ui-proxies route can stay deployed; 5.0.0 never calls it.

---
_File naming: this file is `RELEASE_NOTES/release-5.1.0.md` — name matches the deploy branch._
