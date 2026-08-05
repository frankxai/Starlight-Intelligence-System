# Community Platform Portfolio Strategy

**Status:** Proposed canonical portfolio decision  
**Date:** 2026-07-29  
**Decision owner:** FrankX / Starlight Intelligence System  
**Canonical operating-model companion:** [`starlight-communities-operating-system.md`](./starlight-communities-operating-system.md)

---

## 1. Executive Decision

The portfolio will not standardize every brand onto one community SaaS.

It will standardize the **community control plane** and allow each brand to use the surface that best matches its social physics.

### One control plane

Starlight Community OS owns:

- canonical member identity and consent
- entitlements and product access
- member profile and trajectory memory
- creation cells, quests, commitments, artifacts, and reflections
- event history and idempotent integration state
- agent governance, quality gates, and evaluation
- platform adapters and migration contracts

### Multiple replaceable surfaces

| Community | Primary surface | Owned product layer | Supporting surface | Decision |
|---|---|---|---|---|
| **GenCreator** | **Skool Pro** | `gencreator.ai` member shell, CreatorPacks, diagnostics, workspace, entitlements | Vibeclubs for live build rituals | Keep the accepted Skool/custom hybrid. Ship it rather than reopening the platform decision. |
| **AI Music Academy** | **A guild inside GenCreator first** | `ai-music-academy` workbench consuming Starlight Music IS | Vibeclubs listening/build rooms; Discord only when real-time density exists | Do not launch a second empty community. Spin out to Skool only after six weeks of independent music activity and retention. |
| **Arcanea** | **Arcanea-native on Vercel** | Realms, Gates, Luminors, creations, lore graph, profiles, guild progression | Discourse for durable public lore/discussion; Discord as optional real-time guild tavern | Do not flatten Arcanea into a generic course community. Build only the differentiated social objects; borrow forum/chat infrastructure. |
| **Starlight Intelligence Academy** | **Owned academy on Vercel + Discourse** | labs, competencies, evidence, architecture portfolios, credentials, agent memory | Circle only for premium enterprise cohorts; Moodle only when formal competency/badge administration becomes necessary | The product is sovereign intelligence mastery and evidence, not a feed. Keep the durable public protocol network open and agent-readable. |

### Portfolio rule

> **Buy commodity community interaction. Build differentiated identity, progress, evidence, and intelligence.**

Skool, Circle, Discourse, Discord, Moodle, and future surfaces remain adapters. None becomes the canonical relationship graph.

---

## 2. Decisions This Document Preserves and Supersedes

### Preserved

1. **GenCreator ADR-001 remains valid.** Free and paid community delivery stays on Skool; the differentiated Studio/member shell stays custom.
2. **Supabase remains canonical for GenCreator members and entitlements.** Skool, Whop, and Stripe are sync sources.
3. **CreatorPack remains the GenCreator product unit.** A cohort is a learning instrument, not the business model.
4. **Vibeclubs remains a format, not a community platform.** It supplies live creation rituals without owning identity, billing, or scheduling.
5. **Starlight Communities Operating System remains the canonical operating model.** The product is the weekly creation loop and member memory, not chat volume.

### Superseded

1. The March 2026 FrankX **Discord-first Creator Club blueprint** is historical source material, not current strategy.
2. The FrankX `community-fabric-orchestrator` must stop treating Skool, Circle, and Discord as equivalent destinations. It routes through a platform policy and adapter registry.
3. The FrankX admin community page must stop assuming Discord-specific metrics and tier names. It becomes a portfolio console reading canonical data.
4. AI Music Academy's Kubernetes/multi-cloud concept is not the near-term implementation architecture. The current application is a lightweight Next.js shell and should converge on the existing Supabase, Vercel, Starlight, and Vibeclubs estate.
5. No new standalone community is launched merely because a domain has curriculum, a repository, or a brand name.

---

## 3. Why One Platform Is the Wrong Abstraction

The four communities have different core objects:

