# Product Requirements Document: SproutScript

**Status:** Draft v0.2
**Owner:** Jerry
**Last updated:** 22 July 2026

---

## 1. Summary

SproutScript is a plain-language, multilingual medicine information tool. A user adds a medicine — by searching for it, or by scanning a printed prescription — and receives a short, jargon-free explanation of what it's for, how it's usually taken, common side effects, and when to check with a pharmacist, in English, Mandarin, or Vietnamese (more languages planned later). Users can build a simple personal medicines list to keep track of what they take. A non-withering garden that grows through honest engagement, and caretaker visibility, are both committed features sequenced after the core experience is solid.

This is a portfolio/demonstration project, not a clinical product. It is explicitly **not** a diagnostic or treatment-recommendation tool.

---

## 2. Problem statement

**The honest starting point:** nothing stops a person from typing a medicine name into Google or ChatGPT, and most already do — roughly 48% of consumers now use generative AI for health-related questions. So the case for this tool cannot rest on "this information isn't available elsewhere," because increasingly it is. The case has to rest on something general-purpose AI search and chat tools are demonstrably bad at: **reliability and provenance**, specifically in a population least equipped to catch it when they're wrong.

**The reliability problem is documented, not speculative.** A 2026 scoping review comparing Google Search and ChatGPT for non-professional health self-consultation found hallucinations in an estimated 31–45% of references, opaque source provenance, and clearly actionable guidance in only around 40% of responses. A Guardian investigation into Google's AI Overviews for health queries found only 34% of citations came from reliable medical sources, with 65% of sources not designed to ensure medical accuracy at all. Comparative studies testing multiple chatbots (ChatGPT, Gemini, Copilot, Claude, Perplexity) against actual clinical practice guidelines found match rates as low as 33%, with researchers concluding the problem is fundamental to current generative AI technology, not specific to one vendor.

**This risk is not evenly distributed.** A health-literate, English-fluent user has some ability to notice when an AI answer sounds wrong. The target user for this tool — lower health literacy, not fluent in English, less familiar with navigating the Australian health system — has the least ability to catch a hallucinated, inconsistent, or mistranslated answer, and is relying on it in a second-language context where subtle errors are hardest to notice. Free, general-purpose AI tools are least trustworthy for exactly the population this product serves.

**Separately, there's a real access gap too**, though it's the secondary argument, not the primary one. NPS MedicineWise previously provided the closest equivalent to this tool — an app for tracking medicines and accessing Consumer Medicine Information (CMI), plus translated static resources (posters, fact sheets) developed with the Federation of Ethnic Communities' Councils of Australia — but the app and the broader service were decommissioned in February–May 2026, with resources archived and no confirmed like-for-like replacement. What existed even before the shutdown was mostly static, downloadable, topic-specific resources rather than an interactive, searchable, per-medicine lookup tool in multiple languages.

Research on CALD (culturally and linguistically diverse) consumers' healthcare experience identifies language as one of several inter-related barriers to safe, informed medicine use, alongside health system navigation and trust in care. This tool addresses the language/information-access and trust/provenance pieces specifically — it is not a solution to CALD health inequity as a whole, and this PRD does not claim that it is.

## 3. Competitive differentiation

| | SproutScript | Google / ChatGPT / general AI search |
|---|---|---|
| Source of content | Traceable to TGA-approved CMI documents | Generated per-query; sources often unclear or unreliable (only ~34% of Google AI Overview health citations from reliable medical sources) |
| Consistency | Same medicine returns the same reviewed answer every time | Documented high variability between queries and between chatbots for the same clinical question |
| Hallucination risk | None by design — content is fixed and reviewed, not generated live | Estimated 31–45% of references contain hallucinations in health self-consultation contexts |
| Translation handling | Explicit, visible flag on unreviewed translations; roadmap to certified medical translation | No visibility into translation reliability; errors presented with the same confidence as correct answers |
| Designed for | Low health literacy, non-native English speakers, first-time users | General population; assumes some ability to sanity-check or cross-reference answers |
| Scope discipline | Explicitly refuses to do interaction-checking or personalised recommendations, to stay out of SaMD territory and avoid the highest-harm failure mode | No inherent scope limit — will attempt interaction questions, dosing questions, anything asked, regardless of confidence |

