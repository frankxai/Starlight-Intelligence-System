import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Every notable release of the Starlight Intelligence System. Substrate (SIP) version tracked separately from package version. Dated in ISO 8601.",
  openGraph: {
    title: "Changelog — Starlight Intelligence",
    description:
      "Every notable release. v8.1.0 — Composition Layer + Crypto IS. v8.0.0 — v01 Friday-demo + Council archetypes. v7.x — substrate evolution.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Changelog — Starlight Intelligence",
    description:
      "Every notable release. Composition Layer, Crypto IS, Council archetypes, Domain Sub-Stack Tier. Substrate evolution dated in ISO 8601.",
  },
};

const CHANGELOG_FALLBACK = `Changelog source temporarily unavailable.

Read it on GitHub instead: [CHANGELOG.md](https://github.com/frankxai/Starlight-Intelligence-System/blob/main/CHANGELOG.md).`;

function loadChangelogSource(): string {
  // The prebuild script (scripts/sync-changelog.mjs) copies the source markdown
  // from CHANGELOG.md (repo root) into site/content/changelog.md so the file
  // lives inside the Next.js function root and survives Vercel's serverless
  // packaging. process.cwd() resolves to site/ on both Vercel and local builds.
  const path = join(process.cwd(), "content", "changelog.md");
  let raw: string;
  try {
    raw = readFileSync(path, "utf-8");
  } catch {
    return CHANGELOG_FALLBACK;
  }
  // Strip the leading "# Changelog" + preamble line (the page renders its own H1)
  const lines = raw.split("\n");
  const firstVersionIdx = lines.findIndex((l) => /^##\s+v/.test(l));
  if (firstVersionIdx === -1) return raw;
  return lines.slice(firstVersionIdx).join("\n").trim();
}

export default function ChangelogPage() {
  const body = loadChangelogSource();

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
            Public changelog
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-5xl">
            Every release.
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Dated. Tagged. Public.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-[1.8] text-slate-400">
            What shipped, when. Substrate (SIP) version tracked separately from
            package version. ISO 8601 dates. Reflective layer at{" "}
            <Link
              href="/"
              className="text-violet-300 underline-offset-4 transition-std hover:underline"
            >
              the home page
            </Link>
            ; this is the factual layer underneath.
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
            href="https://github.com/frankxai/Starlight-Intelligence-System/blob/main/CHANGELOG.md"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-slate-400 transition-std hover:text-violet-300"
          >
            CHANGELOG.md
          </a>
          <span className="text-slate-700">·</span>
          <a
            href="https://github.com/frankxai/Starlight-Intelligence-System/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 transition-std hover:text-violet-300"
          >
            GitHub Releases
          </a>
          <span className="text-slate-700">·</span>
          <a
            href="https://github.com/frankxai/Starlight-Intelligence-System/releases.atom"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 transition-std hover:text-violet-300"
          >
            RSS
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
            Two surfaces, one source. The Changelog is the factual layer; the
            Chronicle (private practice) is the reflective layer above it.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/explainer"
              className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.2)]"
            >
              Read the explainer &rarr;
            </Link>
            <Link
              href="/quickstart"
              className="rounded-full border border-white/[0.1] px-6 py-3 text-[14px] font-medium text-white transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
            >
              Quickstart
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
