/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { getCanonicalSipVersion } from "@/lib/sip";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Built on SIP — attestation badge",
  description:
    "Embeddable badge for projects built on the Starlight Intelligence Protocol. Markdown, HTML, and shields.io snippets ready to paste.",
  openGraph: {
    title: "Built on SIP — attestation badge",
    description:
      "Embeddable badge for projects built on the Starlight Intelligence Protocol.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Built on SIP — attestation badge",
    description:
      "Embeddable badge for projects built on the Starlight Intelligence Protocol.",
  },
};

const ORIGIN = "https://starlightintelligence.org";

export default async function BadgePage() {
  const version = await getCanonicalSipVersion();
  const badgeUrl = `${ORIGIN}/badge/${version}`;
  const protocolUrl = `${ORIGIN}/protocol`;

  const markdownSnippet = `[![Built on SIP](${badgeUrl})](${protocolUrl})`;
  const htmlSnippet = `<a href="${protocolUrl}"><img src="${badgeUrl}" alt="Built on SIP" /></a>`;
  const shieldsSnippet = `[![Built on SIP](https://img.shields.io/badge/Built%20on-SIP%20${version}-7c3aed)](${protocolUrl})`;
  const latestSnippet = `[![Built on SIP](${ORIGIN}/badge/latest)](${protocolUrl})`;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.04]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-mesh-1 absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-violet-600/[0.05] blur-[100px]" />
          <div className="animate-mesh-2 absolute right-0 top-20 h-[300px] w-[300px] rounded-full bg-cyan-500/[0.04] blur-[80px]" />
          <div className="animate-mesh-3 absolute left-1/3 bottom-0 h-[280px] w-[280px] rounded-full bg-fuchsia-500/[0.04] blur-[90px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-20 md:py-28">
          <p className="text-[11px] font-medium uppercase tracking-widest text-violet-400">
            Attestation badge
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-5xl">
            Built on SIP
          </h1>
          <p className="mt-4 font-mono text-[13px] uppercase tracking-widest text-slate-500">
            current canonical · {version}
          </p>
          <p className="mt-6 max-w-xl text-[15px] leading-[1.8] text-slate-400">
            A visual signal that your project composes the Starlight
            Intelligence Protocol. Drop it in your README so adopters
            recognise the substrate &mdash; and so credit compounds across
            every node.
          </p>

          {/* Hero badge preview */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <img
              src={`/badge/${version}`}
              alt={`Built on SIP ${version}`}
              height={28}
              style={{ height: 28 }}
            />
            <code className="font-mono text-[12px] text-slate-500">
              /badge/{version}
            </code>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        {/* Important note — what the badge is, what it isn't */}
        <section className="rounded-2xl border border-amber-500/[0.18] bg-amber-500/[0.04] p-6">
          <p className="text-[11px] font-medium uppercase tracking-widest text-amber-300/80">
            Important
          </p>
          <p className="mt-3 text-[14px] leading-[1.8] text-slate-300">
            <strong className="text-white">The badge is not the attestation.</strong>{" "}
            It is a visual signal of one. Real attestation lives in your
            README footer per{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-violet-300">
              /sip-attest
            </code>
            . Use the badge to make composition visible at a glance; use the
            attestation block to make it auditable.
          </p>
        </section>

        {/* Sizes preview */}
        <Section eyebrow="01 / Preview" heading="Renders cleanly at any width">
          <div className="space-y-6 rounded-xl border border-white/[0.08] bg-[#0c0c12] p-6">
            <div className="flex items-center gap-4">
              <img
                src={`/badge/${version}`}
                alt={`Built on SIP ${version}`}
                height={28}
                style={{ height: 28 }}
              />
              <span className="font-mono text-[11px] text-slate-600">
                native (28px)
              </span>
            </div>
            <div className="flex items-center gap-4">
              <img
                src={`/badge/${version}`}
                alt={`Built on SIP ${version}`}
                height={20}
                style={{ height: 20 }}
              />
              <span className="font-mono text-[11px] text-slate-600">
                small (20px)
              </span>
            </div>
            <div className="flex items-center gap-4">
              <img
                src={`/badge/${version}`}
                alt={`Built on SIP ${version}`}
                height={40}
                style={{ height: 40 }}
              />
              <span className="font-mono text-[11px] text-slate-600">
                large (40px)
              </span>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-white p-4">
              <img
                src={`/badge/${version}?theme=light`}
                alt={`Built on SIP ${version}`}
                height={28}
                style={{ height: 28 }}
              />
              <span className="font-mono text-[11px] text-slate-500">
                ?theme=light (for light README backgrounds)
              </span>
            </div>
          </div>
        </Section>

        {/* Markdown snippet */}
        <Section eyebrow="02 / Markdown" heading="Paste into your README">
          <p className="text-[14px] leading-[1.85] text-slate-400">
            The most common shape. GitHub, GitLab, npm, and crates.io all
            render it identically.
          </p>
          <CodeBlock label="markdown">{markdownSnippet}</CodeBlock>
          <p className="mt-4 text-[13px] leading-[1.7] text-slate-500">
            Pin to a specific version so the badge reflects what you actually
            built against. The protocol uses SemVer; the badge does too.
          </p>
        </Section>

        {/* Latest snippet */}
        <Section eyebrow="03 / Latest" heading="Floating to canonical">
          <p className="text-[14px] leading-[1.85] text-slate-400">
            Use{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-violet-300">
              /badge/latest
            </code>{" "}
            if you want the badge to always reflect the current canonical SIP
            version. Trades pin precision for zero maintenance.
          </p>
          <CodeBlock label="markdown">{latestSnippet}</CodeBlock>
        </Section>

        {/* HTML snippet */}
        <Section eyebrow="04 / HTML" heading="For non-Markdown contexts">
          <p className="text-[14px] leading-[1.85] text-slate-400">
            Sites, docs platforms, anywhere markdown isn&apos;t the substrate.
          </p>
          <CodeBlock label="html">{htmlSnippet}</CodeBlock>
        </Section>

        {/* Shields.io snippet */}
        <Section eyebrow="05 / Shields.io" heading="Canonical badge service">
          <p className="text-[14px] leading-[1.85] text-slate-400">
            For adopters who prefer the shields.io style or already standardise
            on it across their stack. Same meaning, different chrome.
          </p>
          <CodeBlock label="markdown">{shieldsSnippet}</CodeBlock>
        </Section>

        {/* What the URL accepts */}
        <Section eyebrow="06 / URL contract" heading="What the route accepts">
          <ul className="space-y-3 pl-6 text-[14px] text-slate-400">
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-violet-300">
                /badge/v1.1.0
              </code>{" "}
              &mdash; explicit SemVer pin (preferred).
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-violet-300">
                /badge/latest
              </code>{" "}
              &mdash; resolves to current canonical SIP version (today: {version}).
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-violet-300">
                ?theme=light
              </code>{" "}
              &mdash; light variant for light README backgrounds (default is dark).
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              Cached for 1h in browsers, 24h at the edge. No tracking pixels.
              Badge requests stay private.
            </li>
          </ul>
        </Section>

        {/* CTA back to protocol */}
        <section className="mt-24">
          <div className="rounded-2xl border border-violet-500/[0.18] bg-gradient-to-br from-violet-500/[0.06] via-transparent to-fuchsia-500/[0.05] p-8">
            <p className="text-[11px] font-medium uppercase tracking-widest text-violet-400/80">
              Next
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
              Generate your attestation block
            </h2>
            <p className="mt-4 max-w-xl text-[14px] leading-[1.85] text-slate-400">
              The badge is the surface. The attestation block is the substance.
              Read the protocol to see the full contract, then run{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-violet-300">
                /sip-attest
              </code>{" "}
              against your artifact.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/protocol"
                className="rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.2)]"
              >
                Read the protocol &rarr;
              </Link>
              <a
                href="https://github.com/frankxai/Starlight-Intelligence-System/blob/main/.claude/commands/sip-attest.md"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/[0.1] px-5 py-2.5 text-[14px] font-medium text-white transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
              >
                /sip-attest contract
              </a>
            </div>
          </div>

          <p className="mt-10 text-[11px] uppercase tracking-widest text-slate-600">
            Built on SIP &middot; {version} &middot; MIT
          </p>
        </section>
      </div>
    </div>
  );
}

function Section({
  eyebrow,
  heading,
  children,
}: {
  eyebrow: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16 first:mt-0">
      <p className="text-[11px] font-medium uppercase tracking-widest text-slate-600">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
        {heading}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function CodeBlock({
  label,
  children,
}: {
  label: string;
  children: string;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c12]">
      <div className="border-b border-white/[0.06] px-4 py-2">
        <code className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          {label}
        </code>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-[1.7] text-slate-300">
        {children}
      </pre>
    </div>
  );
}
