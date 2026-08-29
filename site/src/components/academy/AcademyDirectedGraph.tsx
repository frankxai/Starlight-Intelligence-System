"use client";

import { useId } from "react";
import type { ObservatoryGraph, ObservatoryNode } from "@/lib/academy-graphs";

export type GraphLens = "structure" | "proof" | "authority" | "provenance";

type Point = { x: number; y: number };

const CAPABILITY_LAYOUT: Record<string, Point> = {
  competency: { x: 88, y: 205 },
  skill: { x: 268, y: 205 },
  mission: { x: 448, y: 205 },
  artifact_type: { x: 628, y: 205 },
  evidence_requirement: { x: 808, y: 205 },
  rubric: { x: 988, y: 205 },
  plugin: { x: 268, y: 62 },
  opportunity: { x: 88, y: 348 },
};

const EXECUTION_LAYOUT: Point[] = [
  { x: 105, y: 205 },
  { x: 385, y: 205 },
  { x: 665, y: 205 },
  { x: 945, y: 205 },
];

function splitLabel(value: string) {
  if (value.length <= 22) return [value];
  const words = value.split(" ");
  const lines = [""];
  for (const word of words) {
    const current = lines.at(-1) ?? "";
    if (current.length > 0 && `${current} ${word}`.length > 25 && lines.length < 2) {
      lines.push(word);
    } else {
      lines[lines.length - 1] = current ? `${current} ${word}` : word;
    }
  }
  return lines;
}

function nodePoint(graph: ObservatoryGraph, node: ObservatoryNode, index: number) {
  if (graph.mode === "competency") return CAPABILITY_LAYOUT[node.kind] ?? { x: 90 + index * 135, y: 205 };
  return EXECUTION_LAYOUT[index] ?? { x: 105 + index * 280, y: 205 };
}

function NodeGlyph({ node, x, y, active }: { node: ObservatoryNode; x: number; y: number; active: boolean }) {
  const stroke = node.sideEffectClass === "consequential" ? "#fbbf24" : active ? "#67e8f9" : "#a78bfa";
  const props = { fill: "none", stroke, strokeWidth: 1.8, vectorEffect: "non-scaling-stroke" as const };
  const cx = x - 49;
  const cy = y - 28;

  switch (node.kind) {
    case "competency":
      return <polygon points={`${cx},${cy - 10} ${cx + 4},${cy - 4} ${cx + 11},${cy} ${cx + 4},${cy + 4} ${cx},${cy + 11} ${cx - 4},${cy + 4} ${cx - 11},${cy} ${cx - 4},${cy - 4}`} {...props} />;
    case "skill":
      return <><circle cx={cx} cy={cy} r="10" {...props} /><circle cx={cx} cy={cy} r="4" {...props} /></>;
    case "mission":
    case "terminal":
      return <polygon points={`${cx - 10},${cy} ${cx - 5},${cy - 9} ${cx + 5},${cy - 9} ${cx + 10},${cy} ${cx + 5},${cy + 9} ${cx - 5},${cy + 9}`} {...props} />;
    case "artifact_type":
    case "task":
      return <path d={`M ${cx - 9} ${cy - 10} H ${cx + 5} L ${cx + 10} ${cy - 5} V ${cy + 10} H ${cx - 9} Z`} {...props} />;
    case "evidence_requirement":
      return <><circle cx={cx} cy={cy} r="10" {...props} /><circle cx={cx} cy={cy} r="6" {...props} /></>;
    case "rubric":
    case "checkpoint":
      return <rect x={cx - 8} y={cy - 8} width="16" height="16" transform={`rotate(45 ${cx} ${cy})`} {...props} />;
    case "plugin":
      return <><circle cx={cx - 7} cy={cy + 5} r="3" {...props} /><circle cx={cx} cy={cy - 7} r="3" {...props} /><circle cx={cx + 8} cy={cy + 5} r="3" {...props} /><path d={`M ${cx - 5} ${cy + 2} L ${cx - 1} ${cy - 4} M ${cx + 2} ${cy - 4} L ${cx + 6} ${cy + 2}`} {...props} /></>;
    case "opportunity":
      return <path d={`M ${cx - 10} ${cy + 8} A 13 13 0 0 1 ${cx + 10} ${cy + 8} M ${cx} ${cy + 8} V ${cy - 10} M ${cx - 5} ${cy - 5} L ${cx} ${cy - 10} L ${cx + 5} ${cy - 5}`} {...props} />;
    case "gate":
      return <><circle cx={cx} cy={cy} r="11" {...props} /><circle cx={cx} cy={cy} r="7" {...props} /><path d={`M ${cx} ${cy - 4} V ${cy + 3} M ${cx} ${cy + 7} V ${cy + 7}`} {...props} /></>;
    default:
      return <circle cx={cx} cy={cy} r="9" {...props} />;
  }
}