The product thesis in one line: **general AI tools are fast and broad but unreliable in exactly the way that matters most for this population; this tool is narrow and slower to expand, but every answer is traceable to an approved source.** That trade is the whole point of the product.

---

## 4. Goals

- Let a user find plain-language information about a common medicine in their preferred language within a few seconds.
- Present information in a way that's genuinely understandable to someone without medical training — no unexplained jargon.
- Make clear, consistently, that this is general reference information, not personal medical advice.
- Let a user maintain a simple list of medicines they take, for their own reference (e.g., to show a pharmacist or take to an appointment).
- Produce a working, demoable prototype suitable for a portfolio, application material, or an internal pitch — not a production clinical tool.

## 5. Non-goals

- **Not** a drug interaction or contraindication checker. The tool does not assess combinations of medicines or personal suitability — it displays general information and defers interaction/suitability questions to a pharmacist or doctor.
- **Not** a diagnostic or dosing tool. It does not recommend doses, frequency changes, or treatment decisions.
- **Not** intended, in its current form, to be classified or marketed as Software as a Medical Device (SaMD) under TGA regulation. See Section 9.
- **Not** a replacement for professional medical translation services or interpreter-supported consultations.
- **Not** EMR-integrated or connected to any real patient record.

---

## 6. Build decisions (confirmed)

Locked in through direct scoping decisions, so they don't get re-litigated feature by feature:

| Decision | Choice | Why |
|---|---|---|
| Platform | Both iOS and Android via a cross-platform framework (Flutter or React Native) | Camera access (Feature 2) and reminder-style notifications need native capability; a web-only app can't do this well |
| Backend | Python (FastAPI) + Postgres/SQLite | Fast to build solo/two-person, clean typed API contracts for parallel work |
| Build order | Feature 1 (lookup) and Feature 2 (scan) first, end-to-end, before Feature 3 (garden) | Garden logic reads from the dose/medication data the first two features produce — building it first would mean building against fake data twice |
| Team | Two people, split by module (see Section 13 for the collaboration model) | Feature 1 (data core) and Feature 2 (OCR/scan) are independent enough to parallelise once the shared schema is agreed |
| Auth | Magic link (email only, no password) | Removes password-storage risk entirely; email is the only PII collected at signup |
| Data minimisation | No name, date of birth, or other identifying fields collected unless a specific feature requires it. Medication list and dose log stored under a pseudonymous internal user ID, not a real name. | Directly serves the de-identification principle — even though this is a demo/portfolio build using synthetic data, building the habit of minimal data collection now avoids retrofitting privacy later |

---

## 7. Target users

| User | Need |
|---|---|
| CALD patients/consumers | Understand a medicine they've been prescribed or bought, in their own language, without waiting for an appointment |
| Carers of CALD family members (e.g., adult children helping elderly parents) | Manage a relative's medicines list and understand what each one does |
| Health/digital-health reviewers (application audience) | Assess this as a demonstration of product thinking, systems awareness, and responsible scoping around a live regulatory/safety constraint |

---

## 8. Scope — MVP, Stretch, Ambitious

Feature scope is organised into three tiers so it's clear what's being built first, what's realistic next, and what's a genuine bet — and so scope creep into clinician clinical-decision-support territory (see Section 9) doesn't happen by accident.

### 8.1 MVP — the actual build target