| Brand | Member identity | Primary proof object | Social rhythm | What must be native |
|---|---|---|---|---|
| GenCreator | AI-native creator/operator | approved CreatorPack or shipped creator asset | weekly build sprint | diagnostics, workspace, packs, approvals, entitlement-aware delivery |
| AI Music Academy | musician/producer/artist persona | song, arrangement, mix, release, performance | challenges, critiques, listening rooms | music workbench, song lineage, feedback, rights/release state |
| Arcanea | creator, character, guild, realm citizen | lore, character, artwork, music, story, world contribution | quests, guilds, canon events, collaborative creation | realms, Gates, Luminors, canon, creation graph, progression |
| Starlight Academy | intelligence architect/operator | attested architecture, lab evidence, evaluated system | labs, reviews, protocol discussions, professional cells | competency graph, portfolio evidence, evals, credentials, sovereign memory |

A single generic feed cannot express all four without becoming a lowest-common-denominator product.

The correct common abstraction is not a UI. It is a **community event and evidence protocol**.

---

## 4. Platform Evaluation

### 4.1 Skool

**Use when:** the goal is fast activation around one commercial promise, a simple curriculum, events, gamification, and low operator complexity.

**Strengths**

- fast launch and low administration burden
- courses, events, discussions, payments, leaderboards, and level unlocks in one opinionated product
- strong fit for creator education, challenges, and paid transformation communities
- simple enough that community ritual receives more attention than software configuration

**Constraints**

- limited public automation and data-plane depth relative to Circle, Discourse, Discord, or a native application
- Zapier-dependent integration for several practical workflows
- weak fit for custom identity graphs, complex progression, lore, artifact lineage, competencies, or agent-native member experiences
- every additional Skool group creates another paid surface, another feed, another moderation loop, and another cold-start problem

**Portfolio verdict:** canonical GenCreator social surface; possible future AI Music Academy surface after spinout; not Arcanea; not the Starlight control plane.

### 4.2 Circle

**Use when:** a polished branded paid community must ship faster than a custom application, while admin APIs, headless member access, workflows, profile fields, analytics, and integrations matter.

**Strengths**

- stronger branding and information architecture than Skool
- courses, discussions, chat, events, live rooms, memberships, workflows, and analytics
- Admin API, Headless API, and Data API create a credible adapter surface
- useful for premium cohorts, enterprise communities, and concierge memberships
- native AI agents can answer from configured community knowledge on higher plans

**Constraints**

- the serious automation, webhook, and AI-agent surface is concentrated in higher-priced plans
- still a vendor-owned social model; custom realms, creation graphs, progression systems, and evidence models remain external
- adopting Circle portfolio-wide would duplicate capabilities already present in GenCreator and Arcanea

**Portfolio verdict:** reserve as a tactical premium surface for Starlight enterprise cohorts or another high-value program that needs branded community operations before native UI is justified. Do not migrate GenCreator to Circle. Do not make it Arcanea's ontology.

### 4.3 Discourse

**Use when:** durable, searchable, public or private knowledge discussion matters; APIs, webhooks, SSO, moderation, SEO, ownership, and long-lived topic structure are load-bearing.

**Strengths**

- mature open-source forum and chat platform
- strong API, webhook, plugin, theme, SSO, moderation, trust-level, and data-export model
- durable topics outperform ephemeral chat for protocol design, technical support, lore debates, canon proposals, architecture reviews, and searchable answers
- self-hosting preserves data portability and allows agent indexing and automation

**Constraints**

- operational ownership: upgrades, security, email delivery, backups, plugins, abuse, and moderation
- less immediately playful than Discord and less commercially opinionated than Skool
- not an LMS or a differentiated creative workspace

**Portfolio verdict:** preferred open-source discussion substrate for Arcanea lore/canon and Starlight protocol/technical community. Use it as a supporting service, not the canonical member/evidence database.

### 4.4 NodeBB

**Use when:** a Node.js team needs highly real-time forum behavior, WebSockets, and deeper JavaScript-level customization.

**Strengths**

- Node.js, real-time interactions, APIs, plugins, and multiple database options
- technically closer to the portfolio's TypeScript orientation

**Constraints**

- smaller ecosystem and less institutional maturity than Discourse for governance-heavy public knowledge communities
- choosing it mainly for language affinity would optimize developer comfort over product reliability

**Portfolio verdict:** credible fallback, not default. Select only when a specific Node/WebSocket extension cannot be delivered cleanly with Discourse plus adapters.

### 4.5 Flarum

**Use when:** a lightweight conventional forum is the overriding requirement and PHP operations are already native to the team.

**Portfolio verdict:** reject. It does not create a strategic advantage over Discourse and introduces another operational stack.

### 4.6 Moodle

