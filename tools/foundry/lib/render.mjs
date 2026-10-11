import { slugToTitle, yamlQuote } from "./io.mjs";

export function renderShortDescription(value, maximum = 64) {
  const normalized = value.replace(/\s+/g, " ").trim();
  const padded = normalized.length < 25 ? `${normalized} with explicit proof.` : normalized;
  if (padded.length <= maximum) return padded;
  const candidate = padded.slice(0, maximum - 3);
  const boundary = candidate.lastIndexOf(" ");
  return `${candidate.slice(0, boundary >= Math.min(25, maximum - 3) ? boundary : maximum - 3)}...`;
}

function xmlAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function renderPluginLogoSvg(label, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="${xmlAttribute(label)}">
  <rect width="512" height="512" rx="112" fill="${color}"/>
  <rect x="128" y="128" width="256" height="256" rx="72" fill="#FFFFFF"/>
  <circle cx="256" cy="256" r="64" fill="#212121"/>
</svg>`;
}

export function renderPluginComposerIconSvg(label, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${xmlAttribute(label)}">
  <circle cx="64" cy="64" r="56" fill="${color}"/>
  <path d="M64 28 100 64 64 100 28 64Z" fill="#FFFFFF"/>
</svg>`;
}

export function renderSkill(pack) {
  const procedure = pack.procedure
    .map((step, index) => `${index + 1}. ${step.instruction}\n   - Proof: ${step.proof}`)
    .join("\n");
  const inputs = pack.inputs.length > 0 ? pack.inputs.map((entry) => `- ${entry}`).join("\n") : "- User brief";
  const outputs = pack.outputs.map((entry) => `- ${entry}`).join("\n");
  const dependencies = pack.dependencies.length > 0
    ? pack.dependencies.map((entry) => `- \`${entry}\``).join("\n")
    : "- None";
  const denied = pack.toolPolicy.deny.length > 0
    ? pack.toolPolicy.deny.map((entry) => `- Do not use \`${entry}\`.`).join("\n")
    : "- Respect the active harness permission boundary.";

  return `---
name: ${pack.id}
description: ${yamlQuote(pack.description)}
---

# ${slugToTitle(pack.id)}

## Outcome

Produce ${pack.outputs.join(", ")} with an explicit proof trail.

## Use this skill when

${pack.triggers.positive.map((entry) => `- ${entry}`).join("\n")}

Do not use it when:

${pack.triggers.negative.map((entry) => `- ${entry}`).join("\n")}

## Inputs

${inputs}

## Procedure

${procedure}

## Outputs

${outputs}

## Dependencies

${dependencies}

## Guardrails

${denied}
- Never claim a test, review, deployment, or external write happened without a receipt.
- Escalate permission expansion, destructive actions, and public release decisions.

## Completion

Return the artifact, evidence gathered, checks actually run, uncertainty, and unresolved decisions.
`;
}

export function renderOpenAiYaml(pack) {
  const displayName = slugToTitle(pack.id);
  return `interface:
  display_name: ${yamlQuote(displayName)}
  short_description: ${yamlQuote(renderShortDescription(pack.description))}
  default_prompt: ${yamlQuote(`Use $${pack.id} to ${pack.outputs[0].toLowerCase()} with explicit evidence and completion checks.`)}
policy:
  allow_implicit_invocation: ${pack.deployment.implicitInvocation ? "true" : "false"}
`;
}

export function renderAgent(pack) {
  return `---
name: ${pack.id}
tier: specialist
domain: foundry-generated
voice: direct-technical
---

# ${slugToTitle(pack.id)}

## Mission

${pack.description}

## Why this is an agent

${pack.necessity.rationale}

## Decision rights

${pack.decisionRights.map((entry) => `- ${entry}`).join("\n")}

## Active skills

${pack.skills.map((entry) => `- ${entry}`).join("\n")}

## Tool boundary

- Allow: ${pack.toolPolicy.allow.join(", ") || "none"}
- Deny: ${pack.toolPolicy.deny.join(", ") || "none"}

## Memory contract

- Read: ${pack.memoryContract.read.join(", ") || "none"}
- Write: ${pack.memoryContract.write.join(", ") || "none"}
- Retention: ${pack.memoryContract.retention}

## Handoffs

${pack.handoffs.length > 0 ? pack.handoffs.map((entry) => `- ${entry.when} → ${entry.target}`).join("\n") : "- No delegated handoffs."}

## Termination

${pack.termination.conditions.map((entry) => `- ${entry}`).join("\n")}

Maximum turns: ${pack.termination.maxTurns}
`;
}

export function renderPackageReadme(envelope, pack, resolution) {
  return `# ${slugToTitle(pack.id)}

Foundry capability package compiled from Task Envelope \`${envelope.id}\`.

## Contract

- Kind: \`${pack.kind}\`
- Version: \`${pack.version}\`
- Stakes: \`${envelope.stakes.impact}\` / \`${envelope.stakes.reversibility}\`
- Autonomy: \`${envelope.autonomy.level}\`
- Deployment: ${envelope.deployment.targets.map((target) => `\`${target}\``).join(", ")}

## Resolved capabilities

${resolution.selected.length > 0 ? resolution.selected.map((entry) => `- ${entry}`).join("\n") : "- No existing capabilities were selected."}

## Proof

Run:

\`\`\`bash
node tools/foundry/cli.mjs prove <package-directory>
\`\`\`

A package is not validated until its required evidence lanes pass. Manual and judge tests remain pending until independent evidence is supplied.
`;
}
