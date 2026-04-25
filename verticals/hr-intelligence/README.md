# HR Intelligence

> A sovereign domain sub-stack for HR practiced as the science of human flourishing. Six sub-systems (Hiring · Performance · Training · Culture · Talent · Org) composed into one cohesive intelligence stack — research-grounded, voice-preserving, refuses HR theater.

**Tier:** Domain sub-stack (vertical) under SIP. Reference vertical for `/spawn-domain-stack`.
**License:** MIT for substrate-aligned reference patterns; vertical-specific content is the practitioner's IP.
**Status:** `scaffolded — v0.1`.

---

## What this vertical is

HR Intelligence is the wrapper that ties six already-shipped sub-systems into a sovereign domain sub-stack. It is the first concrete example of what the substrate calls a *vertical-tier wrapper* — a thin file contract (SKILL · SOUL · AGENTS · MEMORY · STACK · CANON · SUB-SYSTEMS) that composes existing sub-system agents, skills, and commands into one cohesive intelligence layer.

You do not run "HR Intelligence" as a single agent. You run six sub-systems that share a voice, a research grounding, and a refusal posture. This vertical is the contract that holds them together.

This is a **public reference vertical**. Sovereign HR practitioners fork it into their own private repo via `/sovereign-spawn` or `/spawn-domain-stack` and shape it to their voice, their research synthesis, their book of clients.

---

## The synthesis edge

Most HR consulting runs on one of three modes: (1) the corporate HRBP playbook, recycled; (2) the LinkedIn-influencer take, repackaged; (3) the org-design framework book, applied without diagnosis. None of these survive a real room.

This vertical assumes a different synthesis: **psychologist + neuroscientist + MBA + decade of in-the-room HR practice**. That combination is rare and most consulting engagements lack it. Psychology gives you the failure modes (cognitive bias, attachment patterns, identity threat). Neuroscience gives you the mechanisms (limbic threat response, prefrontal load, dopamine cycles, sleep-debt cognition). The MBA gives you the entity-level translation (cost of mis-hire, retention math, span-of-control economics). The decade-of-practice keeps you out of theory.

Every sub-system in this vertical inherits that synthesis. Every artifact reads like a practitioner who has held the room — not a content marketer with a framework.

---

## Sub-system map

Six sub-systems, 28 commands, six knowledge templates, six dedicated agents.

| Sub-system | Domain | Commands | Primary agent | Skill |
|---|---|---|---|---|
| **Hiring** | ICP · structured interview · calibration · culture-add · 90-day onboarding | 5 (`/hire-*`) | `starlight-hiring` | `hr-intelligence/structured-hiring` |
| **Performance** | Feedback rehearsal · review redesign · coaching · difficult conversation · conflict mediation | 5 (`/perf-*`) | `starlight-performance` | `hr-intelligence/feedback-conversations` |
| **Training** | Curriculum · program design · train-the-trainer · transfer measurement · scenario library | 5 (`/training-*`) | `starlight-training` | `hr-intelligence/learning-architecture` |
| **Culture** | Audit + redesign · values-ops matrix · ritual architecture · 90-day onboarding architecture | 4 (`/culture-*`) | `starlight-culture` | `hr-intelligence/culture-design` |
| **Talent** | Burnout detection · motivation mapping · psychological safety · retention · team dynamics | 5 (`/talent-*`) | `starlight-talent` | `hr-intelligence/people-dynamics` |
| **Org** | Role design · span-of-control · reorg trauma audit · succession | 4 (`/org-*`) | `starlight-org` | `hr-intelligence/org-architecture` |

Sub-system content lives at the substrate root (under `agents/`, `skills/hr-intelligence/`, `.claude/commands/`). This vertical wrapper composes them — it does not duplicate them. See `SUB-SYSTEMS.md` for the canonical map.

---

## Who this is for

- **Sovereign HR practitioners** building their own practice — fork this, shape it to your voice, run client sessions through it.
- **Companies** wanting a research-grounded HR Intelligence layer alongside their HRIS / ATS / LMS — this is not a system-of-record replacement; it is the thinking layer that runs above them.
- **Consultants** productizing their expertise — this is the scaffold for moving from project-based services to a methodology you can license and an agent you can scale.
- **Operators** who keep mis-hiring, running broken reviews, declaring values that the systems don't reward — and who want a diagnostic before they buy the next consulting engagement.