**Use when:** formal competencies, evidence-linked learning plans, badges, completion rules, assessment administration, and education-grade records become mandatory.

**Strengths**

- mature competency and badge models
- broad assessment, course administration, and web-service surface
- useful as a learning-record or credential engine

**Constraints**

- weak fit as the emotional/social front door for these brands
- heavy operational and UX burden compared with the current Vercel estate
- would duplicate product experience unless used behind a clean academy interface

**Portfolio verdict:** optional Starlight Academy credential engine at a later maturity gate. Never the portfolio community home.

### 4.7 Discord

**Use when:** high-energy real-time conversation, voice, stages, bots, role-based events, and cultural presence matter more than durable knowledge organization.

**Portfolio verdict:** optional live guild layer for Arcanea and AI Music; not canonical; not the default first community. A Discord server without dense real-time behavior becomes channel-shaped abandonment.

### 4.8 Custom Vercel Application

**Use when:** the social object is itself the product.

Build natively only when a commodity platform cannot express one of these:

- Arcanea realm, Gate, Luminor, guild, canon, or creation graph
- music song lineage, critique state, release state, or agent-assisted workbench
- Starlight competency, attestation, architecture portfolio, evaluation, or sovereign-memory experience
- GenCreator CreatorPack, approval, workspace, or entitlement workflow

Do not rebuild:

- generic threaded discussion
- basic chat and presence
- email broadcasting
- generic events and calendars
- commodity moderation queues
- generic course video hosting
- payment infrastructure

**Portfolio verdict:** native differentiator layer for every brand; never a justification to rebuild all community infrastructure.

---

## 5. Canonical Community Architecture

```text
                                   ┌─────────────────────────────┐
                                   │ Starlight Community OS      │
                                   │ policy · agents · memory    │
                                   │ evals · adapter contracts   │
                                   └──────────────┬──────────────┘
                                                  │
                               normalized commands/events/evidence
                                                  │
                     ┌────────────────────────────▼──────────────────────────┐
                     │ Canonical Supabase/Postgres control plane            │
                     │ identities · consents · entitlements · cells         │
                     │ quests · commitments · artifacts · reflections       │
                     │ credentials · platform links · event ledger          │
                     └───────────┬──────────────┬──────────────┬─────────────┘
                                 │              │              │
                     ┌───────────▼──────┐ ┌────▼─────────┐ ┌──▼──────────────┐
                     │ Product APIs      │ │ Agent runtime │ │ Integration bus  │
                     │ GenCreator        │ │ deterministic │ │ webhooks/jobs    │
                     │ Arcanea           │ │ + provider    │ │ idempotent       │
                     │ Music/Starlight   │ │ boundary      │ │ retries/DLQ      │
                     └───────────┬──────┘ └────┬─────────┘ └──┬──────────────┘
                                 │              │              │
               ┌─────────────────┼──────────────┼──────────────┼────────────────┐
               │                 │              │              │                │
          ┌────▼────┐       ┌────▼────┐    ┌────▼────┐   ┌────▼────┐     ┌────▼────┐
          │ Skool   │       │ Circle  │    │Discourse│   │ Discord │     │ Native  │
          │ adapter │       │ adapter │    │ adapter │   │ adapter │     │ Vercel  │
          └─────────┘       └─────────┘    └─────────┘   └─────────┘     └─────────┘
```

### Sources of truth

| Concern | Canonical owner |
|---|---|
| person identity | portfolio identity service / Supabase member record |
| billing state | payment provider event + normalized entitlement projection |
| entitlement | canonical capability view, never raw platform tier strings |
| member consent and privacy | Community OS policy records |
| progression and proof | artifact, reflection, competency, and attestation records |
| chat/thread content | original platform, unless explicitly promoted to an approved durable artifact |
| agent memory | SIS private vault scope with provenance and consent |
| public knowledge | approved repository, documentation site, or Discourse topic |
| analytics | canonical event ledger plus product analytics; external platform analytics are inputs |

### Non-negotiable boundary

Do not ingest every message into member memory.

Promote only structured, consented signals:

- explicit profile updates
- commitments
- artifacts and evidence
- reflections
- requests for help
- approved summaries
- moderation and safety state

This prevents surveillance-shaped personalization and reduces noise, cost, and privacy risk.

---

## 6. Platform Adapter Contract

Every surface implements the same bounded contract.

