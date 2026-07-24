# ThriveRx — Schema & API contract (MVP)

**Status:** Schema and API **agreed by both collaborators** (baseline for MVP).  
**Source of truth for types:** `backend/app/schemas/` (Pydantic). Mobile should mirror these shapes in TypeScript as endpoints are built.

**Product spec:** `ThriveRx_PRD.md`

---

## 1. Ownership (who builds what)

| Area | Collaborator | Backend | Mobile |
|------|--------------|---------|--------|
| Medication lookup, script scan, personal med list, reminders, carer read-only | **Med core** | `routers/medicines.py`, `scan.py`, `reminders.py`, `carer.py` + matching `services/` | `mobile/src/features/medications/` |
| Trees, world view, daily engagement press | **World / trees** | `routers/world.py` + `services/world_trees.py` | `mobile/src/features/world/` |
| Auth, disclaimer, API client, app shell | **Shared** (coordinate on PRs) | `routers/auth.py` (when added) | `mobile/src/features/shared/` |

---

## 2. Hard boundaries (do not cross)

These protect privacy, PRD non-goals, and parallel development.

1. **Carer API and UI** may expose only: patient medication list + plain-language catalog content (same fields as the patient sees for each med).  
   **Must never expose:** tree/world state, daily-press status, growth time, engagement history, dose logs, or any adherence signal.

2. **World/trees code** must not add fields to carer responses or shared “patient summary” DTOs used by carers.

3. **Med core** owns creating/removing `PatientMedication` rows. **World** owns `Tree` rows but **creates a tree when notified** that a patient medication exists (via service call or shared hook after POST `/me/medications` — implement once, document in PR).

4. **Daily press** is owned by world (`record_daily_press` / `POST .../daily-press`). Med core may **call** that service when today’s slots for a med are all **Taken** — it must not invent a second scoring/adherence API. Skip does not grow and does not punish.

5. **No gamification in either module:** no streaks, points, badges, or leaderboards in API or UI. Dose check-off is schedule UX only.

6. **Tree growth rules (API must enforce):** one press per medication per calendar day; missed days pause accumulated growth time only — never decrease, reset, or “punish” in responses.

7. **Schema changes** (`backend/app/models/`, shared enums): **both collaborators agree before merge** — ping each other on PRs that touch these paths.

---

## 3. Data model (logical schema)

Pseudonymous `user_id` on all patient-owned rows. Email only for magic-link auth.

### Shared / auth

| Entity | Key fields | Notes |
|--------|------------|--------|
| `User` | `id`, `email`, `created_at` | No name/DOB in MVP |
| `Session` | `token`, `user_id`, `expires_at` | Backend-only |

### Med core

| Entity | Key fields | Notes |
|--------|------------|--------|
| `Medicine` (catalog) | `id`, `names` (en/zh/vi), `content` per locale, `source_metadata`, `common_strengths[]?` (`amount`, `unit`) | Curated seed data only; strengths are illustrative AU pack chips, not dosing advice |
| `PatientMedication` | `id`, `user_id`, `medicine_id`, `indication_key`, `form`, `dose_amount`, `dose_unit`, `frequency_code`, `with_food?`, `added_at` | User’s list item; `form`: tablet\|capsule\|liquid\|inhaler; `frequency_code`: od\|bd\|tds\|qds\|mane\|nocte; `dose_unit`: mg\|g\|mL\|mcg\|puff |
| `Reminder` | `id`, `patient_medication_id`, `times_local[]`, `timezone` | Schedule prompts only; created on add with defaults from `frequency_code`; custom times via PUT |
| `DoseEvent` | `id`, `patient_medication_id`, `local_date`, `time_local`, `status` (`taken`\|`skipped`), `recorded_at` | Unique `(patient_medication_id, local_date, time_local)`; schedule UX only — **not** adherence scoring |
| `CarerLink` | `id`, `patient_user_id`, `carer_user_id`, `created_at` | After pairing |
| `PairingCode` | `code`, `patient_user_id`, `expires_at` | Short-lived |

### World / trees

| Entity | Key fields | Notes |
|--------|------------|--------|
| `Tree` | `id`, `patient_medication_id`, `species_key`, `growth_stage`, `accumulated_growth_days`, `last_press_date` | One tree per patient med |
| `WorldSnapshot` | derived | Aggregated view for planet UI (not stored as source of truth in MVP) |

