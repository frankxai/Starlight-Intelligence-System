# Ecosystem Integration — How SIP travels across every surface

> Status: canonical v7.3.1 integration map. Source of truth for which ecosystems SIP lives inside, at what maturity, and through which artifact.

---

## 1. The protocol / reference distinction

**SIP is a protocol. Claude Code is the reference. These are not the same thing.**

Read that twice. It matters more than anything else on this page.

The Starlight Intelligence Protocol is a six-layer contract — file names, an attestation format, an MCP registry shape, a command taxonomy, a sovereignty clause, an optional archetype extension. All of it is expressible in plain markdown and (where code is involved) MIT-licensed command scaffolds. None of it requires a specific vendor, a specific model, or a specific runtime. Every layer is legible to a human, parseable by any LLM, and portable across tools.

Claude Code is the tool Frank builds in. That's the entire story. Because Frank builds here, this is where the reference implementation is deepest — the 9 substrate commands, the 6 v6 strategic commands, the 7-agent registry, the MCP server wired into `~/.claude/settings.json`, the full adapter stack. It's the most thoroughly-tested SIP runner on the planet. That makes it the *reference*, not the *requirement*.

The distinction matters because adopters who land on this repo and see `.claude/` everywhere reasonably worry they need to adopt Claude Code to use the protocol. They don't. **Anyone who honors the file contract (Layer 1), emits attestation blocks (Layer 2), and respects the sovereignty clause (Layer 5) is running a SIP-conformant environment.** Cursor user, ChatGPT-only creator, Gemini CLI operator, someone with a homebrew Python agent — all conformant as long as the three invariants travel with the work.

This doc is the map of how SIP travels. Read it if you want to know which surfaces are first-class today, which need exports, which need v7.4+ modality commands, and which simply carry the attestation block in plain markdown.

---

## 2. Full ecosystem map

Every surface where SIP currently lives or is scheduled to live. Categorized by integration shape, not by vendor.

| Surface | Category | SIP fit | Integration maturity | v-release | Key artifact |
|---|---|---|---|---|---|
| Claude Code | Code-native AI | Reference | live | v7.0 | All commands, MCP server |
| Claude Projects | Collaborative workspace | Strong | v7.4 scheduled | v7.4 | `/sip-export claude-project` |
| Claude.ai web (chat) | General chat | Compatible | manual paste | always | Attestation block copy-paste |
| Claude Design | UI / artifact studio | Strong (artifact-native) | v7.4 scheduled | v7.4 | Artifact stamping, `/badge` inline |
| Cowork (Anthropic) | Multi-user collab | Strong (alliance-fit) | v7.4 scheduled | v7.4 | `/sip-export cowork` + alliance manifest |
| Cursor | Code editor + AI | Strong | v7.4 scheduled | v7.4 | `.cursorrules` + MCP |
| Codex (OpenAI) | Coding CLI | Strong | manual | v7.1 | `AGENTS.md` supported natively |
| ChatGPT Projects | Workspace | Strong | v7.4 scheduled | v7.4 | `/sip-export chatgpt-project` |
| Custom GPTs (GPT Store) | Published assistant | Compatible | manual | v7.4 | Export template |
| ChatGPT Canvas | Document collaboration | Compatible | manual | always | Attestation block copy-paste |
| Gemini CLI | Terminal AI | Strong | live | v7.1 | `GEMINI.md` supported |
| Gemini Gems | Persistent instruction | Medium (no file uploads) | v7.4 scheduled | v7.4 | Single-file export |
| Gemini Deep Research | Report generation | Compatible | manual | always | Stamp report output |
| Nano Banana / Imagen | Image generation | Modality | v7.5 scheduled | v7.5 | `/sip-attest-image` |
| ChatGPT Image / DALL-E | Image generation | Modality | v7.5 scheduled | v7.5 | `/sip-attest-image` |
| Midjourney | Image generation | Modality | v7.5 scheduled | v7.5 | `/sip-attest-image` + sidecar |
| Suno | Music generation | Modality | v7.5 scheduled | v7.5 | `/sip-attest-audio` + skill compose |
| Udio | Music generation | Modality | v7.5 scheduled | v7.5 | `/sip-attest-audio` |
| ElevenLabs | Voice synthesis | Modality | v7.5 scheduled | v7.5 | `/sip-attest-audio` |
| Veo / Runway / Sora | Video generation | Modality | v7.6 scheduled | v7.6 | `/sip-attest-video` |
| Notion AI | Docs + DB | Compatible | manual | always | Markdown + attestation block |
| Obsidian | PKM | Compatible | manual (excellent) | always | Drop-in `.md` friendly |
| Framer / Webflow | Site builders | Compatible (sovereign surfaces) | v7.4+ | — | Creators publish to their own |
| OpenCode | Open code CLI | Strong | live | v7.1 | `AGENTS.md` (compact) |
| Cline | Code editor | Strong | live | v7.0 | `.clinerules` adapter |
| Antigravity | Code editor | Strong | live | v7.0 | `.antigravity/` adapter |
| MCP-compatible runtimes | Anything | Strong | varies | v7.1+ | `starlight-mcp` |

