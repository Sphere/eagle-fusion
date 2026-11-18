# Release 5.1.9 — 2026-11-18

|                              |                                                          |
| ---------------------------- | -------------------------------------------------------- |
| **Build branch deployed**    | `release-5.1.9` (Jenkins deploy source)                  |
| **Tag**                      | `v5.1.9` (immutable marker + GitHub Release)             |
| **Baseline (previous prod)** | `v5.1.8`                                                 |
| **Commits**                  | 1 (non-merge), from `feature/bihar-staff-nurse-facility-type` |
| **Author**                   | Likhith Thammegowda                                      |

## Summary

The Bihar Staff Nurse registration form now starts with the type of facility the nurse works in: Sadar Hospital, Sub Divisional Hospital, Referral Hospital, CHC, PHC or APHC. It then lists only the districts that have that type, and only that district's facilities of that type. When the district has a single block for the type, the block is filled in without asking; when it has several, the nurse picks the block. This replaces the "district level or block level?" question from 5.1.8. The facility type is now stored with the registration.

## ✨ Features

- **Bihar Staff Nurse form** (`/bnrc/register?service=StaffNurse`) — new first question "संस्थान का प्रकार / Facility type", a dropdown with Sadar Hospital, Sub Divisional Hospital, Referral Hospital, CHC, PHC and APHC (each in English and Hindi), replacing the District / Block question (`3825910`).
  - Then District (only districts that have the type), Block (only when that district has more than one block for the type; a single block is filled in and sent), Name of Facility (that block's facilities of the type) and **Others**.
  - APHCs are placed under the block named in the sheet's "Name of PHC" column.
  - All names exactly as in the Bihar health institutions list, e.g. `SADAR HOSPITAL, ARARIA`, `PHC, MAHUA`, APHC `NABABGANJ, NARPATGANJ`.
  - Sent with the registration: `facilityType` (`SH`, `SDH`, `RH`, `CHC`, `PHC`, `APHC`), `postingLevel` from it (`District` for Sadar / Sub Divisional, `Block` for the rest) and the block, always filled now.
  - Data from a new S3 file, `bihar-staff-nurse-facilities-v2.json` (6 types, 38 districts, 2,090 institutions; already uploaded). The 5.1.8 file `bihar-staff-nurse-facilities.json` stays, so a rollback to 5.1.8 keeps working.

## 🐛 Fixes

_None._

## 🏗️ Build / CI / Infra

- `S3_END_POINTS.biharStaffNurseFacilityUrl` now points at `https://aastar-app-assets.s3.ap-south-1.amazonaws.com/bihar-staff-nurse-facilities-v2.json` (`3825910`).

## 📚 Docs / Chore

- `bnrc-register.component.spec.ts`: 71 tests (3 updated for the facility type, 6 new for the type → district → block → facility steps and what is sent) (`3825910`).
- Release notes for 5.1.9.

## ⚠️ Deploy notes & risk

- **Needs UI Proxy 6.0.7** (`release-6.0.7`): it accepts and stores `facilityType`. On 6.0.6 a Staff Nurse registration from this release is rejected with `"facilityType" is not allowed`. **Deploy UI Proxy 6.0.7 first, or together.**
- **Database column (DevOps, optional for the deploy):** `ALTER TABLE bnrc_registration_data_prod ADD COLUMN IF NOT EXISTS facility_type TEXT;` -- until it exists the value is kept on the user's profile only. `posting_level` was added on 2026-11-17.
- **Spellings as in the sheet:** a few blocks are spelled two ways within the same type and district (e.g. APHC JEHANABAD: GHOSHI / GHOSI) and appear twice. Any correction only needs a new JSON upload, no release.
- **Other Bihar forms unchanged:** CHO, Student, Faculty, ANM, GNM send exactly the same requests as before.
- **Risk:** low. Limited to the Bihar Staff Nurse registration page.

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] BNRC specs pass (71)
- [x] Checked on `localhost:4100` against the uploaded S3 file: Sadar Hospital → ARARIA (block filled in as ARARIA, no block question) → SADAR HOSPITAL, ARARIA; Sub Divisional Hospital → BHAGALPUR → block KAHALGAON / NAUGACHHIA; APHC → ARARIA → 9 blocks → NARPATGANJ → its 4 APHCs + Others; NIN hidden; no page errors
- [ ] Production build passes (Jenkins)
- [ ] UI Proxy 6.0.7 deployed first or together
- [ ] Smoke test after deploy: register a test number with a Sadar Hospital and with an APHC; the profile shows the facility, `facilityType` and `postingLevel`
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-5.1.8`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-5.1.9` (deploy is from a branch, not a tag).

**Rollback** — re-run the same manual Jenkins job against `release-5.1.8`. The Staff Nurse form goes back to the District / Block question; UI Proxy 6.0.7 can stay.

---

_File naming: this file is `RELEASE_NOTES/release-5.1.9.md` — name matches the deploy branch._
