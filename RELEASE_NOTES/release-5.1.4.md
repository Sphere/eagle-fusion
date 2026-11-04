# Release 5.1.4 — 2026-11-03

|                              |                                                       |
| ---------------------------- | ----------------------------------------------------- |
| **Build branch deployed**    | `release-5.1.4` (Jenkins deploy source)               |
| **Tag**                      | `v5.1.4` (immutable marker + GitHub Release)          |
| **Baseline (previous prod)** | `v5.1.3`                                              |
| **Commits**                  | 1 (non-merge), from `fix/search-card-published-date`  |
| **Author**                   | Likhith Thammegowda                                   |

## Summary

Search showed today's date on courses nobody had changed, and moved them to the top of the results. The date it used changes whenever anything about a course is touched, including a new rating or a background system update. Search, the course page and the public course page now show when each course was last **published**, and search lists the most recently published courses first. This pairs with UI Proxy 6.0.3, which applies the same order on the server.

## ✨ Features

_None._

## 🐛 Fixes

- **search — date shown** — The search card's "Last Updated On" shows the course's last published date (`lastPublishedOn`) instead of `lastUpdatedOn`, which also moves on ratings, metadata and system updates. If a course has no publish date, the old date is shown (`be2e78d`).
- **search — order** — Search requests sort by the published date, matching the re-ordering the results page already applied (`be2e78d`).
- **course page — date** — The "Last updated on" date on the course page's at-a-glance details and on the public course banner uses the published date, with the same fallback. The `atAGlance.lastUpdatedOn` config switch is unchanged (`be2e78d`).

## 🏗️ Build / CI / Infra

_None._ No dependency, build or deploy-layout change.

## 📚 Docs / Chore

- `IContent` gains the optional `lastPublishedOn` field; two search specs updated for the renamed sort key (`be2e78d`).
- Release notes for 5.1.4.

## ⚠️ Deploy notes & risk

- **Pairs with UI Proxy 6.0.3** (`release-6.0.3`), but neither release depends on the other:
  - This release sends `sort_by: { lastPublishedOn }`; the proxy passes it to the search service unchanged, on 6.0.2 as well.
  - UI Proxy 6.0.3 also orders competency searches (5+ competencies) by the published date.
- **Labels unchanged:** the text still reads "Last Updated On", so no translation change. A course's publish is when its content was last updated for learners.
- **Config / env / API changes:** none.
- **Breaking changes:** none.
- **Risk:** low. Limited to the date shown on three screens and the search sort key.

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] Production build passes: `yarn prerender` and `yarn run compress:brotli` (the Dockerfile's build steps)
- [x] `tsc`: no new errors in the changed files (two spec type errors in `learning-card.component.spec.ts` and `search-serv.service.spec.ts` predate this release)
- [ ] Smoke test after deploy: search with no text lists the most recently published course first, and its card shows that publish date; a course page's date matches its last publish
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-5.1.3`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-5.1.4` (deploy is from a branch, not a tag).

**Rollback** — re-run the same manual Jenkins job against `release-5.1.3`. The cards show the last-updated date again; nothing else changes.

---

_File naming: this file is `RELEASE_NOTES/release-5.1.4.md` — name matches the deploy branch._
