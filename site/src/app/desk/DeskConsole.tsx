"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { edgeMeter } from "@/lib/desk/edge-meter";
import { RoomQr } from "./RoomQr";

interface Stage {
  name: string;
  status: "ok" | "failed" | "skipped";
  model?: string;
  provider?: string;
  inputTokens?: number;
  outputTokens?: number;
  costEur?: number;
  latencyMs?: number;
  note?: string;
}

interface Receipt {
  receiptId: string;
  verdict: "PASS" | "FAIL" | "PARTIAL";
  stages: Stage[];
  totals: { costEur: number; latencyMs: number; tokens: { input: number; output: number } };
  subject: { name: string; digest: { sha256: string } };
}

interface Source {
  index: number;
  title: string;
  url: string;
}

interface Belief {
  id: string;
  question: string;
  claim: string;
  url: string;
  at: string;
}

interface Contradiction {
  priorId: string;
  priorClaim: string;
  newClaim: string;
  reason: string;
}

interface DeskResponse {
  question: string;
  brief: string;
  sources: Source[];
  judgement: { score: number; rationale: string } | null;
  groundingRate: number;
  related: Belief[];
  contradictions: Contradiction[];
  remembered: number;
  receipt: Receipt;
  signed: boolean;
  pricesVerified: boolean;
}

const STAGE_ORDER = ["recall", "retrieve", "extract", "synthesize", "contradict", "judge", "remember"] as const;

const STAGE_ROLE: Record<string, string> = {
  recall: "the vault",
  retrieve: "sources",
  extract: "small model",
  synthesize: "large model",
  contradict: "small model",
  judge: "other family",
  remember: "the vault",
};

