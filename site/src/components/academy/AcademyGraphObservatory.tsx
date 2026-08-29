"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  PauseCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AcademyDirectedGraph, type GraphLens } from "@/components/academy/AcademyDirectedGraph";
import type {
  AcademyGraphModel,
  ObservatoryGraph,
  ObservatoryMode,
  ObservatoryNode,
} from "@/lib/academy-graphs";

const REPOSITORY_URL = "https://github.com/frankxai/Starlight-Intelligence-System";
const SOURCE_REVISION = "94993ca4626fceb5dce9f482b54240f683bb5f20";
const GRAPH_TABS: Array<{ id: ObservatoryMode; label: string }> = [
  { id: "competency", label: "Capability path" },
  { id: "execution", label: "Execution topology" },
];

const LENSES: Array<{ id: GraphLens; label: string; description: string }> = [
  { id: "structure", label: "Structure", description: "Every typed object and relation" },
  { id: "proof", label: "Proof", description: "Selected upstream and downstream lineage" },
  { id: "authority", label: "Authority", description: "Consequential action and human control" },
  { id: "provenance", label: "Provenance", description: "Sourced, derived, and hypothesized claims" },
];

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function lineage(graph: ObservatoryGraph, selectedId: string) {
  const upstream = new Set([selectedId]);
  const downstream = new Set([selectedId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const edge of graph.edges) {
      if (upstream.has(edge.to) && !upstream.has(edge.from)) {
        upstream.add(edge.from);
        changed = true;
      }
    }
  }
  changed = true;
  while (changed) {
    changed = false;
    for (const edge of graph.edges) {
      if (downstream.has(edge.from) && !downstream.has(edge.to)) {
        downstream.add(edge.to);
        changed = true;
      }
    }
  }
  return [...new Set([...upstream, ...downstream])];
}

function TruthBadge({ origin }: { origin: ObservatoryNode["recordOrigin"] }) {
  const classes =
    origin === "fixture"
      ? "border-emerald-300/25 bg-emerald-300/[0.07] text-emerald-200"
      : origin === "schema-derived"
        ? "border-violet-300/25 bg-violet-300/[0.07] text-violet-200"
        : "border-fuchsia-300/25 bg-fuchsia-300/[0.07] text-fuchsia-200";
  return <span className={`rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] ${classes}`}>{origin}</span>;
}

function ClaimBadge({ state }: { state: ObservatoryNode["claimState"] }) {
  const classes =
    state === "sourced"
      ? "border-cyan-300/25 bg-cyan-300/[0.07] text-cyan-200"
      : state === "hypothesized"
        ? "border-fuchsia-300/25 bg-fuchsia-300/[0.07] text-fuchsia-200"
        : state === "derived"
          ? "border-slate-300/20 bg-slate-300/[0.06] text-slate-300"
          : "border-white/[0.08] bg-white/[0.03] text-slate-400";
  return <span className={`rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] ${classes}`}>{state}</span>;
}