### Categorization

- **Code-native runtimes** — Claude Code, Cursor, Codex, Gemini CLI, Cline, Antigravity, OpenCode. First-class. Commands run natively; `starlight-mcp` plugs in; file contract lives in the repo.
- **Workspace platforms** — Claude Projects, ChatGPT Projects, Cowork, Gemini Gems, Notion AI. Artifacts ship via `/sip-export <target>`. The workspace gets a packaged bundle (instructions + knowledge + attestation block) rather than running commands itself.
- **Artifact surfaces** — Claude Design, ChatGPT Canvas, Gemini Deep Research. The platform produces the artifact; SIP stamps the output. Attestation travels inline in the rendered result.
- **Modality generators** — Nano Banana, Imagen, Midjourney, Suno, Udio, ElevenLabs, Veo, Runway, Sora. Output files carry attestation via v7.5+ modality commands: metadata embed + sidecar `.sip.json`.
- **Sovereign publishing** — Obsidian, Framer, Webflow, any feed or site the creator controls. Attestation travels in markdown, footer, EXIF, or release notes. The creator's surface; SIP just rides along.

---

## 3. Integration patterns

Three canonical patterns cover every surface above. If you're wiring a new tool, pick which pattern applies and follow its shape.

### Pattern A — Run the command runner

**For:** code-native runtimes.
**Shape:** Install `starlight-mcp`, drop in the platform adapter, run `/sip-*` commands natively.
**Example (Cursor):**

1. Add `~/.cursor/mcp.json` with the `starlight` server entry (same JSON as the Claude Code example in `README.md`).
2. Drop `.cursorrules` into the repo pointing to `SKILL.md`.
3. Commands like `/sip-attest`, `/alliance-forge`, `/vertical-spawn` run in-editor via the MCP bridge.

This is the highest-fidelity integration. No export, no translation. The file contract is the source of truth; the tool reads it directly.

### Pattern B — Export to workspace

**For:** workspace platforms that accept instructions + knowledge uploads but don't execute commands.
**Shape:** `/sip-export <target> <artifact>` bundles everything the workspace needs into a .zip or archive the user uploads once.
**Example (Claude Project):**

```
/sip-export claude-project my-vertical
```

Emits `my-vertical-claude-project.zip` containing:
- `custom-instructions.md` — distilled `SKILL.md` + voice assignment
- `knowledge/` — `SIP.md`, `VOICES.md`, `VERTICALS.md`, any vertical canon
- `mcp-config.json` — if the user has Claude Projects MCP enabled
- `badge.svg` — inline "Built on SIP" badge
- `ATTESTATION.md` — the block to paste into any artifact the project produces

User uploads once. The project now composes SIP-aware artifacts. Updates ship as re-exports.

### Pattern C — Modality-attest the output

**For:** generators that produce non-text output (audio, image, video).
**Shape:** Generate the artifact in the native tool, then run `/sip-attest-<modality>` against the file. The command embeds attestation in metadata and writes a sidecar `.sip.json`.
**Example (Suno):**

```
/sip-attest-audio track.mp3 --tool suno --canon hz --artist "Frank Riemer"
```

Produces:
- `track.mp3` with ID3v2 `TXXX:SIP_ATTESTATION` frame embedded
- `track.sip.json` sidecar with full attestation block + prompt provenance + canon pin
- A one-line console output for release notes

The sidecar is the canonical record; the embedded frame is the convenience copy for tools that read ID3. Same pattern for image (EXIF `UserComment` + `.sip.json`) and video (MP4 `udta` atom + `.sip.json`).

---

## 4. Suno + music integration

Frank asked specifically about Suno. Here's the shape.

