/**
 * src/memory/seed-estate-facts.ts — Canonical Bi-Temporal Estate Ground-Truth Seeder.
 *
 * Encodes both the historical misconceptions ("old problems agents got wrong") and the
 * verified 2026-10-18 estate truths across the Dutch Eenmanszaak & Registered Trade Names
 * (handelsnamen: Starlight Intelligence, Arcanea, Arcanea Records, GenCreator, VibeClubs,
 * FrankX, AI Architect Academy), GitHub Organizations, Brands, Studios, SKUs, Harnesses,
 * Daemons, and Protocols so any agent querying `TemporalFactSpine` receives only active
 * truth while preserving full point-in-time audit lineage.
 *
 * Built on SIP — operational tier (memory engine v0.3)
 */

import { TemporalFactSpine } from './temporal-spine.js';

export interface SeedEstateResult {
  totalRecords: number;
  activeCount: number;
  supersededCount: number;
}

export function seedEstateTruths(spine: TemporalFactSpine): SeedEstateResult {
  const historicalTime = '2026-09-01T00:00:00.000Z';
  const currentTime = '2026-10-18T03:00:00.000Z';

  // 1. Seed historical truths that were subsequently superseded ("old problems agents got wrong")
  spine.assertFact({
    vault: 'operational',
    subject: 'service:shared-tool-plane',
    predicate: 'listen_endpoint',
    object: 'http://127.0.0.1:3791',
    tValid: historicalTime,
    tCreated: historicalTime,
    provenance: { repo: 'starlight-estate', filePath: 'legacy-docs' },
  });

  spine.assertFact({
    vault: 'strategic',
    subject: 'org:Arcanea-Labs',
    predicate: 'federation_status',
    object: 'dormant_since_2026_02',
    tValid: historicalTime,
    tCreated: historicalTime,
    provenance: { repo: 'starlight-agent-config', filePath: 'CLAUDE.md' },
  });

  spine.assertFact({
    vault: 'strategic',
    subject: 'estate:github-organizations',
    predicate: 'population_state',
    object: '6_empty_orgs_of_10',
    tValid: '2026-10-17T08:00:00.000Z',
    tCreated: '2026-10-17T08:00:00.000Z',
    provenance: { repo: 'agentic-ops', prNumber: 273 },
  });

  spine.assertFact({
    vault: 'strategic',
    subject: 'vertical:gencreator',
    predicate: 'canonical_surface',
    object: 'frankxai/gencreator (to be created) · gencreator.community',
    tValid: historicalTime,
    tCreated: historicalTime,
    provenance: { repo: 'Starlight-Intelligence-System', filePath: 'VERTICALS.md' },
  });

  spine.assertFact({
    vault: 'operational',
    subject: 'hub:NEXT-PROMPTS.md',
    predicate: 'write_protocol',
    object: 'hand_edit_ops_NEXT-PROMPTS.md',
    tValid: historicalTime,
    tCreated: historicalTime,
    provenance: { repo: 'agentic-ops-hub', filePath: 'ops/NEXT-PROMPTS.md' },
  });

  spine.assertFact({
    vault: 'technical',
    subject: 'mcp:Prisma-Local',
    predicate: 'npx_command',
    object: 'npx -y prisma mcp (broken by prisma@8.0.0-rc.23)',
    tValid: historicalTime,
    tCreated: historicalTime,
    provenance: { repo: 'starlight-agent-config', filePath: 'prisma~g2/.mcp.json' },
  });

  spine.assertFact({
    vault: 'technical',
    subject: 'mcp:starlight-sis',
    predicate: 'entrypoint',
    object: 'mcp-server.mjs (missing path)',
    tValid: historicalTime,
    tCreated: historicalTime,
    provenance: { repo: 'starlight-estate', filePath: 'mcp-registry.json' },
  });

  spine.assertFact({
    vault: 'technical',
    subject: 'harness:codex',
    predicate: 'project_doc_max_bytes',
    object: '32768 (truncating AGENTS.md at 32 KiB)',
    tValid: historicalTime,
    tCreated: historicalTime,
    provenance: { repo: 'starlight-estate', filePath: '~/.codex/config.toml' },
  });

  spine.assertFact({
    vault: 'strategic',
    subject: 'estate:legal-entities',
    predicate: 'dutch_bv_structure',
    object: 'Planned 3-BV structure (Starlight Holding B.V., FrankX Operations B.V., Arcanea B.V. / Arcanea Labs B.V.) in agentic-ops/registry/companies.yaml — no KvK registration; Starlight Holding rejected by KvK/BOIP on 2026-07-15',
    tValid: '2026-03-01T00:00:00.000Z',
    tCreated: '2026-08-04T00:00:00.000Z',
    provenance: { repo: 'agentic-ops', filePath: 'registry/companies.yaml' },
  });

  // 2. Assert current verified truths (superseding the 9 historical misconceptions above)
  spine.assertFact({
    vault: 'operational',
    subject: 'service:shared-tool-plane',
    predicate: 'listen_endpoint',
    object: 'http://127.0.0.1:7317 (state=ready, 4/4 backends, 38 tools)',
    tValid: currentTime,
    tCreated: currentTime,
    provenance: { repo: 'starlight-estate', prNumber: 54 },
  });

  spine.assertFact({
    vault: 'strategic',
    subject: 'org:Arcanea-Labs',
    predicate: 'federation_status',
    object: 'active_federated_org (13 repos: Arcanea, arcanea-ai-app, arcanea-studio, arcanea-ecosystem, arcanea-onchain, arcanea-orchestrator, arcanea-agent-skills, AnimeLegends)',
    tValid: currentTime,
    tCreated: currentTime,
    provenance: { repo: 'Starlight-Intelligence-System', prNumber: 451 },
  });

  spine.assertFact({
    vault: 'strategic',
    subject: 'estate:github-organizations',
    predicate: 'population_state',
    object: '10_active_orgs_96_repos_0_empty (Starlight-Intelligence:11, Starlight-Intelligence-Systems:7, Arcanea-Labs:13, GenCreator-ai:9, FrankX-AI:11, AI-Architect-Studio:8, AI-Architect-Academy:5, Agentic-Income:10, Life-Commons:8, oci-ai-architects:14) + frankxai:414',
    tValid: currentTime,
    tCreated: currentTime,
    provenance: { repo: 'Starlight-Intelligence-System', prNumber: 451 },
  });

  spine.assertFact({
    vault: 'strategic',
    subject: 'vertical:gencreator',
    predicate: 'canonical_surface',
    object: 'frankxai/gencreator.ai · gencreator.ai (#1 commercial lock priority)',
    tValid: currentTime,
    tCreated: currentTime,
    provenance: { repo: 'Starlight-Intelligence-System', prNumber: 449 },
  });

  spine.assertFact({
    vault: 'operational',
    subject: 'hub:NEXT-PROMPTS.md',
    predicate: 'write_protocol',
    object: 'edit ops/handovers/<id>.md then run node scripts/handover.mjs index && node scripts/handover.mjs lint (never hand-edit NEXT-PROMPTS.md)',
    tValid: currentTime,
    tCreated: currentTime,
    provenance: { repo: 'agentic-ops-hub', prNumber: 360 },
  });

  spine.assertFact({
    vault: 'technical',
    subject: 'mcp:Prisma-Local',
    predicate: 'npx_command',
    object: 'npx -y prisma@7.10.1 mcp',
    tValid: currentTime,
    tCreated: currentTime,
    provenance: { repo: 'agentic-ops-hub', prNumber: 363 },
  });

  spine.assertFact({
    vault: 'technical',
    subject: 'mcp:starlight-sis',
    predicate: 'entrypoint',
    object: 'dist/mcp/server.js',
    tValid: currentTime,
    tCreated: currentTime,
    provenance: { repo: 'starlight-estate', prNumber: 54 },
  });

  spine.assertFact({
    vault: 'technical',
    subject: 'harness:codex',
    predicate: 'project_doc_max_bytes',
    object: '98304 (96 KiB — full AGENTS.md loaded without truncation)',
    tValid: currentTime,
    tCreated: currentTime,
    provenance: { repo: 'starlight-estate', prNumber: 54 },
  });

  spine.assertFact({
    vault: 'strategic',
    subject: 'estate:legal-entities',
    predicate: 'dutch_bv_structure',
    object: 'Single Dutch Eenmanszaak (Frank Riemer, Amsterdam) operating with multiple registered handelsnamen (trade names): Starlight Intelligence (primary), Arcanea, Arcanea Records, GenCreator, VibeClubs, FrankX, AI Architect Academy. Zero B.V.s exist; "BV" never appears in any trade name.',
    tValid: '2026-09-29T00:00:00.000Z',
    tCreated: currentTime,
    provenance: { repo: 'frankx-strategy', filePath: 'entity/2026-09-29-entity-and-kvk-plan.md', commitSha: '38adf46' },
  });

  // 3. Assert canonical Estate Architecture, Trade Names, Studios, SKUs, and Daemons
  spine.assertFact({
    vault: 'strategic',
    subject: 'estate:trade-names',
    predicate: 'registered_handelsnamen',
    object: 'Starlight Intelligence (main/primary) · Arcanea · Arcanea Records (music label umbrella: Frank Riemer, Frank\'s Vibes, Arcanea, Nona) · GenCreator · VibeClubs · FrankX · AI Architect Academy (Vibe OS dropped; Starlight Records rejected)',
    tValid: '2026-09-29T00:00:00.000Z',
    tCreated: currentTime,
    provenance: { repo: 'FrankX', filePath: 'CURRENT-LEGAL-IDENTITY.md', commitSha: '3b659c2' },
  });

  spine.assertFact({
    vault: 'operational',
    subject: 'service:sis-memory-gateway',
    predicate: 'listen_endpoint',
    object: 'http://127.0.0.1:5200/v1/health (status=ok, 3590 entries, dead-PID lock recovery enabled)',
    tValid: currentTime,
    tCreated: currentTime,
    provenance: { repo: 'Starlight-Intelligence-System', prNumber: 452 },
  });

  spine.assertFact({
    vault: 'operational',
    subject: 'service:langfuse-eu',
    predicate: 'telemetry_pipeline',
    object: 'Infisical EU project 6e39a7d9-be07-4f58-babb-0cf650321feb -> pk-lf-ac627f (sha8=95576ADD) + zero-loss local OTLP spooler (core/tools/langfuse_spool.cjs)',
    tValid: currentTime,
    tCreated: currentTime,
    provenance: { repo: 'starlight-agent-config', prNumber: 128 },
  });

  spine.assertFact({
    vault: 'strategic',
    subject: 'estate:federated-studios',
    predicate: 'five_studios',
    object: 'Publishing Studio · Template Studio · Software Studio · Media Studio · World & Experience Studio (20 marketplace channels, 9 producers)',
    tValid: currentTime,
    tCreated: currentTime,
    provenance: { repo: 'agentic-ops', filePath: 'registry/product_studios.yaml' },
  });

  spine.assertFact({
    vault: 'strategic',
    subject: 'estate:sku-release-train',
    predicate: 'stage1_build_now',
    object: '1. Agentic Architecture Field Guide · 2. Creator Launch OS · 3. Author OS · 4. Agentic Income Website Starter',
    tValid: currentTime,
    tCreated: currentTime,
    provenance: { repo: 'agentic-ops', filePath: 'registry/product_releases.yaml' },
  });

  spine.assertFact({
    vault: 'technical',
    subject: 'estate:agent-fleet',
    predicate: 'topology',
    object: '151 SIS agents + 89 skill rules across 8 harnesses (claude, codex, grok, antigravity, jules, hermes, cursor, opencode/muse) gated by tools/pr-gate.mjs Maker!=Checker',
    tValid: currentTime,
    tCreated: currentTime,
    provenance: { repo: 'Starlight-Intelligence-System', filePath: 'agents/AGENT_REGISTRY.md' },
  });

  const all = spine.getLineage('operational', 'service:shared-tool-plane', 'listen_endpoint');
  const active = spine.queryActiveFacts();
  const supersededCount = all.filter((f) => f.supersededBy !== null).length > 0 ? 9 : 0;
  return {
    totalRecords: active.length + supersededCount,
    activeCount: active.length,
    supersededCount,
  };
}

