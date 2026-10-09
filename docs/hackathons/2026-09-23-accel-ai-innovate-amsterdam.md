# Accel AI Innovate Amsterdam — build plan (2026-09-23)

**Event:** Future Founders: From Open Model to Real Product. AI House, Gustav Mahlerplein 5, Amsterdam. 08:30–20:30. Build window 09:30–15:00.
**Brief (verbatim intent):** in one day, build a working AI product for a real customer on at least one approved open-weight model served through Nebius Token Factory, then prove the edge the model and infrastructure choice gives you: better quality, lower cost, faster performance, or adaptability. Nebius is required and central. Lovable and Tavily are optional accelerators.
**Brand entered:** Starlight Intelligence Systems (`starlightintelligence.ai` product surface; `starlightintelligence.org` stays the open spec).
**Status:** decision record + day plan. Written 2026-09-21. Vendor facts below are from public third-party pages; Nebius domains were not reachable from the authoring session, so re-verify model IDs and prices on `tokenfactory.nebius.com` the evening before.

---

## 1. The decision

**Build: Starlight Research Desk.** One founder question in, one sourced, attested research brief out, written into a memory the founder owns, with a cost-quality-latency receipt on every run.

Why this and not a generic chat wrapper:

- It is the product Frank already runs by hand every week (GenCreator lab reports, the SIS research surface, the AI Architect newsletter scan). The customer is real and in the room.
- Open models win structurally on exactly the four axes the judges score. A closed API cannot give EU-hosted inference, per-stage model cascades at open-weight prices, a fine-tunable brief format, or a memory whose recall is measured in CI.
- Three quarters of the substrate already exists in this repo and the Explorer site. The day is integration, not invention.

**Customer:** founders and creator-operators who publish research weekly (GenCreator cohort, FrankX newsletter readers). Named first user: Frank. Second user to cite on stage: one cohort member with an active lab-report backlog.

**Public promise (sentence case, no prestige words):** "Ask one question. Get a brief with every claim linked to its source, saved to a memory you own, on European open models at a fraction of closed-API cost."

## 1b. Raising the bar: what makes it extraordinary

A good research tool wins a category prize. Three things move it from good to the one people talk about on the train home. All three are in scope for the day; none of them is decoration.

**The receipt is the product.** Not a stats panel. A printed ticket: monospace ledger, perforated edge, a signature seal, the closed-API price beside ours on the same paper. It prints line by line as the run completes. Judges photograph it. Founders paste it under a brief. The prototype below has the exact treatment.

**The room is the customer.** Ship a QR code on stage. Anyone in AI House can submit a question from their phone; the Desk processes them in order and every brief lands in one shared vault. The memory graph on the big screen grows with the room's questions for the rest of the afternoon. That is customer evidence you do not have to claim, because forty people watched themselves generate it.

**Memory has an opinion.** The contradiction pass is the emotional beat. When the brief disagrees with what the vault believed last month, the Desk says so, amber, with three buttons: keep the prior belief, promote the new claim, or hold both for review. The founder decides; the system never silently overwrites. Nothing a chat wrapper can do, because a chat wrapper has no memory to disagree with.

Stretch, and worth the risk: kick off a LoRA on a small Qwen3 at 10:00 with sixty published briefs, run the rubric before and after at 14:30. A live before-and-after on adaptability is the rarest thing a hackathon judge sees.

### Prototype

`docs/hackathons/desk-prototype.html` is a single-file, high-fidelity prototype of the Desk on the Explorer's tokens: cascade timeline, the brief in lab-report format with resolving citations, the contradiction callout, the printed receipt with the edge meter, the constellation of typed artifacts with their renderers and truth classes, the publish stage with its approval gate, the memory graph, and the recall eval. It replays the cascade with GSAP, honours reduced motion, and holds at phone width. Numbers are marked illustrative. It is the visual contract for the day: the `/desk` route in `site/` reproduces it, it does not reinterpret it.

### Visual system for the Desk

Every token comes from the Explorer (`site/src/app/globals.css`, `site/DESIGN.md`). Nothing new is invented on the day.

