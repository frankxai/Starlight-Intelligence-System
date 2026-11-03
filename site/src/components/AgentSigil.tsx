"use client";

import { useId, useMemo } from "react";

export interface AgentSigilProps {
  id: string;
  domain?: string;
  tier?: string;
  voice?: string;
  size?: number;
  className?: string;
  accent?: "gold" | "cyan" | "auto" | "monochrome";
}

/**
 * Parametric deterministic hash function (FNV-1a 32-bit).
 */
function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Deterministic Parametric Agent Sigil.
 *
 * Generates an SVG sacred-geometry glyph derived from the agent ID, tier, and domain.
 * Architecture:
 * - Concentric orbital rings (Golden ratio & harmonic resonances)
 * - Rotational polygon lattices (4-fold, 6-fold, 8-fold, 12-fold symmetry)
 * - Guiding core star with cardinal diffraction rays
 * - Satellite companion nodes on orbital tracks
 * Scales cleanly from 16px to 512px without degradation.
 */
export function AgentSigil({
  id,
  domain = "Universal",
  tier = "Specialist",
  voice = "architect",
  size = 48,
  className = "",
  accent = "auto",
}: AgentSigilProps) {
  const svgId = useId();

  const geometry = useMemo(() => {
    const seed = hashString(`${id}:${domain}:${tier}`);
    const r1 = (seed & 0xff) / 255;
    const r2 = ((seed >> 8) & 0xff) / 255;
    const r3 = ((seed >> 16) & 0xff) / 255;
    const r4 = ((seed >> 24) & 0xff) / 255;

    // Determine symmetry fold
    const tierLower = tier.toLowerCase();
    let folds = 6;
    if (tierLower.includes("leadership")) folds = 8;
    else if (tierLower.includes("front-door")) folds = 4;
    else if (tierLower.includes("excavation")) folds = 4;
    else if (tierLower.includes("foundation")) folds = 12;
    else if (tierLower.includes("council")) folds = 3;
    else if (tierLower.includes("universal")) folds = 8;
    else {
      folds = [4, 6, 8, 12][Math.min(3, Math.floor(r1 * 4))];
    }

    // Geometry radii (viewBox 0 0 100 100, center 50,50)
    const center = 50;
    const outerRadius = 42;
    const midRadius = 26 + r2 * 8; // 26 to 34
    const innerRadius = 12 + r3 * 6; // 12 to 18
    const coreRadius = 3.5 + r4 * 2; // 3.5 to 5.5

    // Build outer polygon points
    const outerPoints: { x: number; y: number }[] = [];
    for (let i = 0; i < folds; i++) {
      const angle = (i * 2 * Math.PI) / folds - Math.PI / 2;
      outerPoints.push({
        x: Number((center + outerRadius * Math.cos(angle)).toFixed(2)),
        y: Number((center + outerRadius * Math.sin(angle)).toFixed(2)),
      });
    }

    // Build inner star / polygon points (alternating outer/inner radii)
    const starPoints: { x: number; y: number }[] = [];
    const starFolds = folds === 3 ? 6 : folds;
    for (let i = 0; i < starFolds * 2; i++) {
      const angle = (i * Math.PI) / starFolds - Math.PI / 2;
      const r = i % 2 === 0 ? midRadius : innerRadius;
      starPoints.push({
        x: Number((center + r * Math.cos(angle)).toFixed(2)),
        y: Number((center + r * Math.sin(angle)).toFixed(2)),
      });
    }

    // Build satellite nodes
    const nodeCount = 2 + Math.floor(r3 * 4); // 2 to 5 satellites
    const satellites: { cx: number; cy: number; r: number }[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const angle = (r4 * Math.PI * 2 + (i * 2 * Math.PI) / nodeCount);
      satellites.push({
        cx: Number((center + outerRadius * Math.cos(angle)).toFixed(2)),
        cy: Number((center + outerRadius * Math.sin(angle)).toFixed(2)),
        r: Number((1.5 + ((i + seed) % 3) * 0.6).toFixed(1)),
      });
    }

    // Secondary inner satellites
    const innerNodes: { cx: number; cy: number; r: number }[] = [];
    if (folds >= 6) {
      for (let i = 0; i < folds; i++) {
        if (i % 2 === 0) {
          const angle = (i * 2 * Math.PI) / folds - Math.PI / 2;
          innerNodes.push({
            cx: Number((center + midRadius * Math.cos(angle)).toFixed(2)),
            cy: Number((center + midRadius * Math.sin(angle)).toFixed(2)),
            r: 1.2,
          });
        }
      }
    }

    // Ray lengths for diffraction cross-star
    const hasRays = folds % 4 === 0 || folds === 8;
    const rayLength = 46;

    // Palette accents
    let primaryColor = "var(--sl-companion, #82d8e6)";
    let accentColor = "var(--sl-gold, #c9a15c)";
    if (accent === "gold" || tierLower.includes("leadership") || tierLower.includes("council")) {
      primaryColor = "var(--sl-gold, #c9a15c)";
      accentColor = "var(--sl-companion, #82d8e6)";
    } else if (accent === "cyan") {
      primaryColor = "var(--sl-companion, #82d8e6)";
      accentColor = "var(--sl-gold, #c9a15c)";
    } else if (accent === "monochrome") {
      primaryColor = "currentColor";
      accentColor = "currentColor";
    }

    return {
      center,
      outerRadius,
      midRadius,
      innerRadius,
      coreRadius,
      folds,
      outerPoints,
      starPoints,
      satellites,
      innerNodes,
      hasRays,
      rayLength,
      primaryColor,
      accentColor,
      r1,
      r2,
      r3,
    };
  }, [id, domain, tier, accent]);

  const outerPointsStr = geometry.outerPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const starPointsStr = geometry.starPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-label={`Sigil for agent ${id}`}
      role="img"
    >
      <defs>
        <linearGradient id={`${svgId}-core-grad`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor={geometry.accentColor} />
        </linearGradient>
        <radialGradient id={`${svgId}-aura`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={geometry.primaryColor} stopOpacity="0.22" />
          <stop offset="70%" stopColor={geometry.primaryColor} stopOpacity="0.04" />
          <stop offset="100%" stopColor={geometry.primaryColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient background aura */}
      <circle cx="50" cy="50" r="46" fill={`url(#${svgId}-aura)`} />

      {/* Outer orbital boundary circle */}
      <circle
        cx="50"
        cy="50"
        r={geometry.outerRadius}
        stroke="var(--sl-border, rgba(237, 230, 216, 0.14))"
        strokeWidth="1"
        strokeDasharray={geometry.r1 > 0.5 ? "3 3" : undefined}
      />

      {/* Mid harmonic orbit */}
      <circle
        cx="50"
        cy="50"
        r={geometry.midRadius}
        stroke={geometry.primaryColor}
        strokeWidth="0.8"
        strokeOpacity="0.4"
      />

      {/* Geometric symmetry polygon */}
      <polygon
        points={outerPointsStr}
        stroke={geometry.primaryColor}
        strokeWidth="1.2"
        strokeOpacity="0.65"
        strokeLinejoin="round"
      />

      {/* Star / crystal core structure */}
      <polygon
        points={starPointsStr}
        stroke={geometry.accentColor}
        strokeWidth="1.2"
        fill={geometry.primaryColor}
        fillOpacity="0.06"
        strokeLinejoin="round"
      />

      {/* Cardinal diffraction cross-rays if applicable */}
      {geometry.hasRays && (
        <g stroke={geometry.accentColor} strokeWidth="0.8" strokeOpacity="0.45">
          <line x1="50" y1={50 - geometry.rayLength} x2="50" y2={50 + geometry.rayLength} />
          <line x1={50 - geometry.rayLength} y1="50" x2={50 + geometry.rayLength} y2="50" />
        </g>
      )}

      {/* Satellite orbital nodes */}
      {geometry.satellites.map((node, i) => (
        <circle
          key={i}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          fill={geometry.accentColor}
          fillOpacity="0.9"
        />
      ))}

      {/* Secondary inner nodes */}
      {geometry.innerNodes.map((node, i) => (
        <circle
          key={i}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          fill={geometry.primaryColor}
          fillOpacity="0.8"
        />
      ))}

      {/* Core central nucleus */}
      <circle
        cx="50"
        cy="50"
        r={geometry.coreRadius}
        fill={`url(#${svgId}-core-grad)`}
      />
      <circle
        cx="50"
        cy="50"
        r={Math.max(1.2, geometry.coreRadius * 0.45)}
        fill="#070a10"
      />
    </svg>
  );
}