- **Feature 1 — Medication lookup:** add a medicine by search; curated dataset of 10–15 common medicines; per-medicine plain-language display (what it's for, how it's usually taken, common side effects, "check with your pharmacist if…" safety note)
- **Feature 2 — Script scanning:** camera capture of a printed Victorian hospital script → OCR → text parsing → fuzzy-match against the Feature 1 dataset → auto-add to the medication list
- **Indication handling:** simple picker only — when a medicine has multiple common indications (e.g., an ACE inhibitor for blood pressure vs heart failure), the patient is asked to select which applies, with an honest "not sure" option that shows general, non-personalised content. No automated PBS-code matching yet.
- **Language support:** English, Mandarin, Vietnamese — full plain-language content and UI in all three, with the same demonstration-translation disclaimer as before
- **Personal medicines list:** add/remove, persisted per user (not just session-based, given accounts now exist via magic link)
- **Auth:** magic link, email-only signup, no other identifying fields collected
- **Persistent, non-alarming safety disclaimer** shown at all times
- **No garden/gamification and no caretaker linking in this phase** — both are committed for later, but deliberately sequenced after the core lookup-and-scan experience is solid, since both read from data this phase produces

### 8.2 Stretch — committed, sequenced after MVP

These are not hypothetical — they're already agreed as "definitely happening," just after the MVP is working end-to-end.

