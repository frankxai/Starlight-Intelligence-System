/**
 * Starlight Refero Design System Bridge
 *
 * Connects the Starlight Teammates swarm to the Refero UI design engine:
 *   - Semantic screen and flow exploration across premier production web/mobile apps
 *   - Real layout structure, color system, and interaction pattern extraction
 *   - Token recommendations (Tailwind CSS, Radix UI primitives, responsive grids)
 *   - Resilient multi-channel token resolution (process.env, ~/.gemini/antigravity/mcp_config.json, with offline fallback)
 *
 * Attestation: Built on SIP § 3 — Teammates Orchestration Tier
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

// ── Types & Interfaces ──────────────────────────────────────

export interface ReferoSite {
  id?: number;
  name: string;
  domain?: string;
  categories?: string[];
  refero_url?: string;
  description?: string;
  favicon_url?: string;
  background_url?: string;
  background_color?: string;
}

export interface ReferoScreenRecord {
  uuid: string;
  thumbnail_url?: string;
  hex_colors: string[];
  page_url?: string;
  refero_url: string;
  site: ReferoSite;
  ux_patterns: string[];
  ui_elements: string[];
  page_types: string[];
  platform: "web" | "ios";
  content?: {
    description?: string;
  };
  flows?: Array<{
    id: number;
    name: string;
    step: number;
    total_steps: number;
  }>;
}

export interface ReferoSearchResponse {
  pagination?: {
    count: number;
    page: number;
    next_page?: number;
    total_count: number;
    total_pages: number;
  };
  records: ReferoScreenRecord[];
}

export interface UiColorSystem {
  mode: "dark" | "light" | "adaptive";
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  rawHexColors: string[];
}

export interface UiLayoutStructure {
  type: "kanban" | "tree" | "chat" | "dashboard" | "split_view" | "feed" | "modal_form" | "table_grid" | "standard";
  sidebar: boolean;
  header: boolean;
  columns?: string;
  density: "compact" | "comfortable" | "spacious";
  responsiveBehavior: string;
  description: string;
}

export interface UiInteractionStates {
  loading: string;
  empty: string;
  hoverFocus: string;
  activeSelection: string;
  filteringSorting: string;
  modalDrawer: string;
}

export interface TokenRecommendations {
  colors: {
    bg: string;
    surface: string;
    card: string;
    primaryText: string;
    mutedText: string;
    accent: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    scale: string;
    hierarchy: string;
  };
  spacingAndRadius: {
    radius: string;
    gap: string;
    padding: string;
  };
  shadows: string;
  recommendedComponents: string[];
}

export interface UiPatternSpec {
  uuid: string;
  appName: string;
  domain?: string;
  pageType: string;
  referoUrl: string;
  pageUrl?: string;
  thumbnailUrl?: string;
  layout: UiLayoutStructure;
  colorSystem: UiColorSystem;
  interactionStates: UiInteractionStates;
  uxPatterns: string[];
  uiElements: string[];
  tokenRecommendations: TokenRecommendations;
  narrativeDescription: string;
}

export interface DesignInspirationResult {
  query: string;
  platform: "web" | "ios";
  source: "live_refero_api" | "offline_curated_registry";
  screens: ReferoScreenRecord[];
  patterns: UiPatternSpec[];
  topSpec: UiPatternSpec;
  tokenRecommendations: TokenRecommendations;
  summary: string;
}

// ── Token & Config Resolution ───────────────────────────────

let cachedBearerToken: string | null = null;

/**
 * Resolves the Refero Bearer token from environment variables or mcp_config.json.
 */