**Growth stages (enum):** `budding` → `small` → `large` → `mature` (mature at ~6 months accumulated growth time; PRD §7.3).

**`accumulated_growth_days`:** counts days with a valid daily press only; pauses when a day has no press — never decreases.

---

## 4. HTTP API (MVP contract)

Prefix: `/api/v1` (all new routes). Legacy `/health` stays unprefixed for ops.

Auth: `Authorization: Bearer <session_token>` unless noted. Stubs may skip auth until magic-link lands.

### Med core — Collaborator 1

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/medicines/search?q=` | Search curated catalog |
| GET | `/api/v1/medicines/{medicine_id}` | Detail + plain-language content + `common_strengths` |
| GET | `/api/v1/me/medications` | List patient meds (includes form/dose/frequency/with_food + `times_local` from Reminder) |
| POST | `/api/v1/me/medications` | Add to list `{ medicine_id, form, dose_amount, dose_unit, frequency_code, with_food?, indication_key? }` — also creates `Reminder` with default `times_local` from frequency and a world tree |
| PATCH | `/api/v1/me/medications/{patient_medication_id}` | Update dosing `{ form, dose_amount, dose_unit, frequency_code, with_food? }` — if `frequency_code` changes, **reset** Reminder `times_local` to the default mapping |
| DELETE | `/api/v1/me/medications/{patient_medication_id}` | Remove from list (cascades related tree + reminder + dose events) |
| POST | `/api/v1/scan/script` | `multipart/form-data` image → matches + confirm payload |
| GET | `/api/v1/me/reminders` | List reminders |
| PUT | `/api/v1/me/reminders/{patient_medication_id}` | Set custom `times_local` (schedule prompts only) |
| GET | `/api/v1/me/doses/today` | Per med: today’s slots from Reminder × DoseEvent statuses + medicine display name; `can_grow_today` soft hint only |
| PUT | `/api/v1/me/doses/{patient_medication_id}` | Mark today’s slot `{ time_local, status: taken\|skipped }`; when **all** slots are **Taken**, calls `world_trees.record_daily_press` (idempotent) |
| POST | `/api/v1/me/carer/pairing-code` | Generate code for carer |
| GET | `/api/v1/carer/medications` | **Carer role:** read-only med list + info (**boundary** — no dose logs, press, or trees) |

**Default reminder times on add** (schedule prompts only, not clinical advice):

| `frequency_code` | Default `times_local` |
|------------------|------------------------|
| `od` / `mane` | `["08:00"]` |
| `nocte` | `["21:00"]` |
| `bd` | `["08:00","20:00"]` |
| `tds` | `["08:00","14:00","20:00"]` |
| `qds` | `["08:00","12:00","16:00","20:00"]` |

### World / trees — Collaborator 2

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/me/world` | Planet/world summary + tree placements |
| GET | `/api/v1/me/trees` | All trees for user |
| GET | `/api/v1/me/trees/{patient_medication_id}` | Single tree state |
| POST | `/api/v1/me/trees/{patient_medication_id}/daily-press` | Once per day per med; returns updated tree |

### Shared (later)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/auth/magic-link/request` | `{ email }` |
| POST | `/api/v1/auth/magic-link/verify` | `{ token }` → session |

---

## 5. Git workflow & PR coordination

### Roles

| Role | Responsibility |
|------|----------------|
| **Med core** | Owns med routes/services + mobile `features/medications/`; **opens the first shared DB PR** (`shared/db-models-v1`). |
| **World / trees** | Owns world routes/services + mobile `features/world/`; reviews med PRs that touch the **tree creation hook** or shared schema. |
| **Both** | Required review before merge on `backend/app/models/`, `backend/app/schemas/`, this doc, and Alembic migrations. |

### GitHub — do you need to “connect” both accounts?

**No** — not in Cursor or one shared login.

