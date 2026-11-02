# Release 5.1.3 — 2026-11-02

|                              |                                                             |
| ---------------------------- | ----------------------------------------------------------- |
| **Build branch deployed**    | `release-5.1.3` (Jenkins deploy source)                     |
| **Tag**                      | `v5.1.3` (immutable marker + GitHub Release)                |
| **Baseline (previous prod)** | `v5.1.2`                                                    |
| **Commits**                  | 2 (non-merge), from `fix/learner-quiz-hint-video-questions` |
| **Author**                   | Likhith Thammegowda                                         |

## Summary

Learners now see the course creator's explanations in quizzes and assessments: after answering, the explanation for the option they picked is shown and, after a wrong answer, the explanation for the correct option too; the same explanations appear in View Answers. In-video questions work again on videos saved on the new platform, appear once instead of twice, and keep each answer when moving between questions. This pairs with Creation Portal 6.1.0, which ships the authoring side of video questions and hints.

## ✨ Features

- **assessment / quiz — explanations** — The answer screen shows the creator's hint as an **Explanation** for the option the learner picked; after a wrong answer it also shows the explanation for the correct option. Each box carries an icon matching its colour: a green tick for the correct option, a red cross for a wrong pick (`08158babb`, `395a42f60`).
- **assessment — View Answers** — Shows the explanation on the correct option(s) and on the learner's wrong pick (`08158babb`).

## 🐛 Fixes

- **in-video questions — missing questions** — Questions saved on Sunbird Spark arrive as a list, but the player only read the older text form, so it found no questions and played the video without stopping. The player now reads either form and treats anything else as no questions, instead of failing (`08158babb`).
- **in-video questions — shown twice** — The player attached its time listener more than once per video, so a question could pop up twice. It now attaches once and tracks which questions were shown on each pass (`08158babb`).
- **in-video questions — answers lost** — Moving between questions in the popup no longer resets an earlier question's answer, and after a wrong answer the popup shows the correct option's explanation (`08158babb`).
- **i18n** — "Wrong" added in English and Hindi (`08158babb`).

## 🏗️ Build / CI / Infra

_None._ No dependency, build or deploy-layout change.

## 📚 Docs / Chore

- Tests for the result-screen hints, `parseVideoQuestions` (list, text and bad input), the question trigger (crossing a question's time, including at 3× speed, once per pass, not on a forward seek, registered once) and the popup state (`395a42f60`).
- Test files restyled to the repo's lint rules (no semicolons); no test changed.
- Release notes for 5.1.3.

## ⚠️ Deploy notes & risk

- **Pairs with Creation Portal 6.1.0**, but neither release depends on the other:
  - CBP 6.1.0 saves `videoQuestions` as text again. 5.1.2 already reads text, and 5.1.3 reads both forms.
  - Questions saved as a list, by CBP 6.0.x since the move to Spark, only show from **5.1.3** onwards.
- **Config / env / API changes:** none.
- **Breaking changes:** none.
- **Risk:** low. Changes are limited to the video player, the question popup, the quiz result screen and View Answers, all covered by new tests.

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] Unit tests: 309 suites, 6,808 tests pass; coverage threshold met (statements 95.44%, branches 81.98%, functions 91.95%, lines 95.55%; thresholds 80/70/80/80)
- [x] Lint: the release's new test files had 727 style errors (extra semicolons, arrow-function brackets); these are auto-fixed in this release, and the files are otherwise unchanged, with all 123 tests still passing. Left: 6 `prefer-control-flow` notices in the two templates this release extends (`assesment-question-result`, `view-answer`), whose new lines use `*ngIf` like the rest of each file.
- [x] Production build passes (`ng build --configuration production`)
- [x] Already on `stage` for testing (PR #733)
- [ ] Smoke test after deploy: a video with questions stops at each question once (also at 2×), and Next/Back keep the answers; an assessment shows the Explanation after a correct and a wrong answer, and View Answers shows the explanations
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-5.1.2`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-5.1.3` (deploy is from a branch, not a tag).

**Rollback** — re-run the same manual Jenkins job against `release-5.1.2`. Video questions saved as text (CBP 6.1.0 and later) keep working on 5.1.2; questions saved as a list by CBP 6.0.x would stop showing again.

---

_File naming: this file is `RELEASE_NOTES/release-5.1.3.md` — name matches the deploy branch._
