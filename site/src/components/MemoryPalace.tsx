"use client";

import React, { useState } from "react";
import { Starfield } from "@/components/cosmos/Starfield";

/**
 * MemoryPalace — L99 Jarvis-style seed visualization for the Starlight Intelligence System.
 *
 * Zero new dependencies. Reuses every proven idiom:
 * - Starfield (seeded deterministic SVG stars + animate-brain-node twinkle)
 * - BrainHero pulse language (core + staggered node breathing via existing CSS)
 * - Glassmorphic surface / accent tokens from globals.css + accents.ts
 * - Dark premium #060609, Fraunces/Inter, existing motion curve
 *
 * Six vault orbs + central Starlight Core in a living constellation.
 * Click orbs to focus (excerpts from real vaults). "Speak to focus" simulates voice-reactive intent.
 * HUD shows compounding signals (RRF from receipts, agent count, SIP).
 * Explicit "Built on SIP" + pointer to the full 21-person team brief.
 *
 * This is the beautiful innovative animated seed. The 21-dev/UI-UX team brief
 * (docs/superpowers/specs/2026-06-12-jarvis-memory-palace-team-brief.md) takes it to full r3f 3D palace + shaders + real gateway data.
 */

type VaultKey = "strategic" | "technical" | "creative" | "operational" | "wisdom" | "horizon";

interface VaultOrb {
  key: VaultKey;
  label: string;
  accent: string; // hex
  angle: number; // degrees from 12 o'clock
  excerpt: string;
  confidence: string;
}

const VAULTS: VaultOrb[] = [
  {
    key: "strategic",
    label: "Strategic",
    accent: "#a78bfa",
    angle: 0,
    excerpt: "Claws architecture decision + yolo Hive + brand reconciliation (RA vs agenticincome). Every decision shapes the future.",
    confidence: "0.95",
  },
  {
    key: "technical",
    label: "Technical",
    accent: "#67e8f9",
    angle: 60,
    excerpt: "Configuration-first. Skill auto-activation. Claw Contract pattern. Local-first ingestion. Memory hierarchy proven.",
    confidence: "0.95",
  },
  {
    key: "creative",
    label: "Creative",
    accent: "#f0abfc",
    angle: 120,
    excerpt: "Luminor wisdom integration + Frank DNA voice: direct, technical, warm, playful. Pattern recognition as poetry.",
    confidence: "0.95",
  },
  {
    key: "operational",
    label: "Operational",
    accent: "#4ade80",
    angle: 180,
    excerpt: "Overnight deep ships, v0.1 event spine, Jarvis-grade LCC, multiple handovers. State is rolling but receipts are permanent.",
    confidence: "1.0",
  },
  {
    key: "wisdom",
    label: "Wisdom",
    accent: "#fcd34d",
    angle: 240,
    excerpt: "Memory is Power. Systems over Tools. The Compound Intelligence Effect. Intelligence as infrastructure, not feature.",
    confidence: "0.95",
  },
  {
    key: "horizon",
    label: "Horizon",
    accent: "#fb7185",
    angle: 300,
    excerpt: "Letters to the future. Human hopes + AGI alignment values as first-class data. The first thing we built into it is care.",
    confidence: "1.0",
  },
];

const CORE_ACCENT = "#c084fc";

