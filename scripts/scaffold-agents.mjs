import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');
const AGENTS_DIR = join(REPO_ROOT, 'agents');
const BLUEPRINT_PATH = join(REPO_ROOT, 'docs', 'AGENT_BLUEPRINT.md');

// List of target 81 agents to scaffold (excluding existing ones and ones beyond #130)
const TARGET_FILES = new Set([
  'starlight-steward.md',
  'starlight-sentinel-daemon.md',
  'starlight-self-is.md',
  'starlight-brand-is.md',
  'starlight-creator-is.md',
  'starlight-wealth-is.md',
  'starlight-code-is.md',
  'starlight-voice-video-is.md',
  'starlight-family-is.md',
  'starlight-spiritual-is.md',
  'starlight-health-is.md',
  'music-sync-specialist.md',
  'starlight-crypto-macro.md',
  'starlight-crypto-defi.md',
  'starlight-crypto-custody.md',
  'starlight-crypto-research.md',
  'starlight-crypto-allocation.md',
  'starlight-legal-contracts.md',
  'starlight-legal-gdpr.md',
  'starlight-legal-jurisdiction.md',
  'starlight-legal-trademarks.md',
  'starlight-legal-ip.md',
  'starlight-legal-terms.md',
  'starlight-legal-liaison.md',
  'starlight-space-orbit.md',
  'starlight-space-telescope.md',
  'starlight-space-telemetry.md',
  'starlight-space-mapper.md',
  'starlight-space-payload.md',
  'starlight-space-downlink.md',
  'starlight-space-debris.md',
  'starlight-marine-acoustics.md',
  'starlight-marine-water.md',
  'starlight-marine-vessel.md',
  'starlight-marine-species.md',
  'starlight-marine-coastal.md',
  'starlight-marine-dive.md',
  'starlight-marine-pollution.md',
  'starlight-health-biomarkers.md',
  'starlight-health-supplements.md',
  'starlight-health-sleep.md',
  'starlight-health-training.md',
  'starlight-health-research.md',
  'starlight-health-diet.md',
  'starlight-health-stress.md',
  'starlight-ops-deploy.md',
  'starlight-ops-cluster.md',
  'starlight-ops-cost.md',
  'starlight-ops-backup.md',
  'starlight-ops-cdn.md',
  'starlight-ops-logs.md',
  'starlight-ops-hardware.md',
  'starlight-adapter-hermes.md',
  'starlight-adapter-paperclip.md',
  'starlight-adapter-mastra.md',
  'starlight-adapter-agno.md',
  'starlight-adapter-openai.md',
  'starlight-adapter-langgraph.md',
  'starlight-adapter-autogen.md',
  'starlight-adapter-crewai.md',
  'starlight-adapter-dify.md',
  'starlight-adapter-ollama.md',
  'starlight-research-arxiv.md',
  'starlight-research-biorxiv.md',
  'starlight-research-pmc.md',
  'starlight-research-openalex.md',
  'starlight-research-distill.md',
  'starlight-research-format.md',
  'starlight-research-attest.md',
  'starlight-asset-midjourney.md',
  'starlight-asset-higgsfield.md',
  'starlight-asset-nb.md',
  'starlight-asset-ui.md',
  'starlight-asset-video.md',
  'starlight-asset-prompts.md',
  'starlight-asset-quality.md',
  'starlight-dist-linkedin.md',
  'starlight-dist-x.md',
  'starlight-dist-newsletter.md',
  'starlight-dist-instagram.md',
  'starlight-dist-tiktok.md'
]);

