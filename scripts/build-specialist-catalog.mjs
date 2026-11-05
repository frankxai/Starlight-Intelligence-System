#!/usr/bin/env node
/** Operational projection of existing SIS profiles. No identity or skill is renamed. */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "../foundry/agent-ontology/agent-ontology.mjs";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const CATALOG_PATH = "agents/catalog/specialists.json";
export const GRAPH_PATH = "agents/catalog/constellation.json";
export const CONTRACTS_PATH = "agents/catalog/contracts.json";
export const IDENTITIES_PATH = "agents/catalog/identity-overrides.json";
const META = new Set(["AGENT_REGISTRY.md", "CODING_AGENTS_REGISTRY.md"]);
const read = (root, path) => readFileSync(join(root, path), "utf8");
const hash = (text) => createHash("sha256").update(text).digest("hex");
const sortedUnique = (values) => [...new Set(values)].sort();
const json = (value) => JSON.stringify(value, null, 2) + "\n";
const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
// Exact existing Foundry normalization. Do not collapse its preserved hyphens.
const ontologySlug = (text) => String(text).toLowerCase().replace(/^@/, "").replace(/\.agent$/, "").replace(/[^a-z0-9/-]+/g, "-").replace(/^-+|-+$/g, "");

export function listProfiles(root = ROOT) {
  const paths = [];
  function walk(dir) {
    for (const entry of readdirSync(join(root, dir), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, "en"))) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory() && path !== "agents/catalog") walk(path);
      else if (entry.isFile() && entry.name.endsWith(".md") && !META.has(entry.name)) paths.push(path);
    }
  }
  walk("agents");
  return paths.sort();
}

function source(root, path) {
  return { path, sha256: hash(read(root, path)) };
}

function section(body, names) {
  const lines = body.split(/\r?\n/);
  const selected = [];
  let active = false;
  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)/);
    if (heading) active = names.includes(heading[1].trim().toLowerCase());
    else if (active) selected.push(line);
  }
  return selected.join("\n");
}

function declaredSkills(body) {
  const text = section(body, ["skill activations", "active skills", "skills"]);
  const values = [];
  for (const line of text.split("\n")) {
    const table = line.match(/^\|\s*`?([a-z][a-z0-9/-]+)`?\s*\|/);
    const bullet = line.match(/^[-*]\s+`?([a-z][a-z0-9/-]+)`?(?:\s|$)/);
    const value = table?.[1] ?? bullet?.[1];
    if (value && value !== "skill") values.push(value);
  }
  return sortedUnique(values);
}

function skillPath(root, key) {
  for (const path of [`skills/${key}/SKILL.md`, `skills/${key}.md`]) {
    if (existsSync(join(root, path))) return path;
  }
  return null;
}