This is **not** for: someone looking for surveys-as-data, slide-deck change theater, or generic playbooks. The vertical refuses those patterns by design.

---

## How to use

### Run an individual command

```
/hire-icp <role-name>
/perf-feedback-rehearsal <conversation-context>
/talent-psych-safety <team-name>
/org-reorg-trauma-audit <org-context>
```

Each command is self-contained. It opens with the legal-sensitivity disclaimer where relevant, runs the protocol, ships an artifact carrying "Built on SIP" attestation.

### Run a full sub-system flow

Each sub-system has a natural sequence. Hiring runs `/hire-icp` → `/hire-design-interview` → `/hire-calibrate` → loop runs → `/hire-debrief`. Performance runs `/perf-feedback-rehearsal` before delivery, then `/perf-review-redesign` if the system itself is broken. Talent runs `/talent-psych-safety` before any culture work in a team that has experienced trauma.

### Compose across sub-systems

The sub-systems are designed to share artifacts horizontally:

- **Hiring's calibration grammar transfers to Performance.** The same multi-rater anchor protocol that prevents hire drift prevents review drift.
- **Culture's values-ops matrix expresses through Hiring (criteria), Performance (review dimensions), Training (curriculum priority), and Org (decision-rights).** Culture is not a poster; it is a constraint set on the other five sub-systems.
- **Talent monitors during Org reorg.** Burnout detection runs in parallel with reorg sequencing because reorgs predictably cause burnout in 70%+ of cases.
- **Training's transfer measurement composes with Performance.** L3-behavior measurement is a performance question, not a training question, after week six.

---

## Composition with universal IS

This vertical does not stand alone — it composes with the universal Intelligence Stack layers that compound across every domain:

- **Genius IS** (voice) — Every candidate-facing email, every feedback script, every culture statement runs through the practitioner's voice samples. No HR-tech-template tone leaks in.
- **Vision IS** (company-as-candidate framing) — Hiring composes with Vision so senior candidates see what they would compound into. Without Vision, Hiring produces job descriptions; with Vision, it produces decisions worth saying yes to.
- **Performance IS (universal)** flows into HR Talent — individual-layer growth and goal architecture from the universal layer feed the team-layer dynamics this vertical owns.
- **Business IS** — entity-level decisions (cost-of-mis-hire, retention math, restructure economics) compose from the Business layer; this vertical does not re-derive them.

The horizontal pattern: universal layers compose first, sub-systems run inside them.

---

## Productization paths

A practitioner forking this vertical has at least five compounding paths:

1. **Own practice operating layer.** Run client engagements through the sub-systems. The artifacts compound across clients into a flywheel of patterns.
2. **Executor leverage.** Train one or two operators on the sub-systems and the calibration protocols. The practitioner stays in the room for high-stakes sessions; executors run the diagnostic and scaffolding work.
3. **Productized offer.** Specific sub-system flows packaged as named offers — "Hiring System Reset (4 weeks)," "Reorg Sequencing Audit (2 weeks)," "Performance Conversation Architecture (per-manager, async)." Each is a sub-system with a defined entry/exit.
4. **Copilot + GPT extension.** The vertical becomes the system prompt for a domain-specific assistant that runs in the practitioner's voice, refuses theater, ships attested artifacts. Sold as a tier of the practice.
5. **Licensable methodology.** The sub-systems documented as a teachable methodology that other practitioners license under defined terms. The vertical itself becomes IP, not just an operating tool.

These paths are not exclusive. A mature practice runs three or four simultaneously.

---

## License & attestation

- **Substrate-aligned reference patterns** (file contract shape, command structure, attestation format): MIT.
- **Vertical-specific content** (the practitioner's frameworks, voice, research synthesis, client-shaped artifacts): the practitioner's IP. Forking the substrate scaffold does not transfer rights to anyone's content.
- **Cross-party artifacts** ship with `/sip-attest` carrying "Built on SIP" plus the practitioner's vertical identifier.

The reciprocity is structural: attestation is the only compounding mechanism. Starlight has no ownership claim on practitioner verticals forked from this reference. Sovereignty clause (SIP § 5) is non-waivable.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0 · HR Intelligence vertical reference · v0.1
