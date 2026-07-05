"use client";

// ─────────────────────────────────────────────────────────────────────────────
// KnowledgeGraph — Interactive constellation explorer for the Knowledge Tree.
//
// This is a pure Client Component. It is never imported by a Server Component
// directly — always through GraphWrapper.tsx which does next/dynamic ssr:false.
//
// Renderer: react-force-graph-2d (canvas, performant, touch-friendly).
//
// Stage roadmap:
//   Stage 1 (current): 2D constellation — react-force-graph-2d
//   Stage 2: 3D fly-through — swap renderer to react-force-graph-3d;
//     both share the same { nodes, links } data shape. No data changes needed.
//   Stage 3: Rooms / spatial navigation (domain clusters as navigable spaces).
//   Stage 4: Game layer — quests, progression, evidence linking.
//
// Aesthetic: dark-premium. Matches /knowledge-tree page tokens:
//   - Domain accent colors (cyan/amber/emerald/fuchsia) via ACCENT_HEX
//   - Glow on hover, faint links, dark canvas background (#060609)
//   - Glass-card detail panel (backdrop-blur, border, bg-white/[0.02])
//
// Accessibility: canvas is not screen-reader accessible. A collapsible
// accessible list of domains → nodes is always rendered as a DOM fallback.
// ─────────────────────────────────────────────────────────────────────────────

// We import ForceGraph2D directly here (no next/dynamic needed — this file
// itself is "use client" and is only ever loaded browser-side via the outer
// GraphWrapper.tsx next/dynamic ssr:false boundary).
import ForceGraph2D from "react-force-graph-2d";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  KNOWLEDGE_GRAPH,
  DOMAINS,
  getDomain,
  getNode,
  neighbors,
} from "@/lib/knowledge-tree/data";
import type { KnowledgeNode, NodeKind } from "@/lib/knowledge-tree/schema";
import { ACCENT_TEXT, ACCENT_CHIP, ACCENT_BORDER, ACCENT_BG_SOFT } from "@/lib/accents";
import type { Accent } from "@/lib/accents";

// ── Accent → hex color (for canvas rendering) ────────────────────────────────
const ACCENT_HEX: Record<Accent, string> = {
  cyan:    "#22d3ee",
  amber:   "#fbbf24",
  emerald: "#34d399",
  fuchsia: "#e879f9",
  violet:  "#a78bfa",
  rose:    "#fb7185",
};

// ── Node kind labels ─────────────────────────────────────────────────────────
const KIND_LABELS: Record<NodeKind, string> = {
  concept:      "Concept",
  skill:        "Skill",
  practice:     "Practice",
  artifact:     "Artifact",
  evidence:     "Evidence",
  contribution: "Contribution",
  quest:        "Quest",
};

// ── Node type for react-force-graph-2d callbacks ──────────────────────────────
// The library's NodeObject<T> has `[others: string]: any` as an index signature,
// making it structurally incompatible with our KnowledgeNode which has specific
// required fields. We use `any` in the callback signatures — this is intentional
// and the only practical approach with this library's type design.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = any;

// ── Detail panel ─────────────────────────────────────────────────────────────

