import type { Metadata } from "next";
import Link from "next/link";
import { VERTICALS } from "@/lib/verticals";
import {
  ACCENT_TEXT,
  ACCENT_BORDER,
  ACCENT_BG,
  ACCENT_CHIP,
  ACCENT_GLOW,
} from "@/lib/accents";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Verticals",
  description:
    "Three reference Domain Sub-Stacks built on the Starlight Intelligence Protocol: People Intelligence, Sound Intelligence, and Music IS. The pattern generalizes — spawn your own.",
  openGraph: {
    title: "Verticals — Starlight Intelligence",
    description:
      "Three reference Domain Sub-Stacks: People · Sound · Music. Calibrated, structured, sovereign. The pattern generalizes via /spawn-domain-stack.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verticals — Starlight Intelligence",
    description:
      "Three reference Domain Sub-Stacks: People · Sound · Music. The pattern generalizes.",
  },
};

export default function VerticalsPage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-mesh-1 absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-violet-600/[0.06] blur-[100px]" />
          <div className="animate-mesh-2 absolute right-0 top-20 h-[300px] w-[300px] rounded-full bg-cyan-500/[0.04] blur-[80px]" />
          <div className="animate-mesh-3 absolute left-1/3 bottom-0 h-[280px] w-[280px] rounded-full bg-fuchsia-500/[0.05] blur-[90px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-20 md:py-28">
          <p className="text-[11px] font-medium uppercase tracking-widest text-violet-400">
            Domain Sub-Stack Tier
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-5xl">
            Three reference verticals.
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
              The pattern generalizes.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-[1.8] text-slate-400">
            Each vertical is a complete Intelligence System composed of 4–7
            sub-systems, with its own agents, commands, file contract, and
            sovereign vault namespace. Same substrate. Different domain.
          </p>
        </div>
      </section>

      {/* ── Vertical cards ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-3">
            {VERTICALS.map((v) => (
              <article
                key={v.slug}
                className={`flex flex-col rounded-2xl border ${ACCENT_BORDER[v.accent]} ${ACCENT_BG[v.accent]} p-6 transition-std ${ACCENT_GLOW[v.accent]}`}
              >
                <header>
                  <p
                    className={`text-[11px] font-medium uppercase tracking-widest ${ACCENT_TEXT[v.accent]}`}
                  >
                    {v.status === "live-frank-operated"
                      ? "Live · Frank-operated"
                      : "Live"}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    {v.name}
                  </h2>
                  <p className="mt-3 text-[14px] leading-relaxed text-slate-400">
                    {v.taglineShort}
                  </p>
                </header>

                <dl className="mt-6 grid grid-cols-3 gap-2 border-y border-white/[0.06] py-4 text-center">
                  <Stat label="sub-systems" value={v.counts.subSystems} />
                  <Stat label="commands" value={v.counts.commands} />
                  <Stat label="agents" value={v.counts.agents} />
                </dl>

                <div className="mt-6">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">
                    Sub-systems
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {v.pillars.map((p) => (
                      <li
                        key={p}
                        className={`rounded-full border px-2.5 py-1 text-[11px] ${ACCENT_CHIP[v.accent]}`}
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto flex flex-wrap gap-2 pt-6">
                  <Link
                    href={`/verticals/${v.slug}`}
                    aria-label={`Explore ${v.name}`}
                    className="rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-[#060609] transition-std hover:bg-white/90"
                  >
                    Explore <span aria-hidden="true">&rarr;</span>
                  </Link>
                  <a
                    href={`${v.githubBlobBase}/QUICK-START.md`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${v.name} QUICK-START on GitHub`}
                    className="rounded-full border border-white/[0.1] px-4 py-2 text-[12px] font-medium text-slate-300 transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
                  >
                    QUICK-START
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pattern generalizes ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            The pattern
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
            Spawn your own.
          </h2>
          <p className="mt-5 text-[15px] leading-[1.85] text-slate-400">
            Every Domain Sub-Stack follows the same 7-file contract: README ·
            SUB-SYSTEMS · AGENTS · SOUL · STACK · CANON · MEMORY. Each
            sub-system maps to its own agent and command set, all attested
            under the parent vertical.
          </p>
          <p className="mt-4 text-[15px] leading-[1.85] text-slate-400">
            The meta-command{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-violet-300">
              /spawn-domain-stack
            </code>{" "}
            scaffolds a 4–7-sub-system vertical from any sovereign domain —
            Capital, Spatial, Clinical, Legal, whatever your edge happens to
            be. The substrate is the same. Your domain is yours.
          </p>

          <div className="mt-8 overflow-hidden rounded-xl border border-violet-500/[0.18] bg-violet-500/[0.05]">
            <div className="border-b border-white/[0.06] px-4 py-3">
              <code className="font-mono text-[10px] uppercase tracking-widest text-violet-300/80">
                spawning a vertical
              </code>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-[1.8] text-slate-200">
              <span className="text-emerald-400">$</span>{" "}
              <span className="text-slate-400">claude</span>{" "}
              <span className="text-violet-300">/spawn-domain-stack</span>{" "}
              <span className="text-slate-400">--domain</span>{" "}
              <span className="text-emerald-400">&quot;Clinical Intelligence&quot;</span>
              {"\n\n"}
              <span className="text-slate-400">
                {
                  "// Diagnoses domain → proposes 4-7 sub-systems → scaffolds the 7-file contract"
                }
              </span>
              {"\n"}
              <span className="text-slate-400">
                {
                  "// Generates agents, commands, vault namespaces, and SIP attestation"
                }
              </span>
            </pre>
          </div>

          <p className="mt-8 text-[13px] leading-relaxed text-slate-400">
            Forking-domain-stacks reference:{" "}
            <a
              href="https://github.com/frankxai/Starlight-Intelligence-System/blob/main/docs/forking-domain-stacks.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-300 transition-std hover:text-violet-200"
            >
              docs/forking-domain-stacks.md
            </a>
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[15px] leading-relaxed text-slate-400">
            Three references. Infinite domains. One sovereign substrate.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/quickstart"
              className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.2)]"
            >
              Run the reference build &rarr;
            </Link>
            <Link
              href="/protocol"
              className="rounded-full border border-white/[0.1] px-6 py-3 text-[14px] font-medium text-white transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
            >
              Read the protocol
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-widest text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-[12px] text-white">{value}</dd>
    </div>
  );
}
