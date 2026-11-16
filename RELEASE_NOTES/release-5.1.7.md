# Release 5.1.7 — 2026-11-16

|                              |                                                                   |
| ---------------------------- | ----------------------------------------------------------------- |
| **Build branch deployed**    | `release-5.1.7` (Jenkins deploy source)                           |
| **Tag**                      | `v5.1.7` (immutable marker + GitHub Release)                      |
| **Baseline (previous prod)** | `v5.1.6`                                                          |
| **Commits**                  | 2 (non-merge), from `fix/toc-certificate-icon-video-popup-dark`   |
| **Author**                   | Pavithra Prakash                                                  |

## Summary

Two fixes. The certificate icon on a course page now shows only when the learner's batch actually has a certificate template. Before, learners who were already enrolled never saw the icon, because the batch data the page used for them was missing the template. The question that pops up during a video is now readable in dark mode. Before, the answer a learner picked turned light text on a light background and nearly vanished.

## ✨ Features

_None._

## 🐛 Fixes

- **Certificate icon on the course page** — the icon now needs both a certificate template on the batch (`cert_templates`) and `issueCertification` on the course. A batch whose `cert_templates` is `null` or empty hides it.
  - Enrolled learners get their batch from the enrollment-list API, which only returns the fields named in `batchDetails`. `cert_templates` is now requested there (`FETCH_USER_ENROLLMENT_LIST_CERT` and `FETCH_USER_ENROLLMENT_LIST_COMP`), so the icon shows for them too.
  - `IBatch.cert_templates` is typed as a map of the new `ICertTemplate` (`8211571`).
- **In-video question, dark mode** — the selected option, right/wrong states, result boxes and the Skip button had fixed light backgrounds. In dark mode they now use translucent tints and a lighter blue, so the chosen answer and the Skip button are readable. Light mode is unchanged (`3e9fa3e`).

## 🔁 Changes

- **Courses without a certificate template no longer show the certificate icon**, even when the course has `issueCertification: true`. Example: `do_2146938432070123521566` has `issueCertification: true` but its batch has `cert_templates: null`, so the icon is now hidden there.

## 🏗️ Build / CI / Infra

_None._ No dependency, build or deploy-layout change.

## 📚 Docs / Chore

- Release notes for 5.1.7.

## ⚠️ Deploy notes & risk

- **Course-page certificate icon may disappear on some courses.** Any course whose batch has no certificate template will lose the icon. If a course should show one, attach a certificate template to its batch.
- **Enrollment data is cached per tab.** Learners with a tab open across the deploy see the new behaviour after they reload in a new tab or log in again.
- **Enrollment-list requests now ask for `cert_templates`** in `batchDetails`. Checked against `sphere.aastrika.org`: the field comes back with it requested, and the response is otherwise unchanged.
- **Not covered by unit tests:** the changed TOC and video-popup code lives under `project/` and `library/`, which Jest does not run. The production build is the automated check there.
- **Config / env / API changes:** none in this repo beyond the extra `batchDetails` field.
- **Breaking changes:** none.
- **Risk:** low. Limited to the certificate icon on the course page and the in-video question dialog.

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] `yarn test`: 310 suites, 6,842 tests pass
- [x] `yarn run build:local` passes
- [ ] Production build passes (Jenkins)
- [ ] Smoke test after deploy: open an enrolled course whose batch has a certificate template (e.g. `do_11443054465544192011`) and see the icon; open one without (e.g. `do_2146938432070123521566`) and see it hidden; in dark mode, answer an in-video question and check the selected, right and wrong states
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-5.1.6`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-5.1.7` (deploy is from a branch, not a tag).

**Rollback** — re-run the same manual Jenkins job against `release-5.1.6`. The certificate icon returns to depending on `issueCertification` alone, and the in-video question goes back to its light-only colours.

---

_File naming: this file is `RELEASE_NOTES/release-5.1.7.md` — name matches the deploy branch._
