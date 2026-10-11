# Starlight Communities Operating System

Status: foundation spec
Owner lane: Starlight Intelligence System, with ACOS, ALOS, Swarm, and FrankX website as consumers
Date: 2026-06-23

## Executive Decision

Starlight Communities should begin as a small, agent-run creation circle system, not as a generic Discord, course community, or content calendar. The winning move is to make the weekly ritual and member memory the canonical product, then let Circle, Discord, Slack, email, calendar, and the FrankX site become optional surfaces.

The spine is:

1. SIS owns the canonical operating model, memory rules, agent governance, and evidence trail.
2. ACOS turns quests, labs, reflections, and sessions into creator artifacts.
3. ALOS contributes personal rhythm, goals, profile, and life-operating-loop semantics.
4. Starlight Swarm contributes the queen/worker governance model and external-action gates.
5. frankx.ai-vercel-website becomes the public front door and eventual admin/member UI after the loop proves itself.
6. starlight-agent-config tracks cross-repo ownership, cost gates, and durable progress.

This should be sold and operated as "agentic creation cells": 3-5 people with a shared theme, a weekly mission, individual build goals, one team challenge, one shipped artifact, one captured reflection, and one next commitment.

## Why This Works

The community is not asking people for more time. It gives the week a shape.

The motivational engine is:

- Identity: members are not "students"; they are builders in a cell.
- Progress: every week produces visible proof.
- Relatedness: 3-5 person cells are small enough for actual social memory.
- Competence: quests are sized to ship, not to impress.
- Autonomy: the agent suggests prompts and structure, but members choose their build.
- Closure: Friday demo/reflection gives the nervous system a real finish line.

This lines up with behavior-change basics: Self-Determination Theory emphasizes autonomy, competence, and relatedness; implementation-intention research supports turning intent into concrete action plans; small-group behavior-change literature supports group structures that reshape expectations and behavior. Use those as design constraints, not as marketing overclaims.

## Source Material Absorbed

| Source | What To Use |
|---|---|
| `Starlight-Intelligence-System` | Canonical memory, Gateway, agent registry, private/public boundary, delivery workflow doctrine |
| `agentic-creator-os` | Creator path, content strategy, community updates, trajectory memory, human approval gates |
| `agentic-life-os` | Profile-driven operating loops, personal rhythm, private offering spine |
| `Agent-Intelligence-System` | Capability discovery, routing, emitted manifests, complexity routing |
| `starlight-swarm` | Queen/worker topology, escalation, external-action safety gates |
| `frankx.ai-vercel-website` | Future public/community UI stack: Next.js, auth, Stripe, Resend, tldraw, Vercel |
| `starlight-agent-config` | Cross-repo work ledger, cost gate, long-term platform discipline |
| `agentic-ops-hub` | Agent permissions, bounded 24/7 operations, no external sends/publishes without approval |

## Product Definition

Starlight Communities are weekly creation cells for people building freedom systems, mind systems, content, events, and intelligent lives.

A creation cell has:

- 3-5 people.
- One shared theme.
- One weekly mission.
- Individual build goals.
- One team challenge.
- One artifact shipped.
- One reflection captured.
- One next commitment.

The product is the weekly compounding loop, not the chat room.

## Weekly Loop

| Day | System Action | Human Effect | Output |
|---|---|---|---|
| Monday | Agent sends weekly quest and personal prompt | Direction | Quest card, personal commitment |
| Tuesday | Agent proposes 1:1 or pair spark calls | Intimacy and momentum | Pair agenda, next micro-step |
| Wednesday | Deep creation lab | Artifact | Draft, map, prompt, post, event plan, or agent |
| Thursday | Async voice/video updates | Social proof | Proof note, blocker, next move |
| Friday | Demo, reflection, leaderboard | Dopamine and closure | Artifact record, reflection, next commitment |
| Weekend | Optional salon, walk, or event | Community and beauty | Story, connection note, event artifact |

The loop should feel mythic, but the mechanics must stay practical. Every ritual creates data, proof, memory, or a shippable artifact.

## Core Objects

### CommunityMemberProfile

Canonical owner: SIS local memory, with private-person scope by default.

Fields:

- `member_id`
- `display_name`
- `timezone`
- `goals`
- `skills`
- `current_project`
- `preferred_rhythm`
- `social_energy`
- `growth_edge`
- `channels`
- `consent_flags`
- `privacy_class`
- `weekly_commitments`
- `artifacts_shipped`
- `reflections`
- `matching_notes`

### CreationCell

Fields:

- `cell_id`
- `name`
- `theme`
- `member_ids`
- `week_id`
- `status`
- `matching_rationale`
- `shared_mission`
- `team_challenge`
- `risk_notes`
- `steward_agent`