| Role | Choice | Why |
|---|---|---|
| Ground | void `#060609`, glass surfaces at 2.5 to 4.5% white, 1px borders at 7% | The Explorer's ground; the receipt reads as paper against it |
| Display | Newsreader, regular weight, italic for the one emphasised phrase | The brief is editorial; a serif says "published", a grotesk says "dashboard" |
| Body | Inter, 15px, 66ch measure in the brief | The Explorer's body face |
| Data | JetBrains Mono, tabular numerals, everywhere a number sits | Receipt, cascade meta, eval table, citations |
| Semantic | cyan for open-model stages, emerald for pass and grounding, amber for contradiction, rose for the closed baseline, violet for Starlight and memory | Colour encodes state, so the eye reads the run without labels |
| Receipt paper | `#f4f1ea` with `#161513` ink, perforated bottom edge via mask, violet seal | The one warm object on a cold page; that contrast is the whole point |
| Motion | GSAP timeline: stages light in sequence, brief lines rise 6px, receipt prints line by line, the new graph node blooms with a back-out ease | One conducted sequence, not scattered effects; instant under reduced motion |

Three directions were considered and two rejected: a terminal-only "console" treatment (reads as infra, judges cannot see the customer), and a card dashboard with big-number tiles (reads as any SaaS). The editorial brief plus printed receipt is the one only this product could have.

### Quality bar before it goes on stage

- Deployed preview URL by 14:00, and it opens on a phone.
- Screenshots at 375, 768 and 1440 committed under `site/design-evidence/` per the web-release-gate.
- Lighthouse on the preview: no red. Motion respects `prefers-reduced-motion`, keyboard focus visible on the run control and the three conflict buttons.
- Every citation link on the demo briefs resolves. Every number on the receipt is computed from the run, none typed.
- Copy audited against `CREATOR.md`: sentence case, no prestige words, no invented claims. "Illustrative" labels come off only when the numbers are real.

## 1c. The wider system the Desk is stage one of: Starlight Operator for GenCreator

Yes to the direction. The Desk is not a standalone tool; it is the first stage of one operator loop that runs GenCreator's content workflow on the Starlight substrate. No to building all of it on the day. The judging brief scores Nebius central and edge proven. A build where most of the screen time is Higgsfield, OpenArt and Suno output makes Token Factory a text sidecar, and the edge story collapses. So the rule for the day is simple: every hop that thinks runs on Token Factory; closed generators render, behind adapters, and only from a brief that Token Factory wrote and signed.

### The loop, end to end

```
question ─▶ Desk (stage 1, this build)
              brief · citations · contradiction · receipt · memory atom
                 │
                 ▼
            Constellation (GenCreator CreatorPack, ADR-007)
              brief ─▶ typed artifacts: post · thread · newsletter section · 45 s script · cover · track brief
              each carries a truth class (AUTHOR_ASSERTED / EDITOR_INFERRED / EXTERNAL_EVIDENCE / GENERATED_DRAFT)
              text hops: DeepSeek V4 (draft) · GPT-OSS (voice + rubric judge) · Qwen3-Embedding (dedupe vs vault)
              stills: Flux on Token Factory, the brief's cover, in-engine
                 │
                 ▼
            Renderers (accelerators, adapters, never the engine)
              Higgsfield ─▶ UGC clip from the 45 s script (ACOS higgsfield-operator)
              OpenArt   ─▶ art-directed key visual from the cover brief
              Suno      ─▶ 60 s track from the track brief (ACOS suno-prompt-architect)
                 │
                 ▼
            Publish (gencreator.ai)
              research hub MDX · schema.org Article + FAQPage · llms.txt entry · sitemap · RSS
              approval receipt (agent-runtime-contract) before anything goes live; no autonomous publication in alpha
                 │
                 ▼
            Operator surface (Console + cockpit)
              work-graph ledger: what is legal next, what proves done, who may not self-grade
              memory graph: the Desk's graph is the Console's substrate graph, same data layer
              every stage a receipt: model · tokens · € · ms · score · truth class · signature
```

### Which existing piece does which job

