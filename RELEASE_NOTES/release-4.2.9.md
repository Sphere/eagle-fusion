# Release 4.2.9 — 2026-08-03

|                              |                                              |
| ---------------------------- | -------------------------------------------- |
| **Build branch deployed**    | `release-4.2.9` (Jenkins deploy source)      |
| **Tag**                      | `v4.2.9` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `v4.2.8` (2026-07-30)                        |
| **Commits**                  | `4`                                          |
| **Author**                   | Likhith Thammegowda                          |

## Summary

Repairs three visible defects in the quiz player. Question images were not rendering at all
on quizzes that reference images by absolute URL. The connector lines in match-the-following
questions drifted away from their boxes whenever the dialog scrolled, making the question
hard to answer. The Response column of the match-the-following review table was always
empty, so learners could not see what they had actually matched.

Also corrects three smaller issues: a quiz publishing a pass percentage of zero was taken
literally, so every attempt counted as a pass; the quiz overview dialog could not be reopened
after being closed, which left "Yes, Restart" doing nothing; and the competency card on the
ASHA learning list showed untranslated text to Hindi users.

## 🐛 Fixes

- **quiz** — question images now render. The image path resolver stripped the `src="` prefix
  with a replace that only matched paths beginning with `/`, so an absolute
  `src="https://…"` became `src=https://…` and Angular's sanitizer rewrote it to
  `unsafe:src=https://…`. Absolute and `data:` URLs are now left as authored; relative paths
  still resolve against the artifact URL (`976e80512`)
- **quiz** — match-the-following connectors stay aligned with their boxes while scrolling.
  jsPlumb was instantiated without a `Container`, so it appended its SVG connectors to
  `document.body` in page coordinates while the boxes sat inside the scrolling dialog
  (`976e80512`)
- **quiz** — the Response column of the match-the-following review table now shows what the
  learner matched. Two defects kept it blank: the guard indexed the connection list by option
  position, blanking rows past the number of connections; and it compared rendered
  `innerText` against the raw option text, which never matched because CSS collapses the
  double spaces and `&nbsp;` present in the authored content (`976e80512`)
- **assessment** — a `passPercentage` of `0` is now treated as unset and falls back to the
  60% default, in both the TOC assessment detail and the viewer's quiz route. Previously only
  a missing property triggered the fallback, so a published zero meant every attempt passed
  (`31a7127bc`)
- **quiz** — the overview dialog reference is released when the dialog closes, so
  "Yes, Restart" reopens it. The reference was only cleared by a commented-out line, leaving
  the reopen guard permanently blocked for the life of the component (`dbd513d77`)
- **i18n** — the ASHA learning competency card now uses translation keys that exist in both
  locales. It asked for `COMPETENCY`, present in `en.json` but missing from `hi.json`, so
  Hindi users saw the raw key rendered; it now uses `Competency` and `Completed`. The missing
  `LEVELS` entry was also added to `hi.json` (`585fae92e`)

## 🏗️ Build/CI

- None.

## 📚 Docs/Chore

- None.

## ⚠️ Deploy notes & risk

- **Config / env / secret changes:** none
- **Backend / API contract dependencies:** none. The quiz artifact JSON is unchanged; all
  three quiz fixes are client-side rendering corrections
- **Breaking changes:** none
- **Risk note:** all five fixes live under `project/ws/viewer` and `project/ws/app`, which
  `jest.config.js` excludes via `testPathIgnorePatterns`. They therefore carry **no unit test
  coverage** and the production build is the only automated gate. The image and Response
  fixes were verified by replaying the old and new logic against the real quiz artifact
  (`do_1146265771989319681410`); the connector and restart fixes are reasoned from the DOM
  and dialog lifecycle but were **not confirmed in a browser** — smoke-test both before
  declaring the release good.

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] Build verified (`yarn run build:local`)
- [ ] `yarn run lint` clean — pre-existing repo-wide `@typescript-eslint/ban-types`
      rule-not-found error blocks a clean lint run (known issue, see CLAUDE.md); no new lint
      errors introduced by this release
- [x] Unit tests green (`yarn test`) — no spec exercises the changed paths, see risk note
- [ ] Smoke-tested on preprod — **required for this release**: open a quiz with image
      questions, a match-the-following question (scroll while answering, then check the
      Response column after submit), and confirm "Yes, Restart" reopens the overview
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-4.2.8`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch**
`release-4.2.9` (deploy is from a branch, not a tag). Each release gets its own new build
branch + a `v4.2.9` tag; the previous `release-4.2.8` branch stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release branch
`release-4.2.8`.
