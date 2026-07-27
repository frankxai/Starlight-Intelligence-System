import { promises as fs } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(process.cwd(), "..");
const ledgerPath = path.join(repoRoot, "metrics", "current.json");
const ledger = JSON.parse(await fs.readFile(ledgerPath, "utf8"));

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  }));
  return nested.flat();
}

function value(name) {
  const metric = ledger.metrics?.[name];
  if (!metric || !Number.isFinite(metric.value) || !metric.last_verified || !metric.source || metric.stale) {
    throw new Error(`Metric ${name} must be reproducible, sourced, dated, and non-stale`);
  }
  return metric.value;
}

const excludedAgentDocs = new Set([
  "AGENT_REGISTRY.md",
  "CODING_AGENTS_REGISTRY.md",
  "README.md",
]);

const agentFiles = (await walk(path.join(repoRoot, "agents"))).filter(
  (file) => file.endsWith(".md") && !excludedAgentDocs.has(path.basename(file)),
);
const skillRules = JSON.parse(
  await fs.readFile(path.join(repoRoot, "skills", "skill-rules.json"), "utf8"),
).rules;
const vaultFiles = (await fs.readdir(path.join(repoRoot, "memory", "vaults"))).filter(
  (name) => name.endsWith("-vault.md"),
);
const horizonLetters = (await fs.readFile(
  path.join(repoRoot, "public-vault", "horizon.jsonl"),
  "utf8",
)).split("\n").filter((line) => line.trim()).length;

const observed = {
  registered_agents: agentFiles.length,
  skill_activation_rules: skillRules.length,
  starlight_vaults: vaultFiles.length,
  horizon_letters: horizonLetters,
};

for (const [name, count] of Object.entries(observed)) {
  const claimed = value(name);
  if (claimed !== count) {
    throw new Error(`Metric drift: ${name} claims ${claimed}, source contains ${count}`);
  }
}

console.log("Metrics contract verified:", observed);
