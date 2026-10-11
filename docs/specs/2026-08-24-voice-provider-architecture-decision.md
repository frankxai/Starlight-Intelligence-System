# Voice Provider Architecture Decision — 2026-08-24

> **Status:** Accepted for implementation and measured validation  
> **Decision owner:** Frank Riemer  
> **Scope:** Starlight Voice Operator and shared voice capability across FrankX, Starlight, GenCreator, Agentic Income, Arcanea, Reality Architect, Family Intelligence, and the AI learning app  
> **Supersedes:** Provider choices in `docs/specs/2026-06-15-voice-operator-v2-prd.md` where they conflict  
> **Does not supersede:** The Voice Operator's intent router, approval gates, dispatch contracts, workflow engine, memory boundaries, or bench-first latency SLO

## Decision

Adopt a **dual-path voice architecture** behind one internal contract:

1. **Native realtime speech-to-speech**
   - **Primary:** xAI Grok Voice `grok-voice-think-fast-2.0` / `grok-voice-latest`
   - **Fallback and reasoning-critical lane:** OpenAI `gpt-realtime-2.1`
   - **Scale/economy lane:** OpenAI `gpt-realtime-2.1-mini`

2. **Chained, transcript-first voice**
   - STT → existing text agent/workflow → TTS
   - **Canonical character, narration, and long-form voice:** ElevenLabs
   - **Default batch/streaming transcription candidate:** xAI STT, subject to corpus accuracy tests
   - Preserve provider interchangeability for transcription and TTS.

**Grok is the default interactive voice for the authenticated Starlight/Frank operator experience.** Frank's direct preference for its conversational feel is product evidence, not an aesthetic footnote. Native voice is an interface; perceived intelligence and desire to keep speaking are first-order success metrics.

ElevenLabs is **not** the default reasoning agent. It is the canonical voice-production and character-identity layer, and the turnkey agent platform only when its deployment/operations surface is itself the product requirement.

OpenAI Realtime is the strongest fallback where browser transport, long-session reasoning, tool precision, or economy at public scale dominates persona preference.

## Why this architecture

A single-provider decision collapses three different workloads that should remain distinct:

- A live voice companion must minimize turn latency and preserve conversational presence.
- An operational workflow must preserve transcripts, approvals, tool receipts, and deterministic state.
- A content/character pipeline must preserve a stable, licensable voice identity across thousands of outputs.

Native speech-to-speech wins the first workload. A chained pipeline wins the second. ElevenLabs wins the third. One internal interface lets each product select the correct mode without copying agent logic.

## Current provider comparison

Prices were verified on 2026-08-24 from official provider documentation. Telephony, external tools, model calls outside the native session, taxes, and enterprise commitments are excluded.

| Provider | Current economics | Strength | Constraint | Portfolio role |
|---|---:|---|---|---|
| **xAI Grok Voice 2.0** | **$0.08 per audio minute** + $0.004 per text input | Frank-preferred conversational character; sub-second native voice; function tools, web/X/collections search, remote MCP, SIP, custom voices | WebSocket-first client transport; current standard concurrency is 10 sessions/team; provider surface is newer | Default authenticated interactive agent |
| **OpenAI Realtime 2.1** | Audio $32/M input + $64/M output tokens; roughly **$0.048 per wall-clock minute** at a 50/50 speaking split before text/history/tools | Strongest realtime reasoning/tool lane; WebRTC, WebSocket, SIP; MCP/connectors; sideband controls; 128k long-session context | Voice/persona may be less compelling for the target experience; cumulative conversation context affects cost | Reasoning-critical and transport-resilient fallback |
| **OpenAI Realtime 2.1 mini** | Audio $10/M input + $20/M output tokens; roughly **$0.015 per wall-clock minute** at a 50/50 speaking split before text/history/tools | Lowest projected native-agent cost; same product-shaped realtime surface | Lower reasoning ceiling; must be constrained to bounded flows | Public/free/high-volume practice lane |
| **ElevenAgents** | **$0.08/call minute** included/overage; LLM and telephony billed separately; burst minutes $0.16 | Mature agent operations: workflows, testing, evals, analytics, telephony, mobile SDKs, 5k+ voices | Cascaded STT→LLM→TTS latency and separate LLM cost; more platform coupling | Turnkey contact center or multilingual deployment lane |
| **ElevenLabs APIs** | Flash/Turbo TTS $0.05/1k chars; realtime STT $0.39/hr; Scribe batch $0.22/hr | Voice quality, cloning, character continuity, narration, 70+ languages; Flash advertises 75ms TTS latency | TTS quality does not equal end-to-end agent intelligence; orchestration remains ours | Canonical media, narration, and character voice layer |
| **xAI STT/TTS** | STT $0.10/hr batch, $0.20/hr streaming; TTS $15/M chars | Lowest listed transcription price, integrated voice family, speech tags and diarization | Accuracy on Frank's names, brands, mixed German/English, and noisy rooms is unproven | First candidate for capture/transcription benchmark |

