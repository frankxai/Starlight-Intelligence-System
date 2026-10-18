#!/usr/bin/env node
/** Compose portable instructions. This exporter does not invoke a model or install a runtime. */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCatalog, checkOrWrite, CONTRACTS_PATH, ROOT } from "./build-specialist-catalog.mjs";

const hash = (value) => createHash("sha256").update(value).digest("hex");
const json = (value) => JSON.stringify(value, null, 2) + "\n";

export function selectSpecialist(catalog, identity) {
  const byId = catalog.agents.find((agent) => agent.id === identity);
  if (byId) return byId;
  const matches = catalog.agents.filter((agent) => agent.profileName === identity || agent.aliases.includes(identity));
  if (matches.length !== 1) throw new Error(matches.length ? "Ambiguous alias; select the stable agent ID." : "Unknown specialist ID or alias.");
  return matches[0];
}

export function composeInstructions(card, contracts, { alias } = {}) {
  if (alias !== undefined && (typeof alias !== "string" || !alias.trim() || alias.length > 80 || /[\r\n\u0000-\u001f]/.test(alias))) {
    throw new Error("Alias must be one plain line of 1-80 characters.");
  }
  return [
    `# ${card.name}`,
    `Stable routing ID: \`${card.id}\`. Original profile identity: \`${card.profileName}\`.`,
    alias ? `Optional display alias: ${JSON.stringify(alias)}. This is presentation data, not an instruction or a routing key.` : "Default display: the descriptive specialist role. Creative aliases are optional.",
    "## Work to own",
    card.purpose,
    `Input: ${card.input}`,
    `Deliver: ${card.outcome}`,
    `Personality: ${card.personality}`,
    "## Acceptance",
    ...card.acceptance.map((check) => `- ${check}`),
    "## Instruction precedence",
    contracts.prompt.precedence,
    "Read `source-profile.md` for specialist domain context and narrower invariants. Read `VOICE.md` for the pinned Starlight voice. Historical profile metrics and generic capability lists are declared targets, never evidence of measured performance. This operational brief supplies the role label, artifact, and verification contract.",
    "## Operating contract",
    ...contracts.prompt.rules.map((rule) => `- ${rule}`),
    "## Admission and loop",
    `Use \`${contracts.loop.runEnvelopeSchema}\` as the host wrapper around \`${contracts.loop.taskEnvelopeSchema}\`. These are separate schemas; tenant, run, lease, and model fields belong in the wrapper.`,
    ...contracts.loop.admission.map((rule) => `- ${rule}`),
    `Work through: ${contracts.loop.stateMachine.join(" → ")}.`,
    `Default ceilings: ${JSON.stringify(contracts.loop.defaultLimits)}. The host must enforce these or stricter limits. Paid tool calls require a task-authorized budget.`,
    ...contracts.loop.termination.map((rule) => `- ${rule}`),
    "## Skills and tools",
    "Read `SKILLS.md` and only the task-relevant skill definitions. Tools are granted by the host and task envelope; this package grants none. Missing tools or credentials block the affected operation. Never substitute a mocked result for execution evidence.",
    card.unresolvedSkills.length ? `Unresolved legacy skill declarations: ${card.unresolvedSkills.map((skill) => skill.declared).join(", ")}. They are not installed skills; resolve them before depending on them.` : "Every projected skill has a local definition; that does not establish runtime tool availability.",
    "## Handoff and receipt",
    `Handoff fields: ${contracts.loop.handoffFields.join(", ")}.`,
    `Receipt fields: ${contracts.loop.receiptFields.join(", ")}.`,
    "Keep private context in the authorized tenant scope. Return artifact references and the smallest needed evidence to collaborators. A different authorized actor verifies the work; failed checks return the draft to its owner within the original budget.",
    "## Runtime state",
    "This package contains generated instructions. Native configuration, adapter smoke tests, evaluations, and deployment are unverified. A graph edge or a source profile does not start a process.",
    contracts.loop.enforcement,
    "Built on SIP — operational composition of existing agent profiles, file contracts, and skill references. This label is not a signed execution receipt.",
  ].join("\n\n") + "\n";
}

