# Release 4.2.1 — 2026-07-20

|                              |                                              |
| ---------------------------- | -------------------------------------------- |
| **Build branch deployed**    | `release-4.2.1` (Jenkins deploy source)      |
| **Tag**                      | `v4.2.1` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `v4.2.0` (2026-07-20)                        |
| **Commits**                  | `2`                                          |
| **Author**                   | Pavithra                                     |

## Summary

This is a small patch release on top of 4.2.0. It fixes a login-session bug where competency
self-assessment submissions failed with a session-expired error on the Ekshamata portal, and
includes a minor CSS alignment fix for a button on the ASHA learning/competency course list.

## ✨ Features

_None — patch release._

## 🐛 Fixes

- **competency** — competency assessment submission failed with a session-expired (419) error on `ekshamata.aastrika.org`. The request was being sent to a different domain (`azureHost`, used elsewhere only for public content assets) instead of the app's own origin, so the browser dropped the session cookie. Now uses the same relative API path as every other authenticated endpoint (`694b0d889`)
- **ui** — button alignment/spacing fix on the ASHA learning competency course list (`effc98ff6`)

## 🏗️ Build / CI / Infra

_None._

## 📚 Docs / Chore

_None._

## ⚠️ Deploy notes & risk

> Delete the lines that don't apply; keep this section honest — it's the part on-call reads.

- **Config / env / secret changes:** none
- **Backend / API contract dependencies:** none — the competency-submit fix only changes which origin the existing `assessmentCompetency/v1/assessment/submit` request is sent to; the endpoint itself is unchanged. Relies on each portal's own server routing `/apis/protected/v8/*` to the correct backend on its own domain, the same way every other protected endpoint in the app already does.
- **Breaking changes:** none. Low risk, single-endpoint fix; smoke-test competency self-assessment submission specifically on `ekshamata.aastrika.org` post-deploy (that's the environment the bug was reported on).

## ✅ Pre-deploy checklist

- [ ] Node 20 active (`nvs use 20`)
- [ ] Build verified (`yarn run build`)
- [ ] `yarn run lint` clean (or documented remaining warnings acceptable)
- [ ] Unit tests green (`yarn test`)
- [ ] Smoke-tested on preprod: competency self-assessment submission on `ekshamata.aastrika.org` (no 419), and on `sphere.aastrika.org` for regression
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-4.2.0`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-4.2.1` (deploy is from a branch, not the tag). This release gets its own new build branch + a `v4.2.1` tag; the previous release stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release (`release-4.2.0`).

---
_File naming: this file is `RELEASE_NOTES/release-4.2.1.md` — name matches the deploy branch._
