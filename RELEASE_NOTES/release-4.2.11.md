# Release 4.2.11 — 2026-08-03

|                              |                                               |
| ---------------------------- | --------------------------------------------- |
| **Build branch deployed**    | `release-4.2.11` (Jenkins deploy source)      |
| **Tag**                      | `v4.2.11` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `v4.2.10` (2026-08-03)                        |
| **Commits**                  | `1`                                           |
| **Author**                   | Likhith Thammegowda                           |

## Summary

The public course overview page showed the internal creator username as the author —
`creatorjhpaastrika_0qfj` rather than `Jhpiego Cooperation`. It now shows the same author
name the signed-in course page shows.

## 🐛 Fixes

- **public-toc** — the author line now resolves the display name from `creatorDetails`
  instead of rendering the raw `creator` username. The signed-in TOC reads
  `creatorDetails[0].name`, but that only works there because `app-toc-home` parses the field
  first; the public page is fed by the public search API, which returns `creatorDetails` as a
  JSON **string**, so indexing it directly yields `"["` and then `undefined`. The value is now
  resolved from either shape — string or already-parsed array — and falls back to `creator`
  when the details are malformed or absent, so it can never render less than before
  (`a4604b993`)

## 🏗️ Build/CI

- None.

## 📚 Docs/Chore

- None.

## ⚠️ Deploy notes & risk

- **Config / env / secret changes:** none
- **Backend / API contract dependencies:** none. This is a client-side display change; the
  search payload is unchanged
- **Breaking changes:** none
- **Risk note:** low. The change is confined to the public course overview banner and is
  fallback-guarded, so the worst case is the previous behaviour (the username). Confirmed
  working on the page before release, and covered by 7 unit tests spanning both payload
  shapes plus the malformed, absent, no-name and null-content paths

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] Build verified (`yarn run build:local`)
- [ ] `yarn run lint` clean — pre-existing repo-wide `@typescript-eslint/ban-types`
      rule-not-found error blocks a clean lint run (known issue, see CLAUDE.md); no new lint
      errors introduced by this release
- [x] Unit tests green (`yarn test`) — `public-toc-banner.component.spec.ts` 13/13, including
      7 new cases for the author name resolution
- [x] Verified on the running app — the public overview now shows `Jhpiego Cooperation`
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-4.2.10`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch**
`release-4.2.11` (deploy is from a branch, not a tag). Each release gets its own new build
branch + a `v4.2.11` tag; the previous `release-4.2.10` branch stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release branch
`release-4.2.10`.