```ts
export interface CommunitySurfaceAdapter {
  readonly surface: 'skool' | 'circle' | 'discourse' | 'discord' | 'native';

  resolveIdentity(input: ExternalIdentityInput): Promise<IdentityLink>;
  provisionMember(input: ProvisionMemberInput): Promise<ExternalMembership>;
  grantCapabilities(input: GrantCapabilitiesInput): Promise<SyncReceipt>;
  revokeCapabilities(input: RevokeCapabilitiesInput): Promise<SyncReceipt>;

  publishPrompt(input: PublishPromptInput): Promise<ExternalContentRef>;
  publishEvent(input: PublishEventInput): Promise<ExternalEventRef>;
  draftNudge(input: DraftNudgeInput): Promise<DraftRef>;

  readActivity(input: ActivityCursor): Promise<NormalizedCommunityEvent[]>;
  readModerationSignals(input: ModerationCursor): Promise<ModerationSignal[]>;

  health(): Promise<AdapterHealth>;
}
```

### Adapter rules

1. External identifiers are links, never primary keys.
2. Every write carries an idempotency key.
3. Every adapter exposes declared capabilities; orchestration never assumes parity.
4. Missing capability produces a human task or alternate channel, not silent failure.
5. Platform-specific logic remains inside the adapter package.
6. Payment webhooks update canonical entitlements first; platform access follows asynchronously.
7. Revocation is reversible and logged.
8. No outbound message is sent by an agent without the policy gate required for that class of message.

### Initial capability map

| Capability | Skool | Circle | Discourse | Discord | Native |
|---|---:|---:|---:|---:|---:|
| provision member | limited/integration | strong API | strong API/SSO | strong bot/API | direct |
| granular profile fields | weak | strong | extensible | role-centric | direct |
| durable threaded knowledge | adequate | good | excellent | weak-medium | build-specific |
| real-time voice/presence | limited live calls | rooms/live | chat-oriented | excellent | use Vibeclubs/LiveKit |
| course delivery | strong/simple | strong | plugin/adjacent | weak | build-specific |
| agent automation | third-party dependent | strong on higher plans | strong API/webhooks | strong bots/events | direct |
| custom progression objects | weak | medium | plugin-dependent | bot-dependent | excellent |
| data ownership/portability | limited | export/API | excellent self-hosted | API-dependent | excellent |

---

## 7. Agent Operating Model

The existing Starlight community agents are retained and tightened into a queen/worker topology.

### Community Queen

**Community Steward** owns:

- weekly cadence and run sheet
- adapter selection
- member-consent gates
- escalation and safety
- conflict resolution
- quality synthesis
- cost and notification budgets
- final recommendation to the human operator

### Worker agents

| Agent | Responsibility | Canonical outputs | Forbidden autonomous actions |
|---|---|---|---|
| Concierge | intake, intent classification, initial route | structured member intake, route packet | promising access, changing billing, sensitive profiling |
| Circle Architect | cell/guild matching | proposed cell map, rationale, alternates | publishing private rationale, forcing matches |
| Quest Designer | weekly mission design | quest, difficulty variants, proof object | medical/legal/financial directives; generic engagement bait |
| Invitation Agent | welcome and invitation drafts | channel-specific drafts, RSVP state | sending without approval when policy requires it |
| Accountability Agent | blocker detection and proof collection | nudge drafts, blocker route, next step | shame, coercion, excessive nudging |
| Artifact Agent | package member work | artifact draft, metadata, distribution variants | public publishing without explicit approval |
| Memory Agent | trajectory and reflection capture | private profile deltas, approved durable summaries | storing raw private media without consent |
| Moderator/Sentinel | trust, safety, quality | moderation recommendation, risk record | irreversible bans or public accusations without human gate |
| Evaluator | falsification and outcome measurement | weekly scorecard, retention/artifact analysis | optimizing raw activity at the expense of member value |
| Hermes | retrieval across docs, repos, approved community knowledge | source-linked answer packet | mutation or ungrounded claims |

### Human approval gates

Always require a human for:

- public publication in a member's name
- refunds, billing changes, permanent access revocation
- sanctions beyond temporary anti-spam containment
- sensitive member matching or disclosures
- partnership promises, sponsorships, or commercial offers
- clinical, legal, financial, or safety escalations
- any agent action whose adapter cannot prove target and scope

### Autonomous actions allowed after configuration

