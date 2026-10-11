import { NextResponse } from "next/server";

export interface ApiMarketplaceItem {
  id: string;
  name: string;
  version: string;
  kind: string;
  category: string;
  author: string;
  description: string;
  pricing: string;
  featured?: boolean;
  installCommand: string;
  tags: string[];
  capabilities: string[];
  permissions: string[];
  verifiedAttestation: boolean;
}

const CATALOG_ITEMS: ApiMarketplaceItem[] = [
  {
    id: "starlight-mcp",
    name: "Starlight Sovereign Memory MCP",
    version: "8.3.0",
    kind: "mcp_server",
    category: "Agent memory",
    author: "Starlight Foundation",
    description: "Exposes 6 semantic vaults, hybrid SQLite FTS5 search, epistemic knowledge tree, and Santa convergence loop directly to AI harnesses.",
    pricing: "Free",
    featured: true,
    installCommand: "starlight-mcp --vault-dir ~/.starlight/vaults",
    tags: ["memory-vaults", "sqlite", "fts5", "knowledge-tree"],
    capabilities: ["vault:read", "vault:write", "dreaming:promote", "fts5:query"],
    permissions: ["fs:read:vaults", "fs:write:vaults"],
    verifiedAttestation: true,
  },
  {
    id: "starlight-agent-canvas",
    name: "Infinite Visual Spatial DAG MCP",
    version: "0.1.0",
    kind: "mcp_server",
    category: "Spatial reasoning",
    author: "Starlight Media Lab",
    description: "2D infinite canvas MCP server for multimodal asset lineage. Ingests URLs, YouTube videos, and images into a visual node graph.",
    pricing: "Free",
    featured: true,
    installCommand: "npx @starlight-intelligence/agent-canvas-mcp",
    tags: ["canvas", "dag", "visual-memory", "spatial-reasoning"],
    capabilities: ["canvas:create_node", "canvas:connect_edges", "canvas:render_dag"],
    permissions: ["network:fetch", "fs:write:canvas-cache"],
    verifiedAttestation: true,
  },
  {
    id: "starlight-foundry",
    name: "Starlight Foundry & Compiler",
    version: "1.0.0",
    kind: "skill_pack",
    category: "Capability compilation",
    author: "Starlight Engineering",
    description: "Compiles high-level agent missions into target-specific skill packages, evaluates taste gates, and produces cryptographic evidence receipts.",
    pricing: "Free",
    featured: true,
    installCommand: "starlight pack install starlight-foundry",
    tags: ["foundry", "compiler", "codex", "claude-code"],
    capabilities: ["foundry:compile", "foundry:audit", "foundry:receipt"],
    permissions: ["fs:read:repo", "fs:write:repo"],
    verifiedAttestation: true,
  },
  {
    id: "dashboard-cockpit-pack",
    name: "Zellij & Web Cockpit Console",
    version: "0.1.0",
    kind: "skill_pack",
    category: "Developer experience",
    author: "Starlight Foundation",
    description: "Real-time multi-pane terminal cockpit (Zellij) and local web interface for tracking agent fleets, token velocity, and memory vault health.",
    pricing: "Free",
    featured: true,
    installCommand: "starlight pack install dashboard-cockpit-pack",
    tags: ["cockpit", "zellij", "telemetry", "monitoring"],
    capabilities: ["cockpit:stream_metrics", "cockpit:inspect_vaults"],
    permissions: ["fs:read:vaults", "network:local_bind"],
    verifiedAttestation: true,
  },
  {
    id: "anime-legends-mascots",
    name: "AnimeLegends Mascot Trinity & Legal Firewall",
    version: "0.1.0",
    kind: "skill_pack",
    category: "Creative & cinema",
    author: "AnimeLegends Studio",
    description: "Maintains strict character sheet consistency for Akashi, Kage, and Mira while filtering prompt leaks against trademarked anime styles.",
    pricing: "Freemium",
    featured: true,
    installCommand: "npx @anime-legends/cli character akashi",
    tags: ["anime", "mascot", "cinema", "storyboard", "firewall"],
    capabilities: ["mascot:render_spec", "firewall:audit_prompt"],
    permissions: ["network:fetch:fal", "fs:write:assets"],
    verifiedAttestation: true,
  },
  {
    id: "agentic-income-router",
    name: "Agentic Income Catalog & Edge 302",
    version: "0.1.0",
    kind: "skill_pack",
    category: "Revenue & monetization",
    author: "Agentic Income Network",
    description: "30+ editorially vetted AI software tools, dynamic alternatives router, and sub-5ms edge 302 redirect engine with FTC disclosure checks.",
    pricing: "Freemium",
    installCommand: "npx @agentic-income/cli list",
    tags: ["monetization", "affiliate", "cloudflare-edge", "ftc-compliance"],
    capabilities: ["income:resolve_tool", "income:edge_redirect"],
    permissions: ["network:fetch:catalog"],
    verifiedAttestation: true,
  },
  {
    id: "harness-claude-code",
    name: "Claude Code Symphony Profile",
    version: "2.1.0",
    kind: "harness_profile",
    category: "Harness presets",
    author: "Starlight Foundation",
    description: "Optimized CLAUDE.md guidelines, slash command bindings, and background task supervisor config for Anthropic Claude Code.",
    pricing: "Free",
    featured: true,
    installCommand: "starlight guidance --project default --target claude-code",
    tags: ["claude-code", "anthropic", "prompt-caching", "subagents"],
    capabilities: ["harness:guidance", "harness:rules_sync"],
    permissions: ["fs:write:workspace"],
    verifiedAttestation: true,
  },
  {
    id: "postgres-vector-mcp",
    name: "PostgreSQL pgvector Enterprise Connector",
    version: "1.0.0",
    kind: "mcp_server",
    category: "Enterprise storage",
    author: "Starlight Enterprise",
    description: "High-concurrency PostgreSQL pgvector adapter for multi-agent teams requiring ACID compliance, tenant isolation, and connection pooling.",
    pricing: "Pro",
    installCommand: "npx @starlight-intelligence/mcp-pgvector --dsn $DATABASE_URL",
    tags: ["postgres", "pgvector", "enterprise", "acid"],
    capabilities: ["storage:pgvector_query", "storage:connection_pool"],
    permissions: ["network:egress:postgres"],
    verifiedAttestation: true,
  },
  {
    id: "cloudflare-d1-mcp",
    name: "Cloudflare D1 & Vectorize Edge MCP",
    version: "0.9.0",
    kind: "mcp_server",
    category: "Edge storage",
    author: "Starlight Edge Team",
    description: "Global sub-10ms distributed SQLite shadow index and vector search connector operating on Cloudflare Workers edge network.",
    pricing: "Free",
    installCommand: "npx @starlight-intelligence/mcp-d1 --account $CF_ACCOUNT_ID",
    tags: ["cloudflare", "d1", "vectorize", "edge-sqlite"],
    capabilities: ["storage:edge_sync", "storage:vectorize_query"],
    permissions: ["network:egress:cloudflare"],
    verifiedAttestation: true,
  },
  {
    id: "starlight-managed-router",
    name: "Unified Frontier LLM API Router",
    version: "2.0.0",
    kind: "cloud_service",
    category: "Managed cloud",
    author: "Starlight Cloud",
    description: "Pooled credits and ultra-low latency model routing across Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro, and Grok via Vercel AI SDK.",
    pricing: "Pro",
    featured: true,
    installCommand: "starlight cloud route --enable-ai-sdk",
    tags: ["vercel-ai-sdk", "model-routing", "unified-billing", "frontier-llms"],
    capabilities: ["route:frontier", "billing:pool_credits"],
    permissions: ["network:egress:starlight-cloud"],
    verifiedAttestation: true,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");
  const category = searchParams.get("category");
  const pricing = searchParams.get("pricing");
  const query = searchParams.get("q")?.toLowerCase();

  let results = CATALOG_ITEMS;

  if (kind) {
    results = results.filter((item) => item.kind.toLowerCase() === kind.toLowerCase());
  }

  if (category) {
    results = results.filter((item) => item.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (pricing) {
    results = results.filter((item) => item.pricing.toLowerCase() === pricing.toLowerCase());
  }

  if (query) {
    results = results.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.tags.some((t) => t.toLowerCase().includes(query)) ||
        item.capabilities.some((c) => c.toLowerCase().includes(query))
    );
  }

  const categories = Array.from(new Set(CATALOG_ITEMS.map((i) => i.category))).sort();

  return NextResponse.json({
    ok: true,
    count: results.length,
    totalCatalogSize: CATALOG_ITEMS.length,
    categories,
    items: results,
  });
}
