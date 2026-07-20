# Release 4.2.0 — 2026-07-20

|                              |                                              |
| ---------------------------- | -------------------------------------------- |
| **Build branch deployed**    | `release-4.2.0` (Jenkins deploy source)      |
| **Tag**                      | `v4.2.0` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `v4.1.0` (2026-07-03)                        |
| **Commits**                  | `51`                                          |
| **Author**                   | Pavithra                                     |

## Summary

This release introduces **Program Competency** — a new program-based learning flow where
learners progress through courses tied to competency levels, complete self-assessments, and
track their progress on a dedicated program dashboard, all built to the Figma design. It
ships alongside a large batch of fixes for progress/completion tracking, navigation, dark
theme and responsive layout issues surfaced while building the feature, plus a Sonar-driven
cleanup that removes unused components and dead code from the shared library.

## ✨ Features

- **program** — new program feature: program dashboard, banner, and flow to load courses under a program (`fdc1293a3`, `5efca6de5`, `41e2ce135`, `4b3bc5c9e`)
- **competency** — competency levels UI and API integration for progress/completion, driven by Figma design (`d720e63e9`, `411b66555`, `ef0a476ee`)
- **competency** — load competency based on the active language, with a domain check for `ekshamata` (`65010cba0`, `fc750ef9b`)
- **course** — completed-course modal on course completion/failure, plus self-assessment flow (`06a38566a`, `c4c2fc17b`)
- **playlist** — condition change so the playlist service correctly drives program course loading (`9fc061218`)

## 🐛 Fixes

- **program/competency** — progress and completion-percentage fixes across program and competency levels (`7696a3343`, `867338a18`, `128f0c0ab`, `f1e00ef23`, `30e5a5715`, `b253a300c`)
- **program** — header stays correct when navigating back to other pages from the program page (`57b1ec5ed`)
- **program** — course-failed condition fix and button label sync (`26fe4faf1`, `0b3693d4f`)
- **competency** — conditional and language-condition fixes for the competency flow; reverted an incorrect domain change (`08474c295`, `a668ab863`, `eaf044955`)
- **navigation** — completed-section and navigation fix (`ca0048de6`)
- **ui** — dark theme CSS fixes for program/competency and program dashboard; removed the assessment-completion GIF (`4bf63f604`, `2f532d705`)
- **ui** — mobile responsiveness fixes and translation/CSS fixes for program and competency screens (`9aec6c0c4`, `b4b31d0ce`)

## 🏗️ Build / CI / Infra

- **cleanup** — removed unused and dead components/code from the `library` folder, including a further pass of no-reference components, as a Sonar hygiene activity (`e1448ffa8`, `ce0a421bf`, `63c10b1d2`, `c26f2d510`)

## 📚 Docs / Chore

- **test** — updated Jest test cases for new files and fixed previously failing cases (`dea5c88dd`, `eb3bfd1cd`)
- **i18n** — updated translation strings for competency levels (`3741dbb97`, `d9b374e28`)
- **lint** — lint fixes (`870aa171a`)

## ⚠️ Deploy notes & risk

> Delete the lines that don't apply; keep this section honest — it's the part on-call reads.

- **Config / env / secret changes:** none
- **Backend / API contract dependencies:** Program and competency screens depend on the program/competency and playlist-service APIs (`9fc061218`, `65010cba0`) — confirm these endpoints are live and returning expected data in prod before smoke-testing.
- **Breaking changes:** none for users. Note: several dark-theme/CSS fixes touch shared program/competency styling (`4bf63f604`, `2f532d705`) — smoke-test both light and dark themes.

## ✅ Pre-deploy checklist

- [ ] Node 20 active (`nvs use 20`)
- [ ] Build verified (`yarn run build`)
- [ ] `yarn run lint` clean (or documented remaining warnings acceptable)
- [ ] Unit tests green (`yarn test`)
- [ ] Smoke-tested on preprod (program dashboard, competency progress/completion, self-assessment flow, dark theme, mobile view)
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-4.1.0`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-4.2.0` (deploy is from a branch, not the tag). This release gets its own new build branch + a `v4.2.0` tag; the previous release stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release (`release-4.1.0`).

---
_File naming: this file is `RELEASE_NOTES/release-4.2.0.md` — name matches the deploy branch._