export function buildCatalog(root = ROOT) {
  const identityText = read(root, IDENTITIES_PATH);
  const identities = JSON.parse(identityText);
  const contracts = JSON.parse(read(root, CONTRACTS_PATH));
  const rules = JSON.parse(read(root, "skills/skill-rules.json")).rules;
  const paths = listProfiles(root);
  const ids = paths.map((path) => basename(path, ".md"));
  if (new Set(ids).size !== ids.length) throw new Error("Profile filename stems must be unique; resolve the collision without renaming a registered agent automatically.");
  const unknown = Object.keys(identities).filter((id) => !ids.includes(id));
  if (unknown.length) throw new Error(`Identity overrides without profiles: ${unknown.join(", ")}`);
  const sourcePaths = new Set([
    IDENTITIES_PATH, CONTRACTS_PATH, "skills/skill-rules.json", "scripts/build-specialist-catalog.mjs",
    "foundry/agent-ontology/agent-ontology.mjs", ".starlight/voice/context.md", ".starlight/voice/VOICE.json",
    contracts.loop.taskEnvelopeSchema, contracts.loop.runEnvelopeSchema, contracts.loop.lifecycleBlueprintRef, contracts.loop.executableGraphRef, ...contracts.loop.driverRefs,
  ]);
  const ruleKeys = sortedUnique(rules.map((rule) => rule.skill));
  const agents = paths.map((path) => {
    sourcePaths.add(path);
    const text = read(root, path);
    const { fm, body, hasFrontmatter } = parseFrontmatter(text);
    if (!hasFrontmatter || !fm.name || !fm.tier || !fm.domain) throw new Error(`Incomplete profile: ${path}`);
    const id = basename(path, ".md");
    const identity = identities[id];
    if (!identity) throw new Error(`Missing specialist identity: ${id}`);
    for (const field of ["role", "purpose", "outcome", "input", "personality"]) {
      if (typeof identity[field] !== "string" || !identity[field].trim()) throw new Error(`Missing ${field}: ${id}`);
    }
    if (!Array.isArray(identity.acceptance) || identity.acceptance.length < 2 || identity.acceptance.some((value) => typeof value !== "string" || !value.trim())) {
      throw new Error(`At least two acceptance checks required: ${id}`);
    }
    const profileName = String(fm.name);
    const activatingRules = rules.filter((rule) => (rule.triggers?.agents ?? rule.agents ?? []).some((agent) => agent === id || agent === profileName));
    const requested = sortedUnique([...declaredSkills(body), ...activatingRules.map((rule) => rule.skill)]);
    const skills = [];
    const unresolvedSkills = [];
    for (const name of requested) {
      const matches = name.includes("/") ? [name] : ruleKeys.filter((key) => key.split("/").at(-1) === name);
      const key = matches.length === 1 ? matches[0] : null;
      const path = key ? skillPath(root, key) : null;
      if (!key || !path) {
        unresolvedSkills.push({ declared: name, reason: matches.length > 1 ? "ambiguous-key" : "no-local-definition" });
        continue;
      }
      sourcePaths.add(path);
      if (!skills.some((skill) => skill.id === key)) skills.push({ id: key, source: source(root, path) });
    }
    skills.sort((a, b) => a.id.localeCompare(b.id, "en"));
    const keywords = sortedUnique([
      id, profileName, identity.role.toLowerCase(),
      ...(identity.legacy_alias ? [identity.legacy_alias.toLowerCase()] : []),
      ...`${id} ${profileName}`.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3 && word !== "starlight"),
      ...identity.role.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3),
      ...activatingRules.flatMap((rule) => rule.triggers?.keywords ?? []),
    ]);
    return {
      id,
      name: identity.role,
      slug: slug(identity.role),
      aliases: sortedUnique([identity.legacy_alias, profileName].filter((value) => typeof value === "string" && value !== identity.role && value !== id)),
      profileName,
      ontologyId: `agent:sis/${ontologySlug(profileName)}`,
      type: ["executive", "council", "leadership", "apex", "meta"].includes(String(fm.tier)) || ["starlight-orchestrator", "starlight-prime", "starlight-architect"].includes(id) ? "meta" : "specialist",
      tier: String(fm.tier),
      domain: String(fm.domain),
      purpose: identity.purpose,
      outcome: identity.outcome,
      input: identity.input,
      acceptance: identity.acceptance,
      personality: identity.personality,
      identityProvenance: {
        sourceDeclared: ["profileName", "tier", "domain"],
        curatedOperationalProposal: ["name", "purpose", "outcome", "input", "acceptance", "personality"],
        overrideSource: source(root, IDENTITIES_PATH),
        capabilityEvidence: "Profile and local skill declarations only; observed runtime capability remains unverified.",
      },
      source: source(root, path),
      skills,
      unresolvedSkills,
      triggers: { keywords, filePatterns: sortedUnique(activatingRules.flatMap((rule) => rule.triggers?.files ?? [])) },
      contracts: { prompt: contracts.prompt.version, loop: contracts.loop.version },
      authority: { mode: "host-intersection", profileRef: path, toolsGrantedByCatalog: [], memoryScope: "tenant/project/purpose", automaticMoneyMovement: false },
      readiness: { definition: "profile", portable: "generated", eve: "instructions-only", executableAdapters: "unverified", deployment: "unverified" },
    };
  });
  const roles = agents.map((agent) => agent.name.toLowerCase());
  if (new Set(roles).size !== roles.length) throw new Error("Default specialist roles must be distinct.");
  const slugs = agents.map((agent) => agent.slug);
  if (new Set(slugs).size !== slugs.length) throw new Error("Descriptive export slugs must be distinct.");
  const sources = [...sourcePaths].sort().map((path) => source(root, path));
  const sourceDigest = hash(json(sources));
  const catalog = {
    schemaVersion: "starlight.specialist-catalog.v1",
    projection: "operational; original profiles and Foundry ontology IDs remain authoritative for their existing consumers",
    sourceDigest,
    count: agents.length,
    naming: { default: "descriptive-role", creativeAlias: "optional-per-instance", identityKey: "id", graphKey: "agent:<id>" },
    contracts: { path: CONTRACTS_PATH, sha256: hash(read(root, CONTRACTS_PATH)) },
    sources,
    agents,
  };
  const nodes = agents.map((agent) => ({ id: `agent:${agent.id}`, kind: "agent", label: agent.name, stableId: agent.id, ontologyId: agent.ontologyId, source: agent.source }));
  const edges = [];
  const seenSkills = new Set();
  for (const agent of agents) {
    for (const skill of agent.skills) {
      if (!seenSkills.has(skill.id)) {
        nodes.push({ id: `skill:${skill.id}`, kind: "skill", label: skill.id, source: skill.source });
        seenSkills.add(skill.id);
      }
      edges.push({ from: `agent:${agent.id}`, to: `skill:${skill.id}`, relation: "uses-skill", status: "declared", sourceRef: agent.source.path });
    }
    if (agent.id !== "starlight-orchestrator") edges.push({ from: "agent:starlight-orchestrator", to: `agent:${agent.id}`, relation: "can-route-to", status: "declared", sourceRef: "agents/starlight-orchestrator.md" });
    edges.push({ from: `agent:${agent.id}`, to: `agent:${agent.id === "starlight-evaluator" ? "starlight-sentinel" : "starlight-evaluator"}`, relation: "requires-independent-review", status: "policy", sourceRef: CONTRACTS_PATH });
  }
  const swarmTemplates = [
    { id: "research-and-review", name: "Research and evidence review", alias: null, lead: "starlight-research-distill", members: ["starlight-hermes", "starlight-social-factcheck"], verifier: "starlight-evaluator", outcome: "Cited brief, contradiction review, and evaluation receipt." },
    { id: "build-and-review", name: "Build and security review", alias: null, lead: "starlight-architect", members: ["starlight-code-is", "starlight-steward"], verifier: "starlight-sentinel", outcome: "Reviewable change, relevant checks, and recovery checkpoint." },
    { id: "content-and-review", name: "Editorial and visual review", alias: null, lead: "starlight-social-strategist", members: ["starlight-weaver", "starlight-asset-quality"], verifier: "starlight-social-sentinel", outcome: "Source-backed draft and visual review; publishing requires task authority." },
    { id: "adapter-and-review", name: "Runtime adapter review", alias: null, lead: "starlight-architect", members: ["starlight-adapter-paperclip", "starlight-adapter-crewai"], verifier: "starlight-evaluator", outcome: "Version-pinned mapping, missing bindings, and a conformance plan." },
  ];
  const graph = {
    schemaVersion: "starlight.specialist-constellation.v1",
    sourceDigest,
    kind: "discovery-and-policy-projection",
    execution: "No scheduler, delegation authority, runtime activation, or data access is created by an edge. Use the existing loop and work graph contracts.",
    nodes: nodes.sort((a, b) => a.id.localeCompare(b.id, "en")),
    edges: edges.sort((a, b) => `${a.from}/${a.relation}/${a.to}`.localeCompare(`${b.from}/${b.relation}/${b.to}`, "en")),
    swarmTemplates,
  };
  validateCatalog(catalog, graph);
  return { catalog, graph };
}