function Inspector({ node, copied, onCopy }: { node: ObservatoryNode; copied: boolean; onCopy: () => void }) {
  return (
    <aside className="flex min-h-[420px] flex-col rounded-[1.5rem] border border-white/[0.07] bg-white/[0.025] p-5 lg:p-6" aria-live="polite">
      <div className="flex flex-wrap gap-2">
        <TruthBadge origin={node.recordOrigin} />
        <ClaimBadge state={node.claimState} />
      </div>
      <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">{humanize(node.kind)}</p>
      <h3 className="mt-3 font-serif text-3xl font-semibold leading-[1.02] tracking-[-0.025em] text-white">{node.name}</h3>
      <p className="mt-4 text-sm leading-6 text-slate-400">{node.description}</p>

      <dl className="mt-7 grid gap-4 border-t border-white/[0.07] pt-5 text-xs">
        <div className="flex items-start justify-between gap-5">
          <dt className="text-slate-400">Lifecycle</dt>
          <dd className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-200">{node.lifecycle}</dd>
        </div>
        {node.executor && (
          <div className="flex items-start justify-between gap-5">
            <dt className="text-slate-400">Executor</dt>
            <dd className="text-right font-mono text-[10px] uppercase tracking-[0.12em] text-slate-200">{humanize(node.executor)}</dd>
          </div>
        )}
        {node.sideEffectClass && (
          <div className="flex items-start justify-between gap-5">
            <dt className="text-slate-400">Side effect</dt>
            <dd className={node.sideEffectClass === "consequential" ? "font-mono text-[10px] uppercase tracking-[0.12em] text-amber-200" : "font-mono text-[10px] uppercase tracking-[0.12em] text-slate-200"}>
              {node.sideEffectClass}
            </dd>
          </div>
        )}
        {node.retry && (
          <div className="flex items-start justify-between gap-5">
            <dt className="text-slate-400">Recovery</dt>
            <dd className="text-right font-mono text-[10px] leading-5 text-slate-200">
              {node.retry.maxAttempts} attempt{node.retry.maxAttempts === 1 ? "" : "s"} · {node.retry.backoff}<br />
              {node.retry.idempotent ? "idempotent" : "human decision — no replay"}
            </dd>
          </div>
        )}
        {node.toolScopes && (
          <div>
            <dt className="text-slate-400">Tool scopes</dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {node.toolScopes.length === 0 ? (
                <span className="font-mono text-[10px] text-slate-400">none</span>
              ) : (
                node.toolScopes.map((scope) => <span key={scope} className="rounded-md bg-black/25 px-2 py-1 font-mono text-[9px] text-cyan-100/80">{scope}</span>)
              )}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-auto pt-7">
        <p className="break-all font-mono text-[9px] leading-4 text-slate-400">{node.id}</p>
        <button type="button" onClick={onCopy} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/[0.09] px-3 py-2 text-[11px] font-semibold text-slate-300 transition-micro hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "URN copied" : "Copy stable URN"}
        </button>
      </div>
    </aside>
  );
}

export function AcademyGraphObservatory({ model }: { model: AcademyGraphModel }) {
  const [mode, setMode] = useState<ObservatoryMode>("competency");
  const [lens, setLens] = useState<GraphLens>("proof");
  const [selectedId, setSelectedId] = useState(model.competency.nodes[0].id);
  const [copied, setCopied] = useState(false);
  const [runState, setRunState] = useState<"idle" | "running" | "awaiting-human">("idle");
  const [runIndex, setRunIndex] = useState(-1);
  const runSequence = useRef(0);

  const graph = mode === "competency" ? model.competency : model.execution;
  const selectedNode = graph.nodes.find((node) => node.id === selectedId) ?? graph.nodes[0];
  const activeNodeIds = useMemo(
    () => (lens === "proof" ? lineage(graph, selectedNode.id) : graph.nodes.map((node) => node.id)),
    [graph, lens, selectedNode.id],
  );

  useEffect(() => {
    if (runState !== "running" || runIndex >= 2) return;
    const timer = window.setTimeout(() => {
      const nextIndex = runIndex + 1;
      setRunIndex(nextIndex);
      setSelectedId(model.execution.nodes[nextIndex].id);
      if (nextIndex >= 2) setRunState("awaiting-human");
    }, 820);
    return () => window.clearTimeout(timer);
  }, [model.execution.nodes, runIndex, runState]);

  const changeMode = (nextMode: ObservatoryMode) => {
    runSequence.current += 1;
    setRunIndex(-1);
    setRunState("idle");
    setMode(nextMode);
    setSelectedId((nextMode === "competency" ? model.competency : model.execution).nodes[0].id);
    if (nextMode === "competency" && lens === "authority") setLens("proof");
  };

  const changeLens = (nextLens: GraphLens) => {
    runSequence.current += 1;
    setRunIndex(-1);
    setRunState("idle");
    setLens(nextLens);
    if (nextLens === "authority" && mode !== "execution") {
      setMode("execution");
      const gate = model.execution.nodes.find((node) => node.sideEffectClass === "consequential");
      setSelectedId(gate?.id ?? model.execution.nodes[0].id);
    }
  };

  const startRun = (bringIntoView: boolean) => {
    const sequence = runSequence.current + 1;
    runSequence.current = sequence;
    setMode("execution");
    setLens("authority");
    setRunIndex(-1);
    setRunState("idle");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (bringIntoView) {
      const panel = document.getElementById("academy-graph-panel");
      panel?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      panel?.focus({ preventScroll: true });
    }
    const launch = () => {
      if (runSequence.current !== sequence) return;
      if (reduceMotion) {
        setRunIndex(2);
        setSelectedId(model.execution.nodes[2].id);
        setRunState("awaiting-human");
      } else {
        setRunIndex(0);
        setSelectedId(model.execution.nodes[0].id);
        setRunState("running");
      }
    };
    if (bringIntoView && !reduceMotion) window.setTimeout(launch, 520);
    else launch();
  };

  const showProvenance = () => {
    runSequence.current += 1;
    setRunIndex(-1);
    setRunState("idle");
    setMode("competency");
    setLens("provenance");
    setSelectedId(model.competency.nodes[0].id);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const panel = document.getElementById("academy-graph-panel");
    panel?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    panel?.focus({ preventScroll: true });
  };

  const resetRun = () => {
    runSequence.current += 1;
    setRunIndex(-1);
    setRunState("idle");
    setSelectedId(model.execution.nodes[0].id);
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(selectedNode.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const maxSpend = new Intl.NumberFormat("en", {
    style: "currency",
    currency: model.mission.bounds.currency,
    maximumFractionDigits: 0,
  }).format(model.mission.bounds.amountMinor / 100);

  return (
    <div className="overflow-hidden">
      <section className="relative border-b border-white/[0.06] px-5 pb-16 pt-16 sm:px-8 lg:px-10 lg:pb-20 lg:pt-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(124,92,255,.13),transparent_29%),radial-gradient(circle_at_18%_80%,rgba(34,211,238,.07),transparent_24%)]" />
        <div className="relative mx-auto max-w-[1480px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-200">Open Academy Commons</span>
            <span className="rounded-full border border-white/[0.08] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">fixture-backed · read only</span>
            <span className="rounded-full border border-white/[0.08] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">{model.releaseLabel}</span>
          </div>

          <div className="mt-10 grid items-end gap-10 xl:grid-cols-[minmax(0,1fr)_440px]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-violet-300">Academy Graph Observatory / 0.1</p>
              <h1 aria-label="Can this graph prove its shape?" className="mt-5 max-w-5xl font-serif text-[clamp(3.2rem,7vw,7.4rem)] font-semibold leading-[0.82] tracking-[-0.058em] text-white">
                <span className="block">Can this graph</span>{" "}
                <span className="block bg-gradient-to-r from-violet-300 via-slate-100 to-cyan-200 bg-clip-text italic text-transparent">prove its shape?</span>
              </h1>
              <p className="mt-8 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
                Inspect the smallest public path from system judgment to evidence—and trace its execution topology until the exact moment a human must decide. No agent activation. No credential theatre. No paid gate.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button type="button" onClick={() => startRun(true)} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#07070b] transition-micro hover:bg-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70">
                  <Play className="h-4 w-4" /> Preview Mission Zero <ArrowRight className="h-4 w-4" />
                </button>
                <button type="button" onClick={showProvenance} className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.025] px-5 py-3 text-sm font-semibold text-slate-200 transition-micro hover:border-white/25 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70">
                  Trace claim provenance
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/[0.08] bg-black/20">
              {[
                [String(model.competency.nodes.length + model.execution.nodes.length), "typed graph nodes"],
                [maxSpend, "maximum fixture spend"],
                ["1", "consequential human gate"],
                ["0", "active persistent agents"],
              ].map(([value, label]) => (
                <div key={label} className="border-b border-r border-white/[0.06] p-5 last:border-b-0 odd:[&:nth-last-child(-n+2)]:border-b-0 even:border-r-0">
                  <strong className="block font-serif text-3xl font-semibold text-white">{value}</strong>
                  <span className="mt-1 block font-mono text-[9px] uppercase leading-4 tracking-[0.13em] text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex max-w-5xl items-start gap-3 border-l border-amber-300/40 pl-5 text-sm leading-6 text-slate-400">
            <Sparkles className="mt-1 h-4 w-4 shrink-0 text-amber-200" />
            <p><strong className="font-semibold text-slate-200">One domain is public today:</strong> {model.academy.pathwayName}. The Observatory shows a faithful, provenance-explicit projection instead of presenting an invented forty-domain catalog as fact.</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-[1760px]">
          <div className="flex flex-col justify-between gap-7 border-b border-white/[0.07] pb-8 xl:flex-row xl:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Proof Loom / deterministic projection</p>
              <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">Four truths. Never one decorative graph.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Capability and execution remain different records. Evidence and Passport appear later as explicitly hypothetical projections—not learner state.</p>
            </div>
            <div className="inline-flex w-fit rounded-xl border border-white/[0.08] bg-white/[0.025] p-1" role="tablist" aria-label="Graph chamber">
              {GRAPH_TABS.map((item, itemIndex) => (
                <button
                  key={item.id}
                  id={`academy-tab-${item.id}`}
                  type="button"
                  role="tab"
                  aria-controls="academy-graph-panel"
                  aria-selected={mode === item.id}
                  tabIndex={mode === item.id ? 0 : -1}
                  onClick={() => changeMode(item.id)}
                  onKeyDown={(event) => {
                    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                    event.preventDefault();
                    const delta = event.key === "ArrowRight" ? 1 : -1;
                    const next = GRAPH_TABS[(itemIndex + delta + GRAPH_TABS.length) % GRAPH_TABS.length];
                    changeMode(next.id);
                    window.requestAnimationFrame(() => document.getElementById(`academy-tab-${next.id}`)?.focus());
                  }}
                  className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 ${mode === item.id ? "bg-white text-[#07070b]" : "text-slate-400 hover:text-white"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 grid gap-5 lg:grid-cols-[190px_minmax(0,1fr)] min-[1800px]:grid-cols-[190px_minmax(0,1fr)_360px]">
            <nav className="rounded-[1.5rem] border border-white/[0.07] bg-white/[0.02] p-3" aria-label="Observatory lenses">
              <p className="px-3 pb-3 pt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">Inspection lens</p>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                {LENSES.map((item) => (
                  <button key={item.id} type="button" aria-pressed={lens === item.id} onClick={() => changeLens(item.id)} className={`rounded-xl border p-3 text-left transition-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 ${lens === item.id ? "border-violet-300/35 bg-violet-300/[0.08]" : "border-transparent hover:border-white/[0.08] hover:bg-white/[0.025]"}`}>
                    <span className={`block text-xs font-semibold ${lens === item.id ? "text-white" : "text-slate-400"}`}>{item.label}</span>
                    <span className="mt-1.5 hidden text-[10px] leading-4 text-slate-400 lg:block">{item.description}</span>
                  </button>
                ))}
              </div>
              <div className="mt-5 hidden border-t border-white/[0.06] px-3 pt-5 lg:block">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-400">Line grammar</p>
                <div className="mt-3 grid gap-2 font-mono text-[9px] text-slate-400">
                  <span><i className="mr-2 inline-block w-7 border-t border-cyan-300" /> sourced</span>
                  <span><i className="mr-2 inline-block w-7 border-t border-dashed border-slate-400" /> derived</span>
                  <span><i className="mr-2 inline-block w-7 border-t border-dotted border-fuchsia-300" /> hypothesized</span>
                </div>
              </div>
            </nav>

            <div id="academy-graph-panel" role="tabpanel" aria-labelledby={`academy-tab-${mode}`} tabIndex={0} className="min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4 px-1">
                <div>
                  <p className="text-sm font-semibold text-white">{graph.name}</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-400">{graph.status} · {graph.nodes.length} nodes · {graph.edges.length} typed edges</p>
                </div>
                <div className="flex items-center gap-2"><TruthBadge origin={graph.recordOrigin} /><span className="rounded-full border border-white/[0.08] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-400">read only</span></div>
              </div>
              <AcademyDirectedGraph graph={graph} selectedId={selectedNode.id} activeNodeIds={activeNodeIds} lens={lens} runNodeId={runIndex >= 0 ? model.execution.nodes[runIndex]?.id : undefined} onSelect={setSelectedId} />
              <div role="status" aria-live="polite" className="mt-4 grid gap-3 rounded-2xl border border-white/[0.07] bg-black/20 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="flex items-start gap-3">
                  {runState === "awaiting-human" ? <PauseCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" /> : <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" />}
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {runState === "idle" && "The preview is deterministic and side-effect free."}
                      {runState === "running" && `Tracing stage ${runIndex + 1} of 3 before human authority.`}
                      {runState === "awaiting-human" && "Stopped: accountable human decision required."}
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                      {runState === "awaiting-human"
                        ? "The terminal receipt remains unreachable here. No approval, evidence verification, competence decision, or credential was created."
                        : `${model.mission.baseline}. No authority transfers between nodes.`}
                    </p>
                  </div>
                </div>
                {runState === "idle" ? (
                  <button type="button" onClick={() => startRun(false)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.1] px-3 py-2 text-[11px] font-semibold text-slate-200 transition-micro hover:border-cyan-300/30 hover:text-white"><Play className="h-3.5 w-3.5" /> Trace preview</button>
                ) : (
                  <button type="button" onClick={resetRun} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.1] px-3 py-2 text-[11px] font-semibold text-slate-200 transition-micro hover:border-white/25 hover:text-white"><RotateCcw className="h-3.5 w-3.5" /> Reset</button>
                )}
              </div>
            </div>

            <div className="lg:col-start-2 min-[1800px]:col-start-auto">
              <Inspector node={selectedNode} copied={copied} onCopy={copyId} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.015] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-[1480px] gap-12 xl:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300">The economic law</p>
            <h2 className="mt-4 max-w-2xl font-serif text-5xl font-semibold leading-[0.95] tracking-[-0.045em] text-white sm:text-6xl">Knowledge, proof, and portability stay free.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400">Payment may buy managed operations—compute, hosting, isolation, integrations, backups, or service levels. It never buys a different assessment standard, credential eligibility, or ownership of the learner’s proof.</p>
            <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07]">
              {[
                [model.openAccess.completePathWithoutPayment, "Complete path"],
                [model.openAccess.localOrByokExecutionSupported, "Local / BYOK"],
                [model.openAccess.credentialEligibilityWithoutPayment, "Credential eligibility"],
                [model.openAccess.exportWithoutPayment, "Passport export"],
              ].map(([passed, label]) => (
                <div key={String(label)} className="bg-[#09090e] p-4">
                  <Check className={`h-4 w-4 ${passed ? "text-emerald-300" : "text-rose-300"}`} />
                  <span className="mt-3 block text-xs font-semibold text-slate-200">{label}</span>
                  <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.12em] text-slate-400">without payment</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-emerald-300/15 bg-emerald-300/[0.035] p-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-300">Free core · {model.openAccess.freeCoreIncludes.length} elements</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {model.openAccess.freeCoreIncludes.map((item) => (
                  <div key={item} className="flex items-center gap-2 border-b border-white/[0.05] py-2 text-xs text-slate-300"><Check className="h-3.5 w-3.5 shrink-0 text-emerald-300" /> {humanize(item)}</div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-violet-300/15 bg-violet-300/[0.035] p-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-violet-300">Optional managed operations</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {model.openAccess.paidDifferentiators.map((item) => (
                  <span key={item} className="rounded-lg border border-white/[0.07] bg-black/15 px-2.5 py-2 text-[10px] text-slate-400">{humanize(item)}</span>
                ))}
              </div>
              <p className="mt-6 border-t border-white/[0.07] pt-5 text-xs leading-5 text-slate-400">Commerce is deliberately parked in this release. No checkout, entitlement graph, or autonomous payment authority is implemented.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[1480px]">
          <div className="max-w-4xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fuchsia-300">Projection boundary</p>
            <h2 className="mt-4 font-serif text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">What comes next is visible—and not yet real.</h2>
            <p className="mt-5 text-base leading-7 text-slate-400">The compiler can state the required evidence and Passport laws. It cannot pretend that a learner completed them. These two lanes remain hypothetical until canonical records are materialized.</p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <article className="rounded-[1.5rem] border border-fuchsia-300/15 bg-fuchsia-300/[0.025] p-6 lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fuchsia-200">Evidence lineage preview</p><TruthBadge origin={model.previews.evidence.recordOrigin} /></div>
              <h3 className="mt-6 font-serif text-3xl font-semibold text-white">Four artifacts. One human decision.</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{model.previews.evidence.state}</p>
              <div className="mt-6 grid grid-cols-2 gap-2">
                {model.previews.evidence.artifacts.map((artifact, index) => <div key={artifact} className="rounded-xl border border-white/[0.07] bg-black/15 p-3"><span className="font-mono text-[9px] text-slate-400">0{index + 1}</span><span className="mt-2 block text-xs font-semibold text-slate-200">{humanize(artifact)}</span></div>)}
              </div>
              <p className="mt-6 border-l border-amber-300/35 pl-4 text-xs leading-5 text-slate-400">{model.previews.evidence.law}</p>
            </article>
            <article className="rounded-[1.5rem] border border-fuchsia-300/15 bg-fuchsia-300/[0.025] p-6 lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fuchsia-200">Passport projection preview</p><TruthBadge origin={model.previews.passport.recordOrigin} /></div>
              <h3 className="mt-6 font-serif text-3xl font-semibold text-white">Purpose-bound by default.</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{model.previews.passport.projection}. No private learner fixture is exposed.</p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-emerald-300">Requires</p><ul className="mt-3 grid gap-2 text-xs text-slate-300">{model.previews.passport.requires.map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />{humanize(item)}</li>)}</ul></div>
                <div><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-rose-300">Excludes</p><ul className="mt-3 grid gap-2 text-xs text-slate-400">{model.previews.passport.excludes.map((item) => <li key={item}>— {humanize(item)}</li>)}</ul></div>
              </div>
              <p className="mt-6 border-l border-amber-300/35 pl-4 text-xs leading-5 text-slate-400">{model.previews.passport.law}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.015] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[1480px]">
          <div className="grid gap-10 xl:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">Skills before agents</p>
              <h2 className="mt-4 font-serif text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-white">The team is smaller than the ambition.</h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">{model.plugin.description}</p>
              <div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full border border-white/[0.09] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-400">v{model.plugin.version}</span><span className="rounded-full border border-white/[0.09] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-400">{model.plugin.license}</span><span className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.05] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-emerald-200">skills only</span></div>
              <div className="mt-7 grid gap-2 sm:grid-cols-2">{model.plugin.skills.map((skill, index) => <div key={skill} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/15 p-3"><span className="font-mono text-[9px] text-violet-300">0{index + 1}</span><span className="text-xs font-semibold text-slate-300">{skill}</span></div>)}</div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {model.agents.map((agent) => (
                <article key={agent.id} className="rounded-[1.5rem] border border-white/[0.07] bg-black/20 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3"><span className="font-mono text-[9px] uppercase tracking-[0.15em] text-slate-400">Reference Agent Pack · v{agent.version}</span><span className="rounded-full border border-amber-300/20 bg-amber-300/[0.05] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-amber-200">not activated</span></div>
                  <h3 className="mt-6 font-serif text-3xl font-semibold text-white">{humanize(agent.id)}</h3>
                  <p className="mt-3 text-xs leading-5 text-slate-400">{agent.description}</p>
                  <div className="mt-6 border-t border-white/[0.06] pt-5"><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-rose-300">Denied authority</p><div className="mt-3 flex flex-wrap gap-1.5">{agent.deniedAuthority.slice(0, 6).map((item) => <span key={item} className="rounded-md bg-rose-300/[0.045] px-2 py-1 font-mono text-[8px] text-rose-100/60">{item}</span>)}</div></div>
                </article>
              ))}
              <div className="md:col-span-2 rounded-[1.5rem] border border-emerald-300/15 bg-emerald-300/[0.025] p-5 text-xs leading-5 text-slate-400"><strong className="text-emerald-200">Mission Zero design verdict:</strong> no persistent agent is necessary. The experimental reference topology is one skill, one temporary verifier, one human gate, and one deterministic renderer.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-[1480px] gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300">Contract gates</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.035em] text-white">Conformance, not efficacy.</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">Passing these fixture gates proves structural contract claims. It does not prove a learner outcome, a completed Mission Zero run, an issued credential, or a production agent deployment.</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">{[...model.competency.qualityGates, ...model.execution.qualityGates].map((gate) => { const matchesExpectation = gate.value === gate.expected; return <div key={gate.label} className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[10px] leading-4 text-slate-400"><Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${matchesExpectation ? "text-emerald-300" : "text-rose-300"}`} /><span>{humanize(gate.label)}: <strong className="font-mono text-slate-200">{String(gate.value)}</strong><span className="block text-slate-400">expected {String(gate.expected)}</span></span></div>; })}</div>
          </div>
          <div className="rounded-[1.5rem] border border-white/[0.07] bg-black/20 p-6">
            <div className="flex items-center justify-between gap-4"><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">Canonical public inputs</p><span className="font-mono text-[9px] text-slate-400">{model.modelVersion}</span></div>
            <div className="mt-5 grid gap-2">
              {model.sources.map((source) => (
                <a key={source.path} href={`${REPOSITORY_URL}/blob/${SOURCE_REVISION}/${source.path}`} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition-micro hover:border-cyan-300/25 hover:bg-cyan-300/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">
                  <span><strong className="block text-xs font-semibold text-slate-200">{source.label}</strong><span className="mt-1 block break-all font-mono text-[8px] leading-4 text-slate-400">{source.path}</span></span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 transition-micro group-hover:text-cyan-200" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