- Each collaborator uses **their own** GitHub account to clone, push, and open PRs on the same remote repo.
- Repo **admin** (whoever owns the GitHub repo) sets **branch protection** on `main` once: require PR, optional required reviewers (see below).
- **Optional:** fill in GitHub usernames in `.github/CODEOWNERS` so GitHub auto-requests the right reviewer. Replace `@REPLACE_MED_CORE` and `@REPLACE_WORLD` with real `@handles`.
- Cursor/Git credentials on each machine are **per developer**; no need to link both accounts to one IDE session.

### Branch rules

- **`main`** — always runnable: backend `pytest` + `ruff`, mobile `tsc --noEmit`.
- **No direct pushes to `main`** — merge via pull request only.
- **Branch names:** `feature/med-…`, `feature/world-…`, `shared/db-…` (shared = both must review).

### PR size & order

1. **`shared/db-models-v1`** (med core author) — Alembic + SQLAlchemy models from §3; first migration; wire GET list/world stubs to DB where easy.
2. Med core: seed catalog → search/detail → POST `/me/medications` + **tree hook** → reminders → scan → carer.
3. World: tree logic + daily press + world UI on real IDs.
4. **Shared PR:** magic-link auth; remove `UUID(int=0)` stubs on `/me/` and `/carer/`.

Use **stub routers** until each slice is implemented; responses must match Pydantic schemas in this repo.

### Author checklist (every PR)

- [ ] `cd backend && python -m uv run pytest && python -m uv run ruff check .`
- [ ] If mobile changed: `cd mobile && pnpm exec tsc --noEmit`
- [ ] API or schema change → update **this doc** and `backend/app/schemas/` in the **same PR**
- [ ] PR description: what changed + how to test (2–3 bullets)

### Reviewer checklist

- [ ] Matches §3–§4 and **§2 boundaries** (carer: no tree/press/adherence)
- [ ] Tree growth: pause only, never punish (§2.6)
- [ ] No secrets in code; no LLM-generated medicine copy
- [ ] If `models/` or migrations changed: other collaborator **approves** before merge

### Integration points (single owners)

| Event | Owner | Action |
|-------|--------|--------|
| Patient adds med | Med core | Persist `PatientMedication` (form/dose/frequency), create `Reminder` with default times from `frequency_code`, then call `world_trees.create_tree_for_patient_medication(db, id)` |
| Patient updates med dosing | Med core | PATCH fields; if `frequency_code` changes, reset Reminder `times_local` via the same default mapping as add |
| Patient sets custom times | Med core | `PUT /me/reminders/{id}` (after add/edit sheet); does not score adherence |
| Patient marks today’s slot Taken/Skip | Med core | `PUT /me/doses/{id}`; Skip never grows or punishes; all **Taken** → `world_trees.record_daily_press` |
| Patient removes med | Med core | DELETE patient med and related tree + reminder + dose events |
| Daily press | World | `POST .../daily-press` and/or service call from med core on all-Taken; updates growth per §2.6; **no points** |
| Carer list | Med core | `GET /carer/medications` — shape §2.1 only (never dose events) |

### Local database

```bash
cd backend
python -m uv run alembic upgrade head
```

Creates/updates SQLite `thriverx.db` (or DB from `DATABASE_URL`).

---

## 6. Open items (fill in as you go)

- [ ] Magic-link email provider (dev: log link to console?)
- [ ] OCR provider for script scan (backend-only API key)
- [ ] Exact budding sub-stages (PRD open question) — UI-only until decided
- [ ] TypeScript types: generate from OpenAPI (`/openapi.json`) or hand-maintain `mobile/src/lib/api-types.ts`

---

## 7. Changelog

| Date | Change |
|------|--------|
| 2026-07-23 | Initial agreed contract for MVP parallel build |
| 2026-07-23 | Schema agreed; Git/PR workflow (§5); med core drives first DB PR |
| 2026-07-24 | SQLAlchemy models + Alembic; tree hook on POST `/me/medications` |
| 2026-07-24 | PatientMedication dosing fields + Medicine.common_strengths; reminder defaults on add; Search / My list / World tabs |
| 2026-07-24 | PATCH `/me/medications/{id}` for dosing edits; DELETE cascades tree + reminder; My list edit/remove UI |
| 2026-07-24 | `DoseEvent` + `/me/doses/today` + mark slot; all-Taken → daily-press (no points); custom times via reminders PUT; list includes `times_local` |
