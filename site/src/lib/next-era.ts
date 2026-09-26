export const SOURCE_COMMIT = "a54cc7090f53ebe4f79765ba01e6a459d835b2dd";
export const SOURCE_ROOT = `https://github.com/frankxai/Starlight-Intelligence-System/blob/${SOURCE_COMMIT}`;

export type ClaimStatus = "Live locally" | "Staged" | "Research" | "Horizon";

export type EvidenceItem = {
  name: string;
  status: ClaimStatus;
  finding: string;
  boundary: string;
  source: string;
  test?: string;
};

export const evidenceItems: EvidenceItem[] = [
  {
    name: "Memory",
    status: "Live locally",
    finding: "JSONL event memory, vault search, and a local gateway have executable code and privacy tests.",
    boundary: "Cross-venture recall advantage is not measured.",
    source: "src/memory.ts",
    test: "test/v90-gateway-privacy.test.ts",
  },
  {
    name: "Capabilities",
    status: "Staged",
    finding: "Foundry graph, skill-package compilation, and local proof paths pass.",
    boundary: "OpenAI plugin projection fails audited-main preflight on a stale toolchain digest; cross-venture outcome improvement is unmeasured.",
    source: "tools/foundry/lib/prove.mjs",
    test: "test/v92-foundry.test.ts",
  },
  {
    name: "Evidence",
    status: "Live locally",
    finding: "SIP reference tools validate profiles and sign and verify receipts.",
    boundary: "An attribution footer alone is not a signed receipt.",
    source: "protocol/verify.mjs",
    test: "protocol/test/sign.test.mjs",
  },
  {
    name: "Command",
    status: "Staged",
    finding: "Authenticated portfolio tools and a workspace UI exist in the plugin source.",
    boundary: "Deployment and live workspace outcomes are not verified from main.",
    source: "plugins/starlight-intelligence/server/src/mcp.ts",
    test: "plugins/starlight-intelligence/server/src/store.test.ts",
  },
  {
    name: "Teams and operations",
    status: "Staged",
    finding: "Routing, bounded work, and loop contracts are implemented.",
    boundary: "Default execution and autonomous venture operation are not end-to-end proven.",
    source: "src/orchestrator.ts",
    test: "test/queen-session.test.ts",
  },
  {
    name: "Transfer",
    status: "Staged",
    finding: "Registered local project context can be imported into SIS memory.",
    boundary: "No verified venture-to-venture capability outcome is recorded.",
    source: "src/multi-sync.ts",
  },
  {
    name: "Starlight Notes",
    status: "Staged",
    finding: "A public JSON-readable vault and manual notes convention exist.",
    boundary: "Versioned Notes records and export need a dedicated public contract.",
    source: "notes/NOTES_SYSTEM.md",
  },
  {
    name: "Starlight Network",
    status: "Research",
    finding: "SIP graph v0.1 is a proposed extension with a local reference profile.",
    boundary: "Federation and external interoperability are unproven.",
    source: "protocol/README.md",
  },
  {
    name: "Autonomous venture operation",
    status: "Horizon",
    finding: "An intended direction, not a present end-to-end capability.",
    boundary: "Requires governed operation and real venture outcome receipts.",
    source: "MASSIVE_ACTION_PLAN.md",
  },
];

export const workingNow = evidenceItems.filter((item) => item.status === "Live locally");

export const mechanism = [
  { name: "Create", detail: "Build a real product or operating pattern in a venture." },
  { name: "Capture", detail: "Keep the decision, context, and source in durable memory." },
  { name: "Verify", detail: "Test the capability and retain a checkable receipt." },
  { name: "Transfer", detail: "Adapt a proven capability with permission and provenance." },
  { name: "Operate", detail: "Use it in another independent venture." },
  { name: "Learn", detail: "Compare the outcome with its baseline and update the pattern." },
] as const;

export function sourceUrl(path: string) {
  return `${SOURCE_ROOT}/${path}`;
}