export function resolveReferoBearerToken(): string | null {
  if (cachedBearerToken) return cachedBearerToken;

  // 1. Check environment variables
  const envToken =
    process.env.REFERO_API_KEY ||
    process.env.REFERO_TOKEN ||
    process.env.REFERO_BEARER_TOKEN;
  if (envToken && envToken.trim().length > 0) {
    cachedBearerToken = envToken.replace(/^Bearer\s+/i, "").trim();
    return cachedBearerToken;
  }

  // 2. Check Antigravity and Gemini mcp_config.json paths
  const candidateConfigPaths = [
    join("C:", "Users", "frank", ".gemini", "antigravity", "mcp_config.json"),
    join(homedir(), ".gemini", "antigravity", "mcp_config.json"),
    join(homedir(), ".gemini", "antigravity-cli", "mcp_config.json"),
    join(homedir(), ".starlight", "mcp_config.json"),
  ];

  for (const configPath of candidateConfigPaths) {
    if (existsSync(configPath)) {
      try {
        const raw = readFileSync(configPath, "utf8");
        const config = JSON.parse(raw);
        const authHeader = config?.mcpServers?.refero?.headers?.Authorization;
        if (typeof authHeader === "string" && authHeader.trim().length > 0) {
          cachedBearerToken = authHeader.replace(/^Bearer\s+/i, "").trim();
          return cachedBearerToken;
        }
        const serverEnvKey = config?.mcpServers?.refero?.env?.REFERO_API_KEY;
        if (typeof serverEnvKey === "string" && serverEnvKey.trim().length > 0) {
          cachedBearerToken = serverEnvKey.replace(/^Bearer\s+/i, "").trim();
          return cachedBearerToken;
        }
      } catch {
        // continue to next candidate
      }
    }
  }

  return null;
}

// ── Color & Pattern Extraction Helpers ──────────────────────

/**
 * Normalizes hex colors from Refero (e.g. "0x252323", "252323", "#252323") to standard #RRGGBB.
 */