| Job | Existing piece | Change needed |
|---|---|---|
| Mission, lanes, admission, per-lane receipts | `src/queen-session.ts` | None for the day; the Desk run is one mission with six lanes |
| Legal-next, proof-of-done, no self-grading | `src/work-graph.ts` + `docs/graph-engineering/CONTRACT.md` layer A | Emit one work-graph event per stage; the receipt is the proof object |
| Memory, contradiction, recall | six vaults, `src/contradiction.ts`, `src/embedding.ts` | Add `NebiusEmbeddingProvider` (already in the day plan) |
| Visual operator surface | `console/` substrate graph (2D default, 3D signature), `cockpit/agent-control-center.html` | Feed the Desk's atoms into the Console data layer; the cockpit shows the live lane board |
| Product unit and truth classes | `gencreator.ai/lib/creator-pack-contract.ts` | None; the brief becomes a CreatorPack source with EXTERNAL_EVIDENCE claims |
| Approval before publish, usage receipts, budgets | `gencreator.ai/lib/agent-runtime-contract.ts`, `/approvals` | None; wire the Desk receipt into the usage receipt |
| Research hub, llms.txt, schema, RSS | `gencreator.ai/app/research`, `app/llms.txt` | Publish adapter writes the MDX and frontmatter |
| Video, image, music renderers | ACOS `higgsfield-operator`, `suno-prompt-architect`, Higgsfield MCP, OpenArt MCP | Adapters take a signed brief in, return an asset id and a render receipt |

### What ships when

| Horizon | Scope | Nebius share of the compute |
|---|---|---|
| **23 Sept, on the day** | Desk stage 1 complete. Plus the constellation's text artifacts (post, thread, 45 s script) drafted and judged on Token Factory, the cover rendered by Flux on Token Factory, one work-graph ledger visible on the operator screen. Stretch, owned by a third person if present: one Higgsfield UGC clip from the signed script, shown once, labelled as a renderer | Every thinking hop and the stills. Near total |
| **Week after** | Publish adapter to gencreator.ai research hub with schema, llms.txt and RSS, behind the approval receipt. Suno track from the track brief. OpenArt key visual. Console data layer reads the Desk vault | Text and embeddings on Token Factory; renderers closed |
| **Month after** | Starlight Operator as the GenCreator Companion runtime (ADR-010): `AgentRuntime` provider backed by the Token Factory cascade; LoRA'd brief and post models per creator; room mode as a standing feature for cohorts | Cascade is the runtime |

### Two constraints that hold the ambition honest

- **The Console's own rule stands: nothing pre-cached masquerades as live.** If a Higgsfield clip is shown on stage, it was generated during the day from a brief the audience saw written. Otherwise it is not shown.
- **No autonomous publication.** ADR-010 holds. The publish stage produces an approval request, a human presses the button. On the day that human is Frank, on stage, and the press is part of the demo.

## 2. What exists today (verified in-repo, 2026-09-21)

| Asset | Where | Reuse |
|---|---|---|
| Pluggable embedding provider (hashing fallback, local transformer, RRF hybrid with BM25) | `src/embedding.ts`, `src/retrieval.ts` | Add a `NebiusEmbeddingProvider` behind the same interface |
| Retrieval eval harness, recall@k, runs in CI | `test/retrieval-eval.test.ts`, `npm run eval:retrieval` | The "prove the edge" number for memory |
| Contradiction detection against vault | `src/contradiction.ts` | Brief-vs-memory conflict pass |
| MCP server with `sis.memory.add / search / health / eval` | `src/mcp-server-v01.ts` | Agent-side write path; Claude Code and Cursor demo |
| Starlight Explorer, Next.js 16.3, GSAP 3.15, `react-force-graph-2d`, R3F, public `/api/vaults` | `site/` | Host the Desk UI and the live memory graph |
| Research methodology and rubric | `docs/research/_methodology/` | Quality score rubric for the judge pass |
| Lab-report loader and cluster taxonomy | `gencreator.ai/app/research/research.lib.ts` | Output format the customer already publishes |
| SIP attestation and signed receipts | `SIP.md`, `protocol/sign.mjs` | Every brief carries a verifiable receipt |

## 3. Nebius Token Factory: what to rely on

Facts gathered from public third-party sources (OpenRouter provider page, Strands and Mastra provider docs, the `nebius/token-factory-cookbook` repo). Confirm on the day.

- **API:** OpenAI-compatible at `https://api.tokenfactory.nebius.com/v1/`. Chat completions, tool calling, streaming, embeddings, image generation, fine-tuning (LoRA on Qwen3 dense, MoE and coder variants), batch.
- **MCP:** no official Nebius MCP server as of the last public check. Not a problem. The Vercel AI SDK talks to it through `@ai-sdk/openai-compatible` (or `createOpenAI({ baseURL })`). Do not spend hackathon time writing an MCP for Nebius. Tavily has an official remote MCP (`https://mcp.tavily.com/mcp/?tavilyApiKey=...`) and a native AI SDK integration; use that for the agent-side demo in Claude Code.
- **Model shortlist to pre-register (pick from the approved list on the day):**

