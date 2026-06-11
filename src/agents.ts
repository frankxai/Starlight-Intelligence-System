import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, basename, extname } from "node:path";
import type { AgentDefinition, AgentRegistry } from "./types.js";

// ── Static Fallback Agent Definitions ───────────────────────

const STATIC_AGENTS: AgentDefinition[] = [
  {
    id: "content-architect",
    name: "Content Architect",
    type: "specialist",
    description: "Blog posts, SEO content, social media copy. Enforces brand voice.",
    skills: ["frankx-brand", "seo-content-writer", "seo-fundamentals", "schema-markup"],
    triggers: {
      keywords: ["write", "article", "blog", "content", "publish", "social", "seo"],
      filePatterns: ["content/**/*.mdx"],
    },
  },
  {
    id: "frontend-engineer",
    name: "Frontend Engineer",
    type: "specialist",
    description: "React components, Next.js pages, Tailwind styling, accessibility.",
    skills: ["vercel-react-best-practices", "next-best-practices", "tailwind-css-patterns", "fixing-accessibility"],
    triggers: {
      keywords: ["component", "page", "ui", "design", "responsive", "accessibility", "layout"],
      filePatterns: ["app/**/*.tsx", "components/**/*.tsx"],
    },
  },
  {
    id: "ai-systems-architect",
    name: "AI Systems Architect",
    type: "specialist",
    description: "Agent design, MCP servers, orchestration patterns.",
    skills: ["ai-agents-architect", "mcp-builder", "prompt-engineering-patterns"],
    triggers: {
      keywords: ["agent", "mcp", "orchestration", "agentic", "system design", "multi-agent"],
      filePatterns: [".claude/**/*"],
    },
  },
  {
    id: "music-producer",
    name: "Music Producer",
    type: "specialist",
    description: "AI music creation with Suno, genre production, commercial tracks.",
    skills: ["suno-ai-mastery"],
    triggers: {
      keywords: ["suno", "music", "song", "track", "beat", "lyrics", "genre"],
    },
  },
  {
    id: "product-engineer",
    name: "Product Engineer",
    type: "specialist",
    description: "Digital products, templates, packaging, distribution.",
    skills: ["product-engine"],
    triggers: {
      keywords: ["product", "template", "package", "sell", "launch", "gumroad"],
      filePatterns: ["data/products.json", "app/products/**/*"],
    },
  },
  {
    id: "devops-engineer",
    name: "DevOps Engineer",
    type: "specialist",
    description: "Deployment, production sync, CI/CD, monitoring.",
    skills: ["vercel-deployment"],
    triggers: {
      keywords: ["deploy", "production", "push", "build", "ci", "pipeline", "vercel"],
    },
  },
  {
    id: "research-analyst",
    name: "Research Analyst",
    type: "specialist",
    description: "Deep research, competitive analysis, market intelligence.",
    skills: ["deep-research"],
    triggers: {
      keywords: ["research", "analyze", "investigate", "competitive", "market", "deep dive"],
    },
  },
  {
    id: "starlight-orchestrator",
    name: "Starlight Orchestrator",
    type: "meta",
    description: "Meta-intelligence for cross-domain coordination. Routes complex tasks to specialists.",
    skills: ["acos"],
    triggers: {
      keywords: ["coordinate", "orchestrate", "strategy", "complex", "multi-domain"],
    },
  },
];

// ── Dynamic Agent Discovery ──────────────────────────────────