### Cost-model notes

OpenAI documents user audio at about 1 token/100 ms and assistant audio at about 1 token/50 ms. The wall-clock estimates above assume 30 seconds of user speech and 30 seconds of assistant speech. They exclude growing text context and tool charges and are therefore planning baselines, not invoices.

xAI meters audio duration sent or received. Instrument both directional audio duration and session wall time so dashboards do not incorrectly compare unlike units.

## Product routing

| Product / surface | Voice job | Default path |
|---|---|---|
| **Starlight Voice Operator** | Capture, morning brief, intent routing, repo/brand dispatch, approval, spoken receipts | Grok native realtime; OpenAI 2.1 fallback; transcript and receipts remain provider-neutral |
| **FrankX public app/site** | Founder concierge, product discovery, workshop qualification | OpenAI mini for anonymous/free sessions; Grok for authenticated/premium sessions |
| **GenCreator / Agentic Income / Starlight Foundry** | Voice intake that produces a structured Compass, workflow, WorkPacket, or implementation artifact | Chained transcript-first pipeline; text agent owns schema and approvals; optional ElevenLabs response voice |
| **AI literacy learning app** | Pronunciation, role-play, rapid drills, tutor dialogue | OpenAI mini for high-volume drills; Grok premium mentor lane; session-level provider experiment |
| **Arcanea / Anime Legends** | Canonical characters, in-world conversations, audiobooks, trailers, dubbed content | ElevenLabs character voices and long-form generation; Grok native only for live improvisational encounters |
| **Reality Architect / Soulbook / reflective products** | Guided reflection, journaling, rehearsal, personalized practices | Chained state machine for auditable flow; ElevenLabs for pre-generated practices; native Grok only for open dialogue |
| **Family Intelligence** | Oral-history capture, diarized transcription, multilingual memories, consented legacy narration | xAI/ElevenLabs/OpenAI STT bake-off; transcript-first; ElevenLabs cloning/narration only with explicit voice-owner consent |
| **Starlight Table, workshops, retreats** | Room capture, live transcription, participant summaries, multilingual access | Streaming STT plus human-approved summaries; no always-on agent actions |
| **Sales/support telephony** | Qualification, support, booking, follow-up | ElevenAgents when turnkey operations/analytics dominate; otherwise Grok/OpenAI SIP behind our agent contract |

## Internal contract

Expose one product-level interface; never import provider event schemas into domain logic.

```ts
type VoiceMode = "native-realtime" | "chained";
type VoiceProvider = "xai" | "openai" | "elevenlabs";

interface VoiceSessionPolicy {
  mode: VoiceMode;
  primary: VoiceProvider;
  fallback?: VoiceProvider;
  personaId: string;
  toolPolicyId: string;
  transcriptPolicy: "ephemeral" | "consented-durable";
  actionTier: "observe" | "propose" | "approve-to-execute";
  maxSessionMinutes: number;
  budgetCents: number;
}

interface VoiceTurnReceipt {
  sessionId: string;
  provider: VoiceProvider;
  model: string;
  transcript?: string;
  toolCalls: Array<{ name: string; status: string }>;
  approvals: Array<{ tier: string; status: string }>;
  firstAudioMs?: number;
  interruptionRecoveryMs?: number;
  inputAudioMs: number;
  outputAudioMs: number;
  estimatedCostUsd: number;
}
```

