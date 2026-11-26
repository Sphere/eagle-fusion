# Release 5.2.0 — 2026-11-26

|                              |                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| **Build branch deployed**    | `release-5.2.0` (Jenkins deploy source)                                                           |
| **Tag**                      | `v5.2.0` (immutable marker + GitHub Release)                                                      |
| **Baseline (previous prod)** | `v5.1.9`                                                                                          |
| **Commits**                  | 14 (non-merge), from `feature/course-rating-emoji-ui`, `feature/competencyCertificate`, `feature/html-archive-content-player` |
| **Author**                   | Pavithra Prakash                                                                                  |

## Summary

Three features ship together. The course rating dialog has been redesigned: picking a rating now shows a face and a label (Terrible to Excellent), and the comment is marked optional once the rating can be submitted. Learners can now see and download competency certificates, both in the profile certificate list and from the completed competency card. HTML (html-archive) course content with package type `html` now plays in the Sunbird content-player. Its progress is saved, resume works across devices, the side TOC updates live and the layout works on phones. SCORM packages keep the existing player.

## ✨ Features

- **Course rating dialog:** a rating face and label above the stars, SVG stars tinted per rating level, and a dialog that grows to fit instead of scrolling. `RATING_*` keys were added to en/hi (`27a6d26`, `409af1e`).
  - Once submit is enabled the comment placeholder reads "Tell us more about what you felt (Optional)". The star aria-labels are translated (`5519f9a`).
- **Competency certificates in the profile certificate list:** they are listed together with course certificates. A failed load shows an error with Retry instead of the "no certificates" state, and a single failed download removes only that certificate from the list (`439cf69`).
  - Status and download go through `/apis/public/v8/mobileApp/kong/user/certificate/competency/{status,download}`, and the `/common-service` host is no longer used (`37ba86e`).
- **Download from the completed competency card:** a new certificate icon checks the status and downloads when the status is `GENERATED`. Otherwise an info banner says the certificate is not ready, using the API's message when it sends one. "Download certificate" and "Your certificate is not ready yet" were added to en/hi (`8f895be`).
- **HTML content in the Sunbird content-player** (`@project-sunbird/content-player` 8.0.0, served at `/content-player/`) on the normal TOC → `/viewer/html/:id` route (`be740a4`, `78c02c4`, `89dfd32`).
  - Used only for html-archive content with `packageType: "html"`. Content is matched by site config `htmlContentPlayer.mimeTypes` (default `application/vnd.ekstep.html-archive`) or `.contentIds`. SCORM packages that share the mimeType keep the existing HTML player.
  - Progress is saved through `realTimeProgressUpdateV3` at start, at each 10%, on completion, and on leave. The position is saved at most every 15 s. Resume reads the server record (`fetchContentHistoryV2`), so it is per user and works across devices.
  - The side TOC percentage, the tick and the next-module unlock now update without a reload.
  - The viewer TOC labels this content "HTML" (SCORM content is still labelled "Scrom").
  - The package's Finish button (`showEndPage`) now opens the next resource, or goes back to the course TOC (`7c454de`).

## 🐛 Fixes

- Viewer TOC: the loading overlay no longer stays over the player when the progress read fails (`be740a4`, `78c02c4`).
- On phones, HTML content no longer spills over Previous/Next or out of the card (`78c02c4`).
- `viewer-util`: html-archive progress updates were always marked completed. The HTML content player now sends an opt-in `statusOverride`, so a 20% milestone is no longer recorded as done. Other players are unchanged (`be740a4`).
- The resume position is posted only to the package's own origin, not `'*'`, and a backtracking regex was removed (`8b4e6a7`).

## 🏗️ Build / CI / Infra

- **New dependency:** `@project-sunbird/content-player@8.0.0`. `angular.json` copies it to `/content-player/` without its spec files or README (`be740a4`).
- `yarn.lock` was refreshed within the existing ranges and synced with `package.json`, so `--frozen-lockfile` installs pass (`3d4efd5`, `32d741f`).
- `site.config.json` / `site.config.hi.json` have a new `htmlContentPlayer` block (`be740a4`).

## 📚 Docs / Chore

- README markdown tables realigned (`c7a12f8`).
- New and extended specs: content-player util / progress / resume / component, HTML container, viewer TOC, asha-learning-completed, certificate-received, mobile-profile-dashboard, widget-content service.
- Release notes for 5.2.0.

## ⚠️ Deploy notes & risk

- **Backend dependency (competency certificates):** the UI calls `/apis/public/v8/mobileApp/kong/user/certificate/competency/status` and `.../download`. Confirm both routes are live on prod before deploying. Without them, the profile list shows the error/Retry state for competency certificates (course certificates still load), and the card icon shows the "not ready" banner.
- **New npm package:** the Jenkins install must fetch `@project-sunbird/content-player@8.0.0`. It is in `yarn.lock`.
- **HTML player switch:** every html-archive item with `packageType: "html"` moves to the new player. To roll that back without a release, set `htmlContentPlayer.mimeTypes` to `[]` in site config. `site.config.json` is cached in `sessionStorage`, so open tabs keep the old value until they are closed.
- **Progress status change:** for content in the new player, partial progress is now saved as in progress (1) instead of completed (2). Content completed before this release is not affected.
- **Risk:** medium. Touches the viewer progress path for HTML content, the profile certificate list and the rating dialog. SCORM, PDF, video and quiz players are unchanged.

## ✅ Pre-deploy checklist

- [ ] Node 20 active (`nvs use 20`). The local checks below ran on **Node 24** (no Node 20 was available in that shell). Re-run on Node 20.
- [x] `tsc --noEmit` reports no errors in application source. The existing type errors are only in `*.spec.ts` / `src/test-import.ts`.
- [x] `yarn test`: 6,999 tests passed, 312/314 suites. The 2 suites that fail to load (`public-api.spec.ts`, `all-discussion-widget.component.spec.ts`) crash inside the `esm` loader under Node 24. These files are not touched by this release. Re-check them on Node 20.
- [x] `yarn run build:local` passes, and `content-player/` is emitted in `dist`.
- [ ] Production build passes (Jenkins)
- [ ] Competency certificate status/download routes confirmed on prod
- [ ] Smoke test after deploy: rate a course (face and label shown, comment optional); download a competency certificate from the profile list and from the completed card; open an html-archive (`packageType: html`) module, leave at ~30%, reopen on another device → it resumes and the TOC shows the percentage; Finish opens the next module; a SCORM module still opens in the old player
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-5.1.9`

## Release & rollback

**Deploy:** a human runs the manual Jenkins job pointed at the **build branch** `release-5.2.0`. Deploys run from a branch, not a tag.

**Rollback:** re-run the same manual Jenkins job against `release-5.1.9`. HTML content goes back to the old player. Progress saved by the new player stays on the server and is read as normal content progress.

---

_File naming: this file is `RELEASE_NOTES/release-5.2.0.md`. The name matches the deploy branch._
