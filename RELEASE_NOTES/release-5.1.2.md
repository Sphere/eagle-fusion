# Release 5.1.2 — 2026-10-27

|                              |                                                       |
| ---------------------------- | ----------------------------------------------------- |
| **Build branch deployed**    | `release-5.1.2` (Jenkins deploy source)               |
| **Tag**                      | `v5.1.2` (immutable marker + GitHub Release)          |
| **Baseline (previous prod)** | `v5.1.0` (`release-5.1.1` never built)                |
| **Commits**                  | 1 (non-merge), from `fix/gzipper-uuid`                |
| **Author**                   | Likhith Thammegowda                                   |

## Summary

Release 5.1.1 could not be built: the Docker image build stopped at the file-compression step. This release fixes that build problem and nothing else, so it ships everything in 5.1.1 unchanged — lessons open in the batch the learner enrolled in, and hidden tab characters are removed when a profile is saved.

## ✨ Features

_None._

## 🐛 Fixes

_None in the application. 5.1.1's fixes ship in this release; see `RELEASE_NOTES/release-5.1.1.md`._

## 🏗️ Build / CI / Infra

- **build** — Docker build failed at `yarn run compress:brotli` with `ERR_PACKAGE_PATH_NOT_EXPORTED: Package subpath './v4'`. The Dependabot update (`eab91782d`) forced `uuid` 11 onto `gzipper` 2.x through a yarn resolution, and gzipper loads `uuid/v4`, a path removed in uuid 8. The resolution is removed, so gzipper uses uuid 3.4.0 (already in the lockfile). gzipper runs only at build time and is not shipped (`85477e0`)

## 📚 Docs / Chore

- Release notes for 5.1.2

## ⚠️ Deploy notes & risk

- **Build-only change.** No application code, config or API change compared with 5.1.1.
- **Dependabot** may raise an alert for `uuid` 3.4.0. It is used only by the build-time compressor and can be dismissed as a development dependency.
- **Breaking changes:** none.

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] Docker build steps reproduced locally: `yarn prerender` then `yarn run compress:brotli`
- [x] 5.1.1 batch fix tested on staging
- [ ] Jenkins image build for `release-5.1.2` passes
- [ ] Smoke test on prod: enrol in a multi-batch course, open a lesson, confirm one entry in "My Learning"; save a profile with a pasted registration number
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-5.1.0`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-5.1.2` (deploy is from a branch, not a tag). `release-5.1.1` stays frozen and is not deployed.

**Rollback** — re-run the same manual Jenkins job against `release-5.1.0`.

---
_File naming: this file is `RELEASE_NOTES/release-5.1.2.md` — name matches the deploy branch._