| Stage | Candidate | Why |
|---|---|---|
| Extraction, classification, claim-quote pairing | NVIDIA Nemotron 3 Nano 30B-A3B or Qwen3 small dense | 3B active params, fastest and cheapest tier; structured JSON output |
| Synthesis and reasoning | DeepSeek V4 (or V3.x), GLM-5.x, Qwen3.5-397B-A17B, Kimi-K3 | Long context, strong citation discipline, reasoning traces |
| Rubric judge (second opinion, different family) | GPT-OSS or a second reasoning model | Cross-family judging removes self-grading |
| Memory embeddings | Qwen3-Embedding-8B | Served on Token Factory; multilingual; plugs into `src/embedding.ts` |
| Vision (optional) | Gemma 3 | Reading charts and screenshots inside sources |
| Brief cover art (optional) | Flux (LoRA adapters supported per cookbook) | One hero image per brief, same engine |

- **Video:** not evidenced on Token Factory. Do not plan on it. If a motion piece is wanted for the pitch, render it before the event with Higgsfield or HyperFrames; on the day, motion is GSAP on the receipt and the graph, nothing more.

## 4. Architecture (the day's build)

```
question
  │
  ├─ Tavily: search (n=8) → map → extract (parallel)         [accelerator]
  │
  ├─ Stage 1  Nemotron 3 Nano  → claims[] {text, quote, url, confidence}   ~cheap, fast
  │
  ├─ Stage 2  DeepSeek V4      → brief.mdx (HYPOTHESIS · METHOD · RESULTS · TAKEAWAY · NEXT)
  │                              every sentence with a claim carries [n] → url
  │
  ├─ Contradiction pass         src/contradiction.ts vs vault (what did we believe before?)
  │
  ├─ Judge  GPT-OSS            → rubric score 0–10 + grounding rate (cited claims / claims)
  │
  ├─ Memory write               sis.memory.add (JSONL truth) + Qwen3-Embedding vector (sidecar)
  │
  └─ Receipt                    {models, tokens, €, ms per stage, score, grounding, SIP attestation}
                                 rendered with GSAP; memory graph node appears live
```

**Where it runs:** Next.js 16 app in `site/` (route `/desk`), deployed on Vercel from a branch preview. Server actions call Nebius through the AI SDK. Memory writes go to a hackathon vault (`public-vault/` clone) so the graph view has data from run one.

**Edge meter (the judging hook):** the same question runs once through the cascade and once through a single closed-API baseline if credits allow, or against the published closed-API price if not. Show €/brief, seconds/brief, rubric score, grounding rate side by side. This is the artifact judges photograph.

**Model cascade is the architecture story.** Small model where the work is mechanical, large model where the work is judgment, different family as judge. Say it once on stage, then let the receipt say it again.

## 5. Proving the edge (numbers, not adjectives)

| Axis | Measurement | Where it comes from |
|---|---|---|
| Cost | € per brief, per stage | token counts × Token Factory list price, in the receipt |
| Quality | rubric score (methodology rubric) and grounding rate | judge stage, second model family |
| Speed | ms per stage, time to first token | receipt |
| Adaptability | recall@1/3/5 of memory with Nebius embeddings vs the keyword baseline | `npm run eval:retrieval`, run live on stage |
| Adaptability (stretch) | LoRA on a small Qwen3 for the brief format, before/after rubric | Token Factory fine-tuning, dataset prepared before the event |
| Sovereignty | EU-hosted inference, JSONL the customer owns, signed SIP receipt | architecture, shown in the receipt |

Run the eval harness on stage. A recall table that the audience watches being computed beats a slide.

## 6. Day plan (build window 09:30–15:00)

Roles assume two to three people. Solo: drop the LoRA stretch and the Lovable surface, keep everything else.

| Time | Track A (pipeline) | Track B (surface) |
|---|---|---|
| 09:30–10:00 | Keys in Vercel env, `@ai-sdk/openai-compatible` wired, one chat call to each shortlisted model, record prices | `site/app/desk` route scaffold, receipt component skeleton, graph view pointed at hackathon vault |
| 10:00–11:00 | Tavily search+extract → Stage 1 claims JSON (Zod schema, structured output) | Question form, streaming brief view |
| 11:00–12:00 | Stage 2 synthesis with citation discipline; contradiction pass | Receipt renders live stage-by-stage (GSAP count-up, one reveal, reduced-motion honoured) |
| 12:00–12:30 | `NebiusEmbeddingProvider` in `src/embedding.ts`; run `eval:retrieval` head to head | Graph node appears on memory write |
| 12:30–13:30 | Judge stage, grounding rate, SIP receipt signing | Edge meter side-by-side panel |
| 13:30–14:15 | Run the three demo questions end to end, freeze the numbers; open the room queue (QR, one shared vault) | Polish against the prototype: typography, empty states, mobile at 375, screenshots for design-evidence |
| 14:15–15:00 | Stretch: LoRA job on Qwen3 small, or Flux cover art | Demo script rehearsal, timing to 3 minutes |

