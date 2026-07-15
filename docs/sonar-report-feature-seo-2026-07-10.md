# SonarQube Analysis Report — `feature/seo` branch

**Project key:** `Sphere_eagle-fusion-seo` (separate project — Community edition has no multi-branch analysis) · **Branch:** `feature/seo` @ `77d1fe19e` (github.com/Sphere/eagle-fusion) · **Analysis date:** 10 Jul 2026 · **SonarQube:** 25.6 (local instance) · **Quality Gate:** ✅ OK — *first analysis of this project, so new-code conditions don't apply yet*

## Summary

`feature/seo` was analyzed in an isolated worktree at its latest commit. The headline: **65,442 open issues, of which 91% (59,184) is a single rule — commented-out CSS — and 58,136 of those sit in one file:** `src/styles.scss`, a 176,312-line stylesheet that is ~78% commented-out code. That file was removed/restructured on `feature/opt3`, which is most of why the two branches look wildly different. Setting that file aside, the branches carry a similar issue profile — `feature/seo` is simply the codebase before the July dead-code cleanup and test expansion: 27% more code, 36% more bugs, and 7.6% coverage vs 47.2%.

## Snapshot (10 Jul 2026)

| Metric | Value |
|---|---|
| Lines of code | 164,038 across 1,680 files |
| Bugs | 569 → Reliability **E** |
| Vulnerabilities | 3 · Security hotspots 96 → Security **D** |
| Code smells | 64,870 → Maintainability rating driven by debt below |
| Total issues | 65,442 (6 blocker · 233 critical · 63,233 major · 1,952 minor · 18 info) |
| Coverage | **7.6%** (37,783 / 41,251 lines uncovered) — 13 Jest suites / 82 tests, all passing |
| Duplication | 5.5% (1,077 blocks) |
| Technical debt | ~682 dev-days (327,182 min SQALE) |

## The one-file problem

| | |
|---|---|
| File | `src/styles.scss` |
| Size | 176,312 lines, ~137,000 of them comments |
| Issues from this file | **58,136** of the 59,184 `css:S125` (commented-out code) findings |
| On `feature/opt3` | File no longer exists (global styles restructured) |

Deleting the commented blocks (or carrying over the opt3 restructure) would remove ~89% of this branch's total issue count and the bulk of its ~682-day technical debt in one commit.

## Comparison vs `feature/opt3` (analyzed 9 Jul 2026)

| Metric | `feature/seo` | `feature/opt3` | Difference |
|---|---|---|---|
| Lines of code | 164,038 | 119,778 | −44,260 (−27%) |
| Files | 1,680 | 1,114 | −566 |
| Bugs | 569 | 362 | −207 (−36%) |
| Code smells | 64,870 | 5,214 | −92% |
| Total issues | 65,442 | 5,579 | −91.5% |
| Blocker / Critical | 6 / 233 | 4 / 168 | −2 / −65 |
| Coverage | 7.6% (82 tests) | 47.2% (2,627 tests) | +39.6 pts |
| Duplicated blocks | 1,077 | 408 | −669 |
| Security hotspots | 96 | 74 | −22 |
| Technical debt | ~682 days | ~58 days | −624 days |

The gap is the July 2026 work on `feature/opt3`: dead-code removal, the `styles.scss` restructure, and the `src/` Jest expansion. (This also confirms the ~65k-issue / ~678-day figures previously circulated were measurements of this pre-cleanup codebase state.)

## Top rules by issue count

| Rule | Issues | What it flags |
|---|---|---|
| `css:S125` | **59,184** | Commented-out CSS (58,136 in `src/styles.scss` alone) |
| `typescript:S2933` | 1,659 | Fields only assigned in the constructor should be `readonly` |
| `typescript:S6582` | 600 | Optional chaining (`?.`) should be preferred |
| `typescript:S6606` | 534 | Nullish coalescing (`??`) should be preferred |
| `Web:AvoidCommentedOutCodeCheck` | 520 | Commented-out HTML |
| `typescript:S1874` | 501 | Deprecated APIs should not be used |
| `typescript:S4325` | 280 | Redundant casts / non-null assertions |
| `typescript:S125` | 229 | Commented-out TS code |
| `Web:MouseEventWithoutKeyboardEquivalentCheck` | 207 | Mouse events need keyboard equivalents (a11y) |
| `css:S4666` | 180 | Duplicated CSS selectors |
| `css:S4649` | 122 | Font declarations need a generic font family fallback |
| `typescript:S3776` | 87 | Cognitive complexity too high |

## Security

**Vulnerabilities (3, all critical):** identical to `feature/opt3` — `typescript:S2819`, `window.postMessage` without an explicit target origin, in `library/ws-widget/utils/src/lib/services/subapplication-respond.service.ts` (lines 73, 114, 208).

**Security hotspots (96, need review — not confirmed issues):** XSS 55 · DoS 17 · weak cryptography 12 · other 7 · auth 2 · permissions 2 · data encryption 1.

## Reproducing this report

```bash
git fetch origin feature/seo
git worktree add /tmp/seo-worktree FETCH_HEAD
ln -s <main-checkout>/node_modules /tmp/seo-worktree/node_modules   # deps are identical (Angular 21.2.7)
cd /tmp/seo-worktree
npx jest --coverage
sonar-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.token=<global analysis token> \
  -Dsonar.projectKey=Sphere_eagle-fusion-seo "-Dsonar.projectName=eagle-fusion (feature/seo)"
```

Dashboard: `http://localhost:9000/dashboard?id=Sphere_eagle-fusion-seo` (local instance; credentials held by the team).
