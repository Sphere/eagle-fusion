# Release 5.1.1 — 2026-10-27

|                              |                                                                     |
| ---------------------------- | ------------------------------------------------------------------- |
| **Build branch deployed**    | `release-5.1.1` (Jenkins deploy source)                             |
| **Tag**                      | `v5.1.1` (immutable marker + GitHub Release)                        |
| **Baseline (previous prod)** | `v5.1.0`                                                            |
| **Commits**                  | 2 (non-merge), from `fix/toc-batch-mismatch` and `fix/profile-text-sanitize` |
| **Author**                   | Likhith Thammegowda                                                 |

## Summary

Two fixes for problems learners reported after go-live. On courses with more than one open batch, a learner could end up with the course listed twice in "My Learning", progress stuck below 100% and no certificate. Lessons now open in the batch the learner actually enrolled in. Separately, a profile value pasted from a spreadsheet carried a hidden tab character that stopped certificates being generated for everyone queued behind that learner. The portal now removes such characters when a profile is saved.

## ✨ Features

_None._

## 🐛 Fixes

- **toc** — Lessons open in the batch the learner enrolled in. Enrolment used the newest batch while lesson links carried the oldest, so progress was saved against a batch the learner wasn't in: lern created a second, sparse enrolment row, the course showed twice and never reached 100%. `getBatchId()` now returns the enrolled batch, and `enrollUser()` narrows the batch list to the one just enrolled in (`cbc9927`)
- **profile** — Profile save and the BNRC / UPSMF / MP registration calls trim text values and replace tabs and other control characters with spaces; newlines are kept for multi-line fields. A leading tab in `regNurseRegMidwifeNumber` produced invalid certificate JSON in RC and crash-looped the certificate generator (`81a5b9b`)

## 🏗️ Build / CI / Infra

_None._

## 📚 Docs / Chore

- TOC specs updated for the enrolled-batch behaviour (`cbc9927`)
- Release notes for 5.1.1

## ⚠️ Deploy notes & risk

- **Frontend only.** No backend, config or API change.
- **Existing data is not repaired by this release.** Learners who already have a duplicate sparse enrolment row keep seeing the course twice until that row is cleaned up in the database (separate, approved data fix). Profiles already saved with a tab keep it until the learner re-saves the profile or it is cleaned in the database.
- **Breaking changes:** none.
- **Tested on staging:** the batch fix (`stage` branch, PR #726). The profile fix is checked by type-check and a unit run of the sanitiser against tab, carriage-return, newline and non-string inputs; it lives in `project/`, which Jest does not cover, so the production build is its automated gate.

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] Build verified (pre-push production build)
- [x] Batch fix tested on staging
- [ ] Smoke test on prod: enrol in a multi-batch course, open a lesson, confirm one entry in "My Learning"; save a profile with a pasted registration number
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-5.1.0`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-5.1.1` (deploy is from a branch, not a tag). Each release gets its own new build branch + a `v5.1.1` tag; the previous `release-5.1.0` branch stays frozen.

**Rollback** — re-run the same manual Jenkins job against `release-5.1.0`.

---
_File naming: this file is `RELEASE_NOTES/release-5.1.1.md` — name matches the deploy branch._
