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

4. **Daily press** is owned by world routes (`POST .../daily-press`). Med core must not implement alternate “adherence” endpoints that duplicate scoring.

5. **No gamification in either module:** no streaks, points, badges, or leaderboards in API or UI.

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
| `Medicine` (catalog) | `id`, `names` (en/zh/vi), `content` per locale, `source_metadata` | Curated seed data only |
| `PatientMedication` | `id`, `user_id`, `medicine_id`, `indication_key`, `added_at` | User’s list item |
| `Reminder` | `id`, `patient_medication_id`, `times_local[]`, `timezone` | Schedule prompts only |
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
| GET | `/api/v1/medicines/{medicine_id}` | Detail + plain-language content |
| GET | `/api/v1/me/medications` | List patient meds |
| POST | `/api/v1/me/medications` | Add to list `{ medicine_id, indication_key? }` |
| DELETE | `/api/v1/me/medications/{patient_medication_id}` | Remove from list |
| POST | `/api/v1/scan/script` | `multipart/form-data` image → matches + confirm payload |
| GET | `/api/v1/me/reminders` | List reminders |
| PUT | `/api/v1/me/reminders/{patient_medication_id}` | Set schedule |
| POST | `/api/v1/me/carer/pairing-code` | Generate code for carer |
| GET | `/api/v1/carer/medications` | **Carer role:** read-only med list + info (**boundary**) |

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
| Patient adds med | Med core | Persist `PatientMedication`, then call `world_trees.create_tree_for_patient_medication(db, id)` |
| Daily press | World | `POST .../daily-press` only; updates growth per §2.6 |
| Carer list | Med core | `GET /carer/medications` — shape §2.1 only |

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
