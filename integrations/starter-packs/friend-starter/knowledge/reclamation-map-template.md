# Reclamation Map — Template

> Structure for organizing scattered professional material into a domain-based second brain. Source-first is the failure mode. Function-first is the answer.

## The core rule

Do not organize by where it came from (Employer A / Employer B / Project X). Organize by what it *does* (recruiting / training / onboarding / comp). Source is metadata. Function is structure.

## The five-part structure

1. **Source inventory** — where material currently lives, what shape it's in
2. **Functional domains** — what the material actually does, grouped by function
3. **Folder tree** — the proposed new home, domain-first
4. **Source-to-domain mapping** — a bridge table for every piece of material
5. **Outdated audit** — current / outdated-but-adaptable / obsolete, flagged explicitly

## Empty template

```
# Reclamation Map — <Person Name> — <YYYY-MM-DD>

## Source inventory
Where your material currently lives:
- **<Source 1 — e.g., Google Drive "Work Archive">** — <rough size/item count>, <format mix>, <date range>
- **<Source 2 — e.g., Canva "Old Projects" folder>** — ...
- **<Source 3 — e.g., Notion "HR" workspace>** — ...
- **<Source N>** — ...

## Functional domains (the new structure)
Your material clusters around these functions:
1. **<Domain 1 — e.g., Recruiting>** — <one line on what this domain covers>
2. **<Domain 2 — e.g., Onboarding>** — ...
3. **<Domain 3>** — ...
...

## Proposed folder tree
```
/second-brain/
├── 01-<domain-1>/
│   ├── frameworks/
│   ├── templates/
│   ├── case-examples/
│   └── outdated/
├── 02-<domain-2>/
│   ├── frameworks/
│   ├── templates/
│   └── ...
├── 03-<domain-3>/
│   └── ...
└── _inbox/  (for new material pending sort)
```

## Source-to-domain mapping
Every significant item in your corpus goes here:

| Original location | Item | New home | Status |
|-------------------|------|----------|--------|
| <source> | <filename or description> | <new path> | current / outdated / obsolete |
| <source> | <item> | <new path> | <status> |
| ... | ... | ... | ... |

## Outdated audit summary
- **Current** — <count>: use as-is, transferable
- **Outdated but adaptable** — <count>: framework sound, surface details need refresh (vocabulary, tool names, dates, examples)
- **Obsolete** — <count>: reference only, build fresh from the framework rather than recycle

## What's next
<ONE named next move. Examples: "Hand this map to your executor along with the Executor Playbook — they'll run the actual file migration." Or: "Before migrating, let's deepen one domain — your recruiting folder has 47 items and needs a sub-pass.">

---
Built on SIP v1.1.0 · Generated <ISO date>
---
```

## Filled example — Ana (HR Psychologist across 3 past employers)

```
# Reclamation Map — Ana Morales — 2026-04-24

## Source inventory
Where your material currently lives:
- **Google Drive "Company-A Work"** — ~180 items, mix of Docs/Slides/PDFs, 2019–2022
- **Google Drive "Company-B Consulting"** — ~90 items, heavy on Slides and case studies, 2022–2024
- **Canva "Old Projects"** — ~40 decks, visual-heavy, 2020–2025
- **Notion "HR Playbooks"** — ~60 pages, your current working space, 2024–2026
- **Local Documents/HR-Archive** — scattered screenshots, candidate scorecards, ~70 items, 2021–2026
- **Substack drafts folder** — 14 drafts, 2025–2026

## Functional domains (the new structure)
Your material clusters around seven functions:
1. **Recruiting** — intake rubrics, interview frameworks, candidate scoring, job specs
2. **Onboarding** — day-0 through day-90 frameworks, manager handoff guides
3. **Performance management** — review cycles, calibration docs, coaching frames
4. **Compensation** — comp-conversation SOPs, band design, equity primers
5. **Culture & engagement** — audit frameworks, engagement surveys, culture decks
6. **Training & development** — manager training decks, IC development frames
7. **Offboarding & exit** — exit-interview rubrics, alumni-network frames

## Proposed folder tree
```
/second-brain/
├── 01-recruiting/
│   ├── frameworks/  (Attachment-aware Recruiting, Silent Authorization Map)
│   ├── templates/   (job specs, interview rubrics, scorecards)
│   ├── case-examples/  (sanitized — past hires with lessons)
│   └── outdated/    (old rubrics, 2019 comp bands, Company-A specifics)
├── 02-onboarding/
│   ├── frameworks/
│   ├── templates/
│   └── outdated/
├── 03-performance-management/
│   ├── frameworks/  (Performance Reviews as Clinical Intake)
│   ├── templates/
│   └── outdated/
├── 04-compensation/
│   ├── frameworks/  (Trapdoor Compensation Conversations)
│   ├── templates/
│   └── outdated/
├── 05-culture-engagement/
│   ├── frameworks/  (The Culture Audit You Can't Unsee)
│   ├── templates/
│   └── outdated/
├── 06-training-development/
├── 07-offboarding-exit/
└── _inbox/
```

## Source-to-domain mapping (abbreviated — full mapping in Ana's live doc)

| Original location | Item | New home | Status |
|-------------------|------|----------|--------|
| GDrive "Company-A Work" | 2022 performance review framework | 03-performance-management/frameworks/ | outdated but adaptable |
| GDrive "Company-A Work" | 2019 comp bands spreadsheet | 04-compensation/outdated/ | obsolete (reference only) |
| GDrive "Company-B Consulting" | Attachment-aware interview rubric | 01-recruiting/frameworks/ | current |
| Canva "Old Projects" | Exec onboarding deck 2024 | 02-onboarding/templates/ | outdated but adaptable |
| Notion "HR Playbooks" | 2026 comp-season SOP | 04-compensation/templates/ | current |
| Local/HR-Archive | Candidate scorecard screenshots Q1 2026 | 01-recruiting/case-examples/ | current |
| Substack drafts folder | "The Culture Doesn't Lie" draft | _creator/drafts/ (separate tree) | current |

## Outdated audit summary
- **Current** — 112 items: transferable as-is
- **Outdated but adaptable** — 98 items: frameworks sound, surface details need refresh before an executor uses them
- **Obsolete** — 87 items: reference only. Your frameworks survived the employer changes; the artifacts did not.

Past-employer flag: 83 items tagged "Company-A-specific" or "Company-B-specific." Frameworks transfer; proprietary examples do not. Your executor learns the framework from the SOP, not the specific artifact.

## What's next
Hand this map to the executor from your Executor Playbook. They'll run the actual file migration domain by domain over Week 2 and Week 3, and flag back to you anything that doesn't fit a stated domain. You stay out of the migration itself — that is DELEGATE work, not KEEP work.

---
Built on SIP v1.1.0 · Generated 2026-04-24
---
```

## Rules for Starlight when building a Reclamation Map

- **Never leave a source unmapped.** Every source the user names gets an entry in Source inventory, even if you don't have item-level detail yet.
- **Never organize by employer or client.** That's the shape they arrived with; it's the shape that's trapping them. Function-first, always.
- **Domains emerge from the corpus, not from a template.** If they work in something other than HR, the domains will be different. Do not impose HR's seven.
- **Outdated audit is non-optional.** Flagging decay is core value. Without it, the executor inherits silent landmines.
- **_inbox/ folder always exists.** Life keeps arriving. A system with no inbox becomes rigid; material piles up outside it.
- **Past-employer IP gets flagged explicitly.** Framework transfers; proprietary specifics do not. Protect the person from accidental misuse of former-employer material.
