import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Starlight Intelligence Protocol — v1.1.1",
  description:
    "Six-layer protocol for sovereign creator alliances. File contract, attestation, MCP registry, commands, sovereignty, archetypes. MIT.",
  openGraph: {
    title: "Starlight Intelligence Protocol — v1.1.1",
    description:
      "Six-layer protocol for sovereign creator alliances. File contract, attestation, MCP registry, commands, sovereignty, archetypes. MIT.",
    type: "article",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Starlight Intelligence Protocol v1.1.1" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Starlight Intelligence Protocol — v1.1.1",
    description:
      "Six-layer protocol for sovereign creator alliances. File contract, attestation, MCP registry, commands, sovereignty, archetypes. MIT.",
    images: ["/opengraph-image"],
  },
};

const SIP_GITHUB_URL =
  "https://github.com/frankxai/Starlight-Intelligence-System/blob/main/SIP.md";

const FILE_CONTRACT_ROWS: Array<{
  file: string;
  purpose: string;
  required: string;
}> = [
  {
    file: "SKILL.md",
    purpose:
      "Behavior definition — what the AI adopts when this context is loaded",
    required: "yes",
  },
  {
    file: "AGENTS.md",
    purpose: "Voices / agent definitions",
    required: "yes if >1 agent",
  },
  {
    file: "MEMORY.md",
    purpose: "Durable state, commitments, open forks",
    required: "yes",
  },
  {
    file: "CANON.md",
    purpose: "Archetypes, world rules, domain constants",
    required: "optional",
  },
  {
    file: "SOUL.md",
    purpose:
      "Founder or vertical essence — the thing that must not drift",
    required: "optional but recommended",
  },
  {
    file: "STACK.md",
    purpose: "Adopted stack choices (may inherit from Starlight's)",
    required: "optional",
  },
  {
    file: ".claude/commands/*.md",
    purpose: "Slash-command contracts",
    required: "as needed",
  },
];

const COMMAND_TIERS: Array<{
  tier: string;
  prefix: string;
  owner: string;
  example: string;
}> = [
  {
    tier: "Protocol",
    prefix: "/sip-*",
    owner: "Starlight (Frank)",
    example: "/sip-attest",
  },
  {
    tier: "Alliance",
    prefix: "/alliance-*",
    owner: "shared across alliance nodes",
    example: "/alliance-reflect",
  },
  {
    tier: "Vertical",
    prefix: "/<vertical>-*",
    owner: "vertical owner",
    example: "/arcanea-canon, /wealth-dpi",
  },
  {
    tier: "Sovereign",
    prefix: "/<name>-*",
    owner: "individual sovereign node",
    example: "/sovereign-signal, /openclaw-audit",
  },
];

const SOVEREIGNTY_CLAUSES: Array<{ title: string; body: string }> = [
  {
    title: "Sovereignty.",
    body: "Each party retains full decision rights inside its declared domain. Advice ≠ override.",
  },
  {
    title: "Attribution.",
    body: 'Every shared artifact carries the "Built on SIP" block. Silent composition is a breach.',
  },
  {
    title: "Reciprocity of canon.",
    body: "Using another party's canon requires the canon's license terms (default CC-BY-NC for Arcanea canon).",
  },
  {
    title: "Commitment shape.",
    body: "Cross-party commitments name artifacts and dates, never intentions.",
  },
  {
    title: "Fork resolution.",
    body: "Disagreements route through /alliance-decide. One node owns each fork per declared domain; others advise.",
  },
  {
    title: "Exit.",
    body: "Any party can leave the composition. Attribution history remains immutable.",
  },
];

const ATTESTATION_BLOCK = `---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v<semver>
- Verticals: [<list>]
- Canon: [<list or "none">]
- Nodes: [<list of sovereign contributors>]
Generated: <ISO date>
---`;

const MCP_REGISTRY_JSON = `{
  "name": "arcanea-mcp",
  "sip_version": "1.0.0",
  "provides": ["arcanea.canon", "arcanea.guardians", "arcanea.veltara"],
  "requires": [],
  "attestation": { "built_on_sip": true }
}`;

