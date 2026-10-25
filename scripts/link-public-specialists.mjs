#!/usr/bin/env node
/** Exact source lineage between catalogs. No routing, authority, or identity equivalence. */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT, buildCatalog } from "./build-specialist-catalog.mjs";

export function linkPublicSpecialists(portfolio, catalog, sourceCommit, sourceSha256) {
  if (portfolio.schema_version !== "starlight.civilization_portfolio.v2" || !/^[a-f0-9]{40}$/.test(sourceCommit)) {
    throw new Error("Supply the versioned public portfolio and its exact source commit.");
  }
  const publicAgents = portfolio.rings.flatMap((ring) => ring.agents);
  if (new Set(publicAgents.map((agent) => agent.agent_id)).size !== publicAgents.length || publicAgents.length !== portfolio.counts.agents) {
    throw new Error("Public identity count or uniqueness drift.");
  }
  const byPath = new Map(catalog.agents.map((agent) => [agent.source.path, agent]));
  const links = [], unresolved = [];
  for (const agent of publicAgents) {
    const sourceIdentifier = agent.lineage.source_identifier;
    const sourcePath = sourceIdentifier.startsWith("verticals/") ? sourceIdentifier : `agents/${sourceIdentifier}`;
    const target = byPath.get(sourcePath);
    if (!target) {
      unresolved.push({ publicAgentId: agent.agent_id, sourceIdentifier, status: "no_exact_operational_profile" });
      continue;
    }
    links.push({
      from: `public:${agent.agent_id}`, to: `sis:${target.id}`, type: "lineage_reference",
      sourceIdentifier, sourcePath, currentOperationalProfileSha256: target.source.sha256,
      evidence: "exact_source_path", identityEquivalent: false, grantsAuthority: false,
    });
  }
  return {
    schemaVersion: "starlight.public-operational-lineage.v1", presentationOnly: true, grantsAuthority: false,
    semantics: "A public profile cites an operational source path. This is not a live handoff, synchronized memory, or identity equivalence.",
    source: { publicRepository: "frankxai/starlight-agent-army-architecture", publicCommit: sourceCommit, publicPortfolioSha256: sourceSha256, operationalSourceDigest: catalog.sourceDigest },
    counts: { publicProfiles: publicAgents.length, operationalProfiles: catalog.agents.length, exactLinks: links.length, unresolved: unresolved.length },
    links, unresolved,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [input, commit, mode] = process.argv.slice(2);
  if (!input || !commit || (mode && mode !== "--check")) throw new Error("Usage: node scripts/link-public-specialists.mjs <portfolio.json> <source-commit> [--check]");
  const bytes = readFileSync(input);
  const { catalog } = buildCatalog(ROOT);
  const value = linkPublicSpecialists(JSON.parse(bytes), catalog, commit, createHash("sha256").update(bytes).digest("hex"));
  const output = JSON.stringify(value, null, 2) + "\n";
  const destination = join(ROOT, "agents/catalog/public-lineage.json");
  if (mode === "--check") {
    if (readFileSync(destination, "utf8") !== output) throw new Error("Public lineage projection is stale.");
  } else writeFileSync(destination, output);
  console.log(`Public lineage: ${value.counts.exactLinks} exact source paths; ${value.counts.unresolved} unresolved references.`);
}
