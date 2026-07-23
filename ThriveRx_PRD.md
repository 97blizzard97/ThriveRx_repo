# Product Requirements Document: ThriveRx

**Status:** Draft v0.4
**Owner:** Jerry
**Last updated:** 23 July 2026

---

## 1. Summary

ThriveRx is a patient-companion app that helps people reliably understand and manage their medications, while easing the psychological burden of taking them.

The core loop — add a medication, get a clear plain-language explanation of what it is and does, see it organized alongside other medications, get reminded when it's time to take it — is the non-negotiable foundation the product is built on. Reliability of this loop matters more, at this stage, than any other feature.

Alongside that loop, a companion tree grows in a personal "world" as the patient engages with their medications. This is the feature that defines and differentiates ThriveRx: it offers a small, ongoing sense of encouragement through what can be a difficult daily routine, without gamifying or pressuring adherence. The tree-growing feature is part of the MVP, not deferred to a later phase — a demo without it doesn't show the product's actual differentiator.

Tracking of actual dose-taking history (beyond the daily engagement press that drives tree growth) is a low-priority, non-essential addition.

This is a portfolio/demonstration project, not a clinical product. It is explicitly not a diagnostic or treatment-recommendation tool.

---

## 2. Problem statement

Patients — particularly those managing complex or long-term regimens — experience real psychological burden around medication-taking, distinct from simply "not having the information." Three specific components:

- **Uncertainty** — not knowing what a medicine does, how it works, or what side effects to expect.
- **Loss of agency** — taking a medication because a doctor said to, not out of understanding or choice.
- **Reduced self-perception** — being recast as "a patient" every time a dose is taken, day after day, with no sense of progress — an endless grind rather than a path forward.

ThriveRx addresses these three components differently:
- Plain-language, reliable medication information directly addresses **uncertainty**.
- The tree-growing mechanic is aimed at the **grind/self-perception** problem (a visible sense of progress instead of repetitive, invisible compliance), and is intended to somewhat restore a sense of **agency** — though this is a softer effect than its impact on the grind/self-perception problem, and is not assumed to resolve agency loss on its own.

