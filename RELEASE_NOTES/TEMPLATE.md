# Release <version> — <YYYY-MM-DD>

|                              |                                              |
| ---------------------------- | -------------------------------------------- |
| **Build branch deployed**    | `release-<X.Y.Z>` (Jenkins deploy source)      |
| **Tag**                      | `v<X.Y.Z>` (immutable marker + GitHub Release) |
| **Baseline (previous prod)** | `v<previous X.Y.Z>`                            |
| **Commits**                  | `<n>`                                        |
| **Author**                   | <name>                                       |

## Summary

<2–3 line, plain-language overview a non-engineer stakeholder can read. What does this
release change for users / org admins, and why does it matter?>

## ✨ Features

- **<scope>** — <user-facing description of the change> (`<short-sha>`)

## 🐛 Fixes

- **<scope>** — <what was broken, now fixed> (`<short-sha>`)

## 🏗️ Build / CI / Infra

- <change> (`<short-sha>`)

## 📚 Docs / Chore

- <change> (`<short-sha>`)

## ⚠️ Deploy notes & risk

> Delete the lines that don't apply; keep this section honest — it's the part on-call reads.

- **Config / env / secret changes:** <none | describe>
- **Backend / API contract dependencies:** <none | describe + which service version>
- **Breaking changes:** <none | describe + migration step>

## ✅ Pre-deploy checklist

- [ ] Node 20 active (`nvs use 20`)
- [ ] Build verified (`yarn run build`)
- [ ] `yarn run lint` clean (or documented remaining warnings acceptable)
- [ ] Unit tests green (`yarn test`)
- [ ] Smoke-tested on preprod (key flows)
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `<previous release-X.Y.Z branch>`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-<X.Y.Z>` (deploy is from a branch, not a tag). Each release gets its own new build branch + a `v<X.Y.Z>` tag; the previous `release-<prev X.Y.Z>` branch stays frozen.

**Rollback** — re-run the same manual Jenkins job against the previous release branch `release-<prev X.Y.Z>`.

---
_File naming: this file is `RELEASE_NOTES/release-<X.Y.Z>.md` — name matches the deploy branch._