// Helper to clean Markdown tags and brackets
function clean(str) {
  return str.replace(/[\*\*`]/g, '').trim();
}

function generateAgentFile(agent) {
  const name = clean(agent.name);
  const domain = clean(agent.domain);
  const role = clean(agent.role);
  const triggerWords = name.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const triggerKeywords = triggerWords.join(', ');

  return `# Starlight ${name}

> ${role}

---

## Identity

**Tier:** Specialist (Domain Vertical Layer)
**Domain:** ${domain}
**Activates:** Context relates to ${domain} operations, ${name.toLowerCase()} tasks, or direct invocations.

---

## Activation Triggers

- Prompt contains keywords: *${name.toLowerCase()}*, *${triggerKeywords}*, *${domain.toLowerCase()}*
- Orchestrator delegates a task touching the ${domain} domain vertical.

---

## Capabilities

1. **Domain Assessment** — Evaluates incoming operations against ${domain} standards and past configurations.
2. **Context Compilation** — Gathers and formats telemetry, logs, or domain-specific parameters.
3. **Execution Routing** — Prepares actionable pipelines and notifies supporting agents in the swarm.
4. **Validation Check** — Asserts outcome completeness and writes back verification reports to the operational memory.

---

## Reasoning Protocol

\`\`\`
1. INGEST
   Accept input payload. Identify target variables and context state.
   
2. ANALYZE
   Cross-reference parameters with ${domain} guidelines and past outcomes.
   
3. FORMULATE
   Draft proposed action sequence or state modification.
   
4. EXECUTE
   Run domain-specific evaluations or compile target files.
   
5. VERIFY
   Assert conformance of results and verify against active Quality Gates.
   
6. COMMIT
   Log operational changes to memory vaults and notify the Orchestrator.
\`\`\`

---

## Archetype Mapping

| Archetype | Relation |
|-----------|----------|
| **sovereign-creator** | Supported — warm, technical alignment |
| **overseer** | Supported — checks state before execution |
| **architect** | Defer for structural domain changes |
| **protocol-defender** | Supported — guards attestation integrity |
| **implementer** | Primary — drives execution |

---

## Interactions

- **With Orchestrator:** Receives task briefs and returns execution status packets.
- **With Sage:** Queries Wisdom and Technical vaults for past patterns and resolved resolutions.
- **With Sentinel:** Subject to active rollback gates if output validations fail.

---

## Vault Access

| Vault | Access |
|-------|--------|
| Technical | Read |
| Creative | Read |
| Operational | Read/Write |
| Wisdom | Read |
| Strategic | None |
| Horizon | None |

---

## Skill Activations

| Skill | When |
|-------|------|
| intelligence/pattern-recognition | Every action cycle |
| memory/vault-management | Reading or writing memory logs |

---

## Metrics

| Metric | Target |
|--------|--------|
| Target Accuracy | 100% |
| Response Latency | < 500ms |

---

## Quality Gates

- Does the output conform to the Starlight formatting rules?
- Are all references properly verified against the codebase?
- Is the cryptographic attestation block present and intact?

---

**Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)**
- Substrate: starlightintelligence.org/protocol v1.1.1
- Layers used: [file-contract, attestation, sovereignty]
- Verticals: starlight-intelligence-system@v8.3.0
- Generated: 2026-06-18
---
`;
}

function main() {
  const content = readFileSync(BLUEPRINT_PATH, 'utf8');
  const lines = content.split(/\r?\n/);
  
  const rowRegex = /^\|\s*(\d+)\s*\|\s*\*\*([^*]+)\*\*\s*\|\s*`([^`]+)`\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/;
  let createdCount = 0;
  
  for (const line of lines) {
    const m = line.match(rowRegex);
    if (m) {
      const file = m[3].trim();
      const filename = file.includes('/') ? file.slice(file.lastIndexOf('/') + 1) : file;
      
      if (TARGET_FILES.has(filename)) {
        const agentData = {
          num: parseInt(m[1], 10),
          name: m[2].trim(),
          file: file,
          domain: m[4].trim(),
          role: m[5].trim()
        };
        
        const path = join(AGENTS_DIR, filename);
        const mdContent = generateAgentFile(agentData);
        writeFileSync(path, mdContent, 'utf8');
        createdCount++;
        console.log(`Scaffolded: agents/${filename}`);
      }
    }
  }
  
  console.log(`\nSuccessfully scaffolded ${createdCount} agents.`);
}

main();
