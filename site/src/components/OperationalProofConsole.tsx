"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import {
  Activity,
  BadgeCheck,
  Database,
  FileCheck2,
  GitBranch,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ProofLane = {
  label: string;
  value: string;
  state: string;
  icon: LucideIcon;
  tone: string;
};

const PROOF_LANES: ProofLane[] = [
  {
    label: "Memory",
    value: "6 vaults",
    state: "context locked",
    icon: Database,
    tone: "text-cyan-600",
  },
  {
    label: "Trace",
    value: "run graph",
    state: "source kept",
    icon: GitBranch,
    tone: "text-blue-600",
  },
  {
    label: "Evals",
    value: "0.97 score",
    state: "evidence kept",
    icon: Activity,
    tone: "text-amber-600",
  },
  {
    label: "Policy",
    value: "gate pass",
    state: "operator held",
    icon: ShieldCheck,
    tone: "text-emerald-600",
  },
  {
    label: "Release",
    value: "READY",
    state: "rebuildable",
    icon: FileCheck2,
    tone: "text-rose-600",
  },
];

const TRACE_EVENTS = [
  ["00:00", "intent captured", "source: operator"],
  ["00:12", "memory recall", "semantic + temporal"],
  ["00:43", "eval scored", "policy and provenance"],
  ["01:04", "gate cleared", "human review held"],
  ["01:28", "deployment ready", "manifest + source linked"],
];

const FLOW_NODES = [
  { x: 58, y: 92, label: "Memory", color: "#2563eb" },
  { x: 154, y: 58, label: "Trace", color: "#0891b2" },
  { x: 256, y: 92, label: "Eval", color: "#d97706" },
  { x: 354, y: 58, label: "Gate", color: "#059669" },
  { x: 452, y: 92, label: "Release", color: "#e11d48" },
];

export function OperationalProofConsole() {
  const rootRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const figureTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.58, ease: [0.22, 1, 0.36, 1] as const };
  const cardTransition = (delay: number) =>
    reducedMotion
      ? { duration: 0 }
      : { duration: 0.44, ease: [0.22, 1, 0.36, 1] as const, delay };

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.set(".sis-trace-line", {
        strokeDasharray: 240,
        strokeDashoffset: 240,
      });

      gsap.to(".sis-trace-line", {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: "power3.out",
        stagger: 0.16,
        repeat: -1,
        repeatDelay: 2.2,
      });

      gsap.to(".sis-sweep", {
        xPercent: 118,
        duration: 3.8,
        ease: "power2.inOut",
        repeat: -1,
        repeatDelay: 0.7,
      });

      gsap.to(".sis-proof-dot", {
        scale: 1.36,
        opacity: 1,
        duration: 0.72,
        ease: "power2.inOut",
        stagger: 0.18,
        repeat: -1,
        yoyo: true,
        repeatDelay: 1.2,
      });
    }, root);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <motion.figure
      ref={rootRef}
      role="img"
      aria-label="Starlight release room console showing memory recall, trace, evaluation, governance gate, and deployment readiness."
      className="relative overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-950 shadow-[0_28px_90px_rgba(15,23,42,0.18)]"
      initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={figureTransition}
    >
      <div className="relative border-b border-slate-200 bg-slate-950 px-4 py-3 text-white">
        <div className="sis-sweep pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-cyan-200/20 to-transparent" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-cyan-400/12 text-cyan-200">
              <Terminal size={16} aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-[11px] uppercase text-slate-400">
                SIS release room
              </p>
              <p className="text-sm font-semibold text-white">
                Verified release run
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-md bg-emerald-400/12 px-3 py-1.5 text-xs font-semibold text-emerald-100">
            <BadgeCheck size={14} aria-hidden="true" />
            Governance clear
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-slate-200 md:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase text-slate-500">
                Release route
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                Memory becomes a release packet.
              </h2>
            </div>
            <span className="rounded-md border border-slate-200 px-2.5 py-1 font-mono text-[11px] text-slate-600">
              main
            </span>
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <svg viewBox="0 0 512 164" className="h-auto w-full" aria-hidden="true">
              <defs>
                <linearGradient id="sis-flow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="44%" stopColor="#0891b2" />
                  <stop offset="72%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
              </defs>
              <path
                className="sis-trace-line"
                d="M58 92 C104 24 118 24 154 58"
                fill="none"
                stroke="url(#sis-flow)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                className="sis-trace-line"
                d="M154 58 C194 104 214 116 256 92"
                fill="none"
                stroke="url(#sis-flow)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                className="sis-trace-line"
                d="M256 92 C300 28 318 24 354 58"
                fill="none"
                stroke="url(#sis-flow)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                className="sis-trace-line"
                d="M354 58 C394 104 416 118 452 92"
                fill="none"
                stroke="url(#sis-flow)"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {FLOW_NODES.map((node) => (
                <g key={node.label}>
                  <circle
                    className="sis-proof-dot"
                    cx={node.x}
                    cy={node.y}
                    r="14"
                    fill={node.color}
                    opacity="0.78"
                  />
                  <circle cx={node.x} cy={node.y} r="4" fill="#ffffff" />
                  <text
                    x={node.x}
                    y={node.y + 38}
                    textAnchor="middle"
                    className="fill-slate-700 font-mono text-[11px]"
                  >
                    {node.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {PROOF_LANES.map((lane, index) => {
              const Icon = lane.icon;
              return (
                <motion.div
                  key={lane.label}
                  className="rounded-lg border border-slate-200 bg-white p-3"
                  initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={cardTransition(0.16 + index * 0.06)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[11px] uppercase text-slate-500">
                        {lane.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">
                        {lane.value}
                      </p>
                    </div>
                    <Icon className={lane.tone} size={17} aria-hidden="true" />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{lane.state}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-950 p-4 text-white sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] uppercase text-slate-400">
              Release ledger
            </p>
            <span className="rounded-md bg-cyan-300/12 px-2.5 py-1 font-mono text-[11px] text-cyan-100">
              release confidence 0.97
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {TRACE_EVENTS.map(([time, title, detail], index) => (
              <motion.div
                key={`${time}-${title}`}
                className="grid grid-cols-[3rem_1fr] gap-3 rounded-md border border-white/[0.08] bg-white/[0.04] p-3"
                initial={reducedMotion ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={cardTransition(0.24 + index * 0.07)}
              >
                <span className="font-mono text-[11px] text-cyan-200">
                  {time}
                </span>
                <span>
                  <span className="block text-sm font-medium text-white">
                    {title}
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">
                    {detail}
                  </span>
                </span>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-white/[0.08] bg-white/[0.04] p-3">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-300">Operator action</span>
              <span className="font-semibold text-emerald-200">promote ready</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-sm bg-white/[0.08]">
              <div className="h-full w-[91%] bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300" />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              State sequence: recall, trace, score, gate, then release.
            </p>
          </div>
        </div>
      </div>
    </motion.figure>
  );
}