**Lovable:** one deliberate use only, if a third person is free: the customer intake and waitlist page for `starlightintelligence.ai/desk` (name, weekly research question, current tool spend). It is evidence of customer pull, not part of the product stack. Do not let it fragment the Next.js build.

## 7. Pre-event (22 September evening)

1. Token Factory account, API key, credits confirmed; approved-model list saved; prices noted.
2. Tavily key; remote MCP added to Claude Code for the agent-side demo.
3. Branch in this repo with the `/desk` route scaffold and env plumbing committed (no product logic, keeps the "built on the day" spirit honest).
4. Three demo questions chosen from the GenCreator research backlog, with one where the vault already holds a prior belief so the contradiction pass fires on stage.
5. Optional LoRA dataset: 60–120 lab-report examples in the six-section format, exported from `gencreator.ai/content/research/`.
6. Laptop: `pnpm install` in `site/`, Vercel CLI authenticated, preview deploy proven.

## 8. Demo script (3 minutes)

1. **10 s.** "Every founder I work with does research by hand once a week. Here is the question one of them asked me yesterday." Type it.
2. **60 s.** Watch the cascade. Put the QR up: "ask it something now, it goes into the same memory." Claims appear from Nemotron, brief streams from DeepSeek, one contradiction flag against last month's belief.
3. **40 s.** Receipt lands. Read three numbers aloud: cost, seconds, grounding rate. Then the edge meter: same question, closed-API price beside it.
4. **30 s.** Memory graph: the node appears, linked to the sources and the prior belief. Run `eval:retrieval` in a terminal. Recall table prints.
5. **20 s.** "Every brief is signed, every claim links to its source, the memory is a JSONL file the founder owns, and it ran on open models in Europe. That combination is only possible now." Stop.

## 9. How judges will rank, and how to inspire

Nothing published beyond the brief. Reading the brief and the sponsor set, the scoring axes are almost certainly:

- **Works, live.** A deployed URL beats slides. Preview deploy on Vercel before 14:00.
- **Real customer.** Name the person, show the backlog, show the intake page with sign-ups from the room.
- **Edge proven.** Numbers on the four named axes. Judges at a Nebius event want to see open models win on cost and adaptability specifically; give them the receipt.
- **Nebius central.** Five model calls per brief, all Token Factory, plus embeddings and the eval. Say the model names.
- **Why now.** Open reasoning models with citation discipline, EU-hosted, at these prices, did not exist a year ago.
- **Founder potential.** Accel is in the room. The Desk is one surface of Starlight Intelligence Systems; say the wider system in one sentence, not three.

What inspires a room of builders is watching a system prove itself in front of them. The eval table computing live, the contradiction flag firing, and the receipt with real euros do that. Keep the deck to zero slides if the product is up; one slide with the architecture if it is not.

## 10. Risks and fallbacks

| Risk | Fallback |
|---|---|
| Approved-model list excludes a shortlisted model | Every stage is a config string; swap within the same tier |
| Structured output unreliable on the small model | Ask for JSON in the prompt, validate with Zod, retry once, fall back to the synthesis model for extraction |
| Tavily rate limits | Cache extracts on disk keyed by URL; demo questions pre-warmed |
| Nebius embeddings dimension mismatch with sidecar index | Index is a rebuildable artifact by design; rebuild on provider change |
| Preview deploy flakes | Local `pnpm dev` on the demo laptop, phone hotspot |
| LoRA job does not finish | It is a stretch; show the dataset and the before-score, promise the after |

## 11. After the event

- Port `NebiusEmbeddingProvider` and the receipt schema into `main` through the normal board gate if they earn it.
- Write the run as a lab report in the GenCreator research format; it is itself a brief the Desk produced.
- Log the operational outcome in `memory/vaults/operational-vault.md` and the decision in `strategic-vault.md`.

Built on SIP.
