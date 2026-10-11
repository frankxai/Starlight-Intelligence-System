import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { parseFrontmatter } from "./frontmatter.mjs";

function parseRegistryStatuses(path) {
  const statuses = new Map();
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\|\s*([a-z0-9-]+\/[a-z0-9-]+)\s*\|\s*([a-z0-9-]+)\s*\|\s*[^|]+\|\s*[^|]+\|\s*(stable|experimental|deprecated)\s*\|$/);
    if (match) statuses.set(match[1], match[3]);
  }
  return statuses;
}

function resolveSkillPath(root, skill) {
  const directoryPath = join(root, "skills", skill, "SKILL.md");
  if (existsSync(directoryPath)) return directoryPath;
  const flatPath = join(root, "skills", `${skill}.md`);
  if (existsSync(flatPath)) return flatPath;
  return null;
}

function walkAgentFiles(root) {
  const agentsRoot = join(root, "agents");
  const files = [];
  for (const entry of readdirSync(agentsRoot, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".md") && !entry.name.includes("REGISTRY")) {
      files.push(join(agentsRoot, entry.name));
    }
    if (entry.isDirectory()) {
      for (const child of readdirSync(join(agentsRoot, entry.name), { withFileTypes: true })) {
        if (child.isFile() && child.name.endsWith(".md")) {
          files.push(join(agentsRoot, entry.name, child.name));
        }
      }
    }
  }
  return files.sort();
}

export function buildCapabilityGraph(root) {
  const rulesPath = join(root, "skills", "skill-rules.json");
  const registryPath = join(root, "skills", "SKILL_REGISTRY.md");
  const rulesDocument = JSON.parse(readFileSync(rulesPath, "utf8"));
  const rules = rulesDocument.rules ?? [];
  const statuses = parseRegistryStatuses(registryPath);
  const nodes = [];
  const edges = [];
  const ruleById = new Map();
  const activationBindings = [];

  for (const rule of rules) {
    const path = resolveSkillPath(root, rule.skill);
    if (!path) continue;
    const markdown = readFileSync(path, "utf8");
    const { fields } = parseFrontmatter(markdown);
    const provides = [
      rule.skill.split("/")[0],
      ...(rule.triggers?.intents ?? []),
    ].filter((entry, index, array) => array.indexOf(entry) === index);
    nodes.push({
      id: `skill:${rule.skill}`,
      kind: "skill",
      status: statuses.get(rule.skill) ?? "registered",
      path: relative(root, path).replaceAll("\\", "/"),
      description: fields.description ?? "",
      provides,
    });
    ruleById.set(rule.id, rule.skill);
    for (const agent of rule.triggers?.agents ?? []) {
      activationBindings.push({ agent, skill: rule.skill });
    }
  }

  for (const path of walkAgentFiles(root)) {
    const markdown = readFileSync(path, "utf8");
    const { fields } = parseFrontmatter(markdown);
    const sourceId = relative(join(root, "agents"), path).replace(/\.md$/, "").replaceAll("\\", "/");
    const declaredId = fields.name || sourceId;
    const id = /^[a-z0-9][a-z0-9/-]{1,127}$/.test(declaredId) ? declaredId : sourceId;
    nodes.push({
      id: `agent:${id}`,
      kind: "agent",
      status: "registered",
      path: relative(root, path).replaceAll("\\", "/"),
      description: fields.description ?? "",
      provides: [fields.domain ?? "general"].filter(Boolean),
      aliases: id === sourceId ? [] : [`agent:${sourceId}`],
    });
  }

  const agentIds = new Map();
  for (const node of nodes.filter((node) => node.kind === "agent")) {
    agentIds.set(node.id, node.id);
    for (const alias of node.aliases ?? []) agentIds.set(alias, node.id);
  }
  for (const { agent, skill } of activationBindings) {
    const from = agentIds.get(`agent:${agent}`);
    if (!from) continue;
    edges.push({
      from,
      to: `skill:${skill}`,
      relation: "activates",
    });
  }

  for (const [agent, defaults] of Object.entries(rulesDocument.defaults ?? {})) {
    const from = agentIds.get(`agent:${agent}`);
    if (!from) continue;
    for (const ruleId of defaults) {
      const skill = ruleById.get(ruleId);
      if (!skill) continue;
      edges.push({
        from,
        to: `skill:${skill}`,
        relation: "default-for",
      });
    }
  }

  return {
    $schema: "https://starlightintelligence.org/schemas/foundry/capability-graph.schema.json",
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    source: {
      skillRules: "skills/skill-rules.json",
      agentRegistry: "agents/AGENT_REGISTRY.md",
    },
    nodes: nodes.sort((left, right) => left.id.localeCompare(right.id)),
    edges: edges.sort((left, right) => `${left.from}:${left.to}`.localeCompare(`${right.from}:${right.to}`)),
  };
}

