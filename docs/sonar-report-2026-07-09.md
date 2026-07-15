# SonarQube Analysis Report — Sphere / eagle-fusion

**Project key:** `Sphere_eagle-fusion` · **Branch analyzed:** `feature/opt3` (working tree, incl. uncommitted changes) · **Analysis date:** 9 Jul 2026 · **SonarQube:** 25.6 (local instance) · **Quality Gate:** ❌ ERROR (new-code conditions)

## Summary

This analysis captures the codebase after the July 2026 dead-code cleanup and the `src/` unit-test expansion. Compared with the 2 Jul baseline, the codebase is **~37k lines (24%) smaller**, has **31% fewer bugs**, **20% fewer total issues**, and coverage is up **+12.9 points to 47.2%** — with `src/` alone now at **90.1%** line coverage. Ratings: Reliability **E**, Security **D**, Maintainability **A**. The quality gate fails only on *new-code* conditions (see below); every overall metric is trending in the right direction.

## Current snapshot (9 Jul 2026)

| Metric | Value |
|---|---|
| Lines of code | 119,778 across 1,114 files |
| Bugs | 362 → Reliability **E** |
| Vulnerabilities | 3 · Security hotspots 74 → Security **D** |
| Code smells | 5,214 → Maintainability **A** |
| Total issues | 5,579 (4 blocker · 168 critical · 3,910 major · 1,482 minor · 15 info) |
| Coverage | **47.2%** (14,046 / 23,717 lines uncovered) |
| Duplication | 6.7% (408 blocks) |
| Technical debt | ~58 dev-days (28,044 min SQALE) |

## Quality gate

| Condition | Threshold | Actual | Status |
|---|---|---|---|
| Coverage on new code | ≥ 80% | 74.7% | ❌ Fail |
| Issues on new code | 0 | 227 | ❌ Fail |
| Duplication on new code | ≤ 3% | 0.9% | ✅ Pass |

"New code" is measured against the previous analysis (6 Jul), so heavily-touched files re-enter the window each scan. The two failing conditions mean changed lines need a bit more coverage and their pre-existing issues (mostly inherited smells in edited files) need clearing before the gate goes green.

## Trend — last three analyses

| Metric | 2 Jul (baseline) | 6 Jul | 9 Jul | Δ vs baseline |
|---|---|---|---|---|
| Lines of code | 157,172 | 120,914 | 119,778 | **−37,394 (−24%)** |
| Files | 1,507 | 1,150 | 1,114 | −393 |
| Bugs | 529 | 364 | 362 | **−167 (−32%)** |
| Code smells | 6,459 | 5,246 | 5,214 | −1,245 |
| Total issues | 6,991 | 5,613 | 5,579 | −1,412 |
| Blocker / Critical | 6 / 209 | 4 / 173 | 4 / 168 | −2 / −41 |
| Coverage | 34.3% | 43.4% | **47.2%** | **+12.9 pts** |
| Uncovered lines | 20,802 | 14,920 | 14,046 | −6,756 |
| Duplication | 10.8% (1,060 blocks) | 6.7% (410) | 6.7% (408) | −4.1 pts |
| Security hotspots | 82 | 74 | 74 | −8 |
| Technical debt | ~73 days | ~59 days | ~58 days | −15 days |

Drivers: the LOC/files/duplication drop comes from the dead-code removal (commits `ce0a421bf`, `5e5fca66f` and the pending `feature/opt3` deletions); the coverage gain comes from the Jest spec expansion for `src/` (2,627 tests, all green).

> **Note:** an earlier circulated report showed 64,601 code smells. That figure included findings imported from an external ESLint report — the import was removed from `sonar-project.properties` because SonarQube 25.x runs its own ESLint bridge, so native Sonar counts (above) are the comparable series.

## Issue breakdown

**By severity:** 4 blocker · 168 critical · 3,910 major · 1,482 minor · 15 info
**By type:** 5,214 code smells · 362 bugs · 3 vulnerabilities

### Top rules by issue count

| Rule | Issues | What it flags |
|---|---|---|
| `typescript:S2933` | 1,313 | Fields only assigned in the constructor should be `readonly` |
| `css:S125` | 956 | Commented-out CSS should be removed |
| `typescript:S6606` | 553 | Nullish coalescing (`??`) should be preferred |
| `typescript:S6582` | 436 | Optional chaining (`?.`) should be preferred |
| `typescript:S1874` | 357 | Deprecated APIs should not be used |
| `Web:AvoidCommentedOutCodeCheck` | 210 | Commented-out HTML should be removed |
| `typescript:S125` | 188 | Commented-out TS code should be removed |
| `css:S4666` | 181 | Duplicated CSS selectors |
| `typescript:S4325` | 160 | Redundant casts / non-null assertions |
| `css:S4649` | 117 | Font declarations need a generic font family fallback |
| `Web:MouseEventWithoutKeyboardEquivalentCheck` | 100 | Mouse events need keyboard equivalents (a11y) |
| `typescript:S3776` | 77 | Cognitive complexity too high |

Roughly 1,350 issues (S125 ×2 + AvoidCommentedOutCode) are commented-out code — the cheapest large win. The `readonly` and `??`/`?.` families (~2,300 issues) are mechanical, auto-fixable modernizations.

## Security

**Vulnerabilities (3, all critical):** every one is `typescript:S2819` — `window.postMessage` called without an explicit target origin — in [subapplication-respond.service.ts](../library/ws-widget/utils/src/lib/services/subapplication-respond.service.ts) (lines 73, 114, 208). Fixing that one file clears all vulnerabilities.

**Security hotspots (74, need review — not confirmed issues):** XSS 46 · DoS 11 · weak cryptography 11 · other 4 · auth 2.

## Coverage detail

- Overall: 47.2% (23,717 coverable lines, 14,046 uncovered).
- `src/` (shell app): **90.1%** — 2,627 Jest tests across 133 suites, all passing.
- `library/` and `project/` are excluded from Jest runs (`testPathIgnorePatterns` in [jest.config.js](../jest.config.js)), so they report near-zero coverage — this is the single biggest lever for the overall number.

## Reproducing this report

```bash
nvs use 20
yarn run test-coverage          # refreshes coverage/lcov.info
sonar-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.token=<analysis token>
```

Dashboard: `http://localhost:9000/dashboard?id=Sphere_eagle-fusion` (local instance; credentials held by the team).
