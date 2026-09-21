import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(await readFile(join(root, ".codex-plugin", "plugin.json"), "utf8"));
const evals = JSON.parse(await readFile(join(root, "evals", "golden-cases.json"), "utf8"));
const mcpSource = await readFile(join(root, "server", "src", "mcp.ts"), "utf8");
const workerSource = await readFile(join(root, "server", "src", "worker.ts"), "utf8");
const skillDirectories = (await readdir(join(root, "skills"), { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

check(manifest.version === "0.2.0", "plugin manifest version must be 0.2.0");
check(skillDirectories.length === 4, "plugin must contain exactly four focused skills");
for (const directory of skillDirectories) {
  const text = await readFile(join(root, "skills", directory, "SKILL.md"), "utf8");
  check(text.startsWith("---\n"), `${directory} is missing YAML front matter`);
  check(text.includes(`name: ${directory}`), `${directory} front matter name does not match its directory`);
  check(/\ndescription: .+\n/.test(text), `${directory} is missing a one-line description`);
}

check(mcpSource.includes('"ui://starlight/command-center/v2.html"'), "UI resource URI must be versioned at v2");
check(!mcpSource.includes("SnapshotCache"), "stateless Worker must not rely on an in-memory snapshot cache");
check(mcpSource.includes('"io.modelcontextprotocol/skills"'), "MCP server must advertise the skills extension");
check(mcpSource.includes('"search"') && mcpSource.includes('"fetch"'), "company-knowledge search/fetch tools are required");
check(workerSource.includes("authenticateAccessRequest"), "every MCP request must cross the Access authorization boundary");
check(workerSource.includes("SupabaseWorkspaceAdapter"), "production Worker must use durable Supabase state");

const positive = evals.cases.filter((entry) => entry.kind === "positive");
const negative = evals.cases.filter((entry) => entry.kind === "negative");
check(positive.length >= 5, "submission evals require at least five positive cases");
check(negative.length >= 3, "submission evals require at least three negative cases");

if (failures.length > 0) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Validated Starlight cloud plugin: ${skillDirectories.length} skills, ${positive.length} positive and ${negative.length} negative cases.`);
}