export function DeskConsole({ examples }: { examples: string[] }) {
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DeskResponse | null>(null);
  const [elapsed, setElapsed] = useState(0);
  // The room URL is read when the button is pressed, so the server and the
  // first client render agree on an empty string and nothing mismatches.
  const [roomUrl, setRoomUrl] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const run = useCallback(
    async (asked: string) => {
      const trimmed = asked.trim();
      if (!trimmed || pending) return;
      setPending(true);
      setError(null);
      setResult(null);
      setElapsed(0);
      const startedAt = Date.now();
      timer.current = setInterval(() => setElapsed(Date.now() - startedAt), 100);
      try {
        const response = await fetch("/api/desk/run", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ question: trimmed }),
        });
        const isJson = (response.headers.get("content-type") ?? "").includes("application/json");
        const payload: unknown = isJson ? await response.json().catch(() => null) : null;
        if (!response.ok || !payload) {
          const detail =
            payload && typeof payload === "object" && typeof (payload as { error?: unknown }).error === "string"
              ? (payload as { error: string }).error
              : `The Desk answered ${response.status}.`;
          throw new Error(detail);
        }
        setResult(payload as DeskResponse);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "The run failed.");
      } finally {
        if (timer.current) clearInterval(timer.current);
        setPending(false);
      }
    },
    [pending],
  );

  const meter = useMemo(() => {
    if (!result) return null;
    return edgeMeter({
      costEur: result.receipt.totals.costEur,
      latencyMs: result.receipt.totals.latencyMs,
      tokens: result.receipt.totals.tokens,
      groundingRate: result.groundingRate,
      rubricScore: result.judgement?.score ?? null,
      pricesVerified: result.pricesVerified,
    });
  }, [result]);

  const stages = useMemo(() => {
    const byName = new Map((result?.receipt.stages ?? []).map((stage) => [stage.name, stage]));
    return STAGE_ORDER.map((name) => ({ name, stage: byName.get(name) }));
  }, [result]);

  return (
    <div className="space-y-8">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void run(question);
        }}
        className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#0c0c12]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-slate-400">Ask the Desk</span>
          <span className="font-mono text-[11px] text-slate-500">
            {pending
              ? `${(elapsed / 1000).toFixed(1)} s`
              : result
                ? `done in ${(result.receipt.totals.latencyMs / 1000).toFixed(1)} s`
                : "idle"}
          </span>
        </div>
        <div className="p-5">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={3}
            maxLength={400}
            spellCheck={false}
            placeholder="What should I know about…"
            className="w-full resize-none rounded-lg border border-white/[0.08] bg-black/40 p-4 font-sans text-[15px] leading-[1.7] text-slate-100 outline-none placeholder:text-slate-600 focus:border-violet-400/50"
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending || question.trim().length === 0}
              className="rounded-lg bg-violet-500 px-5 py-2.5 text-[13px] font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-slate-500"
            >
              {pending ? "Running the cascade…" : "Run"}
            </button>
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => {
                  setQuestion(example);
                  void run(example);
                }}
                disabled={pending}
                className="rounded-lg border border-white/[0.08] px-3 py-2 text-[12px] text-slate-400 transition hover:border-white/[0.16] hover:text-slate-200 disabled:opacity-40"
              >
                {example}
              </button>
            ))}
          </div>
          {error ? (
            <p role="alert" className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/[0.06] px-4 py-3 text-[13px] text-rose-200">
              {error}
            </p>
          ) : null}
        </div>
      </form>

      <section className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#0c0c12]" aria-live="polite">
        <div className="border-b border-white/[0.06] px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-slate-400">
          The cascade
        </div>
        <ol className="divide-y divide-white/[0.06]">
          {stages.map(({ name, stage }) => (
            <li key={name} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-4">
              <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass(stage?.status, pending)}`} aria-hidden />
              <span className="w-24 font-mono text-[12px] text-slate-200">{name}</span>
              <span className="w-28 text-[12px] text-slate-500">{STAGE_ROLE[name]}</span>
              <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-slate-500">{stage?.model ?? stage?.provider ?? ""}</span>
              <span className="font-mono text-[11px] tabular-nums text-slate-400">
                {stage?.latencyMs === undefined ? "" : `${(stage.latencyMs / 1000).toFixed(1)} s`}
              </span>
              <span className="font-mono text-[11px] tabular-nums text-slate-400">
                {stage?.costEur === undefined ? "" : eur(stage.costEur)}
              </span>
              <span className="w-full text-[12px] text-slate-500 sm:w-auto">{stage?.note ?? ""}</span>
            </li>
          ))}
        </ol>
      </section>

      {result ? (
        <>
          <section className="grid gap-4 sm:grid-cols-4">
            <Figure label="cost" value={result.pricesVerified ? eur(result.receipt.totals.costEur) : "unpriced"} />
            <Figure label="time" value={`${(result.receipt.totals.latencyMs / 1000).toFixed(1)} s`} />
            <Figure label="grounding" value={`${Math.round(result.groundingRate * 100)}%`} />
            <Figure label="rubric" value={result.judgement ? `${result.judgement.score}/10` : "—"} />
          </section>

          {meter ? (
            <section className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#0c0c12]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3">
                <span className="font-mono text-[11px] uppercase tracking-widest text-slate-400">Edge meter</span>
                <span className="font-mono text-[11px] text-slate-500">{meter.baselineLabel}</span>
              </div>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    <th className="px-5 py-2 font-normal">axis</th>
                    <th className="px-5 py-2 font-normal">this cascade</th>
                    <th className="px-5 py-2 font-normal">closed API</th>
                    <th className="px-5 py-2 text-right font-normal">multiple</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {meter.rows.map((row) => (
                    <tr key={row.axis}>
                      <td className="px-5 py-3 text-slate-400">{row.label}</td>
                      <td className="px-5 py-3 font-mono tabular-nums text-white">{row.ours}</td>
                      <td className="px-5 py-3 font-mono tabular-nums text-slate-400">{row.baseline}</td>
                      <td className="px-5 py-3 text-right font-mono tabular-nums text-violet-300">
                        {row.ratio === null ? "" : `${row.ratio}x cheaper`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}

          {!result.pricesVerified ? (
            <p className="rounded-lg border border-amber-400/25 bg-amber-400/[0.05] px-4 py-3 text-[12px] leading-[1.7] text-amber-200/90">
              Model prices are unverified, so this run reports tokens and seconds and withholds euros. Fill them from the Token
              Factory console in <span className="font-mono">src/lib/desk/pricing.ts</span> and every figure here becomes a number
              someone checked.
            </p>
          ) : null}

          <section className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#0c0c12]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-slate-400">Brief</span>
              <span className="font-mono text-[11px] text-slate-500">{result.receipt.subject.name}</span>
            </div>
            <div className="px-5 py-5">
              <Brief text={result.brief} />
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#0c0c12]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-slate-400">Memory</span>
              <span className="font-mono text-[11px] text-slate-500">
                {result.related.length} recalled · {result.remembered} written
              </span>
            </div>
            {result.contradictions.length > 0 ? (
              <ul className="divide-y divide-white/[0.06]">
                {result.contradictions.map((item) => (
                  <li key={item.priorId} className="px-5 py-4">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-amber-300">Disagrees with memory</div>
                    <p className="mt-2 text-[14px] leading-[1.8] text-slate-300">
                      <span className="text-slate-500">held:</span> {item.priorClaim}
                    </p>
                    <p className="mt-1 text-[14px] leading-[1.8] text-slate-100">
                      <span className="text-slate-500">now:</span> {item.newClaim}
                    </p>
                    {item.reason ? <p className="mt-2 text-[13px] leading-[1.7] text-slate-500">{item.reason}</p> : null}
                  </li>
                ))}
              </ul>
            ) : result.related.length > 0 ? (
              <ul className="divide-y divide-white/[0.06]">
                {result.related.map((belief) => (
                  <li key={belief.id} className="px-5 py-3 text-[13px] leading-[1.7] text-slate-400">
                    {belief.claim}
                    <span className="ml-2 font-mono text-[11px] text-slate-600">{belief.at.slice(0, 10)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-4 text-[13px] leading-[1.7] text-slate-500">
                Nothing held near this question yet. This run is the vault&rsquo;s first word on it; ask again after the next one
                and the Desk checks itself against what it said here.
              </p>
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#0c0c12]">
            <div className="border-b border-white/[0.06] px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-slate-400">
              Sources
            </div>
            <ol className="divide-y divide-white/[0.06]">
              {result.sources.map((source) => (
                <li key={source.url} className="flex gap-3 px-5 py-3 text-[13px]">
                  <span className="font-mono text-[11px] text-slate-500">[{source.index}]</span>
                  <a
                    href={source.url}
                    rel="noopener noreferrer nofollow ugc"
                    target="_blank"
                    className="min-w-0 flex-1 truncate text-slate-300 underline decoration-white/20 underline-offset-4 hover:text-white"
                  >
                    {source.title}
                  </a>
                </li>
              ))}
            </ol>
          </section>

          <section className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#0c0c12]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-slate-400">Receipt</span>
              <span className="font-mono text-[11px] text-slate-500">
                {result.signed ? "signed" : "draft, unsigned"} · {result.receipt.verdict}
              </span>
            </div>
            <dl className="divide-y divide-white/[0.06] text-[12px]">
              <Row label="receipt id" value={result.receipt.receiptId} />
              <Row label="subject sha256" value={result.receipt.subject.digest.sha256} />
              <Row
                label="tokens"
                value={`${result.receipt.totals.tokens.input.toLocaleString("en-US")} in · ${result.receipt.totals.tokens.output.toLocaleString("en-US")} out`}
              />
              {result.judgement ? <Row label="judge" value={result.judgement.rationale} /> : null}
            </dl>
          </section>
        </>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#0c0c12]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-slate-400">Room mode</span>
          <button
            type="button"
            onClick={() => setRoomUrl((current) => (current ? "" : `${window.location.origin}/desk`))}
            className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-[12px] text-slate-400 transition hover:border-white/[0.16] hover:text-slate-200"
          >
            {roomUrl ? "Hide the code" : "Put it on the screen"}
          </button>
        </div>
        {roomUrl ? (
          <div className="flex flex-col items-center gap-4 px-5 py-8 sm:flex-row sm:justify-center sm:gap-8">
            <RoomQr url={roomUrl} size={200} />
            <div className="max-w-xs text-center sm:text-left">
              <p className="text-[15px] leading-[1.7] text-slate-200">Scan it and ask the Desk something.</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-slate-500">
                Every question runs the same stages and leaves the same receipt, so anyone here can check what their own answer
                cost.
              </p>
              <p className="mt-3 break-all font-mono text-[11px] text-slate-600">{roomUrl}</p>
            </div>
          </div>
        ) : (
          <p className="px-5 py-4 text-[13px] leading-[1.7] text-slate-500">
            Shows a QR of this page, large enough to scan from the back of a room.
          </p>
        )}
      </section>
    </div>
  );
}

/**
 * The brief, with its six headings set as headings. The body keeps its citation
 * markers verbatim, because the markers are the point.
 */
function Brief({ text }: { text: string }) {
  const blocks = text
    .split(/^##\s+/m)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const newline = block.indexOf("\n");
      return newline === -1
        ? { heading: block, body: "" }
        : { heading: block.slice(0, newline).trim(), body: block.slice(newline + 1).trim() };
    });

  if (blocks.length === 0) return <p className="text-[14px] leading-[1.9] text-slate-300">{text}</p>;

  return (
    <div className="space-y-5">
      {blocks.map((block) => (
        <section key={block.heading}>
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-violet-400">{block.heading}</h3>
          <p className="mt-2 whitespace-pre-wrap text-[14px] leading-[1.9] text-slate-300">{block.body}</p>
        </section>
      ))}
    </div>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.1] bg-[#0c0c12] px-5 py-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{label}</div>
      <div className="mt-1 font-mono text-[22px] tabular-nums text-white">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 px-5 py-3">
      <dt className="w-32 shrink-0 font-mono text-[11px] uppercase tracking-widest text-slate-500">{label}</dt>
      <dd className="min-w-0 flex-1 break-all font-mono text-[11px] text-slate-300">{value}</dd>
    </div>
  );
}

function dotClass(status: Stage["status"] | undefined, pending: boolean): string {
  if (status === "ok") return "bg-emerald-400";
  if (status === "failed") return "bg-rose-400";
  if (status === "skipped") return "bg-slate-600";
  return pending ? "animate-pulse bg-violet-400" : "bg-white/15";
}

function eur(value: number): string {
  return `€${value.toFixed(4)}`;
}