- **Garden/gamification (Feature 3):** non-withering garden that grows through logged engagement (dose taken, or honestly logged as missed with a reason) — see the design rules already established: never punishes, opt-in for adults, growth tied to honest engagement rather than perfect adherence
- **Caretaker linking:** pairing-code system connecting a caretaker's app instance to a patient's; scoped as comprehension-visibility (what the patient has been shown and logged) rather than adherence-tracking, to avoid recreating Medisafe's Medfriend feature and to preserve the honest missed-dose-reason data as the actual differentiator
- **PBS streamlined-authority code matching:** when Feature 2's OCR picks up a streamlined authority code on a script, resolve it against the free public PBS Schedule Data API to auto-populate the correct indication, falling back to the manual picker when no code is present
- Replace the hand-written demo dataset with content sourced from TGA-approved CMI documents, covering a much larger medicine list
- Route translations through a certified medical translation process rather than self-generated text; add a review step before any translated content is marked "reviewed"
- Multilingual *search input* (currently search only matches the medicine's native-language name)
- Printable/exportable medicines list

### 8.3 Ambitious — real bets, not yet committed to

Each of these changes what the product is, who reviews it, or what regulatory territory it's in.

- **Clinician-continuity view:** a read-only view showing a clinician what the patient's app has actually told them, so a GP or pharmacist can build on that instead of re-explaining from scratch. Deliberately *not* a contraindication or interaction checker.
- **Pilot at a real hospital or health service** as a QI/innovation project, using the prototype as the pitch artefact.
- **Integration with AMH/eTG via licensing or API**, rather than building a competing clinician-facing drug reference in-house.
- **A larger language set informed by an actual needs assessment** of a specific hospital's or region's CALD population, rather than the EN/ZH/VI demo set.

## 9. Explicitly out of scope (any version)

- Interaction checking between medicines
- Personalised dosing or suitability recommendations
- Any feature that could be read as clinical decision support for an individual patient

---

## 10. Regulatory and safety considerations

- The TGA regulates software that provides individualised diagnostic or treatment recommendations as Software as a Medical Device. This tool is scoped to stay clearly on the "general reference information" side of that line by design — it never says whether something is safe *for this user*, only what a medicine generally is and does.
- All medicine content must ultimately trace back to an approved source (TGA CMI) rather than model-generated or freehand-written text, to avoid introducing inaccuracies into medical content presented to laypeople.
- Translated content carries real risk if inaccurate — mistranslation of a safety-relevant term is a plausible harm vector, not a cosmetic one. No translated content should be presented as final/reviewed without an actual review step by a qualified medical translator.
- A permanent, prominent disclaimer is a requirement, not a nice-to-have: general information only, always confirm with a doctor or pharmacist.

---

## 11. Success criteria (portfolio framing)

Since this is a demonstration project rather than a deployed product, "success" means:

- A working, polished prototype that clearly communicates the product concept to a non-technical reviewer in under a minute
- A defensible, honest account of what's real (UI, interaction design, scoping decisions) versus illustrative (demo dataset, self-translated content)
- A clear, explicit articulation of the regulatory boundary this product respects and why — this is itself a demonstration of judgement, not just a caveat
- A one-paragraph "path to real deployment" note: sourcing CMI content properly, commissioning certified translation, and (if ever pursued beyond portfolio use) a TGA regulatory scoping conversation

---

## 12. Open questions

- Is this staying a portfolio piece, or is there appetite to pitch it as a QI/innovation project at a hospital or health service? (Affects how much further investment in data sourcing and translation review is worth making.)
- Which languages would actually be prioritised if this were built for a specific hospital's CALD population, rather than the demo set chosen here?
- Should the personal medicines list ever support export/sharing (e.g., a printable summary for a pharmacist), given the original MedicineWise app had this and it was a genuinely used feature?

---

## 13. Collaboration model (two-person build)

- **Split by module, not by feature-in-isolation:** Person A owns the medication data core (Feature 1 + shared database schema); Person B owns OCR/scanning (Feature 2) and, later, the garden UI (Feature 3), building against stubbed data until Person A's real endpoints are ready.
- **Shared repo on GitHub**, feature branches merged via pull request into `main`; GitHub Issues/Projects for task tracking — no separate PM tool needed at this scale.
- **The database schema is defined and agreed before either person builds feature logic against it**; changes to it are a conversation, not a unilateral edit, since both features depend on it.
- **Short, frequent syncs** (even 10 minutes every couple of days) rather than one large integration effort at the end.

## 14. Appendix: prior art referenced

- **NPS MedicineWise app and translated resources** — decommissioned Feb–May 2026. The Australian Commission on Safety and Quality in Health Care's own stated reason: low usage/retention and a value proposition "not unique nor competitive," since other apps already offered comparable or greater medication management functionality. Directly informs why SproutScript avoids competing on tracking/reminders (Section 3).
- **TGA MedSearch app** — the TGA's own consumer CMI-lookup app, also decommissioned in 2026, folded into website-based ARTG search. Reinforces the same trend as MedicineWise rather than being a one-off.
- **medsinfo.com.au** — live, free, up-to-date CMI/PI document repository; document-based, not plain-language, not multilingual, not an app.
- **healthdirect.gov.au medicines section** — live, plain-English general health content; not a structured per-medicine lookup, not confirmed multilingual.
- **State health library translated brochures** (SA Health, WA Health, etc.) — real translated content in a wide language set, but static PDFs, narrow scope (e.g., mental health medications only), not interactive.
- **Medisafe** — the leading commercial medication reminder/adherence app; different core job (adherence tracking vs comprehension), interaction-checking paywalled behind premium tier. Adjacent, not a direct competitor.
- **Australian Medicines Handbook (AMH) / eTG (Therapeutic Guidelines)** — the established clinician-facing drug reference standard; the reason SproutScript deliberately does not attempt a clinician contraindication/interaction tier in-house (Section 8.3).
- **PBS Schedule Data API** (data.pbs.gov.au) — public, free dataset mapping PBS streamlined-authority codes to approved indications; the basis for the Stretch-tier indication-matching feature (Section 8.2).
- **TGA Consumer Medicine Information (CMI) framework** — the intended eventual content source for medicine data (Stretch tier).
- **CALD consumer healthcare engagement research** — language as one of several inter-related access barriers, alongside health system navigation and trust in care.
- **Cognitive accessibility / plain-language design research** — evidence that simplified content built for cognitive/intellectual accessibility benefits multiple groups (elderly, low literacy, non-native speakers) through shared design choices, underpinning the Target Users framing in Section 7.
- **Gamification-for-adherence research** — evidence for both effectiveness (loss-aversion mechanics) and patient-reported risk ("perceived trivialization," discomfort with forced/coercive framing) — directly shaped the "grows, never punishes, opt-in" design rule for Feature 3.