- generate weekly run sheets
- draft quests, invitations, nudges, summaries, and event briefs
- compute adapter health and sync drift
- reconcile external IDs and entitlement projections
- create private operator alerts
- summarize approved public knowledge
- produce eval reports and surface members needing human care

---

## 8. Normalized Event Protocol

Initial event types:

```text
identity.member.created
identity.external_linked
consent.updated
entitlement.granted
entitlement.revoked
community.joined
community.left
cell.proposed
cell.confirmed
quest.published
commitment.created
commitment.updated
artifact.submitted
artifact.approved
artifact.published
reflection.captured
help.requested
help.resolved
event.scheduled
event.attended
moderation.signal_created
moderation.action_proposed
adapter.sync_succeeded
adapter.sync_failed
```

Each event includes:

- `event_id`
- `event_type`
- `occurred_at`
- `actor_type`
- `actor_id`
- `community_id`
- `surface`
- `external_event_id`
- `subject_type`
- `subject_id`
- `payload_version`
- `payload`
- `privacy_class`
- `consent_basis`
- `idempotency_key`
- `correlation_id`
- `causation_id`
- `source_uri`

The ledger must support replay, projection repair, and adapter migration without duplicate side effects.

---

## 9. Community-by-Community Implementation

### 9.1 GenCreator

#### Platform

- Skool Pro: GenCreator Lounge and paid OS Circle
- `gencreator.ai`: identity handoff, CreatorPacks, diagnostics, workspace, dashboard, entitlements, delivery, approvals
- Whop: primary storefront and community access events
- Stripe: Studio/direct subscriptions where already decided
- Vibeclubs: live build sessions

#### Why this is correct

GenCreator has one clear transformation: turn expertise and AI-assisted creation into approved, reusable creator products and output. Skool supplies the lowest-friction activation shell; the custom app already owns the differentiated workflow.

#### Immediate work

1. Implement Skool-to-Supabase identity/access sync through the adapter boundary.
2. Complete session, diagnostic, blueprint, skill-install, and artifact persistence.
3. Make `/community/onboarding` the artifact-first bridge into the weekly loop.
4. Replace platform tier string checks with capability projections everywhere.
5. Instrument commitment, artifact, reflection, and retention events—not message-count vanity.
6. Update the GenCreator Companion to generate community review packets from CreatorPacks.

#### Do not do

- migrate to Circle
- launch additional GenCreator Skool groups by topic
- turn the twelve-person product-learning cohort into the product
- make Skool the canonical profile or evidence store

### 9.2 AI Music Academy

#### Platform

- GenCreator Skool guild during validation
- owned `ai-music-academy` workbench
- Starlight Sound Intelligence and Music IS agents
- Vibeclubs for listening rooms, co-production rituals, and timed creation sessions

#### Product objects

- artist/persona
- song/project
- prompt and generation lineage
- composition/arrangement versions
- critique and revision
- mix/master plan
- release metadata and rights state
- performance/listening-room evidence

#### Immediate work

1. Retire the speculative Kubernetes/multi-cloud architecture from the near-term roadmap.
2. Reframe the current repo as a Next.js workbench and curriculum/product shell.
3. Consume Starlight Music IS via a provider boundary instead of duplicating agents.
4. Launch a six-week AI Music Guild inside GenCreator with one song/proof per week.
5. Record artifacts, peer feedback, and learning progression canonically.
6. Spin out only after the independence gates below pass.

#### Spinout gates

All must hold for six consecutive weeks:

- at least 25 weekly active music members
- at least 60% submit a song, revision, performance, or structured proof object
- at least 40% of interactions are peer-to-peer rather than Frank-to-member
- at least two non-Frank stewards can run a weekly ritual
- the music offer converts independently of the broader GenCreator promise
- music activity is creating feed collision for non-music members

When passed, launch a dedicated Skool Pro academy first. Reconsider Discord only when live listening/presence is already happening weekly.

### 9.3 Arcanea

#### Platform

- `arcanea-platform` as the native social-creation product
- Discourse as a durable lore, support, canon-proposal, and developer discussion substrate
- optional Discord for real-time guild culture, voice, events, and fandom
- no Circle dependency by default

#### Native objects

- realm
- Gate and mastery state
- Guardian/Luminor relationship
- character and identity
- guild/faction
- quest
- creation and lineage
- lore claim and canon status
- collaboration and contribution rights
- attestation and provenance

