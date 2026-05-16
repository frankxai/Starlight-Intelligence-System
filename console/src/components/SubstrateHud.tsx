"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { vaults, verticals } from "@/data/substrate";

type ViewMode = "2d" | "3d";

interface SubstrateHudProps {
  view: ViewMode;
  setView: (v: ViewMode) => void;
}

/**
 * Vellum & Voltage HUD overlay for the substrate view.
 *
 * Five anchored regions, each a separate glass surface to convey layering:
 *   - top-left:   Identity block (Starlight emblem + Fraunces title)
 *   - top-center: Back-link chip
 *   - top-right:  View switcher pill (2D / 3D)
 *   - right:      Atlas legend — vaults + visible verticals
 *   - bottom-l:   Live status + clock
 *   - bottom-r:   Control hints
 *
 * Page-load reveal is staggered by 120ms per region; each card animates
 * from blur=8px+y=8px to crisp. Vignette overlay falls off the edges.
 */
export default function SubstrateHud({ view, setView }: SubstrateHudProps) {
  const [now, setNow] = useState<string>(() => formatTime(new Date()));

  useEffect(() => {
    const id = setInterval(() => setNow(formatTime(new Date())), 30_000);
    return () => clearInterval(id);
  }, []);

  const publicVerticals = verticals.filter(
    (v) => !("private" in v) || (v as { private?: boolean }).private !== true,
  );

  const controlHints =
    view === "3d"
      ? [
          { icon: "◐", label: "drag" },
          { icon: "↕", label: "scroll" },
          { icon: "⊞", label: "pan" },
        ]
      : [
          { icon: "◐", label: "drag node" },
          { icon: "↕", label: "scroll" },
          { icon: "✦", label: "hover" },
        ];

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* TOP LEFT — Identity */}
      <div
        className="hud-in pointer-events-auto absolute left-6 top-6"
        style={{ animationDelay: "0ms" }}
      >
        <div className="glass-elevated flex items-center gap-4 rounded-2xl px-5 py-3">
          <div
            className="h-9 w-9 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, var(--voltage-bright), var(--voltage-deep) 70%, #1a1130 100%)",
              boxShadow:
                "0 0 12px var(--voltage), inset 0 0 8px rgba(140,125,255,0.6)",
            }}
            aria-hidden
          />
          <div className="flex flex-col leading-none">
            <span
              className="font-display text-[18px] font-medium tracking-display text-[color:var(--ink-0)]"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              Starlight
            </span>
            <span className="mt-1 font-mono text-[10px] uppercase tracking-tech text-[color:var(--ink-2)]">
              Substrate · {view.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* TOP CENTER — Back link */}
      <div
        className="hud-in pointer-events-auto absolute left-1/2 top-6 -translate-x-1/2"
        style={{ animationDelay: "60ms" }}
      >
        <Link
          href="/"
          className="glass group inline-flex items-center gap-2 rounded-full px-4 py-2 text-[color:var(--ink-1)] transition-micro hover:text-[color:var(--ink-0)]"
        >
          <span className="font-mono text-[12px] text-[color:var(--doctrine)] transition-micro group-hover:-translate-x-0.5">
            ←
          </span>
          <span className="font-mono text-[10px] uppercase tracking-tech">
            console
          </span>
        </Link>
      </div>

      {/* TOP RIGHT — View switcher */}
      <div
        className="hud-in pointer-events-auto absolute right-6 top-6"
        style={{ animationDelay: "120ms" }}
      >
        <div className="glass flex gap-1 rounded-full p-1">
          <ViewPill active={view === "2d"} onClick={() => setView("2d")}>
            2D
          </ViewPill>
          <ViewPill active={view === "3d"} onClick={() => setView("3d")}>
            3D
          </ViewPill>
        </div>
      </div>

      {/* RIGHT — Atlas legend */}
      <div
        className="hud-in pointer-events-auto absolute right-6 top-1/2 max-w-[280px] -translate-y-1/2"
        style={{ animationDelay: "260ms" }}
      >
        <div className="glass-elevated rounded-2xl p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <span
              className="font-display text-[14px] font-medium tracking-display text-[color:var(--ink-0)]"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              Atlas
            </span>
            <span className="font-mono text-[9px] uppercase tracking-tech text-[color:var(--ink-2)]">
              {vaults.length} · {publicVerticals.length}
            </span>
          </div>
          <div className="doctrine-line mb-4" />

          <div className="mb-4">
            <span className="font-mono text-[9px] uppercase tracking-tech text-[color:var(--doctrine)]">
              Vaults
            </span>
            <ul className="mt-2 space-y-1.5">
              {vaults.map((v) => (
                <li key={v.id} className="flex items-center gap-3">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: v.color,
                      boxShadow: `0 0 8px ${v.color}`,
                    }}
                    aria-hidden
                  />
                  <span className="font-sans text-[12px] text-[color:var(--ink-1)]">
                    {v.name}
                  </span>
                  <span className="ml-auto font-mono text-[9px] tracking-tech text-[color:var(--ink-3)]">
                    {v.glyph}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="font-mono text-[9px] uppercase tracking-tech text-[color:var(--doctrine)]">
              Verticals
            </span>
            <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
              {publicVerticals.map((v) => (
                <li key={v.id} className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: v.color, opacity: 0.75 }}
                    aria-hidden
                  />
                  <span className="font-sans text-[10.5px] text-[color:var(--ink-2)]">
                    {v.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* BOTTOM LEFT — Status */}
      <div
        className="hud-in pointer-events-auto absolute bottom-6 left-6"
        style={{ animationDelay: "380ms" }}
      >
        <div className="glass flex items-center gap-4 rounded-full px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--voltage-bright)] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--voltage-bright)]" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-tech text-[color:var(--ink-1)]">
            substrate · live
          </span>
          <span className="h-3 w-px bg-[color:var(--ink-3)]" aria-hidden />
          <span className="font-mono text-[10px] tracking-tech text-[color:var(--ink-2)]">
            {now}
          </span>
        </div>
      </div>

      {/* BOTTOM RIGHT — Controls */}
      <div
        className="hud-in pointer-events-auto absolute bottom-6 right-6"
        style={{ animationDelay: "500ms" }}
      >
        <div className="glass flex gap-3 rounded-full px-4 py-2">
          {controlHints.map((h, i) => (
            <span key={h.label} className="flex items-center gap-1.5">
              <span className="font-mono text-[12px] text-[color:var(--doctrine)]">
                {h.icon}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-tech text-[color:var(--ink-2)]">
                {h.label}
              </span>
              {i < controlHints.length - 1 && (
                <span className="ml-2 h-3 w-px bg-[color:var(--ink-3)]" aria-hidden />
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Cinematic edge vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 110% 90% at 50% 50%, transparent 55%, rgba(10,10,20,0.55) 100%)",
        }}
        aria-hidden
      />
    </div>
  );
}

function ViewPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "glass-volt rounded-full px-4 py-1.5 font-mono text-[11px] tracking-tech text-[color:var(--ink-0)]"
          : "rounded-full px-4 py-1.5 font-mono text-[11px] tracking-tech text-[color:var(--ink-2)] transition-micro hover:text-[color:var(--ink-0)]"
      }
    >
      {children}
    </button>
  );
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
