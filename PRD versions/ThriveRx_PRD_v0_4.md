# Product Requirements Document: ThriveRx

**Status:** Draft v0.4 (in progress — several sections still to be worked through)
**Owner:** Jerry
**Last updated:** 22 July 2026 (v0.4 — Section 2 grounded in treatment burden literature)

> **Note on this draft:** This version reflects a working session that revised the product's core framing (Summary, Problem Statement, Non-Goals, Goals, Target Users). Sections below marked **[CARRIED OVER — NOT YET REVIEWED]** are unchanged from the prior SproutScript draft and need to be revisited in light of the new direction, especially now that the plant-growth feature has moved into the MVP. Renaming SproutScript → ThriveRx has been applied throughout.

---

## 1. Summary

ThriveRx is a patient-companion app that helps people reliably understand and manage their medications, while easing the psychological burden of taking them.

The core loop — add a medication, get a clear plain-language explanation of what it is and does, see it organized alongside other medications, get reminded when it's time to take it — is the non-negotiable foundation the product is built on. Reliability of this loop matters more, at this stage, than any other feature.

Alongside that loop, a companion tree/plant grows as the patient engages with their medications. This is the feature that defines and differentiates ThriveRx: it offers a small, ongoing sense of encouragement through what can be a difficult daily routine, without gamifying or pressuring adherence. The plant-growth feature is part of the MVP, not deferred to a later phase — a demo without it doesn't show the product's actual differentiator.

Tracking of actual dose-taking (beyond reminding) is a low-priority, non-essential addition.

This is a portfolio/demonstration project, not a clinical product. It is explicitly not a diagnostic or treatment-recommendation tool.

---

## 2. Problem statement

Patients — particularly those managing complex or long-term regimens — experience real psychological burden around medication-taking, distinct from simply "not having the information." This is not a novel framing — it maps closely onto **treatment burden** (sometimes "medication-related burden"), an established concept in chronic disease literature, defined as the workload of healthcare and its impact on patient function and wellbeing. The literature specifically documents that treatment generates negative emotions, strains relationships, and affects identity, and that patients respond by either doing extra adaptive work or by non-adhering; it also links higher burden to lower treatment satisfaction, lower medication self-efficacy, and depression, particularly in polypharmacy and multimorbidity. Three specific components, mapped onto that literature:

- **Uncertainty** — not knowing what a medicine does, how it works, or what side effects to expect.
- **Loss of agency** — taking a medication because a doctor said to, not out of understanding or choice.
- **Reduced self-perception** — being recast as "a patient" every time a dose is taken, day after day, with no sense of progress — an endless grind rather than a path forward. This maps to the "identity" effects of treatment burden that the literature flags as under-researched relative to workload, and to the well-documented difficulty patients report in sustaining the same level of commitment over long periods.

ThriveRx addresses these three components differently:
- Plain-language, reliable medication information directly addresses **uncertainty**.
- The plant-growth mechanic is aimed at the **grind/self-perception** problem (a visible sense of progress instead of repetitive, invisible compliance), and is intended to somewhat restore a sense of **agency** — though this is a softer effect than its impact on the grind/self-perception problem, and is not assumed to resolve agency loss on its own.

This sits alongside — not instead of — the original reliability/provenance argument: general-purpose AI tools (ChatGPT, Google AI Overviews) are documented to be unreliable for health self-consultation, and this risk falls hardest on populations least equipped to catch an error.

**Target population for this problem:** CALD (culturally and linguistically diverse), low-health-literacy, polypharmacy, and neurocognitively impaired patients. These groups are not just more exposed to the information-reliability problem — they are also more likely to carry the psychological burden described above, given the added complexity and cognitive load polypharmacy and neurocognitive impairment introduce.

*(Note: the original PRD's detailed reliability statistics — hallucination rates, citation quality studies, etc. — still apply and should be retained/re-integrated here; this section now grounds the psychological framing in the treatment burden literature, but doesn't yet restate the original AI-reliability evidence in full.)*

---

## 3. Non-goals