#### Why this is correct

Arcanea already has an academy, chat, studio, gallery, library, realms, and sanctuary monorepo structure. Its mythology and progression are not decoration; they are the product ontology. A generic community SaaS would make the differentiator external to the member experience.

#### Build boundary

Build the Arcanea creation graph and progression natively. Embed or link commodity discussion instead of recreating a mature forum. Use the adapter to promote approved Discourse topics into canon proposals and to project Arcanea identity/badges into the forum.

#### Immediate work

1. Establish one canonical Arcanea repository/product boundary and archive or demote overlapping platform experiments.
2. Define `Realm`, `Guild`, `Quest`, `Creation`, `LoreClaim`, `CanonDecision`, and `GateProgress` schemas.
3. Add Discourse SSO/identity-link architecture and a proof-of-concept adapter.
4. Create one founding Worldbuilders Guild rather than many empty factions.
5. Let Luminors assist with quests, synthesis, and retrieval; they do not autonomously decide canon.
6. Create a human Canon Council gate for official-world mutations.

#### Circle exception

Use Circle only when a paid Arcanea creator cohort must launch before the native collaboration layer is ready and the cohort economics justify the temporary surface. Any such use is explicitly transitional and exports structured member/progress events to Community OS.

### 9.4 Starlight Intelligence Academy

#### Platform

- owned Vercel academy and member/evidence interface
- Discourse for open protocol, architecture, integrations, support, proposals, and public technical memory
- GitHub for protocol code, issues, RFCs, examples, and attestations
- Circle only for premium enterprise cohorts or private leadership councils
- Moodle only after formal competency/badge administration becomes operationally necessary

#### Native objects

- learning path
- competency
- lab
- architecture decision
- evidence item
- evaluation run
- attestation
- portfolio
- credential
- organization/cohort
- mentor/reviewer decision

#### Immediate work

1. Converge `ai-architect-academy` and `saas-ai-architect-academy` into one canonical academy product boundary.
2. Map SIS agent/eval capabilities to explicit competencies and labs.
3. Use Discourse for durable public knowledge and GitHub for implementation evidence.
4. Build the minimal native portfolio/evidence view before building a generic course catalog.
5. Issue credentials only from evaluated evidence, never course-completion alone.
6. Keep enterprise cohort data isolated from the open protocol community.

---

## 10. Repository Ownership

| Repository | Canonical responsibility | Required change |
|---|---|---|
| `Starlight-Intelligence-System` | Community OS policy, schemas, agents, adapter contracts, evals, reference workflows | add `packages/community-os`, adapter interfaces, event schemas, portfolio policy, agent updates |
| `gencreator.ai` | GenCreator product/member shell and Skool/Whop adapter implementation | complete sync, persistence, artifact handoff, canonical metrics |
| `arcanea-platform` | Arcanea native identity, progression, realms, guilds, creations, lore graph | define domain schemas and native community experience; integrate Discourse via adapter |
| `ai-music-academy` | music learning/workbench UI and music-specific product objects | simplify stack; consume Music IS; run as GenCreator guild before spinout |
| `ai-architect-academy` | canonical Starlight Academy curriculum, labs, evidence, portfolio UI | absorb useful SaaS academy material; connect to SIS evals and Discourse |
| `saas-ai-architect-academy` | migration source only | mark superseded after content convergence |
| `vibeclubs` | live creation-session format and lightweight session artifacts | remain platform-independent; expose session-completion event adapter |
| `FrankX` | public portfolio router, CRM, executive community console, acquisition | replace generic community page and Discord mock dashboard with canonical portfolio projections |
| `agentic-creator-os` | creator quest-to-artifact patterns and distributable creator workflows | expose reusable workflow modules to Community OS |

### New-repository rule

Do **not** create a `community-platform` or `community-intelligence-system` repository yet.

First land executable contracts and one working adapter in SIS. Extract a repository only when:

- at least two portfolio products consume the package
- release cadence diverges from SIS
- independent contributors require a separate boundary
- a stable public protocol can be versioned without exposing private operations

---

## 11. FrankX Surface Consolidation

### Public `/community`

Replace the generic "choose your space" page with a portfolio router:

- **Build and monetize with AI** → GenCreator
- **Create music with AI** → AI Music Guild / Academy
- **Build worlds and stories** → Arcanea
- **Architect sovereign intelligence systems** → Starlight Academy

