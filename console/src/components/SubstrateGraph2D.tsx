"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  allNodes,
  edges as graphEdges,
  type Node as SubstrateNode,
} from "@/data/substrate";

/**
 * 2D force-directed substrate graph (default view).
 *
 * Why this is the default (Luminor REVISE): a force graph is the most
 * legible view for a "navigate the substrate" use case. The 3D scene is
 * the signature view; this is the working view. Both render the same
 * graph from `src/data/substrate.ts` — single source of truth.
 *
 * `react-force-graph-2d` is canvas-based and needs `window`, so we load
 * it via Next 16's `dynamic(..., { ssr: false })` pattern (same as the
 * 3D scene).
 */

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#050509] text-[12px] uppercase tracking-widest text-slate-500">
      loading graph&hellip;
    </div>
  ),
});

interface GraphNode extends SubstrateNode {
  /** Used by the force-graph runtime — kept loose to avoid coupling to its types. */
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  kind?: string;
}

const NODE_RADIUS = {
  core: 16,
  vault: 9,
  vertical: 6,
} as const;

export default function SubstrateGraph2D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [hovered, setHovered] = useState<GraphNode | null>(null);

  // Resize observer — keep canvas matched to container.
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const data = useMemo(
    () => ({
      nodes: allNodes.map((n) => ({ ...n })) as GraphNode[],
      links: graphEdges.map((e) => ({
        source: e.source,
        target: e.target,
        kind: e.kind,
      })) as GraphLink[],
    }),
    [],
  );

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full bg-[#050509]"
    >
      {size.w > 0 && size.h > 0 && (
        <ForceGraph2D
          graphData={data}
          width={size.w}
          height={size.h}
          backgroundColor="#050509"
          nodeRelSize={6}
          linkColor={() => "rgba(167, 139, 250, 0.18)"}
          linkWidth={(link: unknown) => {
            const l = link as GraphLink;
            return l.kind === "compose" ? 1.4 : 0.8;
          }}
          linkDirectionalParticles={0}
          cooldownTicks={120}
          d3VelocityDecay={0.32}
          warmupTicks={40}
          enableNodeDrag
          onNodeHover={(node: unknown) =>
            setHovered((node as GraphNode | null) ?? null)
          }
          nodeCanvasObject={(
            node: unknown,
            ctx: CanvasRenderingContext2D,
            globalScale: number,
          ) => {
            const n = node as GraphNode;
            if (n.x === undefined || n.y === undefined) return;

            const isPrivate = n.private === true;
            const r = NODE_RADIUS[n.kind];

            // Outer glow (halo)
            const haloOpacity = isPrivate ? 0.08 : 0.18;
            const grad = ctx.createRadialGradient(n.x, n.y, r * 0.4, n.x, n.y, r * 2.4);
            grad.addColorStop(0, hexWithAlpha(n.color, haloOpacity));
            grad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(n.x, n.y, r * 2.4, 0, Math.PI * 2);
            ctx.fill();

            // Solid node
            ctx.fillStyle = isPrivate ? hexWithAlpha(n.color, 0.55) : n.color;
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
            ctx.fill();

            // Inner highlight ring for the core, to differentiate
            if (n.kind === "core") {
              ctx.strokeStyle = "rgba(255,255,255,0.4)";
              ctx.lineWidth = 1.5 / globalScale;
              ctx.beginPath();
              ctx.arc(n.x, n.y, r - 3, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Label — every node, all the time (Force Graph supports this).
            // Skip public name for private verticals; show glyph only.
            const label = isPrivate ? n.glyph : n.name;
            const fontSize = Math.max(10, 12 / Math.sqrt(globalScale));
            ctx.font = `${n.kind === "core" ? "600 " : ""}${fontSize}px ui-sans-serif, system-ui, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";

            // Label background pill
            const padX = 6;
            const padY = 3;
            const textWidth = ctx.measureText(label).width;
            const labelY = n.y + r + 6;
            ctx.fillStyle = "rgba(5, 5, 9, 0.7)";
            roundRect(
              ctx,
              n.x - textWidth / 2 - padX,
              labelY - padY,
              textWidth + padX * 2,
              fontSize + padY * 2,
              4,
            );
            ctx.fill();

            ctx.fillStyle = isPrivate ? "#94a3b8" : n.color;
            ctx.fillText(label, n.x, labelY);
          }}
          nodePointerAreaPaint={(
            node: unknown,
            color: string,
            ctx: CanvasRenderingContext2D,
          ) => {
            const n = node as GraphNode;
            if (n.x === undefined || n.y === undefined) return;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(n.x, n.y, NODE_RADIUS[n.kind] * 1.6, 0, Math.PI * 2);
            ctx.fill();
          }}
        />
      )}

      {/* Hover detail panel */}
      {hovered && (
        <div className="pointer-events-none absolute right-6 top-1/2 z-20 -translate-y-1/2 max-w-[280px] rounded-xl border border-white/[0.08] bg-black/60 p-4 backdrop-blur-md">
          <div
            className="text-[10px] font-mono uppercase tracking-widest"
            style={{ color: hovered.color }}
          >
            {hovered.kind}
          </div>
          <div className="mt-1 text-[14px] font-semibold text-white">
            {hovered.private ? "—" : hovered.name}
          </div>
          <div className="mt-2 text-[12px] leading-relaxed text-slate-400">
            {hovered.private
              ? "Private vertical. Sovereignty clause: visible as a node, never described publicly."
              : hovered.desc}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* helpers                                                              */
/* -------------------------------------------------------------------- */

function hexWithAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const bigint = parseInt(
    h.length === 3
      ? h.split("").map((c) => c + c).join("")
      : h,
    16,
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