function loadDynamicAgents(): AgentDefinition[] {
  const agentsList: AgentDefinition[] = [];
  const processedIds = new Set<string>();

  const scanDirs = [
    join(process.cwd(), "agents"),
    join(process.cwd(), "verticals")
  ];

  // Helper to recursively find .md files
  function findMarkdownFiles(dir: string, fileList: string[] = []): string[] {
    if (!existsSync(dir)) return fileList;
    
    try {
      const files = readdirSync(dir);
      for (const file of files) {
        const fullPath = join(dir, file);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          findMarkdownFiles(fullPath, fileList);
        } else if (stat.isFile() && extname(file) === ".md") {
          fileList.push(fullPath);
        }
      }
    } catch {
      // Ignore reading errors gracefully
    }
    return fileList;
  }

  // Parse a single markdown file into an AgentDefinition
  function parseAgentFile(filePath: string): AgentDefinition | null {
    try {
      const content = readFileSync(filePath, "utf-8");
      const lines = content.split(/\r?\n/);
      
      const filename = basename(filePath, ".md");
      // Decide ID: if filename is "agent.md", take the parent directory name, otherwise the filename
      let id = filename;
      if (filename === "agent") {
        const parentDir = basename(join(filePath, ".."));
        id = parentDir;
      }
      
      if (processedIds.has(id)) return null;

      // Extract Name (e.g., "# Starlight Orchestrator" or "# Music Curator")
      let name = "";
      const nameLine = lines.find(l => l.startsWith("# "));
      if (nameLine) {
        name = nameLine.replace("# ", "").trim();
      } else {
        name = id.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      }

      // Extract Description (blockquote below name)
      let description = "";
      const descLine = lines.find(l => l.startsWith("> "));
      if (descLine) {
        description = descLine.replace("> ", "").trim();
      } else {
        description = `Specialized agent for ${name} operations.`;
      }

      // Extract Tier (to decide if "meta" or "specialist")
      let type: "meta" | "specialist" = "specialist";
      const tierLine = lines.find(l => l.toLowerCase().includes("**tier:**") || l.toLowerCase().includes("tier:"));
      if (tierLine) {
        const tierText = tierLine.toLowerCase();
        if (tierText.includes("meta") || tierText.includes("leadership") || tierText.includes("council") || tierText.includes("apex")) {
          type = "meta";
        }
      } else if (id.includes("orchestrator") || id.includes("prime") || id.includes("architect")) {
        type = "meta";
      }

      // Extract Skills
      const skills = new Set<string>();
      let inSkillsSection = false;
      for (const line of lines) {
        if (line.startsWith("## Skill Activations") || line.startsWith("## Capabilities")) {
          inSkillsSection = true;
          continue;
        }
        if (inSkillsSection && line.startsWith("## ")) {
          inSkillsSection = false;
        }
        if (inSkillsSection) {
          // Check for bullet points
          const bulletMatch = line.match(/^[-*]\s+`?([a-zA-Z0-9_-]+)`?/);
          if (bulletMatch && bulletMatch[1]) {
            skills.add(bulletMatch[1].trim());
          }
          // Check for table rows
          const tableMatch = line.match(/^\|\s*`?([a-zA-Z0-9_-]+)`?\s*\|/);
          if (tableMatch && tableMatch[1]) {
            skills.add(tableMatch[1].trim());
          }
        }
      }

      // Extract Keywords for triggers
      const keywords = new Set<string>();
      // Base keywords from name and id
      id.split("-").forEach(w => {
        if (w.length > 3) keywords.add(w.toLowerCase());
      });
      name.toLowerCase().split(/\s+/).forEach(w => {
        if (w.length > 3) keywords.add(w.replace(/[^a-z0-9]/g, ""));
      });

      // Parse activates keywords
      const activatesLine = lines.find(l => l.toLowerCase().includes("**activates:**") || l.toLowerCase().includes("activates:"));
      if (activatesLine) {
        const text = activatesLine.replace(/[\*_]+[a-zA-Z]+[\*_]+:/i, "").replace(/activates:/i, "");
        text.split(/[,;|]/).forEach(k => {
          const clean = k.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "");
          if (clean.length > 2) keywords.add(clean);
        });
      }

      // Parse domain keywords
      const domainLine = lines.find(l => l.toLowerCase().includes("**domain:**") || l.toLowerCase().includes("domain:"));
      if (domainLine) {
        const text = domainLine.replace(/[\*_]+[a-zA-Z]+[\*_]+:/i, "").replace(/domain:/i, "");
        text.split(/[,;|]/).forEach(k => {
          const clean = k.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "");
          if (clean.length > 2) keywords.add(clean);
        });
      }

      // Ensure some default keywords if set is empty
      if (keywords.size === 0) {
        keywords.add(id);
      }

      processedIds.add(id);
      return {
        id,
        name,
        type,
        description,
        skills: Array.from(skills),
        triggers: {
          keywords: Array.from(keywords),
        }
      };
    } catch {
      return null;
    }
  }

  // Scan all directories and parse files
  for (const dir of scanDirs) {
    const mdFiles = findMarkdownFiles(dir);
    for (const filePath of mdFiles) {
      // Don't parse AGENT_REGISTRY.md or other summary files
      const base = basename(filePath).toLowerCase();
      if (base.includes("registry") || base.includes("readme") || base.includes("skill") || base.includes("canon") || base.includes("memory") || base.includes("stack") || base.includes("soul")) {
        continue;
      }
      const agent = parseAgentFile(filePath);
      if (agent) {
        agentsList.push(agent);
      }
    }
  }

  return agentsList;
}