The music story is already partially in place. Two skills ship today: `suno-ai-mastery` (prompt engineering) and `suno-prompt-architect` (structured prompt composition). Music IS is a live sovereign vertical with four labels (Frank Riemer neo-classical, Frank's Vibes electronic, Arcanea Guardian/cinematic, Nona punk/alt) under Arcanea Records. The compounding mechanism is attested tracks across a growing catalog.

**Current state (v7.3):** Prompt → Suno generation → manual attestation in release notes. Works. Attestation is text in the release description, traveling with the track to Spotify / Apple Music / Bandcamp.

**v7.5 scheduled:** `/sip-attest-audio` ships. Full flow:

```
# 1. Compose prompt (existing skill)
/suno-prompt-architect "guardian cinematic, hz=528, minor key, 90bpm"

# 2. Generate in Suno (external tool)
# → track.mp3 downloaded

# 3. Attest
/sip-attest-audio track.mp3 \
  --tool suno \
  --canon arcanea-guardian \
  --hz 528 \
  --label arcanea-records \
  --prompt-source suno-prompt-architect

# → track.mp3 (metadata embedded)
# → track.sip.json (sidecar)
# → release-notes.md (attestation-rich, ready for distro)
```

**Distribution layer:** Spotify, Apple Music, and most DSPs accept ISRC + custom tags on ingest. The sidecar populates those automatically when piped through the distribution command (e.g. DistroKid API, CD Baby API, or a direct ingest script).

**ATTESTATIONS.md:** Every attested track appends an entry to the vertical's `ATTESTATIONS.md` ledger — permanent public record of what was composed, when, with which canon, under which label. This is what compounds.

**Scaffold exists today:** The commands are defined, the skills ship. What's pending is the binary metadata embed (ID3v2 writer) and the distro integration glue. That lands in v7.5.

---

## 5. Claude Design integration

Frank asked about this one too. Claude Design is Anthropic's artifact studio — generates shareable HTML / React / SVG / interactive artifacts. It fits SIP strongly because the artifacts themselves are full documents, not opaque blobs, which means attestation can live *inside the artifact's UI*, not as external metadata.

**Why this matters:** for most surfaces, attestation is metadata — a block of text at the bottom of a file. In Claude Design, attestation becomes part of the designed experience. The badge is visible. The provenance is a clickable link. The user who views the artifact sees the protocol lineage.

**v7.4 plan:** `/sip-export claude-design <artifact>` generates an artifact with:

1. **Visible `/badge` SVG inline** — the same badge served from `starlightintelligence.org/badge`, rendered in the artifact's footer or header.
2. **Attestation block in footer** — full SIP block, human-readable, with pinned substrate version and contributing nodes.
3. **Canonical link back** — every "Built on SIP" phrase links to `starlightintelligence.org/protocol`.
4. **React component** (optional) — `<SIPAttestation />` component exported as part of the artifact bundle, so subsequent Claude Design sessions can reuse the block consistently.

**Integration is artifact-native.** That's the key distinction vs. workspace platforms. Claude Projects gets a zip of knowledge files; Claude Design gets attestation built into the artifact's HTML. The attestation isn't metadata about the artifact — it's part of how the artifact renders.

---

## 6. What travels, what doesn't

Explicit. Read this when scoping an integration — what you can promise the adopter, what you can't.

| Feature | Travels across ecosystems? | Why |
|---|---|---|
| "Built on SIP" attestation block | Yes — universal | Markdown text; parseable anywhere markdown renders |
| File contract (SKILL / AGENTS / MEMORY) | Yes — via export commands | Text files adapt to target's knowledge/config layer |
| Command taxonomy (`/sip-attest` etc.) | Partially — native to MCP-enabled runtimes | Workspace platforms must use exports; commands don't execute inside Claude Projects or Gems |
| MCP server (`starlight-mcp`) | Yes for MCP-enabled; no otherwise | Claude Code, Cursor, Codex, Gemini CLI supported natively; Claude Projects partial; most workspace surfaces no |
| Vault memory (JSONL) | Yes — via sync | `starlight-mcp` handles cross-tool access; exports snapshot the state at export time |
| Canon composition (Arcanea) | Yes — license permits (CC-BY-NC) | License terms travel inside the attestation block |
| Sovereignty clause | Yes — non-waivable | Any adopter honoring SIP inherits Layer 5 |

The pattern underneath: **text travels, code conditionally travels, commands don't travel.** Attestation is text, so it goes everywhere. Commands are runtime-specific, so they run only where the runtime matches. Exports are the bridge — they convert a running-state composition into a portable text bundle.

---

## 7. Non-negotiables for any integration

Any ecosystem integration — today's or future's — must satisfy all five. A tool that fails any of these is not SIP-conformant and must not ship an integration.

1. **Preserve attestation visibility.** An integration that strips, hides, or obfuscates the "Built on SIP" block is hostile to the protocol. Attestation is the compounding mechanism; removing it breaks the contract. Refuse the integration.
2. **Honor the sovereignty clause.** An integration must not require folding sovereign data into the target's opaque storage without a path back out. Exit must remain available. Data must remain the sovereign's.
3. **Allow round-trip.** An artifact composed in Claude Code, exported to ChatGPT Projects, edited there, and brought back to Claude Code must still validate against its attestation block. Breaking round-trip means breaking provenance.
4. **Pin substrate version.** Every integration declares which SIP version it supports. A Claude Projects export says `sip_version: 1.1.0` in its manifest; a Suno attestation sidecar pins the same. Version pinning is how SemVer discipline survives the translation.
5. **Respect canon licenses.** If an artifact composes Arcanea canon (CC-BY-NC), the integration must carry those terms into the target. A commercial use of Arcanea canon via a SIP integration without respecting CC-BY-NC is a substrate breach regardless of which tool made the breach easier.

---

## 8. Roadmap + current status

What ships when. Cross-reference before promising a capability to an adopter.

| Version | Date | Ecosystem reach |
|---|---|---|
| **v7.3** (current) | Now | Claude Code first-class. Cursor / Codex / Gemini CLI / OpenCode / Cline / Antigravity adapters live. Manual attestation works in any markdown tool (Notion, Obsidian, Canvas, Deep Research). Suno + image modalities: manual attestation only. |
| **v7.4** | ~2 weeks | `/sip-export` commands land for Claude Projects, ChatGPT Projects, Gemini Gems, Cowork, Cursor, Claude Design. Custom GPTs export template. Workspace platforms become first-pass supported. |
| **v7.5** | ~4 weeks | Modality attestation ships. `/sip-attest-audio` (Suno, Udio, ElevenLabs). `/sip-attest-image` (Nano Banana, Imagen, DALL-E, Midjourney). Binary metadata embed + sidecar `.sip.json` standard. |
| **v7.6** | ~6-8 weeks | Video modality. `/sip-attest-video` (Veo, Runway, Sora). MP4 atom embed + sidecar. |
| **v7.7** | TBD | Interactive modality — attested games, attested apps, attested simulations. Shape still being scoped. |

Currently **live and in production:** Claude Code (reference), Cursor / Cline / Antigravity / Codex / Gemini CLI / OpenCode (via adapters). Everything else above is either scheduled (v7.4+) or works today via manual attestation (universal markdown path).

---

## 9. FAQ

**Do I need Claude Code to use SIP?**
No. Claude Code is the reference implementation. Any runtime that lets you maintain the file contract + emit attestation blocks is SIP-conformant. Many adopters never touch Claude Code.

**Can I adopt SIP if I only use ChatGPT?**
Yes. Keep the file contract in git. Use `/sip-export chatgpt-project` (v7.4) to bundle it into a ChatGPT Project. Stamp outputs manually today; via v7.4 commands once shipped.

**Will SIP work with [tool X]?**
If X supports markdown + system prompts, yes at minimum (manual attestation). If X supports MCP, the integration is tighter. If X structurally strips metadata or forbids inline attribution, the answer is no — SIP refuses integration with tools that are hostile to attestation.

**What if my tool strips attestation?**
SIP refuses integration. This is a feature, not a bug. The protocol's compounding mechanism is public attribution; removing attribution breaks the compounding. If the tool's value proposition is cleaner output via stripped metadata, it's not a SIP-compatible tool. Pick a different surface.

**Can I use Suno + SIP?**
Yes. v7.5 ships `/sip-attest-audio` with full ID3v2 embed + sidecar. Today: manual sidecar + release notes works. Skills (`suno-prompt-architect`, `suno-ai-mastery`) already compose with the substrate.

**Multi-model workflows — how do I attest a composite?**
Compose attestation the same way you compose output. Each constituent modality is attested separately (the Suno track gets its audio attestation, the Nano Banana cover gets its image attestation), then `/sip-compose-modality` (v7.6) generates a composite attestation listing each component and its pinned attestation. The composite travels with the composite artifact.

**What about on-device models (Gemini Nano, Apple Intelligence)?**
Same answer as any runtime: if you can maintain the file contract and emit attestation, it's conformant. On-device models that support system prompts work manually today. Tighter integration is adopter-led — if someone ships an adapter, we publish it.

**Can I build my own SIP runner?**
Yes. The protocol is MIT. The reference commands are MIT. You can build a Python / Go / Rust runner that reads `SKILL.md`, emits attestation, and honors the sovereignty clause — and it's just as SIP-conformant as Claude Code is. Attribution to SIP stays.

---

**Built on SIP** — Starlight Intelligence Protocol

Substrate: starlightintelligence.org/protocol v1.1.0
Layers used: [file-contract, attestation, commands, sovereignty, archetype-extension]

Verticals:
- starlight-intelligence-system@v7.3.1 · ecosystem integration hub

Generated: 2026-04-24
Attestation is compounding, not credit transfer: every composition strengthens every node.
---
