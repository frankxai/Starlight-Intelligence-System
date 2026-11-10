import { NextResponse } from "next/server";

export interface TeammateDto {
  id: string;
  name: string;
  role: string;
  domain: string;
  voice: string;
  status: "idle" | "running" | "waiting_approval";
  unreadCount: number;
  lastActive: string;
  defaultTier: "light" | "standard" | "frontier";
  activeModels: string[];
  connectedTools: string[];
  activeVaults: string[];
}

export const TEAMMATES: TeammateDto[] = [
  {
    id: "starlight-queen",
    name: "Starlight Queen",
    role: "Autonomous Ecosystem Operator & CIO",
    domain: "orchestration",
    voice: "queen",
    status: "waiting_approval",
    unreadCount: 1,
    lastActive: "Just now",
    defaultTier: "standard",
    activeModels: ["claude-sonnet-5-5", "claude-opus-5-5", "gemini-4-argon", "gpt-6-1-sol"],
    connectedTools: ["starlight-memory", "github", "vercel", "refero", "browseros-neo"],
    activeVaults: ["operational", "wisdom", "strategic", "technical"],
  },
  {
    id: "search-manager",
    name: "Search Manager",
    role: "Market & AI Lab Intelligence Analyst",
    domain: "intelligence",
    voice: "architect",
    status: "idle",
    unreadCount: 0,
    lastActive: "10m ago",
    defaultTier: "light",
    activeModels: ["gemini-4-argon", "gpt-6-1-sol", "glm-5-3"],
    connectedTools: ["perplexity-api", "browseros-neo", "starlight-memory"],
    activeVaults: ["strategic", "wisdom"],
  },
  {
    id: "github-officer",
    name: "GitHub Officer",
    role: "Code Quality, CI/CD & Sentinel Guardian",
    domain: "safety",
    voice: "sentinel",
    status: "running",
    unreadCount: 0,
    lastActive: "Active now",
    defaultTier: "standard",
    activeModels: ["claude-sonnet-5-5", "gpt-6-1-sol"],
    connectedTools: ["github", "starlight-memory", "sentinel-audit"],
    activeVaults: ["technical", "operational"],
  },
  {
    id: "community-lead",
    name: "Community Lead",
    role: "Member Engagement & Signal Synthesizer",
    domain: "relational",
    voice: "weaver",
    status: "idle",
    unreadCount: 0,
    lastActive: "1h ago",
    defaultTier: "light",
    activeModels: ["gemini-4-argon", "glm-5-3"],
    connectedTools: ["discord", "starlight-memory"],
    activeVaults: ["creative", "wisdom"],
  },
  {
    id: "teammate-builder",
    name: "Teammate Builder",
    role: "Swarm Node & Skill Compiler Studio",
    domain: "foundry",
    voice: "architect",
    status: "idle",
    unreadCount: 0,
    lastActive: "Yesterday",
    defaultTier: "frontier",
    activeModels: ["claude-opus-5-5", "gpt-6-astra", "claude-sonnet-5-5"],
    connectedTools: ["foundry-compiler", "starlight-memory"],
    activeVaults: ["technical", "wisdom"],
  },
];

export async function GET() {
  return NextResponse.json({
    teammates: TEAMMATES,
    count: TEAMMATES.length,
    substrate: "SIP v8.3",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teammateId, prompt, tier = "standard" } = body;

    const teammate = TEAMMATES.find((t) => t.id === teammateId) || TEAMMATES[0];

    // Resolve model based on tier
    const modelUsed =
      tier === "frontier"
        ? "Claude Opus 5.5"
        : tier === "light"
        ? "Gemini 4 Argon"
        : "Claude Sonnet 5.5";

    const isFinancial = /pay|invoice|spend|buy|purchase|credit/i.test(prompt);
    const isDeployOrMerge = /deploy|merge\s*to\s*main|release|publish/i.test(prompt);

    if (isFinancial) {
      return NextResponse.json({
        success: true,
        message: {
          id: `msg-${Date.now()}`,
          sender: "teammate",
          content: `Suspended execution per SIP Fail-Closed Invariant §5. Financial operation requires explicit human signature.`,
          timestamp: "Just now",
          executionTree: [
            {
              id: `step-${Date.now()}`,
              summary: "Financial operation detected — halted at governance gate",
              durationMs: 25,
              status: "pending",
              tool: "the-veil",
              output: "Halted before fund transfer. Approval card emitted to cockpit.",
            },
          ],
          approvalRequest: {
            id: `gate-${Date.now()}`,
            type: "FINANCIAL",
            title: "Authorize Budget Allocation / Payment",
            description: prompt,
            consequences: "Transfers funds from connected account. Non-reversible without manual refund.",
            status: "pending",
          },
        },
      });
    }

    if (isDeployOrMerge) {
      return NextResponse.json({
        success: true,
        message: {
          id: `msg-${Date.now()}`,
          sender: "teammate",
          content: `Staged changes verified via ${modelUsed}. Awaiting your confirmation to merge and deploy live.`,
          timestamp: "Just now",
          executionTree: [
            {
              id: `step-git-${Date.now()}`,
              summary: `Sentinel verified branch diff via ${modelUsed}`,
              durationMs: 310,
              status: "success",
              tool: "github",
              output: "0 vulnerabilities found. Ready for merge.",
            },
          ],
          approvalRequest: {
            id: `gate-${Date.now()}`,
            type: "GIT_MERGE",
            title: "Approve Live Production Release",
            description: prompt,
            consequences: "Merges pull request and updates production endpoint on Cloudflare/Vercel.",
            details: {
              Model: modelUsed,
              Target: "main",
              Gate: "Sentinel Security Pass",
            },
            status: "pending",
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: {
        id: `msg-${Date.now()}`,
        sender: "teammate",
        content: `Acknowledged: "${prompt}". Completed task cleanly with ${modelUsed} (${tier} tier). All 6 vaults updated with execution receipt.`,
        timestamp: "Just now",
        executionTree: [
          {
            id: `step-exec-${Date.now()}`,
            summary: `Executed autonomous action tree in microVM via ${modelUsed}`,
            durationMs: 410,
            status: "success",
            command: `si-dispatch --teammate=${teammate.id} --tier=${tier}`,
            tool: "sandbox-microvm",
            output: "0 errors. Memory consolidated into Operational Vault.",
          },
        ],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}
