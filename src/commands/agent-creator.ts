import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

const ROLES = [
  "elder",
  "sage",
  "builder",
  "sentinel",
  "navigator",
  "weaver",
  "hermes"
] as const;

function generateProfile(domain: string, role: string): string {
  let tier = "specialist";
  if (role === "elder") tier = "leadership";
  if (role === "sage") tier = "foundation";

  return `---
name: starlight-${domain}-${role}
tier: ${tier}
domain: ${domain}
voice: ${role === "elder" ? "prime" : role}
---
# Starlight ${role.charAt(0).toUpperCase() + role.slice(1)}: ${domain} Domain

## Mission
Act as the ${role} for the ${domain} domain council, providing specialized insights, architectural direction, and governance.

## Active Skills
- \`domain/${domain}-${role}-core\`
- \`orchestration/multi-agent-coordination\`
- \`memory/vault-management\`

## Interaction Trigger Rules
Activated when prompt context involves "${domain}" or touches the ${domain} architecture.
`;
}

export function createAgentCouncil(domain: string) {
  const rootDir = process.cwd();
  const agentsDir = join(rootDir, "agents");
  const skillsFile = join(rootDir, "skills", "skill-rules.json");

  if (!existsSync(agentsDir)) {
    mkdirSync(agentsDir, { recursive: true });
  }

  // 1. Generate 7 markdown profiles
  for (const role of ROLES) {
    const profileContent = generateProfile(domain, role);
    const fileName = `starlight-${domain}-${role}.md`;
    const filePath = join(agentsDir, fileName);
    writeFileSync(filePath, profileContent, "utf-8");
    console.log(`[+] Created ${fileName}`);
  }

  // 2. Auto-wire in skill-rules.json
  if (existsSync(skillsFile)) {
    try {
      const raw = readFileSync(skillsFile, "utf-8");
      const rulesData = JSON.parse(raw);
      
      const newAgents = ROLES.map(role => `starlight-${domain}-${role}`);
      const ruleId = `${domain}-domain-council`;

      const existingRule = rulesData.rules?.find((r: any) => r.id === ruleId);
      if (!existingRule) {
        const newRule = {
          id: ruleId,
          skill: "orchestration/multi-agent-coordination",
          triggers: {
            keywords: [domain, `${domain} architecture`, `${domain} council`],
            agents: newAgents,
            intents: [`${domain}-management`]
          },
          priority: "high",
          load_level: "domain"
        };

        if (!rulesData.rules) {
          rulesData.rules = [];
        }
        rulesData.rules.push(newRule);
        
        writeFileSync(skillsFile, JSON.stringify(rulesData, null, 2), "utf-8");
        console.log(`[+] Wired ${ruleId} into skill-rules.json`);
      } else {
        console.log(`[i] Rule ${ruleId} already exists in skill-rules.json. Skipping rule insertion.`);
      }
    } catch (e) {
      console.error(`[-] Failed to update skill-rules.json:`, e);
    }
  } else {
    console.warn(`[!] skill-rules.json not found at ${skillsFile}. Skipping wiring.`);
  }
}

export function main() {
  const { positionals } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true
  });

  if (positionals.length === 0) {
    console.error("Usage: agent-creator <domain>");
    process.exit(1);
  }

  const domain = positionals[0].toLowerCase();
  createAgentCouncil(domain);
}

// Support running directly
if (
  process.argv[1] &&
  (process.argv[1].endsWith("agent-creator.ts") ||
    process.argv[1].endsWith("agent-creator.js") ||
    process.argv[1].endsWith("agent-creator"))
) {
  main();
}