export function normalizeHexColor(raw: string): string {
  if (!raw) return "#000000";
  const cleaned = raw.replace(/^0x/i, "").replace(/^#/, "").trim();
  if (cleaned.length === 6) return `#${cleaned.toUpperCase()}`;
  if (cleaned.length === 8) return `#${cleaned.slice(2).toUpperCase()}`;
  if (cleaned.length === 3) {
    return `#${cleaned[0]}${cleaned[0]}${cleaned[1]}${cleaned[1]}${cleaned[2]}${cleaned[2]}`.toUpperCase();
  }
  return `#${cleaned.padEnd(6, "0").slice(0, 6).toUpperCase()}`;
}

/**
 * Calculates perceived relative luminance of a hex color (0 = black, 1 = white).
 */
export function calculateLuminance(hex: string): number {
  const norm = normalizeHexColor(hex);
  const r = parseInt(norm.slice(1, 3), 16) || 0;
  const g = parseInt(norm.slice(3, 5), 16) || 0;
  const b = parseInt(norm.slice(5, 7), 16) || 0;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * Calculates color saturation/chroma to identify vibrance for accent selection.
 */
function calculateChroma(hex: string): number {
  const norm = normalizeHexColor(hex);
  const r = parseInt(norm.slice(1, 3), 16) || 0;
  const g = parseInt(norm.slice(3, 5), 16) || 0;
  const b = parseInt(norm.slice(5, 7), 16) || 0;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return (max - min) / 255;
}

// ── Core Extract UI Pattern Function ────────────────────────

/**
 * Analyzes raw Refero screen data and extracts layout structures,
 * color systems, UI interaction states, and token recommendations.
 */
export function extractUiPattern(screenData: ReferoScreenRecord): UiPatternSpec {
  const normColors = (screenData.hex_colors || []).map(normalizeHexColor);
  const description = screenData.content?.description || "";
  const uxPatterns = screenData.ux_patterns || [];
  const uiElements = screenData.ui_elements || [];
  const pageTypes = screenData.page_types || [];
  const combinedContext = `${uxPatterns.join(" ")} ${uiElements.join(" ")} ${pageTypes.join(" ")} ${description}`.toLowerCase();

  // 1. Color System Analysis
  const luminances = normColors.map(calculateLuminance);
  const hasDarkColors = luminances.some((l) => l < 0.25);
  const hasLightColors = luminances.some((l) => l > 0.75);
  const explicitDarkMode =
    uxPatterns.some((p) => p.toLowerCase().includes("dark mode")) ||
    combinedContext.includes("dark mode") ||
    combinedContext.includes("dark gray") ||
    combinedContext.includes("black background");

  let mode: "dark" | "light" | "adaptive" = "dark";
  if (explicitDarkMode) {
    mode = "dark";
  } else if (hasDarkColors && hasLightColors) {
    mode = luminances[0] < 0.4 ? "dark" : "light";
  } else if (hasLightColors) {
    mode = "light";
  }

  // Find accent: pick color with highest chroma
  let accent = mode === "dark" ? "#6366F1" : "#4F46E5";
  let maxChroma = 0.15;
  for (const c of normColors) {
    const chroma = calculateChroma(c);
    const lum = calculateLuminance(c);
    // Ignore near-black or near-white when choosing accent
    if (lum > 0.15 && lum < 0.9 && chroma > maxChroma) {
      maxChroma = chroma;
      accent = c;
    }
  }

  // Pick backgrounds and surfaces
  let background = mode === "dark" ? "#0D1117" : "#FFFFFF";
  let surface = mode === "dark" ? "#161B22" : "#F6F8FA";
  let primaryText = mode === "dark" ? "#F0F6FC" : "#111827";
  let secondaryText = mode === "dark" ? "#8B949E" : "#6B7280";
  let border = mode === "dark" ? "#30363D" : "#E5E7EB";

  const darkCandidates = normColors.filter((_, i) => luminances[i] < 0.3);
  const lightCandidates = normColors.filter((_, i) => luminances[i] > 0.7);

  if (mode === "dark") {
    if (darkCandidates.length > 0) background = darkCandidates[0];
    if (darkCandidates.length > 1) surface = darkCandidates[1];
    else surface = "#161B22";
    if (lightCandidates.length > 0) primaryText = lightCandidates[0];
  } else {
    if (lightCandidates.length > 0) background = lightCandidates[0];
    if (lightCandidates.length > 1) surface = lightCandidates[1];
    else surface = "#F3F4F6";
    if (darkCandidates.length > 0) primaryText = darkCandidates[0];
  }

  const colorSystem: UiColorSystem = {
    mode,
    background,
    surface,
    primary: primaryText,
    secondary: secondaryText,
    accent,
    border,
    rawHexColors: normColors,
  };

  // 2. Layout Structure Analysis
  let layoutType: UiLayoutStructure["type"] = "standard";
  let columns = "Split container (sidebar + primary content body)";
  let density: UiLayoutStructure["density"] = "comfortable";
  let responsiveBehavior = "Stacked vertical flow on mobile, split columns on desktop (>=1024px)";
  let layoutDesc = "Clean modular layout with defined navigation and content zones.";

  const hasSidebar =
    uiElements.some((e) => /sidebar|drawer|navigation bar/i.test(e)) ||
    combinedContext.includes("sidebar") ||
    combinedContext.includes("left navigation");

  const isKanban =
    uxPatterns.some((p) => /kanban/i.test(p)) ||
    combinedContext.includes("kanban") ||
    combinedContext.includes("task status") ||
    combinedContext.includes("todo") && combinedContext.includes("in progress");

  const isTree =
    combinedContext.includes("tree") ||
    combinedContext.includes("dag") ||
    combinedContext.includes("execution tree") ||
    combinedContext.includes("nodes") ||
    combinedContext.includes("workflow");

  const isChat =
    combinedContext.includes("chat") ||
    combinedContext.includes("conversation") ||
    combinedContext.includes("message feed") ||
    combinedContext.includes("ai prompt");

  const isDashboard =
    uxPatterns.some((p) => /stats|analytics/i.test(p)) ||
    pageTypes.some((pt) => /dashboard/i.test(pt)) ||
    combinedContext.includes("dashboard") ||
    combinedContext.includes("stats") ||
    combinedContext.includes("metrics");

  const isTableGrid =
    uxPatterns.some((p) => /filter & sorting/i.test(p)) &&
    uiElements.some((e) => /list|accordion/i.test(e)) &&
    !isKanban;

  if (isKanban) {
    layoutType = "kanban";
    columns = "3 to 5 status columns (Backlog, Todo, In Progress, Review, Done)";
    density = "compact";
    responsiveBehavior = "Horizontal touch scroll snap on tablet; accordion or tabbed column selector on mobile (<768px)";
    layoutDesc = "High-velocity Kanban board featuring draggable cards, column header aggregates, and quick issue injectors.";
  } else if (isTree) {
    layoutType = "tree";
    columns = "Hierarchical DAG node tree with SVG spine connectors and branch folding";
    density = "compact";
    responsiveBehavior = "Pan-and-zoom infinite canvas with minimap and auto-fit on viewport resize";
    layoutDesc = "Factory execution tree displaying interdependent step traces, worker node statuses, and governance gates.";
  } else if (isChat) {
    layoutType = "chat";
    columns = "2-column layout: 260px collapsible thread rail + centered max-w-3xl conversational stream";
    density = "comfortable";
    responsiveBehavior = "Thread rail shifts to slide-over sheet on mobile (<768px); composer docks sticky to bottom";
    layoutDesc = "Calm AI conversational canvas with distraction-free typography, floating input capsule, and inline code cards.";
  } else if (isDashboard) {
    layoutType = "dashboard";
    columns = "12-column responsive bento grid with KPI metric cards and charts";
    density = "comfortable";
    responsiveBehavior = "Bento tiles collapse into 1-column cards on mobile (<640px), 2-col on tablet";
    layoutDesc = "Telemetry command dashboard with real-time health indicators, agent activity streams, and vault metrics.";
  } else if (isTableGrid) {
    layoutType = "table_grid";
    columns = "Virtualized multi-column data table with sticky frozen headers";
    density = "compact";
    responsiveBehavior = "Horizontal table scroll with sticky key column, converting to summary cards on mobile";
    layoutDesc = "Data grid with inline filters, multi-column sorting, and bulk action drawers.";
  }

  const layout: UiLayoutStructure = {
    type: layoutType,
    sidebar: hasSidebar,
    header: true,
    columns,
    density,
    responsiveBehavior,
    description: layoutDesc,
  };

  // 3. UI Interaction States
  let loadingState = "Skeleton placeholder shimmer matching card and column dimensions (animate-pulse).";
  let emptyState = "Zero-state illustrated container with clear contextual action ('Create first item' or 'No active tasks').";
  let hoverFocusState = "Subtle elevation card lift (-1px translateY), border contrast shift, and ring-2 ring-primary/40 focus.";
  let activeSelectionState = "High-contrast border-l-2 accent line with subtle surface highlight and checkmark chip.";
  let filteringSortingState = "Sticky pill filter bar with instantaneous debounced search, count tags, and keyboard accelerators.";
  let modalDrawerState = "Centered blur-backdrop modal for atomic inputs; right-docked slide sheet (drawer) for deep detail inspection.";

  if (layoutType === "kanban") {
    loadingState = "Skeleton column headers with ghost card shimmers matching task card aspect ratio.";
    emptyState = "Dashed border dropzone indicating 'Drop tasks here or press C to create'.";
    hoverFocusState = "Card hover elevates shadow-md, reveals quick-actions (assignee, priority pill), and shows cursor-grab.";
    activeSelectionState = "Active drag ghost with 5deg tilt, opacity-80, and blue drop indicator line between cards.";
    filteringSortingState = "Filter pills for Status, Assignee, Priority, and Label with instant search input.";
    modalDrawerState = "Card click opens full-bleed right drawer with markdown editor, activity timeline, and subtasks.";
  } else if (layoutType === "tree") {
    loadingState = "Pulsing outline nodes with glowing connecting SVG branch paths.";
    emptyState = "Root node initiation prompt ('No execution nodes started. Trigger autonomic cycle to begin').";
    hoverFocusState = "Node hover highlights incoming and outgoing dependency edges with accent glow.";
    activeSelectionState = "Selected node expands detail ring-2 ring-accent with live telemetry drawer.";
    filteringSortingState = "Status filter toggles: Running, Completed, Gated, Failed.";
    modalDrawerState = "Governance approval dialog pops as modal card with consequence statement and signature button.";
  } else if (layoutType === "chat") {
    loadingState = "Streaming typing indicator with pulsating model badge ('Claude Sonnet thinking...').";
    emptyState = "Hero greeting with 3 starter prompt cards and recent vault context badges.";
    hoverFocusState = "Message hover displays action bar: Copy, Remix, Fork Thread, Export to Vault.";
    activeSelectionState = "Selected prompt pin highlighted with subtle accent border.";
    filteringSortingState = "Command bar (Cmd+K) search across all historical conversation turns.";
    modalDrawerState = "Settings and model parameters open in clean slide-over drawer.";
  }

  const interactionStates: UiInteractionStates = {
    loading: loadingState,
    empty: emptyState,
    hoverFocus: hoverFocusState,
    activeSelection: activeSelectionState,
    filteringSorting: filteringSortingState,
    modalDrawer: modalDrawerState,
  };

  // 4. Token Recommendations
  const recommendedComponents: string[] = [
    "Button",
    "Badge",
    "Dialog",
    "DropdownMenu",
    "ScrollArea",
  ];

  if (hasSidebar) recommendedComponents.push("Sidebar", "Drawer");
  if (isKanban) recommendedComponents.push("KanbanColumn", "KanbanCard", "AvatarGroup", "CommandMenu");
  if (isTree) recommendedComponents.push("TreeNode", "ConnectorSpine", "Minimap", "ApprovalGateCard");
  if (isChat) recommendedComponents.push("MessageBubble", "PromptInput", "ModelSelector", "CodeBlock");
  if (isDashboard) recommendedComponents.push("BentoCard", "MetricBadge", "Sparkline", "DataTable");

  const tokenRecommendations: TokenRecommendations = {
    colors: {
      bg: background,
      surface,
      card: surface,
      primaryText,
      mutedText: secondaryText,
      accent,
      border,
    },
    typography: {
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      scale: "xs: 11px/1.2, sm: 13px/1.4, base: 14px/1.5, lg: 16px/1.4, xl: 20px/1.3",
      hierarchy: "Mono font (JetBrains Mono) for IDs/code; Sans-serif for navigation and descriptions",
    },
    spacingAndRadius: {
      radius: density === "compact" ? "rounded-lg (8px) for cards, rounded-md (6px) for badges" : "rounded-xl (12px) for cards",
      gap: density === "compact" ? "gap-2.5 (10px)" : "gap-4 (16px)",
      padding: density === "compact" ? "p-3 (12px)" : "p-5 (20px)",
    },
    shadows: mode === "dark" ? "shadow-sm shadow-black/40, border border-border/60" : "shadow-xs border border-border/80",
    recommendedComponents,
  };

  const appName = screenData.site?.name || "Production App";

  return {
    uuid: screenData.uuid,
    appName,
    domain: screenData.site?.domain,
    pageType: pageTypes[0] || "Application Screen",
    referoUrl: screenData.refero_url,
    pageUrl: screenData.page_url,
    thumbnailUrl: screenData.thumbnail_url,
    layout,
    colorSystem,
    interactionStates,
    uxPatterns,
    uiElements,
    tokenRecommendations,
    narrativeDescription: description || `Production interface from ${appName} featuring ${layout.type} architecture.`,
  };
}

// ── Curated Sovereign Offline Fallback Registry ──────────────

const CURATED_OFFLINE_SCREENS: ReferoScreenRecord[] = [
  {
    uuid: "linear-kanban-primary",
    thumbnail_url: "https://images.refero.design/screenshots/linear.app/desktop/540f4049-66b3-4f6d-999c-078cf98a529f_thumb.jpg",
    hex_colors: ["0x0D1117", "0x161B22", "0xF0F6FC", "0x8B949E", "0x5E6AD2", "0xE0B036"],
    page_url: "https://linear.app/team/all",
    refero_url: "https://refero.design/pages/linear-kanban-view",
    site: {
      id: 26,
      name: "Linear",
      domain: "linear.app",
      categories: ["Collaboration Tools", "Project Management", "Productivity"],
      refero_url: "https://refero.design/websites/26",
      description: "The issue tracking tool you'll actually enjoy using. Built for high-performance product teams.",
    },
    ux_patterns: ["Kanban Board", "Filter & Sorting", "Dark Mode", "Stats", "Checklist & To Do"],
    ui_elements: ["Sidebar & Drawer", "Button", "Tags & Chips", "Badge", "Avatar", "Dropdown", "Progress Bar"],
    page_types: ["Task Management"],
    platform: "web",
    content: {
      description: "Linear dark mode Kanban interface divided into columns (Backlog, Todo, In Progress, Done). Each task card contains reference ID (REF-12), priority icon, title, tags, and assignee avatar.",
    },
  },
  {
    uuid: "factory-execution-tree-primary",
    thumbnail_url: "https://images.refero.design/screenshots/temporal.io/desktop/execution_tree_thumb.jpg",
    hex_colors: ["0x090D16", "0x131B2E", "0xF8FAFC", "0x94A3B8", "0x38BDF8", "0x22C55E"],
    page_url: "https://cloud.temporal.io/workflows",
    refero_url: "https://refero.design/pages/temporal-workflow-dag",
    site: {
      id: 89,
      name: "Temporal",
      domain: "temporal.io",
      categories: ["Developer Tools", "Orchestration", "Cloud Infrastructure"],
      refero_url: "https://refero.design/websites/temporal",
      description: "Durable execution platform for mission-critical applications and autonomous agent pipelines.",
    },
    ux_patterns: ["Timeline & History", "Stats", "Dark Mode", "Add & Create"],
    ui_elements: ["Accordion & Collapse", "Badge", "Button", "Toolbar", "Sidebar & Drawer", "Icon"],
    page_types: ["Workflow Execution"],
    platform: "web",
    content: {
      description: "Execution tree view of autonomic agent workflows showing dependency DAG nodes, step runtimes, retry counters, and fail-closed human approval gates.",
    },
  },
  {
    uuid: "calm-ai-chat-primary",
    thumbnail_url: "https://images.refero.design/screenshots/claude.ai/desktop/calm_chat_thumb.jpg",
    hex_colors: ["0x18181B", "0x27272A", "0xFAFAFA", "0xA1A1AA", "0xD97706", "0x3B82F6"],
    page_url: "https://claude.ai",
    refero_url: "https://refero.design/pages/claude-ai-canvas",
    site: {
      id: 104,
      name: "Anthropic Claude",
      domain: "claude.ai",
      categories: ["AI Assistant", "Productivity"],
      refero_url: "https://refero.design/websites/claude",
      description: "Next-generation AI assistant built with constitutional principles and deep technical focus.",
    },
    ux_patterns: ["Dark Mode", "Chat & Conversation", "Search"],
    ui_elements: ["Button", "Text Area", "Sidebar & Drawer", "Tags & Chips", "Icon"],
    page_types: ["AI Interface"],
    platform: "web",
    content: {
      description: "Calm AI conversational canvas featuring a collapsible history rail, distraction-free message cards, floating prompt capsule, and syntax-highlighted code artifacts.",
    },
  },
  {
    uuid: "executive-telemetry-dashboard-primary",
    thumbnail_url: "https://images.refero.design/screenshots/vercel.com/desktop/dashboard_thumb.jpg",
    hex_colors: ["0x000000", "0x111111", "0xFFFFFF", "0x888888", "0x0070F3", "0x50E3C2"],
    page_url: "https://vercel.com/dashboard",
    refero_url: "https://refero.design/pages/vercel-telemetry",
    site: {
      id: 42,
      name: "Vercel",
      domain: "vercel.com",
      categories: ["Cloud Infrastructure", "Developer Tools", "Hosting"],
      refero_url: "https://refero.design/websites/42",
      description: "The platform for frontend developers, providing the speed and reliability needed for high-scale applications.",
    },
    ux_patterns: ["Dark Mode", "Stats", "Filter & Sorting", "Timeline & History"],
    ui_elements: ["Tabs", "Badge", "Button", "Progress Bar", "Avatar", "Dropdown"],
    page_types: ["Analytics Dashboard"],
    platform: "web",
    content: {
      description: "High-density telemetry dashboard with deploy cards, build trace times, serverless function health, and instant project switching.",
    },
  },
];

// ── Search & Retrieval Implementation ───────────────────────

/**
 * Executes a semantic design inspiration search against Refero Design MCP or HTTP API
 * with automatic offline fallback to curated sovereign patterns.
 *
 * @param query Search query (e.g. 'linear kanban', 'factory execution tree', 'calm ai chat')
 * @param platform Target platform filter ('web' or 'ios', default 'web')
 */
export async function searchDesignInspiration(
  query: string,
  platform: "web" | "ios" = "web"
): Promise<DesignInspirationResult> {
  const token = resolveReferoBearerToken();
  let screens: ReferoScreenRecord[] = [];
  let source: DesignInspirationResult["source"] = "offline_curated_registry";

  if (token) {
    try {
      // Direct call to Refero MCP JSON-RPC endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const response = await fetch("https://api.refero.design/mcp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "tools/call",
          params: {
            name: "refero_search_screens",
            arguments: {
              query,
              platform,
              response_format: "json",
            },
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const payload = (await response.json()) as any;
        const textContent = payload?.result?.content?.[0]?.text;
        if (textContent) {
          const parsed = JSON.parse(textContent) as ReferoSearchResponse;
          if (Array.isArray(parsed.records) && parsed.records.length > 0) {
            screens = parsed.records;
            source = "live_refero_api";
          }
        }
      }
    } catch {
      // Graceful offline fallback on timeout or network rejection
    }
  }

  // If live query did not return screens, resolve from curated offline registry
  if (screens.length === 0) {
    source = "offline_curated_registry";
    const q = query.toLowerCase();

    if (q.includes("kanban") || q.includes("board") || q.includes("linear") || q.includes("task")) {
      screens = [CURATED_OFFLINE_SCREENS[0]];
    } else if (q.includes("tree") || q.includes("factory") || q.includes("dag") || q.includes("execution") || q.includes("workflow")) {
      screens = [CURATED_OFFLINE_SCREENS[1]];
    } else if (q.includes("chat") || q.includes("calm") || q.includes("message") || q.includes("conversation") || q.includes("ai")) {
      screens = [CURATED_OFFLINE_SCREENS[2]];
    } else if (q.includes("dashboard") || q.includes("telemetry") || q.includes("stat") || q.includes("metric")) {
      screens = [CURATED_OFFLINE_SCREENS[3]];
    } else {
      screens = [...CURATED_OFFLINE_SCREENS];
    }
  }

  // Extract UI patterns for all retrieved screens
  const patterns = screens.map(extractUiPattern);
  const topSpec = patterns[0];
  const tokenRecommendations = topSpec.tokenRecommendations;

  const summary =
    source === "live_refero_api"
      ? `Retrieved ${screens.length} live production reference screens from Refero Design for "${query}". Top pattern: ${topSpec.appName} (${topSpec.layout.type} architecture).`
      : `Resolved curated sovereign design pattern for "${query}" via offline registry (${screens.length} reference specs). Top pattern: ${topSpec.appName} (${topSpec.layout.type} architecture).`;

  return {
    query,
    platform,
    source,
    screens,
    patterns,
    topSpec,
    tokenRecommendations,
    summary,
  };
}

/**
 * Searches user flows in Refero to examine multi-step journeys.
 */
export async function searchFlowInspiration(
  query: string,
  platform: "web" | "ios" = "web"
): Promise<{ query: string; source: string; flows: any[] }> {
  const token = resolveReferoBearerToken();
  if (token) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const response = await fetch("https://api.refero.design/mcp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "tools/call",
          params: {
            name: "refero_search_flows",
            arguments: {
              query,
              platform,
              response_format: "json",
            },
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const payload = (await response.json()) as any;
        const textContent = payload?.result?.content?.[0]?.text;
        if (textContent) {
          const parsed = JSON.parse(textContent);
          return { query, source: "live_refero_api", flows: parsed.records || [] };
        }
      }
    } catch {
      // fallback
    }
  }

  return {
    query,
    source: "offline_curated_registry",
    flows: [
      {
        id: 1,
        name: `Standard ${query} Journey`,
        steps: ["Intake and discovery", "Interactive Configuration", "Validation & Approval", "Execution Settlement"],
      },
    ],
  };
}
