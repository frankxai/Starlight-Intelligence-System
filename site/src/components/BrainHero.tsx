// Decorative hero visualization of the 10-IS topology.
//
// Server component — pure SVG, no JS bundle cost beyond Next's RSC payload.
// Animation is driven by CSS keyframes in globals.css (animate-brain-*),
// which respect prefers-reduced-motion automatically.
//
// Lineage cited: the visual idiom (ring of specialized regions around a
// central executive controller) is drawn from cortical-organization
// representations common in computational neuroscience (e.g. Hensch 2005
// developmental-phase diagrams). The SIS-specific mapping — Orchestrator at
// the center, 9 layers around the ring with each layer's accent color —
// matches the 10-IS taxonomy locked at v7.5.
//
// Decorative: aria-hidden="true". The actual structured information lives
// in the architecture page's layer table.

import type { ReactElement } from "react";

type LayerAccent =
  | "violet"
  | "cyan"
  | "fuchsia"
  | "emerald"
  | "amber"
  | "rose";

interface LayerNode {
  /** Human name, used for the optional aria-label only. */
  name: string;
  accent: LayerAccent;
  /** Degrees clockwise from 12 o'clock. */
  angle: number;
}

// 9 layer nodes around the ring. Order matches the home page LAYERS array
// so the colors compose into a recognizable arc, but the SVG is decorative.
const LAYER_NODES: readonly LayerNode[] = [
  { name: "Self / Genius", accent: "violet", angle: 0 },
  { name: "Second Brain", accent: "cyan", angle: 40 },
  { name: "Brand", accent: "fuchsia", angle: 80 },
  { name: "Business", accent: "emerald", angle: 120 },
  { name: "Creator", accent: "amber", angle: 160 },
  { name: "Wealth", accent: "rose", angle: 200 },
  { name: "Code", accent: "violet", angle: 240 },
  { name: "Voice & Video", accent: "cyan", angle: 280 },
  { name: "Family", accent: "fuchsia", angle: 320 },
];

const ACCENT_HEX: Record<LayerAccent, string> = {
  violet: "#a78bfa",
  cyan: "#22d3ee",
  fuchsia: "#e879f9",
  emerald: "#34d399",
  amber: "#fbbf24",
  rose: "#fb7185",
};

interface Props {
  /** Tailwind sizing/position classes — e.g. `absolute right-0 top-0 w-[600px]`. */
  className?: string;
  /** Show layer name labels (for /architecture hero). Default false. */
  labels?: boolean;
}

export function BrainHero({ className = "", labels = false }: Props): ReactElement {
  const cx = 200;
  const cy = 200;
  const ringRadius = 140;
  // Pre-compute node positions so labels + connections share the same geometry.
  const positions = LAYER_NODES.map((node) => {
    // Subtract 90deg so angle=0 sits at 12 o'clock instead of 3 o'clock.
    const rad = ((node.angle - 90) * Math.PI) / 180;
    return {
      ...node,
      x: cx + ringRadius * Math.cos(rad),
      y: cy + ringRadius * Math.sin(rad),
    };
  });

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      aria-hidden="true"
      role="presentation"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Soft glow filter applied to each node. Keep stdDeviation small to
            stay performant on mid-tier devices. */}
        <filter id="brain-hero-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Hub-and-spoke connections from each layer to the central Orchestrator.
          Drawn first so they sit behind the nodes. */}
      {positions.map((p, i) => (
        <line
          key={`spoke-${i}`}
          x1={cx}
          y1={cy}
          x2={p.x}
          y2={p.y}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={0.5}
        />
      ))}

      {/* Outer ring connecting adjacent layers — adds the "cortex" topology
          read. Very subtle. */}
      {positions.map((p, i) => {
        const next = positions[(i + 1) % positions.length];
        return (
          <line
            key={`ring-${i}`}
            x1={p.x}
            y1={p.y}
            x2={next.x}
            y2={next.y}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Central Orchestrator core — fuchsia, slow gentle pulse. */}
      <g className="animate-brain-core" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <circle
          cx={cx}
          cy={cy}
          r={14}
          fill={ACCENT_HEX.fuchsia}
          opacity={0.85}
          filter="url(#brain-hero-glow)"
        />
        <circle cx={cx} cy={cy} r={6} fill={ACCENT_HEX.fuchsia} />
      </g>

      {/* 9 layer nodes — staggered pulse around the ring (~1s per node). */}
      {positions.map((p, i) => {
        const color = ACCENT_HEX[p.accent];
        const delay = `${(i * 0.9).toFixed(2)}s`;
        return (
          <g
            key={`node-${i}`}
            className="animate-brain-node"
            style={{
              transformOrigin: `${p.x}px ${p.y}px`,
              animationDelay: delay,
            }}
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={9}
              fill={color}
              opacity={0.55}
              filter="url(#brain-hero-glow)"
            />
            <circle cx={p.x} cy={p.y} r={4} fill={color} />
          </g>
        );
      })}

      {/* Optional labels for the /architecture hero variant. */}
      {labels &&
        positions.map((p, i) => {
          // Position labels just outside the ring; flip to stay inside the
          // viewBox when on the right or left side.
          const labelR = ringRadius + 22;
          const rad = ((p.angle - 90) * Math.PI) / 180;
          const lx = cx + labelR * Math.cos(rad);
          const ly = cy + labelR * Math.sin(rad);
          const anchor =
            Math.abs(Math.cos(rad)) < 0.2
              ? "middle"
              : Math.cos(rad) > 0
                ? "start"
                : "end";
          return (
            <text
              key={`label-${i}`}
              x={lx}
              y={ly + 3}
              fill="rgba(226, 232, 240, 0.55)"
              fontSize={9}
              fontFamily="ui-monospace, SFMono-Regular, monospace"
              textAnchor={anchor}
              letterSpacing="0.08em"
            >
              {p.name.toUpperCase()}
            </text>
          );
        })}
    </svg>
  );
}
