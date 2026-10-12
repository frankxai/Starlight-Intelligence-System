"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type VaultStat = {
  name: string;
  entries: number;
  bytes: number;
  mtime: string | null;
};

type Entry = {
  id?: string;
  vault: string;
  content: string;
  tags?: string[];
  category?: string;
  createdAt?: string;
  score?: number;
};

type Risk = {
  id: string;
  level: "red" | "yellow" | "green";
  title: string;
  detail: string;
};

type OperatorPayload = {
  ok: true;
  generatedAt: string;
  host: { hostname: string; platform: string; role: string };
  vaults: {
    dir: string;
    totalEntries: number;
    totalBytes: number;
    items: VaultStat[];
  };
  signal: Entry[];
  search: { q: string; results: Entry[] };
  today: {
    ledger: {
      path: string;
      lastSweep: string | null;
      bullets: string[];
      exists: boolean;
    };
    risks: Risk[];
    diskFreeGb: number | null;
  };
  voice: { reachable: boolean; error?: string };
  fleet: {
    bookOnline: boolean | null;
    heartbeat: Record<string, unknown> | null;
  };
};

const VAULT_GLYPH: Record<string, string> = {
  strategic: "◆",
  technical: "⬡",
  creative: "✦",
  operational: "▸",
  wisdom: "◎",
  horizon: "↗",
};

const VAULT_TINT: Record<string, string> = {
  strategic: "var(--vault-strategic)",
  technical: "var(--vault-technical)",
  creative: "var(--vault-creative)",
  operational: "var(--vault-operational)",
  wisdom: "var(--vault-wisdom)",
  horizon: "var(--vault-horizon)",
};

function riskTone(level: Risk["level"]) {
  if (level === "red")
    return "border-rose-400/25 bg-rose-500/[0.08] text-rose-200";
  if (level === "green")
    return "border-emerald-400/25 bg-emerald-500/[0.08] text-emerald-200";
  return "border-amber-400/25 bg-amber-500/[0.08] text-amber-100";
}

function riskDot(level: Risk["level"]) {
  if (level === "red") return "bg-rose-400";
  if (level === "green") return "bg-emerald-400";
  return "bg-amber-400";
}

function fmtTime(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso.slice(0, 16);
  }
}

function preview(text: string, n = 220) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