This sits alongside — not instead of — a reliability/provenance argument: general-purpose AI tools (ChatGPT, Google AI Overviews) are documented to be unreliable for health self-consultation, and this risk falls hardest on populations least equipped to catch an error. *(The original PRD's detailed reliability statistics — hallucination rates, citation quality studies — still apply and should be re-integrated here in full for the final version.)*

**Target population:** CALD (culturally and linguistically diverse), low-health-literacy, polypharmacy, and neurocognitively impaired patients. These groups are not just more exposed to the information-reliability problem — they are also more likely to carry the psychological burden described above, given the added complexity and cognitive load polypharmacy and neurocognitive impairment introduce.

---

## 3. Non-goals

- **No gamification.** No streaks, points, badges, or leaderboards.
- **No punishment mechanics.** A tree never shrinks, wilts, or is removed if a dose is missed — growth simply pauses and resumes.
- **No strong extrinsic incentives** for taking medication — the tree/world is psychological support, not a reward system designed to drive adherence.
- **No social or comparative features.** Patients do not see other patients' worlds or compare growth.
- **No adherence-reporting to caregivers/clinicians via tree/world state** without the patient's explicit awareness and consent — a visibly-thriving or stalled world that a caretaker can see is functionally a surveillance mechanism even if the patient doesn't feel it directly, and must not be introduced as a backdoor around the no-punishment principle.
- **No interaction-checking, personalised dosing, or clinical decision support** — the app displays general information only and defers interaction/suitability questions to a pharmacist or doctor.

---

## 4. Goals

1. Let a patient add a medication (via search or script scan) and receive a reliable, plain-language explanation of what it is, how it's usually taken, and relevant side effects/safety notes.
2. Let a patient see all their medications organized in one place.
3. Remind a patient when it's time to take a medication.
4. Grow a tree per medication, in a shared personal world, tied to the patient's daily engagement — as a source of encouragement, explicitly not a performance or adherence-scoring mechanic.
5. Make clear, at all times, that this is general reference information, not personalised medical advice.
6. Support English, Mandarin, and Vietnamese as first-class languages for both content and UI, reflecting the CALD target population.
7. *(Low priority, not essential)* Let a patient log/review whether they actually took a dose, beyond the daily engagement press.

---

## 5. Target users

| User | Need |
|---|---|
| CALD, low-health-literacy, polypharmacy, and neurocognitively impaired patients (primary) | Understand their medications in plain language, manage a (possibly complex) regimen, and feel supported rather than burdened by the daily routine of taking them |
| Carers (secondary, read-only viewer) | A read-only view of the patient's medication list and plain-language info (not the tree/world, not dose-taking status), paired to the patient's account only with the patient's explicit consent via a pairing code the patient shares |
| Health/digital-health reviewers (application audience) | Assess this as a demonstration of product thinking and responsible scoping, not a real user of the product |

---

## 6. User stories

1. As a patient starting a new medication, I want a plain-language explanation of what it does, so I don't feel anxious or uncertain about taking it.
2. As a patient managing several medications, I want them organized in one place, so I can see everything I'm taking at a glance.
3. As a patient, I want to be reminded when it's time to take a medication, so I don't rely on memory alone.
4. As a patient on a long-term medication, I want to see a tree grow the longer I engage with taking it, so the routine feels like progress rather than an endless grind.
5. As a patient managing several medications long-term, I want my world to grow richer over time, so my ongoing effort feels visible and worthwhile.
6. As a patient who misses a day, I want my tree's progress to simply pause (not shrink or reset), so I don't feel punished or discouraged from continuing.
7. As a carer, I want a read-only view of my family member's medications and their plain-language info, so I can understand what they're taking without needing to track their adherence.
8. As a non-English-fluent patient, I want the app's content in my own language, so I can actually understand it rather than guess.

---

## 7. Functional requirements

### 7.1 Medication data & information (core loop)
- Patient can add a medication via text search against a curated dataset, or via camera-scan of a printed script (OCR → parse → fuzzy-match → confirm).
- Each medication displays: what it's for, how it's usually taken, common side effects, and a "check with your pharmacist if…" safety note, in the patient's selected language (EN/ZH/VI).
- When a medication has multiple common indications, the patient selects which applies via a simple picker, with an honest "not sure" option showing general, non-personalised content.
- A persistent, non-alarming disclaimer ("general information only — always confirm with your doctor or pharmacist") is visible wherever medication content is shown.

### 7.2 Organization & reminders
- All added medications appear in a single, organized list.
- Patient can set a reminder schedule per medication (e.g., time(s) of day); the app sends a notification at the scheduled time.
- Reminders are general schedule prompts only — never personalised dosing/timing recommendations.

### 7.3 Tree-growing feature
- **One tree per medication.** Adding a medication creates a new tree in the patient's world.
- **Species is randomly assigned** per tree at creation, for a surprise factor.
- **Growth stages:** budding (first 2 weeks, with visible incremental changes during this period) → small tree → large tree (reaching full/largest size at 6 months of accumulated growth time).
- **Daily engagement press:** once per day, the patient can press a button confirming they've taken that medication. Pressing starts/continues a growth-time counter for that tree.
- **Missed day behavior:** if the patient does not press on a given day, that tree's growth-time counter pauses (does not advance) until the next press — but never reverses, shrinks, or resets. No visual punishment or degradation of any kind.
- **Past the maturity cap:** once a tree reaches its largest size, continued daily engagement no longer grows that tree further; instead, it triggers environmental changes around it — additional smaller trees appearing nearby, and the surrounding world/planet expanding to make room.
- **World framing:** all of a patient's trees exist together in a single "world" or "planet" view — a vibrant, energy-rich space that becomes more alive as more trees grow and mature. This is explicitly not a "garden" requiring upkeep — it's framed as something the patient is building, not maintaining.
- No leaderboard, comparison, streak counter, or numeric score is shown anywhere in this feature.

### 7.4 Carer view
- A patient can generate a pairing code to share with a carer.
- Once paired, the carer gets a read-only view limited to: the patient's medication list and each medication's plain-language info.
- The carer view explicitly excludes: the tree/world, daily engagement/press status, and any dose-taking history.

### 7.5 Language
- English, Mandarin, and Vietnamese are supported for all patient-facing content and UI in the MVP, with a visible flag on any content whose translation hasn't been through a certified medical-translation review (demo-translation disclaimer).

### 7.6 Auth & data
- Magic-link (email-only) signup, no password.
- No name, date of birth, or other identifying fields collected unless a specific feature requires it; medication list, reminders, and engagement data stored under a pseudonymous internal user ID.

---

## 8. Scope — MVP, Stretch, Ambitious

### 8.1 MVP
- Feature 1 — Medication lookup (search + curated 10–15 medicine dataset, plain-language display, per Section 7.1).
- Feature 2 — Script scanning (camera → OCR → fuzzy-match → auto-add, per Section 7.1).
- Indication picker (Section 7.1).
- Language support: English, Mandarin, Vietnamese (Section 7.5).
- Personal medication list, organized (Section 7.2).
- Reminders (Section 7.2).
- Tree-growing feature, full mechanic as specified in Section 7.3.
- Carer read-only view (Section 7.4).
- Magic-link auth, data minimisation (Section 7.6).
- Persistent safety disclaimer.

### 8.2 Stretch — after MVP
- Full dose-tracking/adherence history, beyond the daily engagement press.
- Replace the curated demo dataset with content sourced from TGA-approved CMI documents, covering a larger medicine list.
- PBS streamlined-authority code matching to auto-populate indication from OCR'd scripts.
- Route translations through a certified medical translation process; add a review step before translated content is marked "reviewed."
- Multilingual search input (currently search only matches a medicine's native-language name).
- Printable/exportable medicines list.
- Expanded carer features, if a real need emerges beyond the read-only view.

### 8.3 Ambitious — real bets, not yet committed to
- Clinician-continuity view: a read-only view of what the app has told the patient, for a GP/pharmacist to build on — not a contraindication/interaction checker.
- Pilot at a real hospital or health service as a QI/innovation project.
- Integration with AMH/eTG via licensing or API.
- A larger language set informed by a real needs assessment of a specific population, rather than the EN/ZH/VI demo set.

---

## 9. Build decisions

| Decision | Choice | Why |
|---|---|---|
| Platform | iOS and Android via a cross-platform framework (React Native) | Camera access (script scan) and reminder-style push notifications both need native capability |
| Backend | Python (FastAPI) + Postgres/SQLite | Fast to build solo/two-person, clean typed API contracts for parallel work |
| Build order | Medication data core built first (feeds reminders and the carer view); the tree-growing mechanic is built in parallel against stubbed/mock engagement events, then wired to the real daily-press signal once it exists | Both features are needed for the MVP demo, so neither can wait until the other is fully done — parallel development keeps both on track |
| Team | Two people, split by feature: one person owns the medical-information side (lookup, scan, reminders, carer view); the other owns the tree-growing feature (growth mechanic, world view) | Matches how the collaborators have actually agreed to split the work |
| Auth | Magic link (email only, no password) | Removes password-storage risk; email is the only PII collected at signup |
| Data minimisation | No name, date of birth, or other identifying fields unless a feature requires it. Medication list, reminders, and engagement events stored under a pseudonymous internal user ID. | Serves de-identification; avoids retrofitting privacy later |

---

## 10. Regulatory and safety considerations

- The TGA regulates software that provides individualised diagnostic or treatment recommendations as Software as a Medical Device (SaMD). ThriveRx is scoped to stay on the "general reference information + emotional/motivational support" side of that line: it never assesses whether something is safe or appropriate for a specific patient, and the tree-growing feature is emotional/motivational support, not a clinical intervention — it makes no claims about health outcomes and is not a substitute for adherence counselling.
- Reminders must stay general schedule-based prompts and must not evolve into personalised recommendations about dose timing, frequency, or regimen changes — that would cross into clinical decision support.
- All medicine content must ultimately trace back to an approved source (TGA CMI) rather than model-generated or freehand text.
- Translated content carries real risk if inaccurate; no translated content should be presented as final/reviewed without an actual review step by a qualified medical translator.
- A permanent, prominent disclaimer (general information only, always confirm with a doctor or pharmacist) is a requirement, not a nice-to-have.
- The "no adherence-reporting via tree/world state without consent" non-goal (Section 3) is itself a safety/privacy consideration — it prevents the tree feature from becoming an unconsented clinical-monitoring signal, including for the carer view (Section 7.4 explicitly excludes it).

---

## 11. Success criteria (portfolio framing)

Since this is a demonstration project rather than a deployed product, "success" means:

- A working prototype that clearly communicates both halves of the product concept — reliable plain-language medication info, and the tree-growing psychological-support mechanic — to a non-technical reviewer in under a minute.
- The tree-growing mechanic visibly demonstrates the "no punishment, no gamification" design rule in action (e.g., a reviewer can see that a missed day pauses, not reverses, a tree's progress).
- A defensible, honest account of what's real (UI, interaction design, scoping decisions) versus illustrative (demo medicine dataset, self-translated content).
- A clear, explicit articulation of the regulatory boundary the product respects (Section 10) and why — itself a demonstration of judgement, not just a caveat.
- A one-paragraph "path to real deployment" note: sourcing CMI content properly, commissioning certified translation, and (if pursued beyond portfolio use) a TGA regulatory scoping conversation.

---

## 12. Open questions

- Exact visual/animation details of the tree's budding sub-stages (deliberately left open for later, per the working session).
- Whether/how the full reliability-and-provenance evidence (hallucination rates, citation studies) gets re-integrated into Section 2 alongside the psychological-burden framing.
- Whether Stretch-tier carer features are ever needed, or the read-only view stays permanent.

---

## 13. Appendix: prior art referenced

- **NPS MedicineWise app and translated resources** — decommissioned Feb–May 2026 due to low usage/retention and a value proposition "not unique nor competitive." Reinforces why ThriveRx's differentiator needs to be the psychological-support angle, not tracking/reminders alone, which other apps already do.
- **TGA MedSearch app** — the TGA's own consumer CMI-lookup app, also decommissioned in 2026.
- **medsinfo.com.au** — live, free CMI/PI document repository; document-based, not plain-language, not multilingual.
- **healthdirect.gov.au medicines section** — live plain-English general health content; not a structured per-medicine lookup, not confirmed multilingual.
- **State health library translated brochures** (SA Health, WA Health, etc.) — real translated content, but static PDFs, narrow scope, not interactive.
- **Medisafe** — leading commercial medication reminder/adherence app; different core job (adherence tracking vs. psychological support/comprehension), interaction-checking paywalled. Adjacent, not a direct competitor — the tree-growing/psychological framing is what still separates ThriveRx from it, now that reminders are shared ground.
- **Australian Medicines Handbook (AMH) / eTG** — the established clinician-facing drug reference; the reason ThriveRx deliberately avoids an in-house clinician interaction/contraindication tier.
- **PBS Schedule Data API** (data.pbs.gov.au) — public dataset mapping PBS streamlined-authority codes to indications; basis for the Stretch-tier indication-matching feature.
- **TGA Consumer Medicine Information (CMI) framework** — intended eventual content source (Stretch tier).
- **CALD consumer healthcare engagement research** — language as one of several inter-related access barriers, alongside health system navigation and trust in care.
- **Cognitive accessibility / plain-language design research** — simplified content built for cognitive/intellectual accessibility benefits multiple groups (elderly, low literacy, non-native speakers, neurocognitively impaired patients).
- **Gamification-for-adherence research** — evidence for both effectiveness (loss-aversion mechanics) and patient-reported risk ("perceived trivialization," discomfort with forced/coercive framing) — the direct basis for ThriveRx's "grows, never punishes, no gamification" non-goals (Section 3).