function NodeDetailPanel({
  node,
  onClose,
}: {
  node: KnowledgeNode;
  onClose: () => void;
}) {
  const domain = getDomain(node.domainId);
  const accent = (domain?.accent ?? "cyan") as Accent;
  const neighborIds = neighbors(node.id);
  const neighborNodes = neighborIds
    .map((id) => getNode(id))
    .filter((n): n is KnowledgeNode => !!n);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <aside
      className={[
        "absolute right-4 top-4 z-20",
        "w-72 max-h-[calc(100%-2rem)] overflow-y-auto",
        "rounded-2xl border bg-[#060609]/90 backdrop-blur-xl p-5",
        "shadow-2xl",
        ACCENT_BORDER[accent],
        ACCENT_BG_SOFT[accent],
      ].join(" ")}
      role="complementary"
      aria-label={`Node detail: ${node.label}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-medium uppercase tracking-widest ${ACCENT_TEXT[accent]}`}>
            {domain?.name ?? node.domainId}
          </p>
          <h3 className="mt-1 text-[15px] font-semibold text-white leading-snug">
            {node.label}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close detail panel"
          className="shrink-0 rounded-md p-1 text-slate-500 transition-colors hover:text-white hover:bg-white/[0.06]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M1 1L13 13M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Kind badge */}
      <span className={`mt-3 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${ACCENT_CHIP[accent]}`}>
        {KIND_LABELS[node.kind]}
      </span>

      {/* Summary */}
      {node.summary && (
        <p className="mt-4 text-[13px] leading-relaxed text-slate-300">
          {node.summary}
        </p>
      )}

      {/* Neighbors */}
      {neighborNodes.length > 0 && (
        <div className="mt-5">
          <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500 mb-2">
            Connected nodes
          </p>
          <ul className="space-y-1.5">
            {neighborNodes.map((n) => {
              const nDomain = getDomain(n.domainId);
              const nAccent = (nDomain?.accent ?? "cyan") as Accent;
              return (
                <li key={n.id}>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${ACCENT_CHIP[nAccent]}`}>
                    {n.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
}

// ── Accessible fallback list ─────────────────────────────────────────────────

function AccessibleNodeList() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:inset-x-0 focus-within:bottom-0 focus-within:z-30 focus-within:max-h-64 focus-within:overflow-y-auto focus-within:bg-[#060609]/95 focus-within:p-4 focus-within:border-t focus-within:border-white/[0.08]">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="text-[13px] text-cyan-400 underline mb-3 block focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        {expanded ? "Hide" : "Show"} accessible node list
      </button>
      {expanded && (
        <nav aria-label="Knowledge Tree nodes by domain">
          {DOMAINS.map((domain) => {
            const domainNodes = KNOWLEDGE_GRAPH.nodes.filter(
              (n: KnowledgeNode) => n.domainId === domain.id
            );
            return (
              <section key={domain.id} className="mb-4">
                <h3 className="text-[13px] font-semibold text-white mb-1">
                  {domain.name}
                </h3>
                <p className="text-[12px] text-slate-400 mb-2">{domain.blurb}</p>
                <ul className="space-y-1">
                  {domainNodes.map((node: KnowledgeNode) => (
                    <li key={node.id} className="text-[12px] text-slate-300">
                      <strong>{node.label}</strong>{" "}
                      <span className="text-slate-500">({KIND_LABELS[node.kind]})</span>
                      {node.summary && (
                        <span className="block text-slate-400 text-[11px] mt-0.5">
                          {node.summary}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </nav>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function KnowledgeGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  // ForceGraph2D uses ForceGraphMethods as the ref type; we keep it permissive
  // to avoid fighting the library's complex generics.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  // Lazy initializer reads the media query on first render (client-side only).
  // This avoids calling setState synchronously inside an effect body.
  const [reducedMotion, setReducedMotion] = useState<boolean>(
    () =>
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false
  );

  // Subscribe to prefers-reduced-motion changes (only fires in the handler, not the body)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Measure container for responsive sizing
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: Math.floor(width), height: Math.floor(height) });
      }
    });
    ro.observe(containerRef.current);
    const frame = window.requestAnimationFrame(() => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({
        width: Math.floor(rect.width) || 800,
        height: Math.floor(rect.height) || 600,
      });
    });
    return () => {
      window.cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, []);

  // Pause simulation when reduced motion is preferred
  useEffect(() => {
    if (reducedMotion && graphRef.current?.pauseAnimation) {
      graphRef.current.pauseAnimation();
    }
  }, [reducedMotion]);

  // Zoom to fit after simulation settles
  const handleEngineStop = useCallback(() => {
    graphRef.current?.zoomToFit?.(600, 40);
  }, []);

  // Build graph data — stable reference (module constants never change)
  const graphData = useMemo(() => {
    return {
      nodes: KNOWLEDGE_GRAPH.nodes.map((n: KnowledgeNode) => ({ ...n })),
      links: KNOWLEDGE_GRAPH.edges.map((e) => ({
        source: e.source,
        target: e.target,
        relation: e.relation,
      })),
    };
  }, []);

  // Node visual size (library scales by sqrt of this value)
  const nodeVal = useCallback((node: AnyNode): number => {
    const k = node.kind as string;
    if (k === "artifact" || k === "contribution" || k === "quest") return 6;
    if (k === "concept") return 5;
    return 4;
  }, []);

  // Node color by domain accent
  const nodeColor = useCallback((node: AnyNode): string => {
    const domain = getDomain(node.domainId as string);
    const accent = (domain?.accent ?? "cyan") as Accent;
    return ACCENT_HEX[accent];
  }, []);

  // Custom canvas render: dot + glow + label
  const nodeCanvasObject = useCallback(
    (node: AnyNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const domain = getDomain(node.domainId as string);
      const accent = (domain?.accent ?? "cyan") as Accent;
      const color = ACCENT_HEX[accent];
      const x = (node.x as number) ?? 0;
      const y = (node.y as number) ?? 0;
      const baseR = nodeVal(node);
      const r = baseR / Math.sqrt(globalScale);
      const isHovered = (node.id as string) === hoveredId;
      const isSelected = (node.id as string) === selectedNode?.id;

      // Glow rings on hover / selection
      if (isHovered || isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, r * 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = color + "1a"; // ~10% opacity
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, r * 2, 0, 2 * Math.PI);
        ctx.fillStyle = color + "33"; // ~20% opacity
        ctx.fill();
      }

      // Node dot
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = isHovered || isSelected ? color : color + "CC";
      ctx.fill();

      // Label — visible when zoomed in or highlighted
      if (globalScale >= 1.2 || isHovered || isSelected) {
        const label = node.label as string;
        const fontSize = Math.max(6, 10 / globalScale);
        ctx.font = `${fontSize}px -apple-system, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        // Text shadow
        ctx.fillStyle = "#00000088";
        ctx.fillText(label, x + 0.5, y + r + 2 + 0.5);
        // Label
        ctx.fillStyle = isHovered || isSelected ? "#ffffff" : "#94a3b8";
        ctx.fillText(label, x, y + r + 2);
      }
    },
    [hoveredId, selectedNode, nodeVal]
  );

  const handleNodeHover = useCallback((node: AnyNode) => {
    const id: string | null = node ? (node.id as string) : null;
    setHoveredId(id);
    if (typeof document !== "undefined") {
      document.body.style.cursor = node ? "pointer" : "default";
    }
  }, []);

  const handleNodeClick = useCallback((node: AnyNode) => {
    const knowledgeNode = getNode(node.id as string);
    setSelectedNode((prev) =>
      prev?.id === (node.id as string) ? null : (knowledgeNode ?? null)
    );
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const linkColor = useCallback(() => "#ffffff14", []);

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-[#060609]"
      ref={containerRef}
    >
      {/* Canvas graph — ForceGraph2D is imported directly (this file is client-only) */}
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#060609"
        nodeId="id"
        nodeVal={nodeVal}
        nodeColor={nodeColor}
        nodeCanvasObject={nodeCanvasObject}
        nodeCanvasObjectMode={() => "replace" as const}
        nodeLabel={(node: AnyNode) => node.label as string}
        linkColor={linkColor}
        linkWidth={0.5}
        linkCurvature={0.1}
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
        onBackgroundClick={handleBackgroundClick}
        enableNodeDrag={!reducedMotion}
        onEngineStop={handleEngineStop}
        d3AlphaDecay={reducedMotion ? 1 : 0.02}
        d3VelocityDecay={reducedMotion ? 1 : 0.3}
        warmupTicks={reducedMotion ? 200 : 0}
        cooldownTicks={reducedMotion ? 0 : Infinity}
      />

      {/* Domain legend — top-left overlay */}
      <div
        className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col gap-1.5"
        aria-hidden="true"
      >
        {DOMAINS.map((domain) => {
          const accent = domain.accent as Accent;
          return (
            <div key={domain.id} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: ACCENT_HEX[accent] }}
              />
              <span className="text-[11px] font-medium text-slate-400">
                {domain.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Interaction hint — bottom-left overlay */}
      <p
        className="pointer-events-none absolute bottom-4 left-4 z-10 text-[11px] text-slate-600"
        aria-hidden="true"
      >
        Click a node to explore &middot; Scroll to zoom &middot; Drag to pan
      </p>

      {/* Selected node detail panel */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {/* Accessible fallback — sr-only until focused */}
      <AccessibleNodeList />
    </div>
  );
}