- **No gamification.** No streaks, points, badges, or leaderboards.
- **No punishment mechanics.** The plant does not wilt, shrink, or otherwise degrade if a dose is missed.
- **No strong extrinsic incentives** for taking medication — the plant is psychological support, not a reward system designed to drive adherence.
- **No social or comparative features.** Patients do not see other patients' plants or compare growth.
- **No adherence-reporting to caregivers/clinicians via plant health** without the patient's explicit awareness and consent — a visibly-wilting (or thriving) plant that a caretaker can see is functionally a punishment/surveillance mechanism even if the patient doesn't feel it directly, and must not be introduced as a backdoor around the no-punishment principle.
- **No interaction-checking, personalised dosing, or clinical decision support** (carried over from original scoping) — the app displays general information only and defers interaction/suitability questions to a pharmacist or doctor.

---

## 4. Goals

1. Let a patient add a medication (via search or script scan) and receive a reliable, plain-language explanation of what it is, how it's usually taken, and relevant side effects/safety notes.
2. Let a patient see all their medications organized in one place.
3. Remind a patient when it's time to take a medication.
4. Grow a companion plant tied to the patient's day-to-day engagement with managing their health — reading a medicine's info, acknowledging a reminder, marking a dose taken are all just examples of the same underlying "engagement" signal, none singled out as the "real" one. This is a source of encouragement, explicitly not a performance or adherence-scoring mechanic.
5. Make clear, at all times, that this is general reference information, not personalised medical advice.
6. Support English, Mandarin, and Vietnamese as first-class languages for both content and UI, reflecting the CALD target population.
7. *(Low priority, not essential)* Let a patient log whether they actually took a dose.

---

## 5. Target users

| User | Need |
|---|---|
| CALD, low-health-literacy, polypharmacy, and neurocognitively impaired patients (primary) | Understand their medications in plain language, manage a (possibly complex) regimen, and feel supported rather than burdened by the daily routine of taking them |
| Carers (secondary/optional viewer role) | Some visibility into a patient's medications — exact scope and mechanics not yet decided; must not undermine the patient's agency or the no-surveillance-via-plant-health non-goal |
| Health/digital-health reviewers (application audience) | Assess this as a demonstration of product thinking and responsible scoping, not a real user of the product |

---

## 6. Scope — MVP, Stretch, Ambitious
**[DRAFTED BY CLAUDE — PLEASE REVIEW]**

### 6.1 MVP
- **Feature 1 — Medication lookup:** add a medicine by search; curated dataset of 10–15 common medicines; plain-language display (what it's for, how it's usually taken, common side effects, "check with your pharmacist if…" safety note).
- **Feature 2 — Script scanning:** camera capture of a printed script → OCR → text parsing → fuzzy-match against the Feature 1 dataset → auto-add to the medication list.
- **Indication handling:** simple picker for medicines with multiple common indications, with an honest "not sure" option.
- **Language support:** English, Mandarin, Vietnamese — full plain-language content and UI in all three.
- **Personal medication list:** add/remove, persisted per user.
- **Reminders:** scheduled notifications at the times a patient is meant to take each medication.
- **Plant-growth feature:** a companion plant that grows from a single unified "engagement" signal, logged whenever the patient does any of several possible actions around managing their health — viewing a medicine's info, acknowledging a reminder, or marking a dose taken. No single action type is the "real" one the plant depends on; any of them count equally. This resolves the Goal 4 / Goal 7 tension from the prior draft: it's not a dose-tracking feature with a side door, it's one lightweight interaction log with multiple possible triggers, most of which aren't dose-related at all. Growth is gradual and one-directional — no wilting, no reversal, no scoring, and no per-action-type breakdown shown back to the patient (that would reintroduce a compliance-checkbox feel).
- **Auth:** magic link, email-only.
- **Persistent, non-alarming safety disclaimer** shown at all times.

*Reasoning flag: this replaces the previous two-bullet split (plant-growth + minimal engagement signal) with one unified signal, per the working-session decision that the plant should grow from both information-engagement and medication-taking rather than treating them as separate mechanics. Worth double-checking whether "marking a dose taken" as one of several equal-weight triggers still gives the plant enough of a real signal to feel alive day-to-day once the early information-reading actions are used up — this was the original concern, and unifying the signal softens it but doesn't fully remove it.*