const FOOTER_ATTESTATION = `---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.0.0
- Verticals: [starlight]
- Canon: ["none"]
- Nodes: [Starlight Holding BV]
Generated: 2026-04-22
---`;

export default function ProtocolPage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-mesh-1 absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-violet-600/[0.05] blur-[100px]" />
          <div className="animate-mesh-2 absolute right-0 top-20 h-[300px] w-[300px] rounded-full bg-cyan-500/[0.04] blur-[80px]" />
          <div className="animate-mesh-3 absolute left-1/3 bottom-0 h-[280px] w-[280px] rounded-full bg-fuchsia-500/[0.04] blur-[90px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-20 md:py-28">
          <p className="text-[11px] font-medium uppercase tracking-widest text-violet-400">
            The protocol
          </p>
          <h1 className="mt-3 font-serif text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
            Starlight Intelligence Protocol
          </h1>
          <p className="mt-4 font-mono text-[13px] uppercase tracking-widest text-slate-500">
            v1.0.0
          </p>
          <p className="mt-6 max-w-xl text-[15px] leading-[1.8] text-slate-400">
            The contract that lets sovereign parties compose intelligence
            systems without losing sovereignty.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={SIP_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.2)]"
            >
              Read the spec on GitHub &rarr;
            </a>
            <a
              href="#adopt-sip"
              className="rounded-full border border-white/[0.1] px-5 py-2.5 text-[14px] font-medium text-white transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
            >
              Adopt SIP
            </a>
          </div>
        </div>
      </section>

      {/* ── Source-of-truth banner ── */}
      <section className="border-b border-white/[0.08] bg-white/[0.01] px-6 py-4">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-slate-500">
          <span className="text-[10px] uppercase tracking-widest text-slate-400">
            Canonical source
          </span>
          <span className="text-slate-700">·</span>
          <a
            href={SIP_GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-slate-400 transition-std hover:text-violet-300"
          >
            frankxai/Starlight-Intelligence-System
          </a>
          <span className="text-slate-700">·</span>
          <span className="font-mono text-slate-400">SIP.md</span>
          <span className="text-slate-700">·</span>
          <span>MIT-licensed</span>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        {/* ── Scope ── */}
        <Section
          eyebrow="00 / Scope"
          heading="What SIP defines"
        >
          <p className="text-[15px] leading-[1.85] text-slate-300">
            SIP defines <em>how</em> intelligence systems are built, attested,
            and composed across sovereign parties. It does not define{" "}
            <em>what</em> is built. It is the minimum viable shared contract.
          </p>
        </Section>

        {/* ── Layer 1 — File contract ── */}
        <Section
          eyebrow="Layer 1"
          heading="File contract"
        >
          <p className="text-[15px] leading-[1.85] text-slate-300">
            Every SIP-compliant repository carries these files at the root or
            inside{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-violet-300">
              .&lt;vertical&gt;/
            </code>
            :
          </p>

          <div className="mt-6 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c12]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                      File
                    </th>
                    <th scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                      Purpose
                    </th>
                    <th scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                      Required
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {FILE_CONTRACT_ROWS.map((row, i) => (
                    <tr
                      key={row.file}
                      className={
                        i < FILE_CONTRACT_ROWS.length - 1
                          ? "border-b border-white/[0.08]"
                          : ""
                      }
                    >
                      <td className="px-4 py-3 align-top font-mono text-[12px] text-violet-300">
                        {row.file}
                      </td>
                      <td className="px-4 py-3 align-top text-slate-300">
                        {row.purpose}
                      </td>
                      <td className="px-4 py-3 align-top text-slate-500">
                        {row.required}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-8 text-[15px] leading-[1.85] text-slate-300">
            File extensions beyond markdown:
          </p>
          <ul className="mt-4 space-y-3 pl-6 text-[14px] text-slate-400">
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-violet-300">
                .arc
              </code>{" "}
              — agent configuration (JSON or YAML, schema TBD v1.1).
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-violet-300">
                .nea
              </code>{" "}
              — narrative / world / canon configuration (JSON or YAML).
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-violet-300">
                .skill
              </code>{" "}
              — compact skill descriptor for embedding into larger skill packs.
            </li>
          </ul>
        </Section>

        {/* ── Layer 2 — Attestation ── */}
        <Section
          eyebrow="Layer 2"
          heading="Attestation protocol"
        >
          <p className="text-[15px] leading-[1.85] text-slate-300">
            Every artifact that composes ≥1 SIP element carries a &quot;Built on
            SIP&quot; block. The block is emitted via{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-violet-300">
              /sip-attest
            </code>
            , which refuses to emit without real contribution. Attribution does
            not mean credit <em>transfer</em> — it means credit{" "}
            <em>compounding</em> across every adopter.
          </p>

          <p className="mt-6 text-[14px] uppercase tracking-widest text-slate-400">
            Minimum block
          </p>
          <CodeBlock label="attestation">{ATTESTATION_BLOCK}</CodeBlock>

          <p className="mt-8 text-[14px] uppercase tracking-widest text-slate-400">
            Pinning rules
          </p>
          <ul className="mt-4 space-y-3 pl-6 text-[14px] text-slate-400">
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              Substrate is pinned by SemVer.
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              Vertical contributions are pinned by commit SHA where available.
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              Canon is pinned by canon version tag (Arcanea canon is versioned
              separately in{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-violet-300">
                arcanea-ecosystem
              </code>
              ).
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              Unpinnable contributions are marked{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-violet-300">
                @unpinned
              </code>
              , never fabricated.
            </li>
          </ul>
        </Section>

        {/* ── Layer 3 — MCP registry ── */}
        <Section
          eyebrow="Layer 3"
          heading="MCP registry standard"
        >
          <p className="text-[15px] leading-[1.85] text-slate-300">
            MCP servers that expose SIP-native tools declare themselves via{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-violet-300">
              mcp.json
            </code>{" "}
            in their repo root:
          </p>

          <CodeBlock label="mcp.json">{MCP_REGISTRY_JSON}</CodeBlock>

          <p className="mt-6 text-[15px] leading-[1.85] text-slate-300">
            The registry itself is a flat file at{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-violet-300">
              starlight/REGISTRY.md
            </code>{" "}
            (v1.1 will promote to a queryable MCP).
          </p>
        </Section>

        {/* ── Layer 4 — Command taxonomy ── */}
        <Section
          eyebrow="Layer 4"
          heading="Command taxonomy"
        >
          <p className="text-[15px] leading-[1.85] text-slate-300">
            Four command tiers, each with a naming convention and
            decision-rights rule:
          </p>

          <div className="mt-6 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c12]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                      Tier
                    </th>
                    <th scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                      Prefix / location
                    </th>
                    <th scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                      Owner
                    </th>
                    <th scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                      Example
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMMAND_TIERS.map((row, i) => (
                    <tr
                      key={row.tier}
                      className={
                        i < COMMAND_TIERS.length - 1
                          ? "border-b border-white/[0.08]"
                          : ""
                      }
                    >
                      <td className="px-4 py-3 align-top font-semibold text-white">
                        {row.tier}
                      </td>
                      <td className="px-4 py-3 align-top font-mono text-[12px] text-violet-300">
                        {row.prefix}
                      </td>
                      <td className="px-4 py-3 align-top text-slate-400">
                        {row.owner}
                      </td>
                      <td className="px-4 py-3 align-top font-mono text-[12px] text-slate-300">
                        {row.example}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-6 text-[14px] leading-[1.85] text-slate-400">
            Commands in lower tiers may depend on higher-tier commands.
            Higher-tier commands never depend on lower-tier ones.
          </p>
        </Section>

        {/* ── Layer 5 — Sovereignty + attribution ── */}
        <Section
          eyebrow="Layer 5"
          heading="Sovereignty + attribution clause"
        >
          <p className="text-[15px] leading-[1.85] text-slate-300">
            Non-negotiable social contract. Every party that adopts SIP
            accepts:
          </p>

          <ol className="mt-6 space-y-4">
            {SOVEREIGNTY_CLAUSES.map((clause, i) => (
              <li
                key={clause.title}
                className="flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-std hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-violet-500/[0.25] bg-violet-500/[0.08] font-mono text-[12px] text-violet-300">
                  {i + 1}
                </span>
                <p className="text-[14px] leading-[1.7] text-slate-300">
                  <strong className="text-white">{clause.title}</strong>{" "}
                  {clause.body}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        {/* ── Layer 6 — Archetype extension ── */}
        <Section
          eyebrow="Layer 6 · optional"
          heading="Archetype extension"
        >
          <p className="text-[15px] leading-[1.85] text-slate-300">
            Verticals may adopt or extend canonical archetypes. The foundational
            archetype set (Arcanea&apos;s Guardians / Vel&apos;Tara / Hz
            grounding) is licensed CC-BY-NC by Arcanea BV. Verticals may:
          </p>

          <ul className="mt-6 space-y-3 pl-6 text-[14px] text-slate-400">
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              <strong className="text-slate-200">Adopt whole</strong> — import
              the full archetype set with attribution.
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              <strong className="text-slate-200">Extend</strong> — add new
              archetypes in their own namespace without renaming existing ones.
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              <strong className="text-slate-200">Decline</strong> — use their
              own archetype layer or none at all.
            </li>
          </ul>

          <p className="mt-6 text-[14px] leading-[1.85] text-slate-400">
            Archetypes are not required for SIP compliance. Protocol,
            attestation, and sovereignty are. Archetypes are canon-layer
            compounding, adopted where the vertical benefits.
          </p>
        </Section>

        {/* ── Versioning ── */}
        <Section
          eyebrow="Versioning"
          heading="How SIP evolves"
        >
          <ul className="space-y-3 pl-6 text-[14px] text-slate-400">
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              SIP versions are SemVer.
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              Breaking changes require a major bump and a 90-day deprecation
              window.
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              Canonical changelog:{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-violet-300">
                starlightintelligence.org/protocol/changelog
              </code>
              .
            </li>
          </ul>
        </Section>

        {/* ── License ── */}
        <Section
          eyebrow="License"
          heading="What is owned by whom"
        >
          <ul className="space-y-3 pl-6 text-[14px] text-slate-400">
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              <strong className="text-slate-200">
                This spec (SIP.md):
              </strong>{" "}
              MIT.
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              <strong className="text-slate-200">
                Reference command implementations
              </strong>{" "}
              (
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-violet-300">
                .claude/commands/*
              </code>
              ): MIT.
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              <strong className="text-slate-200">
                Arcanea canon (if adopted):
              </strong>{" "}
              CC-BY-NC 4.0, © Arcanea BV.
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              <strong className="text-slate-200">Per-vertical content:</strong>{" "}
              owned by the vertical entity.
            </li>
          </ul>
        </Section>

        {/* ── Adopt SIP — footer attestation block ── */}
        <section
          id="adopt-sip"
          className="mt-24 scroll-mt-24"
        >
          <p className="text-[11px] font-medium uppercase tracking-widest text-violet-400/80">
            Adopt SIP
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
            Built on SIP
          </h2>
          <p className="mt-4 max-w-xl text-[14px] leading-[1.85] text-slate-400">
            Every artifact that composes a SIP element carries an attestation
            block. This page is one such artifact. Copy the shape below into
            your own work to compound credit across the alliance.
          </p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-violet-500/[0.18] bg-gradient-to-br from-violet-500/[0.06] via-transparent to-fuchsia-500/[0.05]">
            <div className="border-b border-white/[0.06] px-5 py-3">
              <code className="font-mono text-[10px] uppercase tracking-widest text-violet-300/80">
                attestation · this page
              </code>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-[1.8] text-slate-200">
              {FOOTER_ATTESTATION}
            </pre>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={SIP_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.2)]"
            >
              Read SIP.md on GitHub &rarr;
            </a>
            <Link
              href="/architecture"
              className="rounded-full border border-white/[0.1] px-5 py-2.5 text-[14px] font-medium text-white transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
            >
              See the architecture
            </Link>
          </div>

          <p className="mt-10 text-[11px] uppercase tracking-widest text-slate-400">
            Built on SIP · v1.0.0 · Authored by Frank Riemer (Starlight Holding
            BV) · MIT
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
      <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
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
        <code className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
          {label}
        </code>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-[1.7] text-slate-300">
        {children}
      </pre>
    </div>
  );
}
