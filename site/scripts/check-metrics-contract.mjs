import { promises as fs } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(process.cwd(), "..");
const ledgerPath = path.join(repoRoot, "metrics", "current.json");
const ledger = JSON.parse(await fs.readFile(ledgerPath, "utf8"));

async function deriveAgentCount() {
  const agentsDir = path.join(repoRoot, "agents");
  const entries = await fs.readdir(agentsDir, { withFileTypes: true });
  let count = 0;
  for (const entry of entries) {
    if (entry.isFile()) {
      if (
        entry.name.endsWith(".md") &&
        entry.name !== "AGENT_REGISTRY.md" &&
        entry.name !== "CODING_AGENTS_REGISTRY.md"
      ) count += 1;
    } else if (entry.isDirectory()) {
      const children = await fs.readdir(path.join(agentsDir, entry.name), {
        withFileTypes: true,
      });
      count += children.filter(
        (child) => child.isFile() && child.name.endsWith(".md"),
      ).length;
    }
  }
  return count;
}

function value(name) {
  const metric = ledger.metrics?.[name];
  if (!metric || !Number.isFinite(metric.value) || !metric.last_verified || !metric.source || metric.stale) {
    throw new Error(`Metric ${name} must be reproducible, sourced, dated, and non-stale`);
  }
  return metric.value;
}

const agentCount = await deriveAgentCount();
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
  registered_agents: agentCount,
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
