import {
  auditSkillValuation,
  generateHarnessConfig,
  syndicateSkill,
  resolveSkillMatrix,
  type HarnessTarget,
  type SyndicationTarget,
  type SkillDefinition,
} from "../../../../../src/skills/index.js";

export const runtime = "nodejs";

const SAMPLE_SKILLS: SkillDefinition[] = [
  {
    name: "safety/secret-detector",
    version: "1.0.0",
    description: "Zero-trust PII & secret scrubbing gateway for outbound agent payloads.",
    domain: "safety",
    contextBudgetTokens: 800,
    triggers: { keywords: ["api_key", "secret", "token", "sanitize"], agents: ["sentinel", "prime"] },
  },
  {
    name: "intelligence/strategic-reasoning",
    version: "1.0.0",
    description: "First-principles strategic reasoning, trade-off evaluation, and second-order effect modeling.",
    domain: "intelligence",
    contextBudgetTokens: 1400,
    triggers: { keywords: ["strategy", "decision", "trade-off", "architecture"], agents: ["prime", "architect"] },
  },
  {
    name: "orchestration/multi-agent-coordination",
    version: "1.0.0",
    description: "Hierarchical swarm routing, task envelope dispatch, and Santa convergence loops.",
    domain: "orchestration",
    contextBudgetTokens: 1600,
    triggers: { keywords: ["swarm", "subagent", "dispatch", "consensus"], agents: ["orchestrator", "queen"] },
  },
  {
    name: "memory/vault-management",
    version: "1.0.0",
    description: "Multi-vault semantic recall, contradiction resolution, and temporal half-life indexing.",
    domain: "memory",
    contextBudgetTokens: 900,
    triggers: { keywords: ["vault", "recall", "memory", "dreaming"], agents: ["sage", "orchestrator"] },
  },
  {
    name: "code-intelligence/systematic-debugging",
    version: "1.0.0",
    description: "Deterministic 4-phase root cause isolation, regression proofing, and automated verification.",
    domain: "code-intelligence",
    contextBudgetTokens: 1200,
    triggers: { keywords: ["debug", "error", "traceback", "fix"], agents: ["architect", "sentinel"] },
  },
];

const SUPPORTED_HARNESSES: HarnessTarget[] = [
  "claude-code",
  "codex",
  "antigravity",
  "grok",
  "hermes",
  "gemini-cli",
  "cursor",
  "opencode",
  "kilo",
  "windsurf",
];

const SUPPORTED_MARKETPLACES: SyndicationTarget[] = [
  "starlight",
  "openclaw",
  "agentskills",
  "claude",
  "openai",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase();
  const domain = searchParams.get("domain")?.toLowerCase();

  let skills = SAMPLE_SKILLS;

  if (domain) {
    skills = skills.filter((s) => s.domain.toLowerCase() === domain);
  }

  if (query) {
    skills = skills.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.domain.toLowerCase().includes(query)
    );
  }

  return Response.json({
    ok: true,
    ecosystem: {
      registeredAgentsCount: 150,
      activeSkillRulesCount: 88,
      uniqueDomainsCount: 17,
      supportedHarnessesCount: SUPPORTED_HARNESSES.length,
      supportedMarketplacesCount: SUPPORTED_MARKETPLACES.length,
    },
    supportedHarnesses: SUPPORTED_HARNESSES,
    supportedMarketplaces: SUPPORTED_MARKETPLACES,
    skills,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action as string;

    switch (action) {
      case "value": {
        const skill = body.skill as {
          name: string;
          version?: string;
          description: string;
          domain: string;
          content?: string;
          weeklyHoursSaved?: number;
          complexityMultiplier?: number;
        };

        if (!skill || !skill.name || !skill.description) {
          return Response.json(
            { ok: false, error: "Missing required skill fields (name, description)." },
            { status: 400 }
          );
        }

        const report = auditSkillValuation({
          name: skill.name,
          version: skill.version || "1.0.0",
          description: skill.description,
          domain: skill.domain || "general",
          content: skill.content || skill.description,
        });

        // Allow client overrides if explicitly tuned
        if (skill.weeklyHoursSaved && Number.isFinite(skill.weeklyHoursSaved)) {
          report.metrics.estimatedWeeklyHoursSaved = skill.weeklyHoursSaved;
          report.metrics.annualLaborSavingsUSD = skill.weeklyHoursSaved * 50 * 125;
        }

        if (skill.complexityMultiplier && Number.isFinite(skill.complexityMultiplier)) {
          report.metrics.executionComplexityMultiplier = skill.complexityMultiplier;
        }

        return Response.json({
          ok: true,
          action: "value",
          report,
        });
      }

      case "harness": {
        const harness = body.harness as HarnessTarget;
        const skills = (body.skills as SkillDefinition[]) || SAMPLE_SKILLS;

        if (!SUPPORTED_HARNESSES.includes(harness)) {
          return Response.json(
            { ok: false, error: `Unsupported harness: ${harness}. Supported: ${SUPPORTED_HARNESSES.join(", ")}` },
            { status: 400 }
          );
        }

        const config = generateHarnessConfig(harness, skills, {
          projectName: body.projectName || "starlight-agent",
        });

        return Response.json({
          ok: true,
          action: "harness",
          config,
        });
      }

      case "syndicate": {
        const skill = body.skill as SkillDefinition;
        const targets = (body.targets as SyndicationTarget[]) || SUPPORTED_MARKETPLACES;

        if (!skill || !skill.name) {
          return Response.json(
            { ok: false, error: "Missing required skill payload for syndication." },
            { status: 400 }
          );
        }

        const result = syndicateSkill(skill, targets, {
          author: body.author || "Starlight Sovereign Builder",
        });

        return Response.json({
          ok: true,
          action: "syndicate",
          result,
        });
      }

      case "matrix": {
        const agents = (body.agents as string[]) || [
          "orchestrator",
          "prime",
          "architect",
          "sentinel",
          "weaver",
          "sage",
        ];
        const skills = (body.skills as SkillDefinition[]) || SAMPLE_SKILLS;

        const matrix = resolveSkillMatrix(agents, skills);

        return Response.json({
          ok: true,
          action: "matrix",
          matrix,
        });
      }

      default:
        return Response.json(
          { ok: false, error: `Unknown action: "${action}". Valid: value, harness, syndicate, matrix.` },
          { status: 400 }
        );
    }
  } catch (err) {
    return Response.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