export function AcademyDirectedGraph({
  graph,
  selectedId,
  activeNodeIds,
  lens,
  runNodeId,
  onSelect,
}: {
  graph: ObservatoryGraph;
  selectedId: string;
  activeNodeIds: string[];
  lens: GraphLens;
  runNodeId?: string;
  onSelect: (id: string) => void;
}) {
  const markerId = useId().replaceAll(":", "");
  const active = new Set(activeNodeIds);
  const points = new Map(
    graph.nodes.map((node, index) => [node.id, nodePoint(graph, node, index)]),
  );

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-[#08080d] shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-45" />
      <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-violet-500/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full bg-cyan-400/[0.05] blur-3xl" />
      <svg
        className="relative hidden h-auto w-full xl:block"
        viewBox="0 0 1080 420"
        role="group"
        aria-labelledby={`${markerId}-title`}
        aria-describedby={`${markerId}-description ${markerId}-semantic`}
      >
        <title id={`${markerId}-title`}>{graph.name}</title>
        <desc id={`${markerId}-description`}>{graph.description}</desc>
        <defs>
          <marker id={`${markerId}-arrow-neutral`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
          <marker id={`${markerId}-arrow-active`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#67e8f9" />
          </marker>
          <marker id={`${markerId}-arrow-approval`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
          </marker>
        </defs>

        {graph.edges.map((edge) => {
          const from = points.get(edge.from);
          const to = points.get(edge.to);
          if (!from || !to) return null;
          const isActive = active.has(edge.from) && active.has(edge.to);
          const isRunEdge = graph.mode === "execution" && runNodeId === edge.to;
          const stroke = edge.relation === "approval" ? "#fbbf24" : isActive ? "#67e8f9" : "rgba(148,163,184,.48)";
          const marker = edge.relation === "approval" ? "approval" : isActive ? "active" : "neutral";
          const dash = edge.claimState === "hypothesized" ? "2 8" : edge.claimState === "derived" ? "8 6" : undefined;
          const sameRow = from.y === to.y;
          const fromX = from.x + 68;
          const toX = to.x - 68;
          const path = sameRow
            ? `M ${fromX} ${from.y} L ${toX} ${to.y}`
            : `M ${from.x} ${from.y + (to.y > from.y ? 48 : -48)} C ${from.x + 78} ${from.y}, ${to.x - 78} ${to.y}, ${to.x} ${to.y + (to.y > from.y ? -48 : 48)}`;
          const labelX = sameRow ? (fromX + toX) / 2 : (from.x + to.x) / 2;
          const labelY = sameRow ? from.y - 12 : (from.y + to.y) / 2 - 4;
          return (
            <g key={edge.id} className={isRunEdge ? "academy-run-edge" : undefined}>
              <path
                d={path}
                fill="none"
                stroke={stroke}
                strokeWidth={isActive ? 2 : 1.2}
                strokeDasharray={dash}
                strokeLinecap="round"
                markerEnd={`url(#${markerId}-arrow-${marker})`}
                vectorEffect="non-scaling-stroke"
              />
              <rect x={labelX - 43} y={labelY - 10} width="86" height="19" rx="9.5" fill="#08080d" stroke="rgba(255,255,255,.06)" />
              <text x={labelX} y={labelY + 3} textAnchor="middle" fill={isActive ? "#e2e8f0" : "#94a3b8"} className="font-mono" fontSize="9">
                {edge.relation.replaceAll("_", " ")}
              </text>
            </g>
          );
        })}

        {graph.nodes.map((node, index) => {
          const point = points.get(node.id) ?? nodePoint(graph, node, index);
          const isSelected = node.id === selectedId;
          const isActive = active.has(node.id);
          const isRunNode = node.id === runNodeId;
          const consequential = node.sideEffectClass === "consequential";
          const authorityDimmed = lens === "authority" && !consequential;
          const lines = splitLabel(node.name);
          return (
            <g
              key={node.id}
              role="button"
              tabIndex={0}
              aria-label={`${node.kind.replaceAll("_", " ")}: ${node.name}. ${node.claimState}.`}
              aria-pressed={isSelected}
              onClick={() => onSelect(node.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(node.id);
                }
              }}
              className="cursor-pointer outline-none focus-visible:[&>rect:first-of-type]:stroke-white"
              opacity={authorityDimmed ? 0.28 : isActive || lens === "structure" || lens === "provenance" ? 1 : 0.42}
            >
              {isRunNode && <circle cx={point.x} cy={point.y} r="75" fill="none" stroke={consequential ? "rgba(251,191,36,.42)" : "rgba(103,232,249,.36)"} strokeWidth="1" className="academy-run-pulse" />}
              <rect
                x={point.x - 68}
                y={point.y - 50}
                width="136"
                height="100"
                rx="16"
                fill={isSelected ? "rgba(103,232,249,.07)" : consequential ? "rgba(251,191,36,.045)" : "rgba(255,255,255,.025)"}
                stroke={isSelected ? "rgba(103,232,249,.7)" : consequential ? "rgba(251,191,36,.52)" : "rgba(255,255,255,.1)"}
                strokeWidth={isSelected || consequential ? 1.5 : 1}
                vectorEffect="non-scaling-stroke"
              />
              {consequential && <rect x={point.x - 73} y={point.y - 55} width="146" height="110" rx="20" fill="none" stroke="rgba(251,191,36,.18)" strokeWidth="1" />}
              <NodeGlyph node={node} x={point.x} y={point.y} active={isActive} />
              <text x={point.x - 25} y={point.y - 37} fill="#94a3b8" className="font-mono" fontSize="8.5" letterSpacing=".08em">
                {node.kind.replaceAll("_", " ").toUpperCase()}
              </text>
              <text x={point.x} y={point.y + (lines.length === 1 ? 3 : -2)} textAnchor="middle" fill="#f8fafc" className="font-sans" fontSize="11.5" fontWeight="600">
                {lines.map((line, lineIndex) => <tspan key={line} x={point.x} dy={lineIndex === 0 ? 0 : 14}>{line}</tspan>)}
              </text>
              <text x={point.x} y={point.y + 37} textAnchor="middle" fill={node.claimState === "hypothesized" ? "#f0abfc" : node.claimState === "sourced" ? "#67e8f9" : "#94a3b8"} className="font-mono" fontSize="8.5">
                {graph.mode === "execution" ? node.executor?.replaceAll("_", " ") : `${node.claimState} · ${node.lifecycle}`}
              </text>
            </g>
          );
        })}
      </svg>

      <div id={`${markerId}-semantic`} className="sr-only">
        <h3>{graph.name} semantic graph</h3>
        <p>{graph.nodes.length} nodes:</p>
        <ul>
          {graph.nodes.map((node) => (
            <li key={node.id}>{node.id}: {node.kind}, {node.name}, {node.claimState}, {node.lifecycle}</li>
          ))}
        </ul>
        <p>{graph.edges.length} typed edges:</p>
        <ul>
          {graph.edges.map((edge) => (
            <li key={edge.id}>{edge.from} {edge.relation} {edge.to}; claim state {edge.claimState}; authority transfer {String(edge.authorityTransfer ?? false)}</li>
          ))}
        </ul>
      </div>

      <div className="relative grid gap-3 p-4 xl:hidden">
        {graph.nodes.map((node, index) => {
          const selected = node.id === selectedId;
          const runNode = node.id === runNodeId;
          return (
            <button
              type="button"
              key={node.id}
              onClick={() => onSelect(node.id)}
              aria-pressed={selected}
              className={`relative w-full rounded-2xl border p-4 text-left transition-micro ${
                selected
                  ? "border-cyan-300/50 bg-cyan-300/[0.07]"
                  : node.sideEffectClass === "consequential"
                    ? "border-amber-300/35 bg-amber-300/[0.04]"
                    : "border-white/[0.08] bg-white/[0.025]"
              }`}
            >
              {index > 0 && <span aria-hidden="true" className="absolute -top-4 left-7 h-4 w-px bg-white/15" />}
              {runNode && <span aria-hidden="true" className="absolute inset-y-3 left-0 w-px bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.8)]" />}
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400">
                {node.kind.replaceAll("_", " ")} · {graph.mode === "execution" ? node.executor?.replaceAll("_", " ") : node.claimState}
              </span>
              <span className="mt-2 block text-sm font-semibold text-white">{node.name}</span>
              {index < graph.nodes.length - 1 && graph.mode === "execution" && (
                <span className="mt-3 block font-mono text-[9px] uppercase tracking-[0.12em] text-slate-400">
                  {graph.edges[index]?.relation ?? "next"} ↓
                </span>
              )}
            </button>
          );
        })}
        <div className="mt-2 rounded-2xl border border-white/[0.08] bg-black/20 p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-300">Typed relations</p>
          <ol className="mt-3 grid gap-2">
            {graph.edges.map((edge) => {
              const from = graph.nodes.find((node) => node.id === edge.from)?.name ?? edge.from;
              const to = graph.nodes.find((node) => node.id === edge.to)?.name ?? edge.to;
              return <li key={edge.id} className="text-[11px] leading-5 text-slate-400"><span className="text-slate-200">{from}</span> <span className="font-mono text-[9px] text-cyan-200">{edge.relation.replaceAll("_", " ")}</span> <span className="text-slate-200">{to}</span></li>;
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