/** Return all files as data so callers can inspect them before writing. */
export function buildExport(catalog, card, contracts, { target = "portable", alias, root = ROOT } = {}) {
  if (!["portable", "eve-instructions"].includes(target)) throw new Error("Target must be portable or eve-instructions.");
  const prefix = target === "eve-instructions" ? `agent/subagents/${card.slug}` : card.id;
  const instructionsName = target === "eve-instructions" ? "instructions.md" : "AGENTS.md";
  const files = new Map();
  const add = (path, text) => files.set(`${prefix}/${path}`, text);
  add(instructionsName, composeInstructions(card, contracts, { alias }));
  add("source-profile.md", readFileSync(join(root, card.source.path), "utf8"));
  add("VOICE.md", readFileSync(join(root, ".starlight/voice/context.md"), "utf8"));
  add("agent-card.json", json(card));
  add("contracts.json", json(contracts));
  add("SKILLS.md", [
    `# Skills for ${card.name}`,
    "Definitions only: supporting references, scripts, assets, and repository links are not bundled. Keep the source checkout available to resolve those resources at their original paths. A definition supplies instructions, never tools or credentials.",
    ...card.skills.map((skill) => `- \`${skill.id}\`: [definition](source/${skill.source.path}) · SHA-256 \`${skill.source.sha256}\``),
    ...(card.unresolvedSkills.length ? ["## Unresolved legacy declarations", ...card.unresolvedSkills.map((skill) => `- \`${skill.declared}\`: ${skill.reason}`)] : []),
  ].join("\n\n") + "\n");
  for (const skill of card.skills) add(`source/${skill.source.path}`, readFileSync(join(root, skill.source.path), "utf8"));
  add("run-envelope.schema.json", readFileSync(join(root, contracts.loop.runEnvelopeSchema), "utf8"));
  add("task-envelope.schema.json", readFileSync(join(root, contracts.loop.taskEnvelopeSchema), "utf8"));
  add("specialist-review-loop.json", readFileSync(join(root, contracts.loop.executableGraphRef), "utf8"));
  add("README.md", [
    `# ${card.name}`,
    `${card.purpose} The stable agent ID is \`${card.id}\`; the original profile identity remains \`${card.profileName}\`.`,
    `Generated target: \`${target}\`. Read \`${instructionsName}\`, \`source-profile.md\`, \`VOICE.md\`, and relevant entries in \`SKILLS.md\`.`,
    target === "eve-instructions" ? "This directory follows Eve's subagent path convention and contains instructions only. Add a version-pinned `agent.ts` with `defineAgent`, a descriptive `description`, and an explicitly selected model. Bind tools and skills in the native configuration; authored child configurations do not inherit the root's slots. Keep channels, schedules, and instrumentation on the root. Node 24+ is required. No Eve configuration or deployment is created by this export." : "Supply these instructions to a supported host. Map tools explicitly, validate a Foundry task envelope inside the host run wrapper, claim the work lease, and enforce tenant scope and budgets before dispatch. This is a portable instruction package, not proof of compatibility with every harness.",
    "Skill definitions are copied; their supporting scripts, references, assets, and the original profile's repository links remain dependencies of the source checkout. This is not a self-contained installed skill mount. The loop contract is a composition guide. Reuse the existing SIS loop driver and work graph; do not create one graph or one daemon per agent. Require maker/checker separation and a durable receipt.",
    "Runtime evidence progresses separately: generated → typechecked → smoke-tested → evaluated → deployed. This export attests only generation. Framework adapters and all target runtime behavior remain unverified here.",
    `Source digest: \`${catalog.sourceDigest}\`. This exporter reads repository profiles, pinned voice, contracts, and referenced skills. It does not read private memory or host environment credentials.`,
  ].join("\n\n") + "\n");
  const manifest = {
    schemaVersion: "starlight.specialist-export.v1", agentId: card.id, profileName: card.profileName,
    role: card.name, displayAlias: alias ?? null, target, sourceDigest: catalog.sourceDigest,
    status: "generated", nativeConfiguration: "not-generated", runtimeEvidence: [],
    unbundledDependencies: {
      sourceProfileRepositoryReferences: card.source.path,
      skillSupportResourceBases: [...new Set(card.skills.map((skill) => dirname(skill.source.path)))].sort(),
      resolution: "Read support references/scripts/assets from the source checkout; only skill definition files are copied.",
    },
    files: [...files.entries()].map(([path, text]) => ({ path, sha256: hash(text) })),
  };
  add("export-manifest.json", json(manifest));
  return files;
}

export function writeExport(files, out, root = ROOT) {
  const destination = resolve(out);
  const agentsRoot = resolve(root, "agents");
  if (destination === agentsRoot || destination.startsWith(agentsRoot + sep)) throw new Error("Export outside agents/ so generated instructions cannot become source profiles.");
  const planned = [...files.entries()].map(([path, text]) => ({ path: resolve(destination, path), text }));
  for (const item of planned) {
    if (!item.path.startsWith(destination + sep)) throw new Error("Export path escapes destination.");
    if (existsSync(item.path) && readFileSync(item.path, "utf8") !== item.text) throw new Error("Export would overwrite different content; choose a new output directory.");
  }
  for (const item of planned) {
    mkdirSync(dirname(item.path), { recursive: true });
    writeFileSync(item.path, item.text);
  }
  return planned.map((item) => item.path);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const identity = args.shift();
    const option = (name) => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
    if (!identity || identity.startsWith("--")) throw new Error("Usage: node scripts/export-specialist.mjs <stable-id|profile-name> [--target portable|eve-instructions] [--alias Name] [--print|--out DIRECTORY]");
    checkOrWrite(ROOT, true);
    const { catalog } = buildCatalog(ROOT);
    const card = selectSpecialist(catalog, identity);
    const contracts = JSON.parse(readFileSync(join(ROOT, CONTRACTS_PATH), "utf8"));
    const options = { target: option("--target") ?? "portable", alias: option("--alias") };
    if (args.includes("--print")) console.log(composeInstructions(card, contracts, options));
    else {
      const out = option("--out");
      if (!out) throw new Error("Select --print or an explicit --out directory.");
      const files = buildExport(catalog, card, contracts, options);
      console.log(JSON.stringify({ agentId: card.id, target: options.target, status: "generated", files: writeExport(files, out) }, null, 2));
    }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