### 6.2 Stretch — after MVP
- Full dose-tracking/adherence history (beyond the unified engagement signal above).
- Carer secondary-viewer feature, once its scope is decided (open question, Section 10).
- Replace the curated demo dataset with content sourced from TGA-approved CMI documents, covering a larger medicine list.
- PBS streamlined-authority code matching to auto-populate indication from OCR'd scripts.
- Route translations through a certified medical translation process; add a review step before translated content is marked "reviewed."
- Multilingual search input (currently search only matches a medicine's native-language name).
- Printable/exportable medicines list.

### 6.3 Ambitious — real bets, not yet committed to
- Clinician-continuity view: a read-only view of what the app has told the patient, for a GP/pharmacist to build on — not a contraindication/interaction checker.
- Pilot at a real hospital or health service as a QI/innovation project.
- Integration with AMH/eTG via licensing or API.
- A larger language set informed by a real needs assessment of a specific population, rather than the EN/ZH/VI demo set.

---

## 7. Build decisions
**[DRAFTED BY CLAUDE — PLEASE REVIEW]**

| Decision | Choice | Why |
|---|---|---|
| Platform | iOS and Android via a cross-platform framework (React Native) | Camera access (script scan) and reminder-style push notifications both need native capability |
| Backend | Python (FastAPI) + Postgres/SQLite | Fast to build solo/two-person, clean typed API contracts for parallel work |
| Build order | Medication data core (Feature 1) built first, since Feature 2 (scan), reminders, and the plant-growth engagement signal all read from it. The plant-growth *mechanic itself* (growth stages, visuals, animation) is built in parallel against stubbed/mock engagement events, then wired to the real engagement signal once it exists — rather than being sequenced strictly last, as in the original plan. | Reverses the old "garden last" rationale, which assumed the garden was deferred; now that it's MVP, it needs to be developed alongside the core data work rather than after it, or it becomes the last thing built and the most likely to be rushed |
| Team | Two people, split by module: Person A owns the medication data core + reminders; Person B owns OCR/scanning + the plant-growth mechanic, building against stubbed engagement data until Person A's real events are ready | Keeps the parallel-build order above actually achievable |
| Auth | Magic link (email only, no password) | Removes password-storage risk; email is the only PII collected at signup |
| Data minimisation | No name, date of birth, or other identifying fields unless a feature requires it. Medication list, reminders, and engagement events stored under a pseudonymous internal user ID. | Serves de-identification; avoids retrofitting privacy later |

*Reasoning flag: the build-order and team-split rows are my reworking of the original rationale to fit the plant-in-MVP decision — worth double-checking against how your actual two-person split wants to work.*

---

## 8. Regulatory and safety considerations
**[DRAFTED BY CLAUDE — PLEASE REVIEW]**

- The TGA regulates software that provides individualised diagnostic or treatment recommendations as Software as a Medical Device (SaMD). ThriveRx is scoped to stay on the "general reference information + emotional/motivational support" side of that line: it never assesses whether something is safe or appropriate for a specific patient, and the plant-growth feature is emotional/motivational support, not a clinical intervention — it makes no claims about health outcomes and is not a substitute for adherence counselling.
- Reminders must stay general schedule-based prompts (e.g., "time to take your morning dose") and must not evolve into personalised recommendations about dose timing, frequency, or regimen changes — that would cross into clinical decision support.
- All medicine content must ultimately trace back to an approved source (TGA CMI) rather than model-generated or freehand text.
- Translated content carries real risk if inaccurate; no translated content should be presented as final/reviewed without an actual review step by a qualified medical translator.
- A permanent, prominent disclaimer (general information only, always confirm with a doctor or pharmacist) is a requirement, not a nice-to-have.
- The "no adherence-reporting via plant health without consent" non-goal (Section 3) is itself a safety/privacy consideration, not just a UX preference — it prevents the plant from becoming an unconsented clinical-monitoring signal.

*Reasoning flag: this carries the original regulatory boundary forward and explicitly checks it against the new psychological-support framing and reminders — the underlying TGA/SaMD facts haven't changed, but I've reworded the framing rather than just restating the old text.*

---

## 9. Success criteria (portfolio framing)
**[DRAFTED BY CLAUDE — PLEASE REVIEW]**

Since this is a demonstration project rather than a deployed product, "success" means:

- A working prototype that clearly communicates both halves of the product concept — reliable plain-language medication info, and the plant-growth psychological-support mechanic — to a non-technical reviewer in under a minute.
- The plant-growth mechanic visibly demonstrates the "no punishment, no gamification" design rule in action (e.g., a reviewer can see that a missed dose does not make the plant wilt or regress).
- A defensible, honest account of what's real (UI, interaction design, scoping decisions) versus illustrative (demo medicine dataset, self-translated content).
- A clear, explicit articulation of the regulatory boundary the product respects (Section 8) and why — itself a demonstration of judgement, not just a caveat.
- A one-paragraph "path to real deployment" note: sourcing CMI content properly, commissioning certified translation, deciding the carer-viewer feature's real scope, and (if pursued beyond portfolio use) a TGA regulatory scoping conversation.

## 10. Open questions

- Exact mechanics of the plant-growth feature (what actions cause growth, growth stages, visual design) — not yet defined.
- Exact scope of the carer's secondary/optional viewer role — explicitly deferred by the user ("I will decide on the details later").
- How the plant-growth feature avoids becoming a de facto adherence signal despite being non-punitive (e.g., does growth stall, or just grow more slowly, if doses are missed — and does "slower growth" still risk feeling like punishment?).
- Whether/how the original reliability-and-provenance evidence (hallucination rates, citation studies) gets re-integrated alongside the new psychological-burden problem statement.

## 11. Appendix: prior art referenced
**[DRAFTED BY CLAUDE — PLEASE REVIEW]**

- **NPS MedicineWise app and translated resources** — decommissioned Feb–May 2026 due to low usage/retention and a value proposition "not unique nor competitive." Reinforces why ThriveRx's differentiator needs to be the psychological-support angle, not tracking/reminders alone, which other apps already do.
- **TGA MedSearch app** — the TGA's own consumer CMI-lookup app, also decommissioned in 2026.
- **medsinfo.com.au** — live, free CMI/PI document repository; document-based, not plain-language, not multilingual.
- **healthdirect.gov.au medicines section** — live plain-English general health content; not a structured per-medicine lookup, not confirmed multilingual.
- **State health library translated brochures** (SA Health, WA Health, etc.) — real translated content, but static PDFs, narrow scope, not interactive.
- **Medisafe** — leading commercial medication reminder/adherence app; different core job (adherence tracking vs. psychological support/comprehension), interaction-checking paywalled. Adjacent, not a direct competitor — and a useful contrast now that ThriveRx includes reminders itself, since the plant-growth/psychological framing is what still separates the two.
- **Australian Medicines Handbook (AMH) / eTG** — the established clinician-facing drug reference; the reason ThriveRx deliberately avoids an in-house clinician interaction/contraindication tier.
- **PBS Schedule Data API** (data.pbs.gov.au) — public dataset mapping PBS streamlined-authority codes to indications; basis for the Stretch-tier indication-matching feature.
- **TGA Consumer Medicine Information (CMI) framework** — intended eventual content source (Stretch tier).
- **CALD consumer healthcare engagement research** — language as one of several inter-related access barriers, alongside health system navigation and trust in care.
- **Cognitive accessibility / plain-language design research** — simplified content built for cognitive/intellectual accessibility benefits multiple groups (elderly, low literacy, non-native speakers, neurocognitively impaired patients).
- **Gamification-for-adherence research** — evidence for both effectiveness (loss-aversion mechanics) and patient-reported risk ("perceived trivialization," discomfort with forced/coercive framing) — the direct basis for ThriveRx's "grows, never punishes, no gamification" non-goals (Section 3).

---

*Sections 6–9 and 11 have now been drafted based on the working session so far, marked [DRAFTED BY CLAUDE — PLEASE REVIEW] rather than presented as fully confirmed, since they extend beyond what you've explicitly stated into my own judgement calls. The reasoning flags within each section point to the specific inferences worth double-checking.*
