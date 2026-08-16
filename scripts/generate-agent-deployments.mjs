import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadRegistry, validateRegistry } from "./validate-agent-deployments.mjs";

const outputUrl = new URL("../docs/ops/PORTFOLIO_AGENT_DEPLOYMENTS.md", import.meta.url);
const checkMode = process.argv.includes("--check");

const cell = (value) => String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
const title = (value) => value.replaceAll("-", " ").replace(/\b\w/g, (character) => character.toUpperCase());

function commercialLabel(commercial) {
  if (commercial.pricing_model === "internal") return "internal";
  if (commercial.pricing_model === "free-acquisition") return "free acquisition";
  const unit = commercial.billable_unit === "none" ? "" : ` / ${title(commercial.billable_unit)}`;
  return `${title(commercial.pricing_model)}${unit}`;
}

function buildReport(registry) {
  const surfaceById = new Map(registry.surfaces.map((surface) => [surface.id, surface]));
  const runtimeById = new Map(registry.runtimes.map((runtime) => [runtime.id, runtime]));
  const ordered = [...registry.deployments].sort((left, right) => left.priority - right.priority);
  const liveCount = ordered.filter((deployment) => deployment.lifecycle === "live").length;
  const paidCount = ordered.filter((deployment) =>
    ["subscription", "subscription-plus-usage", "one-time-pack"].includes(deployment.commercial.pricing_model),
  ).length;

  const lines = [
    "# Portfolio Agent Deployments",
    "",
    `Generated from \`context/empire/agent-deployments.json\` on the ${registry.as_of} evidence cutoff. Do not hand-edit this file.`,
    "",
    "## Current decision",
    "",
    `- Registrar mode: \`${registry.registrar_mode}\`. Version 1.0 is an inventory and architecture guard, not release authorization; it rejects every \`live\` claim.`,
    `- Control plane: \`${registry.authority.control_plane}\`.`,
    `- Reference execution product: \`${registry.authority.execution_reference}\`.`,
    `- Capability boundary: \`${registry.authority.capability_abi}\`.`,
    `- Run invariant: \`${registry.authority.run_rule}\`.`,
    `- Portfolio truth: ${ordered.length} registered deployments, ${liveCount} agent deployments verified live, ${paidCount} planned paid offers. A healthy website is not evidence that its agent product is live.`,
    "",
    "## Build and launch queue",
    "",
    "| P | Offering | Surface | Lifecycle | Runtime | Risk / autonomy | Commercial model | Next gate |",
    "|---:|---|---|---|---|---|---|---|",
    ...ordered.map((deployment) => {
      const surface = surfaceById.get(deployment.surface_id);
      const runtime = runtimeById.get(deployment.runtime_id);
      return `| ${deployment.priority} | ${cell(deployment.name)} | ${cell(surface?.brand)} | ${cell(deployment.lifecycle)} | ${cell(runtime?.orchestrator)} | ${cell(`${deployment.risk_class} / ${deployment.autonomy}`)} | ${cell(commercialLabel(deployment.commercial))} | ${cell(deployment.next_gate)} |`;
    }),
    "",
    "## Runtime boundaries",
    "",
    "| Runtime | Decision | Loop owner | Inference plane | Scope |",
    "|---|---|---|---|---|",
    ...registry.runtimes.map(
      (runtime) =>
        `| ${cell(runtime.orchestrator)} | ${cell(runtime.status)} | ${cell(runtime.loop_owner)} | ${cell(runtime.inference_plane)} | ${cell(runtime.intended_scope)} |`,
    ),
    "",
    "One run has one loop owner. Vercel AI SDK, OpenAI Agents SDK, Claude Agent SDK, Eve, ChatGPT host and Google ADK are alternative orchestration owners, never a nested chain. Domain capabilities are typed once and exposed through the tenant-aware MCP boundary.",
    "",
    "## Surface evidence",
    "",
    "| Brand | Repository | Domains | State | Boundary | Evidence note |",
    "|---|---|---|---|---|---|",
    ...registry.surfaces.map((surface) => {
      const evidence = surface.evidence.map((item) => item.claim).join(" ");
      return `| ${cell(surface.brand)} | \`${cell(surface.repository)}\` | ${cell(surface.production_domains.join(", ") || "binding not verified")} | ${cell(surface.deployment_state)} | ${cell(surface.data_boundary)} | ${cell(evidence)} |`;
    }),
    "",
    "## Advisory gates enforced now",
    "",
    "- Never resell raw provider credits or expose an undifferentiated inference proxy. Sell finished workflows, governed seats, Creation Units, Render Packs and versioned first-party packs.",
    "- BYOK secrets are encrypted, write-only and configured on a secure account surface. They never enter prompts, client bundles, logs or MCP parameters.",
    "- Managed usage has a hard tenant budget. The product ledger—not AI Gateway—is billing truth.",
    "- R3+ work is approval-gated. R5 deployments are rejected. Publish, send, delete, deploy, financial and external-write effects are enforced in the tool layer.",
    "- Sensitive data requires an EU route, ZDR and the isolated Reality Architect memory boundary. It cannot enter preview runtimes.",
    "- A deployment cannot move to \`live\` without production surface evidence and test evidence.",
    "- Version 1.0 rejects every \`live\` lifecycle. Version 1.1 must add schema-backed regulatory, provider, data-processing, commercial-limit, tool-effect and immutable release receipts before this can become a release gate.",
    "",
    "## Revenue guardrails",
    "",
    "- Target at least 75% median gross margin and 65–70% at p95 for managed AI products.",
    "- Keep included provider spend below 15–20% of net revenue and hard-stop at 30% until observed economics justify a change.",
    "- Price image and video at 2.2–3× blended provider, retry, moderation and storage cost; never offer unlimited video.",
    "- Launch first-party packs before any third-party marketplace. Seller verification, tax reporting, content moderation, takedown, payouts and disputes are separate launch gates.",
    "",
    "Built on SIP.",
    "",
  ];

  return lines.join("\n");
}

const registry = await loadRegistry();
const failures = validateRegistry(registry);
if (failures.length > 0) {
  console.error("Cannot generate an invalid registry:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const expected = buildReport(registry);
if (checkMode) {
  let current = "";
  try {
    current = await readFile(outputUrl, "utf8");
  } catch {
    console.error(`Generated report missing: ${fileURLToPath(outputUrl)}`);
    process.exit(1);
  }
  if (current !== expected) {
    console.error("Generated portfolio agent report is stale. Run node scripts/generate-agent-deployments.mjs.");
    process.exit(1);
  }
  console.log("Generated portfolio agent report is current.");
} else {
  await writeFile(outputUrl, expected, "utf8");
  console.log(`Wrote ${resolve(fileURLToPath(outputUrl))}`);
}
