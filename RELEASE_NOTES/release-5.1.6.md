# Release 5.1.6 — 2026-11-13

|                              |                                                       |
| ---------------------------- | ----------------------------------------------------- |
| **Build branch deployed**    | `release-5.1.6` (Jenkins deploy source)               |
| **Tag**                      | `v5.1.6` (immutable marker + GitHub Release)          |
| **Baseline (previous prod)** | `v5.1.5`                                              |
| **Commits**                  | 1 (non-merge), from `feature/bihar-staff-nurse-form`  |
| **Author**                   | Likhith Thammegowda                                   |

## Summary

Bihar is launching registration for staff nurses, who sign up differently from CHOs. Until now, CHOs and staff nurses shared one form and picked their role on it. They now have separate forms. The CHO form is unchanged apart from the role question. The new Staff Nurse form asks for the "Name of Facility" from a list, and a nurse whose facility isn't listed can pick "Others" and type it in.

## ✨ Features

- **Bihar Staff Nurse form** — new link `/bnrc/register?service=StaffNurse`:
  - **Heading:** "E-kshamata Registration for Staff Nurses". There is no role question; the form registers the user as `Staff Nurses` (designation `Staff-Nurse-Bihar`, unchanged).
  - **Facility:** "Name of Facility / संस्थान का नाम" replaces the AAM-SHC question. It lists the facilities of the chosen block, with **Others** last.
  - **Others:** shows a required, English-only box for the facility name and removes the NIN requirement. The typed name is sent as `facilityName`, with `facilityNameOthers: 'Others'`, the same way the MP form saves it (`8e54362`).

## 🐛 Fixes

_None._

## 🔁 Changes

- **Bihar CHO form** (`/bnrc/register?service=CHO`) — the heading now reads "for CHO". The Role question ("CHO / Staff Nurses") is removed, and the form always registers the user as `CHO`. All other fields are unchanged (`8e54362`).

## 🏗️ Build / CI / Infra

_None._ No dependency, build or deploy-layout change.

## 📚 Docs / Chore

- `bnrc-register.component.spec.ts`: 63 tests (12 new) covering both forms, "Others" validation, and the request body (`8e54362`).
- Release notes for 5.1.6.

## ⚠️ Deploy notes & risk

- **Needs UI Proxy 6.0.5** (`release-6.0.5`, already released) for the "Others" choice. On 6.0.4 a Staff Nurse who picks "Others" gets `"facilityNameOthers" is not allowed`; listed facilities work on either version. Deploy UI Proxy 6.0.5 first or together.
- **Tell the Bihar team which link is which:** staff nurses must use `?service=StaffNurse`. Anyone using the old CHO link is now always registered as a CHO.
- **The facility list is the AAM-SHC list.** The Bihar data file (`bihar-district.json`) only holds AAM-SHC facilities. Staff nurses at a PHC, CHC or district hospital will use "Others". A staff-nurse facility list from the Bihar team can be added to that file, and the dropdown will use it.
- **Other Bihar forms unchanged:** Student, Faculty, ANM (`inservice`), GNM. A form-only field is stripped from every request, so their payloads are exactly as before.
- **Labels follow this form's existing style**, with bilingual English / Hindi text in the template, so there are no `en.json` / `hi.json` changes.
- **Config / env / API changes:** none in this repo.
- **Breaking changes:** the CHO link no longer registers staff nurses (see above).
- **Risk:** low. Limited to the Bihar CHO / Staff Nurse registration page.

## ✅ Pre-deploy checklist

- [x] Node 20 active (`nvs use 20`)
- [x] `yarn test`: 310 suites, 6,842 tests pass
- [x] Checked on `localhost:4100`: CHO form without the role question; Staff Nurse form with the facility list, Others and the typed-name box
- [ ] Production build passes (Jenkins)
- [ ] UI Proxy 6.0.5 deployed first or together
- [ ] Smoke test after deploy: register a test number on each form (CHO; Staff Nurse with a listed facility; Staff Nurse with "Others"), and check the profile's designation and facility
- [ ] Rollback ref confirmed (re-runnable in Jenkins): `release-5.1.5`

## Release & rollback

**Deploy** — a human runs the manual Jenkins job pointed at the **build branch** `release-5.1.6` (deploy is from a branch, not a tag).

**Rollback** — re-run the same manual Jenkins job against `release-5.1.5`. The shared "CHO / Staff Nurses" form returns, and the Staff Nurse link shows the ANM-style defaults; UI Proxy 6.0.5 can stay.

---

_File naming: this file is `RELEASE_NOTES/release-5.1.6.md` — name matches the deploy branch._