### Quest

Fields:

- `quest_id`
- `week_id`
- `challenge_type`
- `theme`
- `title`
- `prompt`
- `personal_prompt`
- `expected_artifact`
- `proof_type`
- `difficulty`
- `created_by`
- `gates`

### WeeklyCommitment

Fields:

- `commitment_id`
- `member_id`
- `cell_id`
- `week_id`
- `individual_build_goal`
- `team_role`
- `due_day`
- `proof_uri`
- `status`
- `next_commitment`

### Artifact

Fields:

- `artifact_id`
- `member_id`
- `cell_id`
- `week_id`
- `type`
- `title`
- `uri`
- `visibility`
- `source_session`
- `attestation_status`
- `publish_gate`

### Reflection

Fields:

- `reflection_id`
- `member_id`
- `cell_id`
- `week_id`
- `wins`
- `friction`
- `insight`
- `next_move`
- `profile_delta`
- `privacy_class`

### LeaderboardSignal

Use recognition sparingly. Score signals that strengthen the community, not vanity.

Good signals:

- Artifact shipped.
- Reflection captured.
- Pair spark completed.
- Helped another member.
- Hosted salon or walk.
- Continued a streak without overworking.

Avoid:

- Raw message count.
- Output volume without quality.
- Public comparison of sensitive personal progress.
- Shame-based "accountability."

## Agent Team

Use a `Community Steward` as the queen/steward agent above the six named agents. It owns cadence, safety, gates, and handoff. The six agents are workers with clear scopes.

| Agent | Function | Outputs | Gates |
|---|---|---|---|
| Community Steward | Runs the weekly loop and resolves conflicts | Weekly run sheet, risk register, synthesis | Human gate for external sends or public posts |
| Circle Architect | Forms 3-5 person groups by goal, energy, skill, rhythm, and consent | Cell map, matching rationale, alternate pairs | Never expose private rationale to members |
| Quest Designer | Turns themes into weekly challenges | Quest card, personal prompts, team challenge | Avoid clinical, legal, or financial advice |
| Invitation Agent | Sends warm personalized invites | Invite draft, follow-up draft, RSVP tracker | Human approval before sending |
| Accountability Agent | Asks for voice notes, proof, and next move | Nudge draft, proof checklist, blocker route | No shame language; escalate distress |
| Artifact Agent | Turns sessions into posts, docs, maps, prompts, and event plans | Artifact draft, title, distribution variant | Human approval before publish |
| Memory Agent | Captures insights into each Starlight Profile | Profile deltas, memory records, reflection summary | Private by default; public only by consent |

## Matching Logic

Hard constraints:

- Consent to join a cell.
- Compatible timezone or async rhythm.
- Group size 3-5.
- No blocked pairings.
- No sensitive private data shared without explicit consent.

Positive match signals:

- Shared theme.
- Complementary skills.
- Similar commitment intensity.
- Mixed but compatible social energy.
- One member can host or stabilize the group.
- At least one clear artifact path per person.

Avoid:

- All beginners with no scaffolding.
- All same skill and same blind spot.
- One high-output member expected to carry the cell.
- Pairing people because they are "useful" rather than mutually generative.
- Matching from sensitive profile data that members did not consent to use.

## Quest Types

Use quests, not homework.

| Quest | Artifact | Prompt Shape |
|---|---|---|
| Mind Map Quest | Model, diagram, essay, tldraw board | "Create your model of human change." |
| Freedom System Quest | Income/lifestyle lever map | "Map one lever that increases freedom without fantasy." |
| Voice Quest | 2-minute truth, lesson, or story | "Say the thing you keep editing out." |
| Offer Seed Quest | Offer sketch, landing copy, pitch | "Define one thing you can help people with." |
| Event Spark Quest | 5-person salon plan | "Design a small gathering with one beautiful outcome." |
| AI Companion Quest | Prompt, agent, workflow, or script | "Build one AI helper that improves your week." |

Quest rules:

- One week, one artifact.
- Prompt must allow beginner, intermediate, and advanced completions.
- Every quest should support both solo and pair work.
- Every quest should end with a proof object.
- The artifact can be private, cell-only, community-visible, or public.

## Memory Model

SIS `local_core` should be canonical. External platforms are shadow surfaces, not source of truth.

Memory classes:

- `profile`: stable member attributes and preferences.
- `working`: current week commitments and blockers.
- `episodic`: session notes, voice summaries, salon stories.
- `semantic`: reusable lessons, frameworks, and quest insights.
- `procedural`: workflows and rituals that work.
- `policy`: consent, privacy, boundaries, gating rules.
- `aspirational`: member goals and desired identity shifts.

