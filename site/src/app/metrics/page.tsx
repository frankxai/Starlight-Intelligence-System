import type { Metadata } from "next";
import Link from "next/link";
import { getMetricsLedger, labelFromKey, type Metric } from "@/lib/metrics";
import { ACCENT_BORDER, ACCENT_BG, type Accent } from "@/lib/accents";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Metrics",
  description:
    "The living ledger — fast-moving public metrics, derived from source and CI-enforced. Read live from metrics/current.json.",
  openGraph: {
    title: "Metrics — Starlight Intelligence",
    description:
      "The living ledger. Every metric carries a value, a source, and a last-verified date — CI-enforced, never hardcoded.",
    type: "article",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Starlight Intelligence — Metrics" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Metrics — Starlight Intelligence",
    description:
      "The living ledger. Every metric carries a value, a source, and a last-verified date.",
    images: ["/opengraph-image"],
  },
};

const ACCENT_CYCLE: Accent[] = [
  "violet",
  "cyan",
  "fuchsia",
  "emerald",
  "amber",
  "rose",
];

export default async function MetricsPage() {
  const ledger = await getMetricsLedger();

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-mesh-1 absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-emerald-600/[0.05] blur-[100px]" />
          <div className="animate-mesh-2 absolute right-0 top-20 h-[300px] w-[300px] rounded-full bg-violet-500/[0.04] blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-20">
          <p className="text-[11px] font-medium uppercase tracking-widest text-emerald-400">
            The living ledger
          </p>
          <h1 className="mt-3 font-serif text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
            Numbers earn their claim
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
              or they don&apos;t ship.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-400">
            Every metric below is derived from source, not typed by hand. Each
            one carries a value, a source path, and a last-verified date, per{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-emerald-300">
              METRICS_TRUTH.md
            </code>
            . Read live from{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-emerald-300">
              metrics/current.json
            </code>
            . CI-enforced — a metric without a source and a date doesn&apos;t
            merge.
          </p>

          {ledger.lastUpdated && (
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/[0.08] pt-6 text-[13px] text-slate-400">
              <span>
                Ledger version{" "}
                <span className="font-mono text-white">{ledger.version || "—"}</span>
              </span>
              <span aria-hidden="true">&middot;</span>
              <span>
                Last updated{" "}
                <span className="font-mono text-white">{ledger.lastUpdated}</span>
              </span>
              {ledger.ledgerStarted && (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <span>
                    Tracking since{" "}
                    <span className="font-mono text-white">
                      {ledger.ledgerStarted}
                    </span>
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Metric cards ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Tracked metrics
          </h2>
          <p className="mt-3 text-xl font-semibold text-white">
            {ledger.metrics.length} live values.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ledger.metrics.map((m, i) => (
              <MetricCard
                key={m.key}
                metric={m}
                accent={ACCENT_CYCLE[i % ACCENT_CYCLE.length]}
              />
            ))}
          </div>

          {ledger.metrics.length === 0 && (
            <p className="mt-10 text-center text-slate-500">
              Ledger unavailable at build time.
            </p>
          )}
        </div>
      </section>

      {/* ── Why this exists ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Why a living ledger
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
            Fast-moving numbers rot the moment they&apos;re typed.
          </h2>
          <p className="mt-5 text-[15px] leading-[1.85] text-slate-400">
            Public claims about agent counts, skill counts, and test coverage
            go stale the day someone ships a new agent or deletes a dead
            skill. Instead of hardcoding a number into prose, every public
            claim reads this ledger — and this ledger is derived from the
            same source files this site reads to build the{" "}
            <Link href="/agents" className="text-emerald-300 transition-std hover:text-emerald-200">
              agent registry
            </Link>{" "}
            and{" "}
            <Link href="/skills" className="text-emerald-300 transition-std hover:text-emerald-200">
              skill registry
            </Link>{" "}
            pages.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[15px] leading-relaxed text-slate-400">
            Derived from source. CI-enforced. No hand-typed numbers.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/architecture"
              className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.2)]"
            >
              See the architecture &rarr;
            </Link>
            <a
              href="https://github.com/frankxai/Starlight-Intelligence-System/blob/main/metrics/METRICS_TRUTH.md"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/[0.1] px-6 py-3 text-[14px] font-medium text-white transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
            >
              Read METRICS_TRUTH.md
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ metric, accent }: { metric: Metric; accent: Accent }) {
  const staleClass = metric.stale
    ? "border-amber-500/[0.3] bg-amber-500/[0.08] text-amber-200"
    : "border-emerald-500/[0.2] bg-emerald-500/[0.05] text-emerald-300";

  return (
    <div
      className={`flex flex-col rounded-xl border p-5 transition-std hover:border-white/[0.2] ${ACCENT_BORDER[accent]} ${ACCENT_BG[accent]}`}
    >
      <h3 className="text-[12px] uppercase tracking-widest text-slate-400">
        {labelFromKey(metric.key)}
      </h3>
      <p className="mt-2 text-3xl font-semibold text-white">{metric.value}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
        <span
          className={`rounded-full border px-2 py-0.5 uppercase tracking-wider ${staleClass}`}
        >
          {metric.stale ? "stale" : "verified"} {metric.lastVerified}
        </span>
      </div>

      <p className="mt-3 truncate font-mono text-[11px] text-slate-500">
        {metric.source}
      </p>

      {metric.notes && (
        <p className="mt-2 text-[12px] leading-relaxed text-slate-400">
          {metric.notes}
        </p>
      )}

      {metric.ownership && (
        <p className="mt-auto pt-3 text-[11px] uppercase tracking-widest text-slate-500">
          {metric.ownership}
        </p>
      )}
    </div>
  );
}