function normalizeCapabilityId(id) {
  return id.includes(":") ? id : `skill:${id}`;
}

export function resolveCapabilities(envelope, graph) {
  const known = new Map();
  for (const node of graph.nodes) {
    known.set(node.id, node);
    for (const alias of node.aliases ?? []) known.set(alias, node);
  }
  const canonicalize = (id) => known.get(normalizeCapabilityId(id))?.id ?? normalizeCapabilityId(id);
  const selection = envelope.capabilitySelection;
  const required = selection.required.map((requested) => ({
    requested: normalizeCapabilityId(requested),
    canonical: canonicalize(requested),
  }));
  const preferred = selection.preferred.map((requested) => ({
    requested: normalizeCapabilityId(requested),
    canonical: canonicalize(requested),
  }));
  const forbidden = new Set(selection.forbidden.map(canonicalize));
  const errors = [];
  const decisions = [];
  const selected = [];

  for (const { requested, canonical } of required) {
    if (forbidden.has(canonical)) {
      errors.push(`Required capability is also forbidden: ${requested}`);
    } else if (!known.has(requested)) {
      errors.push(`Required capability is not registered: ${requested}`);
    } else {
      if (!selected.includes(canonical)) selected.push(canonical);
      decisions.push({
        capability: canonical,
        requestedAs: requested,
        decision: "selected",
        reason: "explicitly required",
      });
    }
  }

  for (const { requested, canonical } of preferred) {
    if (forbidden.has(canonical)) {
      decisions.push({ capability: canonical, requestedAs: requested, decision: "excluded", reason: "explicitly forbidden" });
    } else if (!known.has(requested)) {
      decisions.push({ capability: requested, requestedAs: requested, decision: "unavailable", reason: "not registered" });
    } else if (!selected.includes(canonical)) {
      selected.push(canonical);
      decisions.push({
        capability: canonical,
        requestedAs: requested,
        decision: "selected",
        reason: "explicitly preferred and available",
      });
    }
  }

  const allowedTools = new Set(envelope.permissions.tools.allow);
  const deniedTools = envelope.permissions.tools.deny.filter((tool) => allowedTools.has(tool));
  if (deniedTools.length > 0) errors.push(`Tools appear in both allow and deny lists: ${deniedTools.join(", ")}`);

  const objectiveTokens = new Set(
    envelope.objective.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 3),
  );
  const suggestions = graph.nodes
    .filter((node) => node.kind === "skill" && !forbidden.has(node.id) && !selected.includes(node.id))
    .map((node) => {
      const haystack = `${node.id} ${node.description} ${node.provides.join(" ")}`.toLowerCase();
      const score = [...objectiveTokens].filter((token) => haystack.includes(token)).length;
      return { capability: node.id, score, reason: "lexical discovery only; operator/model confirmation required" };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.capability.localeCompare(right.capability))
    .slice(0, 5);

  if (errors.length > 0) {
    throw new Error(`Capability resolution failed:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  }

  return {
    envelopeId: envelope.id,
    graphGeneratedAt: graph.generatedAt,
    selected,
    forbidden: [...forbidden],
    decisions,
    suggestions,
    note: "Suggestions are transparent lexical discovery, never silent cognitive routing.",
  };
}