The page should expose current status truthfully: open, founding, waitlist, or private—not "coming soon" placeholders without an operational loop.

### Admin `/admin/community`

Replace Discord-specific mock data with canonical projections:

- active members by community and entitlement
- commitment rate
- artifact submission and approval rate
- reflection completion
- peer-help rate
- six/eight-week retained active cohorts
- adapter health and sync drift
- pending human approvals
- moderation/safety queue
- upcoming rituals and capacity
- revenue by product, not invented free/pro/VIP categories

### Agent router

Update `community-fabric-orchestrator`:

1. resolve community and product
2. load platform policy
3. read adapter capability manifest
4. route to Community Steward
5. produce drafts/actions with explicit approval class
6. write canonical event/evidence
7. update portfolio console

Remove hard-coded Circle/Discord/Skool assumptions from the intent classifier.

---

## 12. Rollout Workflow

### Phase A — Decision convergence and launch spine

**Outcome:** one accepted architecture and one live community loop.

- accept this strategy or revise it through the draft PR
- mark the old Discord-first FrankX blueprint superseded
- keep GenCreator ADR-001 accepted
- create Community OS schemas and adapter capability manifest
- configure GenCreator Skool Pro and canonical identity/access sync
- run the first GenCreator creation-cell pilot

**Exit evidence:** one full week produces commitments, artifacts, reflections, and an operator scorecard without manual spreadsheet reconstruction.

### Phase B — GenCreator proof

**Outcome:** the commercial activation engine works.

- 5-15 founding members, 2-4 cells
- one artifact-first weekly loop
- CreatorPack review packets flow into community
- at least 70% of active pilot members submit one proof object in week one
- sync drift is visible and repairable

**Exit evidence:** four consecutive weeks of reliable operation and clear member value.

### Phase C — Music guild validation

**Outcome:** determine whether music has independent social gravity.

- launch music guild inside GenCreator
- use Music IS agents and Vibeclubs
- measure songs/revisions, peer critiques, listening-room attendance, retention
- do not buy another community platform until spinout gates pass

### Phase D — Arcanea native guild alpha

**Outcome:** validate Arcanea's differentiated social objects.

- one founding Worldbuilders Guild
- one Realm
- weekly quest and creation proof
- minimal native creation graph
- Discourse adapter proof for lore/support/canon proposals

**Exit evidence:** members create with each other and the Arcanea ontology changes their behavior beyond what a generic forum would.

### Phase E — Starlight Academy evidence alpha

**Outcome:** validate professional mastery and credentials.

- one architecture lab path
- one competency map
- evidence submission and evaluation
- Discourse/GitHub discussion and proof links
- private enterprise data boundary

**Exit evidence:** a reviewer can explain why a learner earned a competency using inspectable evidence.

### Phase F — platform expansion

Adopt Circle, Moodle, a dedicated music Skool, or a Discord guild only after the corresponding trigger is proven.

---

## 13. Metrics and Decision Gates

### North-star metrics

- artifacts shipped per retained active member
- approved evidence objects per learning path
- meaningful peer help per cell
- eight-week retained active members
- member-reported progress and felt recognition
- time from intake to first proof object
- steward time per active member
- sync error rate and mean repair time

### Anti-metrics

Do not optimize:

- raw message count
- empty member count
- forced daily posting
- leaderboard activity detached from quality
- number of communities launched
- number of courses uploaded
- number of agents invoked

### New-community spinout gate

A guild becomes a standalone community only when:

1. its promise converts independently
2. it sustains at least 25 weekly active members for six weeks
3. at least 60% produce domain proof objects
4. peer-to-peer activity exceeds founder-to-member dependency
5. two stewards can run the ritual without Frank
6. feed collision is harming the parent community
7. canonical identity/evidence migration is tested

### Circle adoption gate

Circle is justified when:

- the community is paid and high-value
- brand control and space architecture materially affect retention or sales
- API/workflow access eliminates meaningful manual operations
- projected margin absorbs the required plan without distorting the offer
- the surface is not duplicating a native product already being built

### Native-feature build gate

Build a community feature only when it expresses a unique product object or eliminates a measured recurring operational cost. "More control" alone is insufficient.

---

## 14. Cost and Complexity Posture

### Near-term recurring surfaces