const DYNAMIC_AGENTS = loadDynamicAgents();
const ACOS_AGENTS: AgentDefinition[] = DYNAMIC_AGENTS.length > 0 ? DYNAMIC_AGENTS : STATIC_AGENTS;

// ── Routing Engine ──────────────────────────────────────────

export class AgentRouter {
  private agents: AgentDefinition[];

  constructor(agents?: AgentDefinition[]) {
    this.agents = agents ?? ACOS_AGENTS;
  }

  /**
   * Route a task to the best agent based on query keywords and file patterns.
   * Returns agents sorted by relevance score.
   */
  route(query: string, filePaths?: string[]): AgentRecommendation[] {
    const queryLower = query.toLowerCase();
    const results: AgentRecommendation[] = [];

    for (const agent of this.agents) {
      let score = 0;

      // Keyword matching
      for (const keyword of agent.triggers.keywords) {
        if (queryLower.includes(keyword.toLowerCase())) {
          score += 10;
        }
      }

      // File pattern matching
      if (filePaths && agent.triggers.filePatterns) {
        for (const pattern of agent.triggers.filePatterns) {
          const regex = patternToRegex(pattern);
          for (const filePath of filePaths) {
            if (regex.test(filePath)) {
              score += 5;
            }
          }
        }
      }

      if (score > 0) {
        results.push({
          agent,
          score,
          reason: this.explainMatch(agent, queryLower),
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Get an agent by ID.
   */
  getAgent(id: string): AgentDefinition | undefined {
    return this.agents.find((a) => a.id === id);
  }

  /**
   * Get the full registry.
   */
  getRegistry(): AgentRegistry {
    return {
      version: "8.0.0",
      agents: this.agents,
    };
  }

  /**
   * Add a custom agent to the registry.
   */
  addAgent(agent: AgentDefinition): void {
    // Prevent duplicates
    this.agents = this.agents.filter((a) => a.id !== agent.id);
    this.agents.push(agent);
  }

  private explainMatch(agent: AgentDefinition, query: string): string {
    const matched = agent.triggers.keywords.filter((k) =>
      query.includes(k.toLowerCase())
    );
    return `Matched keywords: ${matched.join(", ")}`;
  }
}

export interface AgentRecommendation {
  agent: AgentDefinition;
  score: number;
  reason: string;
}

// ── Utilities ───────────────────────────────────────────────

function patternToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/\./g, "\\.")
    .replace(/\*\*/g, "<<GLOBSTAR>>")
    .replace(/\*/g, "[^/]*")
    .replace(/<<GLOBSTAR>>/g, ".*");
  return new RegExp(escaped);
}

// ── Convenience Exports ─────────────────────────────────────

export { ACOS_AGENTS };