Privacy rules:

- Personal profiles are private by default.
- Matching rationale is internal and should be summarized kindly if surfaced.
- Voice/video raw files require explicit consent before storage.
- Public artifacts require explicit publish approval.
- Reflections can be summarized for the cell only when consent allows.
- Leaderboards use display-safe data and can be opted out.

## Event And Data Flow

1. Intake captures a member profile.
2. Memory Agent writes private `CommunityMemberProfile` records.
3. Circle Architect proposes cells.
4. Community Steward reviews cells and gates sensitive concerns.
5. Quest Designer creates weekly quest cards.
6. Invitation Agent drafts Monday invites and prompts.
7. Human approves external sends.
8. Accountability Agent tracks proof and blockers.
9. Artifact Agent packages outputs.
10. Friday demo captures artifacts, reflections, next commitments.
11. Memory Agent writes profile deltas and week memory.
12. Steward produces the next-week run sheet.

## Platform Strategy

Do not pick the community platform first. Pick the canonical data spine first.

Recommended sequence:

1. Pilot in existing low-cost channels with manual concierge operation.
2. Use SIS and Git-backed docs as canonical memory/spec.
3. Add Circle if a polished paid community space is needed.
4. Add Discord if high-energy voice, stage, forum, or social-presence loops matter.
5. Add Slack if the target group is professional, operational, or private-team oriented.
6. Avoid making Skool the canonical automation spine until its public API surface is strong enough for profile, quest, artifact, and event automation.
7. Build the FrankX/Starlight web app only after the weekly loop proves retention and artifact output.

External platform notes:

- Circle has Admin API, Headless API, and Data API surfaces for admin automation, embedded community experience, and analytics export.
- Discord has mature bot, channel, forum, voice, stage, thread, and gateway-event primitives.
- Slack has strong Web API and webhook/workflow automation for private professional operations.
- Skool is viable as a creator-course/community shell, but public automation appears thinner and more third-party dependent.

## Repo Wiring

| Repo | Ownership |
|---|---|
| `Starlight-Intelligence-System` | Canonical spec, memory schema, agent doctrine, privacy model |
| `agentic-creator-os` | Quest-to-artifact workflows, content packaging, community updates, creator trajectory memory |
| `agentic-life-os` | Member profile/rhythm loop model and private operator packaging |
| `Agent-Intelligence-System` | Future emitted capability manifests and routing metadata |
| `starlight-swarm` | Runtime topology, Community Steward/worker execution, escalation ladder |
| `frankx.ai-vercel-website` | Public front door, admin dashboard, member dashboard, auth, payment, email |
| `starlight-agent-config` | Work ledger, cost gate, cross-repo progress, tool-stack decisions |
| `agentic-ops-hub` | Agent permissions, 24/7 ops rules, external-action limitations |

## Build Plan

### Phase 0: Foundation Spec

Deliverables:

- This operating-system document.
- Machine-readable module manifest.
- Cross-repo ledger entry.
- No new paid service.
- No external sends.

### Phase 1: Concierge Pilot

Goal: prove the loop with 5-15 members and 2-4 cells.

Deliverables:

- Intake form or profile template.
- Manual cell map.
- Week 1 quest card.
- Monday invite drafts.
- Tuesday pair agenda.
- Wednesday lab script.
- Thursday proof request.
- Friday demo/reflection form.
- Artifact tracker.

Success metric:

- At least 70 percent of active pilot members ship one artifact or submit one proof object in week one.

### Phase 2: Local Data Model And CLI

Goal: make the loop repeatable without a full web app.

Deliverables:

- TypeScript or YAML schema for profiles, cells, quests, commitments, artifacts, and reflections.
- `generate-weekly-run-sheet` script.
- Human-gated invite/prompt drafts.
- ACOS trajectory record for weekly loop outcomes.
- SIS memory write/read contract.

Success metric:

- A steward can generate a weekly run sheet from profile data in under five minutes.

### Phase 3: Member/Admin UI

Goal: create a high-trust interface once the loop has proof.

Recommended home:

- `frankx.ai-vercel-website` if public/commercial.
- A private Starlight app/worktree if still internal.

Core screens:

- Member profile.
- Cell board.
- Weekly quest.
- Pair spark schedule.
- Artifact submission.
- Reflection capture.
- Steward dashboard.

Success metric:

- A new pilot member can join, understand this week's quest, submit proof, and see their cell without human explanation.

### Phase 4: Integrations

Goal: turn the proven loop into a scalable system.

Possible integrations:

