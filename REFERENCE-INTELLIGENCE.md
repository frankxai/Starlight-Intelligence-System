# Starlight Reference Intelligence

Reference intelligence turns external design evidence and Frank's preference decisions into executable constraints for agents. It is not a bookmark collection and it is not permission to copy.

## Authority order

When sources disagree, use this order:

1. Brand constitution, product truth, and repository-local `taste.md` / `design.md`.
2. Approved preference receipts in the private Starlight Quality Index.
3. A locked primary reference with bounded secondary references.
4. Live research from Refero or another named source.
5. General model knowledge.

External references inform decisions. They never override owned canon, accessibility, factual integrity, product behavior, or production constraints.

## System boundaries

| Surface | Role | May do | Must not do |
|---|---|---|---|
| ChatGPT Work Mode | Direction, live public research, visual review, human curation | Inspect public references, compare options, write approved decisions to Notion/GitHub | Pretend a connector is persistent when it is not available in the current session |
| Codex / Claude Code | Primary implementation and visual QA | Query Refero, compile repo-local design contracts, implement, render, compare, test | Build substantial visual work from vague adjectives alone |
| Hermes | Persistent curator and scheduled research operator | Watch approved sources, normalize records, maintain freshness, prepare candidate packs | Promote candidates to canon without an approval receipt |
| Manus | Burst execution worker | Produce alternative prototypes, wide research, or isolated full-project explorations | Become the source of truth, silently publish production, or overwrite canonical repos |
| Notion | Human curation cockpit | Triage, approve, reject, annotate, assign brand/surface roles | Hold the only machine-executable copy of a design decision |
| GitHub | Executable truth | Store contracts, catalogs, receipts, schemas, and project-local overrides | Store secrets or redistribute unlicensed source assets |

## Reference classes

Every item has exactly one rights class:

- `reference-only`: analyze principles; do not ship the source asset, composition, copy, or proprietary font.
- `licensed-production`: production use is allowed only within recorded license boundaries.
- `owned-or-generated`: owned, commissioned, or generated source that may enter production after provenance and quality gates.
- `unknown`: intake only. It cannot influence production until resolved.

Every item also has a decision state: `candidate`, `approved`, `rejected`, or `archived`.

## Required record

A usable record contains:

- stable ID, title, canonical URL, owner/creator, capture date, last verification date;
- source type: style, screen, flow, site, component, motion, imagery, copy, or tool;
- rights class and evidence;
- applicable brands, surfaces, and bounded role;
- observed principles, signature memory, and anti-reference;
- hard constraints and explicit non-transferable traits;
- quality, distinctiveness, relevance, and confidence scores;
- decision owner, decision state, and rationale;
- production artifacts or preference receipts created from the item.

A URL without this context is only an inbox item.

## Operating loop

1. **Capture** a URL, screenshot, Refero style/screen/flow ID, or owned artifact.
2. **Normalize** provenance, rights, source type, brand, surface, and role.
3. **Extract principles**: hierarchy, rhythm, typography posture, material, interaction causality, media treatment, proof behavior, or journey logic.
4. **Reject copying**: record what must not be transferred.
5. **Compare** candidates against the same real product content and target viewport.
6. **Approve** one dominant foundation; assign secondary references narrow jobs.
7. **Compile** the decision into repo-local `DESIGN.md`, tokens, component rules, and a reference lock.
8. **Implement and render** mobile plus desktop states.
9. **Judge** deterministic gates first, then blind or producer-independent taste review for consequential work.
10. **Record the preference receipt**: winner, loser, rationale, judge, confidence, and links to rendered evidence.
11. **Refresh or archive** when the live source, brand strategy, or implementation constraints change.

## Reference lock

Before substantial visual implementation, record:

```text
Primary foundation: <approved source or owned direction>
Preserve: <3-5 signature traits>
Secondary sources: <source -> one bounded job>
Role rules: <CTA-only, typography-only, flow-only, etc.>
Media strategy: <owned/generated/licensed/placeholder + dimensions>
Reject: <generic defaults and source traits that must not transfer>
Token commitments: <canvas, type, accent, spacing, radius, border/shadow>
Decision owner: <human>
```

One source owns the foundation. Secondary sources do not get averaged into a safe centroid.

## Hard rejection gates

Reject an artifact regardless of its taste score when it contains:

- copied or unlicensed production material;
- fabricated product proof or unsupported claims;
- inaccessible interaction or illegible responsive states;
- broken production constraints, runtime errors, or missing core states;
- generic AI decoration replacing required product/media evidence;
- no traceable reference lock for substantial visual work;
- visual polish that contradicts the brand constitution or product truth.

## Refero

Refero is the default live research surface for web/product design evidence. Its three useful layers are styles, screens, and flows. The public Refero Styles library can provide agent-readable `DESIGN.md` material; the MCP adds live search across curated styles, product screens, and user flows.

Official Codex installation:

```bash
codex plugin marketplace add referodesign/refero_skill
codex plugin add refero@refero
```

Restart Codex and complete OAuth on first connection. The remote endpoint is `https://api.refero.design/mcp`. Project configs are kept under `integrations/mcp/`; no token belongs in Git.

For Hermes running locally, add the remote MCP entry from `integrations/mcp/refero.hermes.yaml`, then run `hermes mcp login refero`. For a remote/headless Hermes gateway, use the dashboard OAuth flow, paste-back/SSH forwarding, or Hermes' official `mcp-oauth-remote-gateway` skill.

## Manus

Manus is an optional worker, not a design authority. Invoke it when the task benefits from autonomous wide research, a disposable alternative prototype, or long-running isolated execution. Keep Codex as the primary canonical implementation path.

Install the official API v2 guidance for Codex:

```bash
npx skills add https://open.manus.ai/docs --skill manus-api --agent codex --global --yes
```

Store `MANUS_API_KEY` in the local secret manager or environment, never in Git. Use API v2 projects for shared instructions, files for inputs, tasks for execution, webhooks for completion, and website endpoints only for intentionally isolated Manus-hosted experiments. Export winning code/artifacts to a branch and run the normal Starlight review gates before promotion.

Hermes may call Manus API v2 as a worker after a scoped local integration is configured. Give it a project/task allowlist, budget ceiling, output destination, and explicit confirmation gate for publishing or external writes.

## Cost posture

Use free/public Refero Styles and owned references for ordinary work. Use Refero MCP when screen/flow evidence materially changes a build. Use Manus credits only when autonomous breadth or execution latency is worth paying for. Neither tool replaces the preference memory accumulated in the Quality Index.

## Canonical stores

- Human cockpit: Notion — **Taste, Design & Worldbuilding** → **Taste & Reference Library**.
- Machine preference memory: private `starlight-quality-index/references/catalog.yaml`.
- Agent operating contract: this file plus repository-local `taste.md` and `design.md`.
- Production artifacts: their owning product repositories and governed media fabric.