export function validateCatalog(catalog, graph) {
  const errors = [];
  const ids = new Set(catalog.agents.map((agent) => agent.id));
  if (ids.size !== catalog.count || catalog.count !== catalog.agents.length) errors.push("Agent identity/count mismatch");
  const nodeIds = new Set(graph.nodes.map((node) => node.id));
  if (nodeIds.size !== graph.nodes.length) errors.push("Duplicate graph node");
  const edgeIds = new Set();
  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) errors.push("Dangling graph edge");
    if (edge.from === edge.to) errors.push("Self-review/self-edge is forbidden");
    const key = `${edge.from}/${edge.relation}/${edge.to}`;
    if (edgeIds.has(key)) errors.push("Duplicate graph edge");
    edgeIds.add(key);
  }
  for (const swarm of graph.swarmTemplates) {
    if ([swarm.lead, ...swarm.members, swarm.verifier].some((id) => !ids.has(id))) errors.push(`Unknown swarm member: ${swarm.id}`);
    if ([swarm.lead, ...swarm.members].includes(swarm.verifier)) errors.push(`Swarm maker/checker collision: ${swarm.id}`);
  }
  if (graph.sourceDigest !== catalog.sourceDigest) errors.push("Graph/catalog digest mismatch");
  if (errors.length) throw new Error(sortedUnique(errors).join("; "));
}

export function checkOrWrite(root = ROOT, check = false) {
  const { catalog, graph } = buildCatalog(root);
  for (const [path, value] of [[CATALOG_PATH, catalog], [GRAPH_PATH, graph]]) {
    const expected = json(value);
    if (check) {
      if (!existsSync(join(root, path)) || read(root, path) !== expected) throw new Error(`Stale ${path}; run node scripts/build-specialist-catalog.mjs`);
    } else {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), expected);
    }
  }
  return { count: catalog.count, nodes: graph.nodes.length, edges: graph.edges.length, unresolvedSkillDeclarations: catalog.agents.reduce((n, agent) => n + agent.unresolvedSkills.length, 0), sourceDigest: catalog.sourceDigest };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(checkOrWrite(ROOT, process.argv.includes("--check")), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
