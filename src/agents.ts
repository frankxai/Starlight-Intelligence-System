/**
 * Agent Registry — Aligned with ACOS v8 specialist agents
 *
 * Provides task routing logic: given a query/file path,
 * recommend the best agent and skill set.
 */

import type { AgentDefinition, AgentRegistry, SkillDefinition } from "./types.js";

// ── ACOS v8 Agent Definitions ───────────────────────────────

const ACOS_AGENTS: AgentDefinition[] = [
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
