# Release 5.1.8 — 2026-11-17

|                              |                                                          |
| ---------------------------- | -------------------------------------------------------- |
| **Build branch deployed**    | `release-5.1.8` (Jenkins deploy source)                  |
| **Tag**                      | `v5.1.8` (immutable marker + GitHub Release)             |
| **Baseline (previous prod)** | `v5.1.7`                                                 |
| **Commits**                  | 1 (non-merge), from `feature/bihar-staff-nurse-posting-level` |
| **Author**                   | Likhith Thammegowda                                      |

## Summary

Bihar's staff nurses work either at district level or at block level, and the registration form now asks which. A nurse first chooses **District** or **Block**. At district level they pick their district and see every institution in it (Sadar and Sub Divisional hospitals, Referral hospitals, CHCs, PHCs and APHCs). At block level they pick the district, then one of that district's blocks, and see only that block's institutions (Referral hospital, CHC, PHC). "Others" is still there for a facility that isn't listed. The NIN field is removed from this form, and the answer (district or block) is now stored with the registration.

## ✨ Features

- **Bihar Staff Nurse form** (`/bnrc/register?service=StaffNurse`) — new first question "आप ज़िले में पदस्थ हैं या ब्लॉक में? / Are you working at the district level or block level?" with **District** / **Block** (`e11c39d`).
  - **District:** district, then every institution of that district, grouped Sadar / Sub Divisional hospital, Referral hospital, CHC, PHC, APHC.
  - **Block:** "आप जिस ब्लॉक में काम करते हैं, वह किस ज़िले में आता है? / Which district does the block you work in belong to?", then "आप किस ब्लॉक में पदस्थ हैं? / Which block are you posted in?" (that district's blocks only), then that block's Referral hospital / CHC / PHC.
  - APHCs appear in the District list only: the APHC sheet has no block column.
  - All names are exactly as written in the Bihar health institutions list (no spelling is corrected), e.g. `PHC, MAHUA`, `SUB DIVISIONAL HOSPITAL, MARHAWRAH`; APHCs as institution and its PHC, e.g. `PATEGNA, ARARIA`. **Others** stays last, with the facility-name box.
  - The lists come from a new, separate S3 file, `bihar-staff-nurse-facilities.json` (38 districts, 556 blocks, 2,090 institutions). The CHO form's `bihar-district.json` is unchanged.
  - The answer is sent as `postingLevel` (`District` / `Block`); a district-level registration is sent with no block.

## 🐛 Fixes

- **Staff Nurse form — NIN removed** — NIN applies to AAM-SHCs (the CHO form) only, so it is no longer shown or sent for Staff Nurses (`e11c39d`).
- **Bihar registration form — required `*`** — the asterisk could wrap onto a line of its own under long bilingual labels; it now stays with the label's last word, on every required field of the form (`e11c39d`).

## 🏗️ Build / CI / Infra

- New S3 constant `S3_END_POINTS.biharStaffNurseFacilityUrl` → `https://aastar-app-assets.s3.ap-south-1.amazonaws.com/bihar-staff-nurse-facilities.json` (already uploaded and verified readable) (`e11c39d`).

## 📚 Docs / Chore

- `bnrc-register.component.spec.ts`: 65 tests (2 updated for the NIN change, 2 new for `postingLevel`) (`e11c39d`).
- Release notes for 5.1.8.

## ⚠️ Deploy notes & risk

- **Needs UI Proxy 6.0.6** (`release-6.0.6`, released): it accepts and stores `postingLevel`. On 6.0.5 a Staff Nurse registration from this release is rejected with `"postingLevel" is not allowed`. **Deploy UI Proxy 6.0.6 first, or together.**
- **Database column (DevOps, optional for the deploy):** `ALTER TABLE bnrc_registration_data_prod ADD COLUMN IF NOT EXISTS posting_level TEXT;` -- until it exists the value is kept on the user's profile only (UI Proxy 6.0.6 detects the column and starts writing it automatically).
- **Spellings as in the sheet:** names are not corrected (only the district Jahanabad is shown as Jehanabad). Where the sheet spells one block two ways, both appear in the Block list (18 pairs, e.g. JOKIHAAT / JOKIHATT), listed in `block-spelling-review.csv` for the Bihar team. Any correction only needs a new JSON upload, no release.
- **Other Bihar forms unchanged:** CHO, Student, Faculty, ANM, GNM send exactly the same requests as before (`postingLevel` is sent by the Staff Nurse form only).
- **Config / env / API changes:** none in this repo besides the S3 constant.
- **Risk:** low. Limited to the Bihar Staff Nurse registration page and the asterisk position on that form.

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] BNRC specs pass (65); `tsc` clean on the changed files
- [x] Checked on `localhost:4100` against the uploaded S3 file: District path (ARARIA → 43 institutions from SADAR HOSPITAL, ARARIA to the APHCs, then Others), Block path (ARARIA → 10 blocks → RANIGANJ → PHC, RANIGANJ / REFERRAL HOSPITAL, RANIGANJ / Others), NIN hidden, no page errors, no `*` alone on a line at 520px
- [ ] Production build passes (Jenkins)
- [ ] UI Proxy 6.0.6 deployed first or together
- [ ] Smoke test after deploy: register a test number once at District level and once at Block level; the profile shows the facility and `postingLevel`
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-5.1.7`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-5.1.8` (deploy is from a branch, not a tag).

**Rollback** — re-run the same manual Jenkins job against `release-5.1.7`. The Staff Nurse form goes back to the AAM-SHC list with NIN; UI Proxy 6.0.6 can stay.

---

_File naming: this file is `RELEASE_NOTES/release-5.1.8.md` — name matches the deploy branch._
