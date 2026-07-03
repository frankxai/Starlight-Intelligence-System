import type { Metadata } from "next";
import Link from "next/link";
import {
  getAgentRegistry,
  FAMILY_LABELS,
  FAMILY_ORDER,
  type AgentEntry,
  type AgentFamily,
} from "@/lib/agents";
import {
  ACCENT_BORDER,
  ACCENT_BG,
  ACCENT_CHIP,
  ACCENT_TEXT_LIGHT,
  type Accent,
} from "@/lib/accents";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Agent Registry",
  description:
    "The full Starlight agent registry — every named agent, grouped by family, derived live from agents/AGENT_REGISTRY.md.",
  openGraph: {
    title: "Agent Registry — Starlight Intelligence",
    description:
      "Every named Starlight agent, grouped by family, derived live from the repo registry.",
    type: "article",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Starlight Intelligence — Agent Registry" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Registry — Starlight Intelligence",
    description:
      "Every named Starlight agent, grouped by family, derived live from the repo registry.",
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

export default async function AgentsPage() {
  const { agents, total } = await getAgentRegistry();

  const grouped = new Map<AgentFamily, AgentEntry[]>();
  for (const fam of FAMILY_ORDER) grouped.set(fam, []);
  for (const a of agents) {
    grouped.get(a.family)?.push(a);
  }

  const nonEmptyFamilies = FAMILY_ORDER.filter(
    (fam) => (grouped.get(fam)?.length ?? 0) > 0
  );

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-mesh-1 absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-violet-600/[0.05] blur-[100px]" />
          <div className="animate-mesh-2 absolute right-0 top-20 h-[300px] w-[300px] rounded-full bg-cyan-500/[0.04] blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-20">
          <p className="text-[11px] font-medium uppercase tracking-widest text-violet-400">
            Agent registry
          </p>
          <h1 className="mt-3 font-serif text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
            {total} named agents.
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              One flat council.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-400">
            No permanent hierarchy — only the mission. Every agent below is
            read live from{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-violet-300">
              agents/AGENT_REGISTRY.md
            </code>{" "}
            and grouped by filename family: Core &amp; Leadership, Council
            Archetypes, and thirteen specialized Domain Sub-Stack families.
          </p>

          {/* Family counts */}
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/[0.08] pt-6 text-[13px]">
            {nonEmptyFamilies.map((fam, i) => {
              const accent = ACCENT_CYCLE[i % ACCENT_CYCLE.length];
              const count = grouped.get(fam)?.length ?? 0;
              return (
                <a
                  key={fam}
                  href={`#${fam}`}
                  className="text-slate-400 transition-micro hover:text-white"
                >
                  <span className={`font-semibold ${ACCENT_TEXT_LIGHT[accent]}`}>
                    {count}
                  </span>{" "}
                  <span className="text-[13px]">{FAMILY_LABELS[fam]}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Family groups ── */}
      {nonEmptyFamilies.map((fam, i) => {
        const accent = ACCENT_CYCLE[i % ACCENT_CYCLE.length];
        const list = grouped.get(fam) ?? [];
        return (
          <section
            key={fam}
            id={fam}
            className="scroll-mt-20 border-b border-white/[0.08] px-6 py-16"
          >
            <div className="mx-auto max-w-5xl">
              <div className="flex flex-wrap items-baseline gap-3">
                <span
                  className={`inline-block rounded-full border px-3 py-1 text-[11px] uppercase tracking-widest ${ACCENT_CHIP[accent]}`}
                >
                  {FAMILY_LABELS[fam]}
                </span>
                <span className="text-[12px] text-slate-500">
                  {list.length} agent{list.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((a) => (
                  <div
                    key={a.slug}
                    className={`rounded-xl border p-4 transition-std hover:border-white/[0.2] ${ACCENT_BORDER[accent]} ${ACCENT_BG[accent]}`}
                  >
                    <h3 className="text-[14px] font-semibold text-white">
                      {a.name}
                    </h3>
                    {a.description && (
                      <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400">
                        {a.description}
                      </p>
                    )}
                    <p className="mt-2.5 truncate font-mono text-[10px] text-slate-500">
                      agents/{a.file}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {total === 0 && (
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl text-center text-slate-500">
            Registry unavailable at build time.
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[15px] leading-relaxed text-slate-400">
            Every agent composes the same substrate. See how they fit together.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/architecture"
              className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.2)]"
            >
              See the architecture &rarr;
            </Link>
            <a
              href="https://github.com/frankxai/Starlight-Intelligence-System/blob/main/agents/AGENT_REGISTRY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/[0.1] px-6 py-3 text-[14px] font-medium text-white transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
            >
              Read the full registry
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
