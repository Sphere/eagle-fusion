# Release 5.1.5 — 2026-11-13

|                              |                                                        |
| ---------------------------- | ------------------------------------------------------ |
| **Build branch deployed**    | `release-5.1.5` (Jenkins deploy source)                |
| **Tag**                      | `v5.1.5` (immutable marker + GitHub Release)           |
| **Baseline (previous prod)** | `v5.1.4`                                               |
| **Commits**                  | 1 (non-merge), from `fix/runtime-course-preview-tags`  |
| **Author**                   | Likhith Thammegowda                                    |

## Summary

A course link shared on WhatsApp, Teams or LinkedIn showed the portal's generic card ("Aastrika Sphere – Free CNE Courses | INC Certified") instead of the course's own name and picture, for any course published after the last deploy. That card is wrong for a non-CNE course. The course's own preview card was only created when the portal was built, so it was missing until the next deploy. The server now builds the card at the moment the link is shared, so every course, including one published today, previews with its own name, description and image. No redeploy is needed when a course is published.

## ✨ Features

_None._

## 🐛 Fixes

- **shared course links — preview card** — When a link-preview bot (WhatsApp, Teams, Facebook, LinkedIn…) opens `/app/toc/<course>/…` or `/public/toc/overview/<course>/…` and the course has no page built at deploy time, `server.js` looks the course up on the public search API and writes its title, description, image and canonical URL into the page. Wording matches the public course page: CNE / INC is only claimed for courses that carry CNE hours (`4934522`).
- **shared course links — old links** — A public course link with an outdated name in the URL, or the `?courseId=` form, now previews with the course's prerendered page instead of the generic card (`4934522`).

## 🏗️ Build / CI / Infra

- `server.js` gains a small helper module `course-preview.js` at the repo root. The Dockerfile already copies the whole repo, so no Dockerfile or deploy change (`4934522`).

## 📚 Docs / Chore

- `course-preview.spec.ts`: 24 unit tests for the bot check, the wording, the tag replacement, the host allow-list, caching and failure handling (`4934522`).
- Release notes for 5.1.5.

## ⚠️ Deploy notes & risk

- **People are not affected.** Only requests from link-preview bots take the new path; browsers get the same page as before.
- **Prerendering is unchanged.** Courses that were Live at build time still get their full prerendered page; the new path only covers courses without one.
- **Outbound call:** the ui-static pod calls `https://<portal host>/apis/public/v8/publicSearch/getCourses` (the same public API the course page uses). The host is limited to `*.aastrika.org`; anything else falls back to `sphere.aastrika.org`. If the pod cannot reach that address, bots get the generic card exactly as today — nothing breaks.
- **Load:** at most one API call per course per hour (in-memory cache, 1,000 courses max; unknown courses are cached for 5 minutes). Each lookup gives up after 2 seconds.
- **Config / env / API changes:** none.
- **Breaking changes:** none.
- **Risk:** low. Limited to what link-preview bots receive; every failure falls back to the current behaviour.

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] `course-preview.spec.ts` passes (24 tests)
- [x] Local `server.js` run against a production build: bot requests for a course published after that build return its own tags; browser requests, unknown courses and bad ids return the normal page; prerendered courses still redirect / serve their prerendered page
- [ ] Production build passes (pre-push hook)
- [ ] Smoke test after deploy (any machine):
      `curl -sL -A 'WhatsApp/2.23.20.0 A' https://sphere.aastrika.org/app/toc/do_2146938432070123521566/overview | grep -oE '<meta property="og:title" content="[^"]*"'`
      prints the TB course title, not "Free CNE Courses". Then share the link in a new WhatsApp chat (WhatsApp caches old previews).
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-5.1.4`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-5.1.5` (deploy is from a branch, not a tag).

**Rollback** — re-run the same manual Jenkins job against `release-5.1.4`. Courses published after the deploy show the generic preview card again; nothing else changes.

---

_File naming: this file is `RELEASE_NOTES/release-5.1.5.md` — name matches the deploy branch._