- Circle Admin API or Headless API for community surface.
- Discord bot for voice/stage/forum loops.
- Slack webhooks/workflows for professional cells.
- Resend for email prompts.
- Google Calendar for pair calls and labs.
- Postiz or Blotato for approved public artifact distribution.
- n8n/Railway only when an automation has proven weekly value.

Success metric:

- At least one full week runs with agent-drafted, human-approved prompts and artifacts across the chosen surface.

### Phase 5: Evals And Growth

Goal: measure quality, not just activity.

Metrics:

- Monday commitment rate.
- Tuesday pair completion rate.
- Wednesday artifact draft rate.
- Thursday proof submission rate.
- Friday reflection completion rate.
- Artifacts shipped per active member.
- Helpfulness signals per cell.
- Week-over-week member retention.
- Member-reported "felt seen" and "made progress" notes.

Anti-metrics:

- Raw message volume.
- Forced posting.
- Leaderboard anxiety.
- Agent over-nudging.

## First Pilot Script

### Intake Prompt

Capture:

- What are you building or becoming this season?
- What do you want to ship in the next four weeks?
- What skill can you offer a small group?
- What skill are you growing?
- What rhythm works for you this week?
- Are you more solo, pair, small-group, or host energy right now?
- What kind of accountability helps you?
- What should the system not use for matching or public recognition?

### Week 1 Theme

Theme: visible proof.

Quest: Ship a tiny artifact that proves what you are becoming.

Personal prompt:

> What is the smallest public or private object you can make this week that would make your future self trust you more?

Expected artifacts:

- A 2-minute voice note.
- A one-page map.
- A prompt or small agent.
- A short post.
- A five-person salon outline.
- A freedom lever map.

### Pair Spark Agenda

20 minutes:

1. What are you building this week?
2. What would make this week feel real?
3. Where are you likely to stall?
4. What proof object will you submit by Thursday?
5. What is one useful reflection your partner should remember?

### Friday Reflection

Capture:

- What shipped?
- What changed in your model of yourself?
- What gave you energy?
- What created drag?
- Who helped?
- What is your next commitment?
- What should the Memory Agent remember?

## Safety And Governance

Agents may:

- Draft invites, prompts, agendas, summaries, reflections, and artifact packages.
- Propose cell matches.
- Generate run sheets.
- Track proof and blockers.
- Prepare publish variants.
- Write private memory records within approved scope.

Agents may not without explicit approval:

- Send invites or DMs.
- Publish posts.
- Add people to channels.
- Create calendar events with external attendees.
- Publicly rank sensitive personal progress.
- Store raw voice/video without consent.
- Give professional legal, financial, medical, or mental-health advice.
- Add paid services, recurring workers, or platform subscriptions.

Escalate to a human when:

- A member expresses distress, crisis, or harm.
- A private/public boundary is unclear.
- Matching could create relational risk.
- A leaderboard or recognition moment may shame someone.
- Any external send, publish, payment, or platform mutation is involved.

## Research Anchors

- Circle developer platform: https://api.circle.so/
- Circle Admin API: https://api.circle.so/apis/admin-api
- Circle Headless API: https://api.circle.so/apis/headless
- Circle Data API: https://api.circle.so/apis/data-api
- Discord channels: https://docs.discord.com/developers/resources/channel
- Discord gateway events: https://docs.discord.com/developers/events/gateway-events
- Slack Web API: https://docs.slack.dev/apis/web-api/
- Slack incoming webhooks: https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/
- Slack workflow webhooks: https://slack.com/help/articles/360041352714-Build-a-workflow--Create-a-workflow-that-starts-outside-of-Slack
- SkoolAPI docs: https://docs.skoolapi.com/
- Make Skool integration notes: https://apps.make.com/skool
- Self-Determination Theory: https://selfdeterminationtheory.org/theory/

## Open Decisions

1. Pilot surface: existing private channel, Circle, Discord, Slack, or email-first.
2. First member segment: creators, founders, AI builders, event hosts, or freedom-system builders.
3. Paid offer shape: free beta, paid pilot, founder cell, or included in a broader Agentic Life OS package.
4. Public name: Starlight Communities, Starlight Creation Cells, or Starlight Circles.
5. Memory storage boundary: SIS-only local private storage first, or mirrored member dashboard from day one.

## Next Build Step

Build the Phase 1 concierge pilot kit before any platform integration:

1. Create a member intake template.
2. Create a cell map template.
3. Create six reusable quest cards.
4. Create Monday-Friday prompt templates.
5. Create a private artifact/reflection tracker.
6. Run one pilot week manually.
7. Only then choose Circle, Discord, Slack, or native FrankX UI as the first automated surface.
