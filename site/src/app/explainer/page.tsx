import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Explainer",
  description:
    "Long-form public explainer for Starlight Intelligence System. Who it's for, how it works, what's different, and how to start.",
  openGraph: {
    title: "Explainer — Starlight Intelligence",
    description:
      "Long-form: who it's for, the five-phase journey, the nine-layer vision, what's different from chat. Sovereign by architecture.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explainer — Starlight Intelligence",
    description:
      "Long-form: who it's for, the five-phase journey, the nine-layer vision. Sovereign by architecture.",
  },
};

const EXPLAINER_FALLBACK = `Explainer source temporarily unavailable.

Read it on GitHub instead: [docs/public/starlight-intelligence-system.md](https://github.com/frankxai/Starlight-Intelligence-System/blob/main/docs/public/starlight-intelligence-system.md).`;

function loadExplainerSource(): string {
  // The prebuild script (scripts/sync-explainer.mjs) copies the source markdown
  // from docs/public/ into site/content/explainer.md so the file lives inside
  // the Next.js function root and survives Vercel's serverless packaging.
  // process.cwd() resolves to site/ on both Vercel and local builds.
  const path = join(process.cwd(), "content", "explainer.md");
  let raw: string;
  try {
    raw = readFileSync(path, "utf-8");
  } catch {
    return EXPLAINER_FALLBACK;
  }
  const lines = raw.split("\n");
  const firstHeadingIdx = lines.findIndex((l) => /^#\s/.test(l));
  if (firstHeadingIdx === -1) return raw;
  const firstHrIdx = lines.findIndex(
    (l, i) => i > firstHeadingIdx && /^---\s*$/.test(l)
  );
  const startIdx = firstHrIdx === -1 ? firstHeadingIdx + 1 : firstHrIdx + 1;
  return lines.slice(startIdx).join("\n").trim();
}

export default function ExplainerPage() {
  const body = loadExplainerSource();

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-mesh-1 absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-violet-600/[0.06] blur-[100px]" />
          <div className="animate-mesh-2 absolute right-0 top-20 h-[300px] w-[300px] rounded-full bg-cyan-500/[0.04] blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-20 md:py-28">
          <p className="text-[11px] font-medium uppercase tracking-widest text-violet-400">
            Public explainer
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-5xl">
            You already have the genius.
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              It&apos;s just scattered.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-[1.8] text-slate-400">
            Long-form for the indispensable professional and the creator with a
            body of work. Five phases. Nine layers. Yours, compounding.
          </p>
        </div>
      </section>

      {/* ── Source-of-truth banner ── */}
      <section className="border-b border-white/[0.08] bg-white/[0.01] px-6 py-4">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-slate-400">
          <span className="text-[10px] uppercase tracking-widest text-slate-400">
            Canonical source
          </span>
          <span className="text-slate-700">·</span>
          <a
            href="https://github.com/frankxai/Starlight-Intelligence-System/blob/main/docs/public/starlight-intelligence-system.md"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-slate-400 transition-std hover:text-violet-300"
          >
            docs/public/starlight-intelligence-system.md
          </a>
          <span className="text-slate-700">·</span>
          <span>Mirrored on every build</span>
        </div>
      </section>

      {/* ── Body ── */}
      <article className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <div className="explainer-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
        </div>
      </article>

      {/* ── CTA ── */}
      <section className="border-t border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[15px] leading-relaxed text-slate-400">
            Two paths to start. Pick the one that matches how you work.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/quickstart"
              className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.2)]"
            >
              Builder path &rarr;
            </Link>
            <a
              href="https://github.com/frankxai/Starlight-Intelligence-System/tree/main/integrations/starter-packs/friend-starter"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/[0.1] px-6 py-3 text-[14px] font-medium text-white transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
            >
              Friend starter (Claude Project)
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
