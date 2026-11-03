"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export type GlassTier = "webgl" | "css" | "static";

export interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  tier?: GlassTier;
  freshness?: "fresh" | "normal" | "stale" | "breach"; // <5m (specular), 15m, 2h, >24h (amber)
  blur?: number;
  specular?: boolean;
  interactive?: boolean;
  children: React.ReactNode;
}

export function GlassSurface({
  tier = "css",
  freshness = "fresh",
  blur = 18,
  specular = true,
  interactive = false,
  children,
  className,
  style,
  ...props
}: GlassSurfaceProps) {
  const [activeTier, setActiveTier] = React.useState<GlassTier>(tier);
  const [mousePos, setMousePos] = React.useState<{ x: number; y: number }>({ x: 50, y: 50 });

  React.useEffect(() => {
    // Detect prefers-reduced-motion or reduced-transparency
    if (typeof window !== "undefined") {
      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      const transparencyQuery = window.matchMedia("(prefers-reduced-transparency: reduce)");
      if (motionQuery.matches || transparencyQuery.matches) {
        setActiveTier("static");
      } else {
        setActiveTier(tier);
      }
    }
  }, [tier]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Freshness hairline & tint styles
  const freshnessBorder =
    freshness === "fresh"
      ? "border-[rgba(237,230,216,0.22)] shadow-[inset_0_1px_0_rgba(251,246,235,0.28)]"
      : freshness === "normal"
      ? "border-[rgba(237,230,216,0.12)] shadow-[inset_0_1px_0_rgba(251,246,235,0.14)]"
      : freshness === "stale"
      ? "border-[rgba(232,195,106,0.35)] shadow-[inset_0_1px_0_rgba(232,195,106,0.2)]"
      : "border-[rgba(255,123,123,0.45)] shadow-[inset_0_1px_0_rgba(255,123,123,0.25)]";

  const backdropStyle: React.CSSProperties = {
    backdropFilter: activeTier === "static" ? "none" : `blur(${blur}px) saturate(115%)`,
    WebkitBackdropFilter: activeTier === "static" ? "none" : `blur(${blur}px) saturate(115%)`,
    ...style,
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      data-tier={activeTier}
      data-freshness={freshness}
      style={backdropStyle}
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all duration-300",
        activeTier === "static"
          ? "bg-[var(--sl-surface-1,#0d1119)]/95"
          : "bg-[var(--sl-glass-bg,rgba(13,17,25,0.58))]",
        freshnessBorder,
        className
      )}
      {...props}
    >
      {/* Specular hairline light reflection */}
      {specular && activeTier !== "static" && (
        <div
          className="pointer-events-none absolute -inset-px opacity-40 transition-opacity duration-300"
          style={{
            background: interactive
              ? `radial-gradient(circle 240px at ${mousePos.x}% ${mousePos.y}%, rgba(251,246,235,0.25), transparent 70%)`
              : "linear-gradient(135deg, rgba(251,246,235,0.16) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />
      )}

      {/* Surface content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