export default function OperatorClient({
  initialData,
}: {
  initialData?: OperatorPayload | null;
}) {
  const [data, setData] = useState<OperatorPayload | null>(initialData ?? null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Entry[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [captureText, setCaptureText] = useState("");
  const [captureVault, setCaptureVault] = useState("strategic");
  const [captureMsg, setCaptureMsg] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/operator", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as OperatorPayload;
      setData(json);
      setError(null);
    } catch (e) {
      // Keep SSR data if refresh fails
      if (!initialData) {
        setError(e instanceof Error ? e.message : String(e));
      }
    }
  }, [initialData]);

  useEffect(() => {
    // Soft refresh in background; SSR already painted
    const initialTimer = setTimeout(() => {
      if (!initialData) void load();
    }, 0);
    const id = setInterval(() => void load(), 30_000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(id);
    };
  }, [load, initialData]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setCaptureOpen(true);
      }
      if (e.key === "Escape") {
        setCaptureOpen(false);
        setResults(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function runSearch(e?: FormEvent) {
    e?.preventDefault();
    const query = q.trim();
    if (!query) {
      setResults(null);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch("/api/operator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search", q: query }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        results?: Entry[];
        error?: string;
      };
      if (!json.ok) throw new Error(json.error || "Search failed");
      setResults(json.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSearching(false);
    }
  }

  async function runCapture(e: FormEvent) {
    e.preventDefault();
    setCapturing(true);
    setCaptureMsg(null);
    try {
      const res = await fetch("/api/operator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "capture",
          content: captureText,
          vault: captureVault,
          tags: ["operator-capture"],
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        entry?: Entry;
      };
      if (!json.ok) throw new Error(json.error || "Capture failed");
      setCaptureMsg(`Saved to ${captureVault}`);
      setCaptureText("");
      setCaptureOpen(false);
      await load();
    } catch (err) {
      setCaptureMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setCapturing(false);
    }
  }

  const mindShare = useMemo(() => {
    if (!data) return 0;
    const mind = data.vaults.items
      .filter((v) =>
        ["strategic", "wisdom", "horizon", "creative", "technical"].includes(
          v.name,
        ),
      )
      .reduce((a, v) => a + v.entries, 0);
    const total = data.vaults.totalEntries || 1;
    return Math.round((mind / total) * 100);
  }, [data]);

  if (!data && !error) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6">
        <p className="font-mono text-[12px] uppercase tracking-tech text-[color:var(--ink-2)]">
          Loading operator…
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6">
        <div className="glass max-w-md rounded-2xl p-6">
          <p className="text-rose-200">Could not load operator: {error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 font-mono text-[12px] text-[color:var(--doctrine)] underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const showing = results !== null ? results : data.signal;
  const showingLabel =
    results !== null
      ? searching
        ? "Searching…"
        : `${results.length} result${results.length === 1 ? "" : "s"}`
      : "Signal feed";

  return (
    <div className="relative min-h-dvh">
      {/* atmospheric wash */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-10 h-[420px] w-[420px] rounded-full bg-[color:var(--voltage)]/[0.07] blur-[110px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-cyan-400/[0.04] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-8 md:px-8 md:pt-10">
        {/* Top bar */}
        <header
          className="hud-in mb-8 flex flex-wrap items-end justify-between gap-4"
          style={{ animationDelay: "0ms" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="h-11 w-11 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, var(--voltage-bright), var(--voltage-deep) 70%, #1a1130 100%)",
                boxShadow:
                  "0 0 16px var(--voltage), inset 0 0 8px rgba(140,125,255,0.55)",
              }}
              aria-hidden
            />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-tech text-[color:var(--ink-2)]">
                {data.host.role} · {data.host.hostname}
              </p>
              <h1
                className="font-display text-[clamp(1.75rem,4vw,2.35rem)] font-medium tracking-display text-[color:var(--ink-0)]"
                style={{ fontVariationSettings: '"opsz" 144' }}
              >
                Operator
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/substrate"
              className="glass rounded-full px-3.5 py-2 font-mono text-[10px] uppercase tracking-tech text-[color:var(--ink-1)] transition-micro hover:text-[color:var(--ink-0)]"
            >
              Substrate
            </Link>
            <Link
              href="/"
              className="glass rounded-full px-3.5 py-2 font-mono text-[10px] uppercase tracking-tech text-[color:var(--ink-1)] transition-micro hover:text-[color:var(--ink-0)]"
            >
              Console
            </Link>
            <button
              type="button"
              onClick={() => void load()}
              className="glass rounded-full px-3.5 py-2 font-mono text-[10px] uppercase tracking-tech text-[color:var(--ink-2)]"
            >
              {fmtTime(data.generatedAt) || "refresh"}
            </button>
          </div>
        </header>

        {/* Command bar */}
        <section
          className="hud-in mb-6"
          style={{ animationDelay: "80ms" }}
        >
          <form
            onSubmit={(e) => void runSearch(e)}
            className="glass-elevated flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center sm:gap-0 sm:p-2 sm:pl-5"
          >
            <label className="sr-only" htmlFor="op-q">
              Search memory
            </label>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span
                className="font-mono text-[12px] text-[color:var(--doctrine)]"
                aria-hidden
              >
                ⌕
              </span>
              <input
                ref={inputRef}
                id="op-q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search vaults — memory, decisions, doctrine…"
                className="min-w-0 flex-1 bg-transparent text-[15px] text-[color:var(--ink-0)] outline-none placeholder:text-[color:var(--ink-3)]"
                autoComplete="off"
              />
            </div>
            <div className="flex items-center gap-2 sm:pr-1">
              <kbd className="hidden rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-[color:var(--ink-3)] sm:inline">
                ⌘K
              </kbd>
              <button
                type="submit"
                disabled={searching}
                className="rounded-xl bg-[color:var(--ink-0)] px-4 py-2.5 text-[13px] font-semibold text-[#0a0a14] transition-micro hover:opacity-90 disabled:opacity-50"
              >
                {searching ? "…" : "Search"}
              </button>
              <button
                type="button"
                onClick={() => setCaptureOpen(true)}
                className="rounded-xl border border-[color:var(--doctrine)]/40 bg-[color:var(--doctrine)]/10 px-4 py-2.5 text-[13px] font-semibold text-[color:var(--doctrine-bright)] transition-micro hover:bg-[color:var(--doctrine)]/20"
              >
                Capture
              </button>
            </div>
          </form>
          {captureMsg && (
            <p className="mt-2 font-mono text-[11px] text-[color:var(--doctrine)]">
              {captureMsg}
            </p>
          )}
        </section>

        {/* Today + risks */}
        <section
          className="hud-in mb-6 grid gap-4 lg:grid-cols-12"
          style={{ animationDelay: "140ms" }}
        >
          <div className="glass rounded-2xl p-5 lg:col-span-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-mono text-[10px] uppercase tracking-tech text-[color:var(--ink-2)]">
                Today · OPS-LEDGER
              </h2>
              {data.today.diskFreeGb != null && (
                <span className="font-mono text-[10px] text-[color:var(--ink-2)]">
                  disk {data.today.diskFreeGb.toFixed(0)} GB free
                </span>
              )}
            </div>
            <div className="doctrine-line my-3 opacity-70" />
            {data.today.ledger.lastSweep ? (
              <p className="text-[13px] leading-relaxed text-[color:var(--ink-1)]">
                {data.today.ledger.lastSweep}
              </p>
            ) : (
              <p className="text-[13px] text-[color:var(--ink-2)]">
                Ledger not found at {data.today.ledger.path}
              </p>
            )}
            <ul className="mt-4 space-y-3">
              {data.today.ledger.bullets.map((b, i) => (
                <li
                  key={i}
                  className="border-l border-[color:var(--doctrine)]/35 pl-3 text-[13px] leading-relaxed text-[color:var(--ink-1)]"
                >
                  {b}
                </li>
              ))}
              {data.today.ledger.bullets.length === 0 && (
                <li className="text-[13px] text-[color:var(--ink-3)]">
                  No recent ledger bullets parsed.
                </li>
              )}
            </ul>
          </div>

          <div className="glass rounded-2xl p-5 lg:col-span-5">
            <h2 className="font-mono text-[10px] uppercase tracking-tech text-[color:var(--ink-2)]">
              Attention
            </h2>
            <div className="doctrine-line my-3 opacity-70" />
            <ul className="space-y-2.5">
              {data.today.risks.map((r) => (
                <li
                  key={r.id}
                  className={`rounded-xl border px-3 py-2.5 ${riskTone(r.level)}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${riskDot(r.level)}`}
                    />
                    <span className="text-[13px] font-semibold">{r.title}</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed opacity-80">
                    {r.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Actions strip */}
        <section
          className="hud-in mb-6 flex flex-wrap gap-2"
          style={{ animationDelay: "200ms" }}
        >
          {[
            {
              label: "Substrate map",
              href: "/substrate",
              external: false,
            },
            {
              label: "3D palace view",
              href: "/substrate?view=3d",
              external: false,
            },
            {
              label: "Voice console",
              href: "http://127.0.0.1:8765/dashboard/cockpit.html",
              external: true,
            },
            {
              label: "Public protocol",
              href: "https://starlightintelligence.org/protocol",
              external: true,
            },
            {
              label: "Public vaults",
              href: "https://starlightintelligence.org/vaults",
              external: true,
            },
          ].map((a) =>
            a.external ? (
              <a
                key={a.label}
                href={a.href}
                target="_blank"
                rel="noreferrer"
                className="glass rounded-full px-4 py-2 text-[12px] text-[color:var(--ink-1)] transition-micro hover:border-[color:var(--glass-edge-bright)] hover:text-[color:var(--ink-0)]"
              >
                {a.label} ↗
              </a>
            ) : (
              <Link
                key={a.label}
                href={a.href}
                className="glass rounded-full px-4 py-2 text-[12px] text-[color:var(--ink-1)] transition-micro hover:border-[color:var(--glass-edge-bright)] hover:text-[color:var(--ink-0)]"
              >
                {a.label}
              </Link>
            ),
          )}
        </section>

        {/* Main grid: feed + vault mind */}
        <section
          className="hud-in grid gap-4 lg:grid-cols-12"
          style={{ animationDelay: "260ms" }}
        >
          <div className="glass rounded-2xl p-5 lg:col-span-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-mono text-[10px] uppercase tracking-tech text-[color:var(--ink-2)]">
                {showingLabel}
              </h2>
              {results !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setResults(null);
                    setQ("");
                  }}
                  className="font-mono text-[10px] text-[color:var(--doctrine)]"
                >
                  Clear search
                </button>
              )}
            </div>
            <ul className="space-y-3">
              {showing.length === 0 && (
                <li className="rounded-xl border border-white/[0.05] px-4 py-8 text-center text-[13px] text-[color:var(--ink-3)]">
                  {results !== null
                    ? "No matches. Try fewer words or a vault name."
                    : "No high-signal atoms yet."}
                </li>
              )}
              {showing.map((e, i) => (
                <li
                  key={e.id ?? `${e.vault}-${i}`}
                  className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3 transition-micro hover:border-white/[0.12]"
                >
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span
                      className="font-mono"
                      style={{ color: VAULT_TINT[e.vault] ?? "var(--ink-2)" }}
                    >
                      {VAULT_GLYPH[e.vault] ?? "·"} {e.vault}
                    </span>
                    {e.category && (
                      <span className="text-[color:var(--ink-3)]">
                        {e.category}
                      </span>
                    )}
                    <span className="ml-auto font-mono text-[color:var(--ink-3)]">
                      {fmtTime(e.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-[14px] leading-[1.65] text-[color:var(--ink-0)]">
                    {preview(e.content, 320)}
                  </p>
                  {e.tags && e.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {e.tags.slice(0, 5).map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-[color:var(--ink-3)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <aside className="space-y-4 lg:col-span-4">
            <div className="glass rounded-2xl p-5">
              <h2 className="font-mono text-[10px] uppercase tracking-tech text-[color:var(--ink-2)]">
                Memory shape
              </h2>
              <p className="mt-3 font-display text-3xl tracking-display text-[color:var(--ink-0)]">
                {data.vaults.totalEntries.toLocaleString()}
              </p>
              <p className="mt-1 text-[12px] text-[color:var(--ink-2)]">
                atoms · {mindShare}% non-operational share
              </p>
              <ul className="mt-4 space-y-2">
                {data.vaults.items.map((v) => {
                  const pct = data.vaults.totalEntries
                    ? Math.round((v.entries / data.vaults.totalEntries) * 100)
                    : 0;
                  return (
                    <li key={v.name}>
                      <div className="mb-1 flex justify-between font-mono text-[11px]">
                        <span style={{ color: VAULT_TINT[v.name] }}>
                          {VAULT_GLYPH[v.name]} {v.name}
                        </span>
                        <span className="text-[color:var(--ink-2)]">
                          {v.entries}
                        </span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full opacity-80"
                          style={{
                            width: `${Math.max(pct, v.entries ? 2 : 0)}%`,
                            background: VAULT_TINT[v.name] ?? "var(--voltage)",
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="glass rounded-2xl p-5">
              <h2 className="font-mono text-[10px] uppercase tracking-tech text-[color:var(--ink-2)]">
                Fleet
              </h2>
              <dl className="mt-3 space-y-2 text-[13px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-[color:var(--ink-2)]">C940</dt>
                  <dd className="font-mono text-emerald-300">
                    {String(data.fleet.heartbeat?.status ?? "—")}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[color:var(--ink-2)]">Book</dt>
                  <dd
                    className={
                      data.fleet.bookOnline
                        ? "font-mono text-emerald-300"
                        : "font-mono text-rose-300"
                    }
                  >
                    {data.fleet.bookOnline ? "online" : "missing"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[color:var(--ink-2)]">Voice</dt>
                  <dd
                    className={
                      data.voice.reachable
                        ? "font-mono text-amber-200"
                        : "font-mono text-rose-300"
                    }
                  >
                    {data.voice.reachable ? "status up" : "down"}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-[11px] leading-relaxed text-[color:var(--ink-3)]">
                Keyboard: <kbd className="text-[color:var(--ink-2)]">⌘K</kbd>{" "}
                search · <kbd className="text-[color:var(--ink-2)]">⌘N</kbd>{" "}
                capture · <kbd className="text-[color:var(--ink-2)]">Esc</kbd>{" "}
                dismiss
              </p>
            </div>
          </aside>
        </section>
      </div>

      {/* Capture modal */}
      {captureOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Capture to vault"
          onClick={() => setCaptureOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => void runCapture(e)}
            className="glass-elevated w-full max-w-lg rounded-2xl p-5 shadow-2xl"
            style={{ animation: "palette-in 280ms var(--ease-out) both" }}
          >
            <div className="flex items-center justify-between">
              <h2
                className="font-display text-xl tracking-display text-[color:var(--ink-0)]"
                style={{ fontVariationSettings: '"opsz" 96' }}
              >
                Capture
              </h2>
              <button
                type="button"
                onClick={() => setCaptureOpen(false)}
                className="font-mono text-[12px] text-[color:var(--ink-2)]"
              >
                Esc
              </button>
            </div>
            <p className="mt-1 text-[12px] text-[color:var(--ink-2)]">
              Writes a real JSONL atom into local SIS vaults.
            </p>
            <label className="mt-4 block font-mono text-[10px] uppercase tracking-tech text-[color:var(--ink-2)]">
              Vault
              <select
                value={captureVault}
                onChange={(e) => setCaptureVault(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-[13px] text-[color:var(--ink-0)] outline-none"
              >
                {[
                  "strategic",
                  "wisdom",
                  "horizon",
                  "technical",
                  "creative",
                  "operational",
                ].map((v) => (
                  <option key={v} value={v}>
                    {VAULT_GLYPH[v]} {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block font-mono text-[10px] uppercase tracking-tech text-[color:var(--ink-2)]">
              Note
              <textarea
                value={captureText}
                onChange={(e) => setCaptureText(e.target.value)}
                rows={5}
                required
                placeholder="Decision, insight, or question this note answers…"
                className="mt-1.5 w-full resize-y rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-[14px] leading-relaxed text-[color:var(--ink-0)] outline-none placeholder:text-[color:var(--ink-3)]"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCaptureOpen(false)}
                className="rounded-xl px-4 py-2.5 text-[13px] text-[color:var(--ink-2)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={capturing || captureText.trim().length < 3}
                className="rounded-xl bg-[color:var(--doctrine)] px-5 py-2.5 text-[13px] font-semibold text-[#1a1408] disabled:opacity-50"
              >
                {capturing ? "Saving…" : "Save atom"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