export function MemoryPalace() {
  const [focused, setFocused] = useState<VaultKey | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);

  const current = focused ? VAULTS.find((v) => v.key === focused)! : null;

  const handleOrbClick = (key: VaultKey) => {
    setFocused((prev) => (prev === key ? null : key));
    setVoiceActive(false);
  };

  // "Speak to focus" — L99 voice-reactive simulation.
  // In a fuller build this would call Web Speech API + real gateway recall.
  const handleSpeak = () => {
    setVoiceActive(true);
    // Cycle focus through orbs in a pleasing wave (simulates intent surfacing relevant memory)
    const order: VaultKey[] = ["wisdom", "strategic", "operational", "technical", "creative", "horizon"];
    let i = 0;
    const interval = setInterval(() => {
      setFocused(order[i]);
      i = (i + 1) % order.length;
      if (i === 0) {
        clearInterval(interval);
        setVoiceActive(false);
      }
    }, 420);
  };

  const reset = () => {
    setFocused(null);
    setVoiceActive(false);
  };

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* Background starfield — reuses the exact seeded component from /cosmos */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
        <Starfield seed={20260612} count={110} className="opacity-70" />
      </div>

      {/* Palace container — glassmorphic, premium, alive with 3D Queen/swarm visual layer for brand (SVG orbs on top) */}
      <div className="relative rounded-3xl border border-white/[0.08] bg-[#060609]/80 p-8 pb-10 backdrop-blur-2xl" style={{ backgroundImage: 'url(/assets/visuals/queen-premium/35.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'multiply', opacity: 0.95 }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[3px] text-white/50">LIVING MEMORY SUBSTRATE</div>
            <div className="text-3xl font-semibold tracking-tighter text-white">Starlight Memory Palace</div>
          </div>
          <button
            onClick={reset}
            className="rounded-full border border-white/10 px-4 py-1 text-xs text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            Reset focus
          </button>
        </div>

        {/* The Palace — circular orbs + central core + constellation */}
        <div className="relative mx-auto mb-8 aspect-square w-full max-w-[620px]">
          <svg
            viewBox="0 0 620 620"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {/* Subtle connecting constellation (deterministic lines) */}
            {VAULTS.map((v, idx) => {
              const next = VAULTS[(idx + 1) % VAULTS.length];
              const cx = 310;
              const cy = 310;
              const r = 205;
              const rad = (v.angle * Math.PI) / 180;
              const radNext = (next.angle * Math.PI) / 180;
              const x1 = cx + Math.cos(rad) * r;
              const y1 = cy + Math.sin(rad) * r;
              const x2 = cx + Math.cos(radNext) * r;
              const y2 = cy + Math.sin(radNext) * r;
              const isActive = focused === v.key || focused === next.key;
              return (
                <line
                  key={`line-${idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isActive ? v.accent : "#ffffff"}
                  strokeOpacity={isActive ? 0.45 : 0.09}
                  strokeWidth={isActive ? 1.5 : 0.75}
                />
              );
            })}

            {/* Core — central Starlight Orchestrator / memory heart */}
            <g>
              <circle
                cx={310}
                cy={310}
                r={42}
                fill="none"
                stroke={CORE_ACCENT}
                strokeWidth="1"
                opacity={focused ? 0.9 : 0.6}
                className={focused ? "animate-brain-core" : ""}
              />
              <circle
                cx={310}
                cy={310}
                r={28}
                fill={CORE_ACCENT}
                opacity={focused ? 0.25 : 0.15}
                className="animate-brain-core"
              />
              <text
                x={310}
                y={315}
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize="11"
                fontFamily="var(--font-inter)"
                letterSpacing="1"
                opacity={0.85}
              >
                CORE
              </text>
            </g>
          </svg>

          {/* Orbs — positioned absolutely over the SVG ring for rich glass + interaction */}
          {VAULTS.map((vault) => {
            const cx = 310;
            const cy = 310;
            const r = 205;
            const rad = (vault.angle * Math.PI) / 180;
            const left = ((cx + Math.cos(rad) * r) / 620) * 100;
            const top = ((cy + Math.sin(rad) * r) / 620) * 100;

            const isFocused = focused === vault.key;
            const isVoice = voiceActive && focused === vault.key;

            return (
              <button
                key={vault.key}
                onClick={() => handleOrbClick(vault.key)}
                className={`group absolute flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-xl transition-all ${
                  isFocused
                    ? "z-20 scale-110 border-white/40 shadow-2xl"
                    : "border-white/10 hover:border-white/25 hover:scale-[1.03]"
                }`}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  background: `radial-gradient(circle at 40% 30%, rgba(255,255,255,0.06), rgba(6,6,9,0.75))`,
                  boxShadow: isFocused
                    ? `0 0 0 1px ${vault.accent}40, 0 25px 60px -15px rgba(0,0,0,0.6)`
                    : `0 0 0 1px ${vault.accent}20`,
                }}
                aria-label={`Focus ${vault.label} vault`}
              >
                {/* Orb glow layers — reuses glow-pulse spirit */}
                <div
                  className={`absolute inset-0 rounded-full transition ${isFocused || isVoice ? "animate-glow-pulse" : ""}`}
                  style={{ background: vault.accent, opacity: isFocused ? 0.18 : 0.06, filter: "blur(28px)" }}
                />
                <div
                  className="absolute inset-[6px] rounded-full"
                  style={{ background: vault.accent, opacity: isFocused ? 0.35 : 0.12 }}
                />

                {/* Label + subtle pulse indicator */}
                <div className="relative z-10 text-center">
                  <div
                    className="text-[10px] font-medium tracking-[1.5px] text-white/80"
                    style={{ color: isFocused ? "#fff" : vault.accent }}
                  >
                    {vault.label.toUpperCase()}
                  </div>
                  <div className="mt-0.5 text-[9px] text-white/40 group-hover:text-white/60">{vault.confidence}</div>
                </div>

                {/* Extra life when voice or focus */}
                {(isFocused || isVoice) && (
                  <div
                    className="absolute inset-0 rounded-full border"
                    style={{ borderColor: vault.accent, opacity: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Interactive HUD — glass, alive, Jarvis */}
        <div className="mx-auto max-w-[620px] rounded-2xl border border-white/[0.08] bg-black/40 p-5 text-sm backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[2px] text-white/50">
              <div>Built on SIP</div>
              <div className="h-px w-3 bg-white/20" />
              <div>6 VAULTS LIVE</div>
              <div className="h-px w-3 bg-white/20" />
              <div>RRF 61.5%</div>
            </div>

            <button
              onClick={handleSpeak}
              disabled={voiceActive}
              className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-1 text-xs text-white/80 transition hover:bg-white/5 disabled:opacity-60"
            >
              {voiceActive ? "LISTENING..." : "SPEAK TO FOCUS"}
              <span aria-hidden>⟐</span>
            </button>
          </div>

          {/* Focused excerpt panel — real vault language */}
          <div className="mt-4 min-h-[92px] rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 text-[13px] leading-relaxed text-white/85">
            {current ? (
              <>
                <div className="mb-1 text-[10px] uppercase tracking-[2px]" style={{ color: current.accent }}>
                  {current.label} VAULT — {current.confidence} CONFIDENCE
                </div>
                <div>{current.excerpt}</div>
              </>
            ) : (
              <div className="text-white/50">
                Tap any orb to surface memory. Or speak an intention. The palace responds.
                <div className="mt-2 text-[10px] text-white/30">This is the L99 seed. Full 3D r3f + real gateway data in the 21-person build.</div>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] text-white/40">
            <div>138 agent definitions • local-first • six semantic vaults</div>
            <a
              href="https://github.com/frankxai/Starlight-Intelligence-System"
              target="_blank"
              className="hover:text-white/70"
            >
              Built on SIP →
            </a>
          </div>
        </div>

        <div className="mx-auto mt-4 max-w-[620px] text-center text-[10px] text-white/35">
          Obsidian is live now (open <span className="font-mono">memory/</span> as vault + use the new starlight-network.base). 
          This is the custom visualization path. See the full team brief in docs/superpowers/specs/.
        </div>
      </div>
    </div>
  );
}
