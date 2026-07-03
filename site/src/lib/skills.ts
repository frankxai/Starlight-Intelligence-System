// Reads skills/skill-rules.json from the repo root at build/request time.
// site/ lives one directory below the repo root — same process.cwd() + ".."
// pattern as lib/agents.ts and lib/sip.ts.

import { promises as fs } from "fs";
import path from "path";

export interface SkillRule {
  id: string;
  skill: string;
  domain: string;
  keywords: string[];
  priority: string;
  loadLevel?: string;
}

interface RawSkillRule {
  id: string;
  skill: string;
  triggers?: {
    keywords?: string[];
    agents?: string[];
    intents?: string[];
  };
  priority?: string;
  load_level?: string;
}

interface SkillRulesFile {
  version?: string;
  description?: string;
  rules: RawSkillRule[];
  defaults?: Record<string, string[]>;
}

export interface SkillRegistry {
  description: string;
  version: string;
  rules: SkillRule[];
  total: number;
}

export async function getSkillRegistry(): Promise<SkillRegistry> {
  const repoRoot = path.join(process.cwd(), "..");
  const rulesPath = path.join(repoRoot, "skills", "skill-rules.json");

  try {
    const raw = await fs.readFile(rulesPath, "utf8");
    const data: SkillRulesFile = JSON.parse(raw);

    const rules: SkillRule[] = (data.rules ?? []).map((r) => ({
      id: r.id,
      skill: r.skill,
      domain: r.skill.split("/")[0] ?? "general",
      keywords: r.triggers?.keywords ?? [],
      priority: r.priority ?? "medium",
      loadLevel: r.load_level,
    }));

    return {
      description: data.description ?? "Skill Auto-Activation Rules",
      version: data.version ?? "",
      rules,
      total: rules.length,
    };
  } catch {
    return { description: "Skill Auto-Activation Rules", version: "", rules: [], total: 0 };
  }
}

export function groupByDomain(rules: SkillRule[]): Map<string, SkillRule[]> {
  const map = new Map<string, SkillRule[]>();
  for (const rule of rules) {
    const list = map.get(rule.domain) ?? [];
    list.push(rule);
    map.set(rule.domain, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.id.localeCompare(b.id));
  }
  return map;
}
