"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import {
  ECOSYSTEM_NODES,
  ECOSYSTEM_LINKS,
  ACCENT_HEX,
  GITHUB_ORG,
  type EcosystemNode,
} from "@/lib/home/ecosystem";

const nodeById = new Map(ECOSYSTEM_NODES.map((n) => [n.id, n]));

function ConstellationSvg({ reduced }: { reduced: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="hub-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Wires */}
      {ECOSYSTEM_LINKS.map(([a, b], i) => {
        const na = nodeById.get(a)!;
        const nb = nodeById.get(b)!;
        return (
          <motion.line
            key={`${a}-${b}`}
            x1={na.x}
            y1={na.y}
            x2={nb.x}
            y2={nb.y}
            stroke={ACCENT_HEX[nb.accent]}
            strokeWidth={0.22}
            strokeOpacity={0.4}
            initial={reduced ? undefined : { pathLength: 0, opacity: 0 }}
            whileInView={reduced ? undefined : { pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{
              duration: 1.1,
              delay: 0.15 + i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        );
      })}

      {/* Hub glow */}
      <circle cx={50} cy={50} r={14} fill="url(#hub-glow)" />

      {/* Nodes */}
      {ECOSYSTEM_NODES.map((n, i) => {
        const isHub = n.tier === "hub";
        const r = isHub ? 2.6 : n.tier === "core" ? 1.5 : 1;
        return (
          <motion.g
            key={n.id}
            initial={reduced ? undefined : { scale: 0, opacity: 0 }}
            whileInView={reduced ? undefined : { scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{
              type: "spring",
              stiffness: 190,
              damping: 18,
              delay: 0.3 + i * 0.05,
            }}
            style={{ transformOrigin: `${n.x}px ${n.y}px` }}
          >
            <circle
              cx={n.x}
              cy={n.y}
              r={r + 1.1}
              fill="none"
              stroke={ACCENT_HEX[n.accent]}
              strokeWidth={0.15}
              strokeOpacity={0.4}
            />
            <circle cx={n.x} cy={n.y} r={r} fill={ACCENT_HEX[n.accent]}>
              {!reduced && !isHub && (
                <animate
                  attributeName="opacity"
                  values="0.65;1;0.65"
                  dur={`${3 + (i % 4)}s`}
                  repeatCount="indefinite"
                />
              )}
            </circle>
            <text
              x={n.x}
              y={n.y - (r + 2.3)}
              textAnchor="middle"
              fontSize={isHub ? 2.4 : 1.9}
              fontWeight={isHub ? 600 : 500}
              fill={isHub ? "#ffffff" : "rgba(226,232,240,0.72)"}
              style={{ fontFamily: "var(--font-jbmono), monospace" }}
            >
              {n.tier === "hub" ? "SIS" : n.label}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}

function RepoCard({ node, index }: { node: EcosystemNode; index: number }) {
  const hex = ACCENT_HEX[node.accent];
  return (
    <motion.a
      href={`${GITHUB_ORG}/${node.repo}`}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-panel group flex min-h-11 flex-col gap-2 rounded-xl p-4 transition-std hover:border-white/[0.16] hover:bg-white/[0.05]"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.55, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-mono text-[13px] font-medium text-white">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: hex, boxShadow: `0 0 8px ${hex}` }}
            aria-hidden="true"
          />
          {node.label}
        </span>
        <ArrowUpRight
          size={14}
          className="shrink-0 text-slate-500 transition-micro group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
          aria-hidden="true"
        />
      </div>
      <p className="text-[13px] leading-6 text-slate-400">{node.desc}</p>
    </motion.a>
  );
}

export function EcosystemConstellation() {
  const reduced = useReducedMotion() ?? false;
  const hub = ECOSYSTEM_NODES.find((n) => n.tier === "hub")!;
  const rest = ECOSYSTEM_NODES.filter((n) => n.tier !== "hub");

  return (
    <div>
      {/* Wired constellation — desktop */}
      <div className="relative mx-auto hidden aspect-[10/7] max-w-3xl md:block lg:max-w-4xl">
        <ConstellationSvg reduced={reduced} />
      </div>

      {/* Hub card */}
      <div className="mx-auto mt-4 max-w-xl md:mt-8">
        <RepoCard node={hub} index={0} />
      </div>

      {/* Repo grid */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((node, i) => (
          <RepoCard key={node.id} node={node} index={i + 1} />
        ))}
      </div>
    </div>
  );
}