- one Skool Pro community for GenCreator
- current Supabase/Vercel/Whop/Stripe/Resend/PostHog estate
- Vibeclubs as existing OSS ritual infrastructure
- no Circle subscription yet
- no dedicated AI Music community yet
- no production Discourse until Arcanea or Starlight has a real founding cohort and an owner for operations

### Why not four Skool groups

Four Pro groups create four subscriptions, four moderation loops, four calendars, four content obligations, and four cold-start problems before they create four network effects.

### Why not build everything on Vercel now

The expensive part is not rendering a feed. It is operating notification delivery, moderation, search, email, mobile behavior, abuse controls, content lifecycle, access sync, exports, and migrations. Native work is reserved for product ontology and evidence.

---

## 15. Security, Privacy, and Governance

1. Member profiles are private by default.
2. Sensitive matching rationale is never published.
3. Raw voice/video is not retained without explicit consent.
4. External platform data is minimized and purpose-bound.
5. Entitlement changes are event-driven, idempotent, and auditable.
6. Every adapter has least-privilege credentials and secret rotation procedures.
7. Public knowledge promotion requires provenance and publish approval.
8. Canon decisions, credentials, permanent moderation, and commercial promises remain human-gated.
9. Community agents cannot silently cross community or tenant boundaries.
10. Member deletion and export must traverse every identity link and adapter.

---

## 16. First Implementation Backlog

### SIS / Community OS

- [ ] define TypeScript schemas for member, consent, community, cell, quest, commitment, artifact, reflection, competency, and credential
- [ ] define normalized event envelope and idempotency contract
- [ ] define adapter interface and capability manifest
- [ ] implement Community Steward workflow and approval classes
- [ ] implement evaluator scorecard and anti-metrics
- [ ] add policy for memory promotion and raw-message exclusion

### GenCreator

- [ ] implement Skool adapter and external identity links
- [ ] complete Whop/Skool entitlement reconciliation
- [ ] persist diagnostics, blueprints, skill installs, CreatorPacks, and review requests
- [ ] instrument artifact-first weekly-loop metrics
- [ ] wire Vibeclubs session completion to canonical events

### FrankX

- [ ] replace `/community` with portfolio router
- [ ] replace Discord mock admin data with canonical read models
- [ ] update `community-fabric-orchestrator` to platform-policy routing
- [ ] mark `COMMUNITY_BLUEPRINT.md` superseded

### AI Music Academy

- [ ] create convergence ADR: Vercel/Supabase/Starlight, not Kubernetes-first
- [ ] define music product objects and evidence model
- [ ] connect Music IS provider boundary
- [ ] publish six-week GenCreator guild pilot contract

### Arcanea

- [ ] designate canonical repository and archive/demote overlaps
- [ ] define realm/guild/quest/creation/lore/canon schemas
- [ ] prototype Discourse identity and event adapter
- [ ] launch one Worldbuilders Guild alpha

### Starlight Academy

- [ ] converge academy repositories
- [ ] define competency/evidence/credential contract
- [ ] map first architecture lab to SIS evals
- [ ] decide Discourse operating owner and hosting model before deployment

---

## 17. Research Sources

Official sources reviewed for this decision:

- [Skool pricing](https://www.skool.com/pricing)
- [Skool Help Center: Zapier integration](https://help.skool.com/article/195-how-to-use-zapier-with-skool)
- [Skool Help Center: points and levels](https://help.skool.com/article/31-how-do-points-and-levels-work)
- [Circle pricing](https://circle.so/pricing)
- [Circle Developer Platform](https://api.circle.so/)
- [Circle Help Center: AI Agents](https://help.circle.so/p/ai-agents)
- [Discourse repository](https://github.com/discourse/discourse)
- [Discourse API documentation](https://docs.discourse.org/)
- [NodeBB repository](https://github.com/NodeBB/NodeBB)
- [Flarum repository](https://github.com/flarum/framework)
- [Moodle competencies](https://docs.moodle.org/en/Competencies)
- [Moodle badges](https://docs.moodle.org/en/Badges)
- [Moodle web services](https://docs.moodle.org/dev/Web_services)

---

## 18. Final Portfolio Position

> **GenCreator rents speed. Arcanea owns its world. AI Music earns its spinout. Starlight owns the intelligence and evidence layer.**

The portfolio becomes coherent when every community shares identity, consent, evidence, memory, and agent governance—but not necessarily the same interface.