Provider adapters own WebRTC/WebSocket/SIP details. The agent/workflow layer owns intent, tools, source precedence, approvals, memory, structured artifacts, and receipts.

## Runtime and governance rules

- Browser/mobile sessions use ephemeral provider credentials. Long-lived API keys remain server-side.
- Every external write or consequential action still crosses the existing Starlight approval gate. Voice confidence never upgrades authority.
- Native sessions may speak naturally, but must emit provider-neutral transcripts/tool receipts for any action-bearing turn.
- Anonymous sessions receive bounded, read-only tools and hard duration/budget caps.
- Durable transcripts require a declared product purpose and consent state. Do not make raw room audio a default memory source.
- Custom and cloned voices require provenance, voice-owner permission, scope, and revocation metadata.
- The public UI must fail over visibly and honestly; it must not silently downgrade into a materially different persona or authority level.
- Keep the existing P50 first-audio ≤800 ms and P95 ≤1500 ms target. Measure to playable audio, not first network byte.

## Evaluation gate

Run the same 40-turn corpus against all applicable lanes:

- 10 short conversational turns, including interruptions
- 10 exact-entity/tool turns using FrankX, Arcanea, Starlight, GenCreator, repo names, German names, and Amsterdam locations
- 10 workflow/approval turns
- 10 noisy or mixed German/English turns

Score:

| Dimension | Weight |
|---|---:|
| User preference / desire to continue | 25% |
| Correct task and tool completion | 25% |
| P50/P95 first playable audio | 15% |
| Interruption and recovery quality | 10% |
| Exact entity capture / transcription | 10% |
| Cost per successful outcome | 10% |
| Operational observability | 5% |

Grok remains primary unless it fails the task/tool threshold or misses the latency SLO materially. Do not let a composite benchmark overrule a decisive user-preference lead when success and safety remain above threshold.

## Implementation sequence

1. Add the provider-neutral session policy and receipt schema.
2. Implement xAI and OpenAI native realtime adapters.
3. Preserve the existing chained adapter seam; update ElevenLabs to a voice/content role.
4. Add per-product policies from the routing table above.
5. Add budget, duration, authority, transcript, and fallback gates.
6. Run the fixed corpus and store raw results under `benchmarks/voice/2026-08/`.
7. Ship Starlight Operator first; expose public FrankX voice only after observability and kill-switch tests pass.
8. Re-evaluate pricing and model aliases monthly without changing the product-level contract.

## Source-of-truth placement

1. **Explicit human decision** — highest authority; reconcile it into the layers below.
2. **This GitHub decision and executable configuration** — normative architecture truth.
3. **Starlight Portfolio Command Center in Notion** — executive rationale, status, gates, and review.
4. **Google Drive** — research evidence, recordings, consented evaluation assets, and collaborator-ready narrative.
5. **Runtime dashboards/configuration** — observed state, never the strategy authority.

No independent provider matrix should be created elsewhere. New research updates this decision or produces dated benchmark evidence linked back here.

## Official references

- [xAI Voice API](https://x.ai/api/voice)
- [xAI API pricing](https://docs.x.ai/developers/pricing)
- [xAI Speech-to-Speech and remote MCP](https://docs.x.ai/developers/model-capabilities/audio/speech-to-speech)
- [OpenAI Realtime pricing](https://developers.openai.com/api/docs/pricing)
- [OpenAI voice-agent architecture](https://developers.openai.com/api/docs/guides/voice-agents)
- [OpenAI Realtime cost model](https://developers.openai.com/api/docs/guides/realtime-costs)
- [OpenAI Realtime tools and MCP](https://developers.openai.com/api/docs/guides/realtime-mcp)
- [ElevenAgents pricing](https://elevenlabs.io/pricing/agents)
- [ElevenAgents architecture](https://elevenlabs.io/docs/eleven-agents/overview)
- [ElevenLabs API pricing](https://elevenlabs.io/pricing/api)
