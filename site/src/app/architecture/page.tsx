import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { sourceUrl } from "@/lib/next-era";
import { productPrimitives } from "@/lib/narrative-artifacts";

export const metadata: Metadata = {
  title: "Architecture",
  description: "How Starlight's local memory, capability, work, and evidence tools fit together—and where the integrated portfolio loop remains staged.",
  alternates: { canonical: "/architecture" },
};

const execution = [
  { label: "Storage", detail: "Local JSONL records are source material; indices can be rebuilt.", source: "src/memory.ts" },
  { label: "Access", detail: "A local MCP server and host adapters expose selected operations.", source: "src/mcp-server.ts" },
  { label: "Capability", detail: "Foundry can resolve, compile, and prove local skill packages; plugin coverage is incomplete.", source: "tools/foundry/lib/prove.mjs" },
  { label: "Verification", detail: "SIP tools check conformance and sign or verify a specific receipt.", source: "protocol/README.md" },
] as const;

function statusClass(status: string) {
  return status === "Live locally" ? "era-status era-status-live" : "era-status era-status-staged";
}

export default function ArchitecturePage() {
  return (
    <div className="era era-architecture">
      <header className="era-section era-evidence era-architecture-hero">
        <div className="era-wrap era-essay-grid"><p className="era-side-label">System architecture</p><div><h1>One system. Seven parts at different stages.</h1><p className="era-lead">Starlight preserves work, coordinates responsibility, packages reusable capability, and makes claims checkable. These are public groupings over existing code; they do not replace the repository’s ten Intelligence Systems or SIP contract.</p><Link className="era-text-link" href="/proof">Check current status <ArrowRight size={17} aria-hidden="true" /></Link></div></div>
      </header>

      <section className="era-section era-horizon" aria-labelledby="architecture-flow">
        <div className="era-wrap era-essay-grid"><p className="era-side-label">The product loop</p><div><h2 id="architecture-flow">From venture work to stronger starting points.</h2><p className="era-lead">A venture creates value. Its team captures consequential context, verifies a reusable method, and adapts it in another venture. Outcome measurement decides whether intelligence actually compounded.</p><ol className="era-architecture-flow"><li>Create and operate</li><li>Capture and verify</li><li>Package capability</li><li>Transfer with permission</li><li>Measure the result</li></ol><p className="era-caveat">The local primitives below have different statuses. A complete, measured venture-to-venture transfer is not yet evidenced.</p></div></div>
      </section>

      <section className="era-section era-evidence" aria-labelledby="architecture-primitives">
        <div className="era-wrap"><div className="era-section-heading"><p className="era-side-label">Public product model</p><div><h2 id="architecture-primitives">The seven parts.</h2><p>Each name points to source. “Live locally” does not imply a hosted service or measured portfolio outcome.</p></div></div><div className="era-architecture-grid">{productPrimitives.map((part, index) => <article key={part.name}><span className="era-architecture-index">0{index + 1}</span><span className={statusClass(part.status)}>{part.status}</span><h3>{part.name}</h3><p>{part.meaning}</p><a href={sourceUrl(part.source)} target="_blank" rel="noopener noreferrer">Read source <ExternalLink size={14} aria-hidden="true" /></a></article>)}</div></div>
      </section>

      <section className="era-section era-evidence era-sovereign" aria-labelledby="architecture-runtime">
        <div className="era-wrap era-essay-grid"><p className="era-side-label">Local execution</p><div><h2 id="architecture-runtime">A path from claim to code.</h2><div className="era-architecture-stack">{execution.map((layer) => <div key={layer.label}><strong>{layer.label}</strong><p>{layer.detail}</p><a href={sourceUrl(layer.source)} target="_blank" rel="noopener noreferrer">{layer.source} <ExternalLink size={14} aria-hidden="true" /></a></div>)}</div><p className="era-caveat">The adapter factory includes Claude Code, Cursor, Codex, Gemini CLI, OpenCode, Antigravity, Grok, and Hermes. Adapter code and tests are local evidence; a particular host connection still needs to be checked in that host.</p><a className="era-text-link" href={sourceUrl("src/adapters/index.ts")} target="_blank" rel="noopener noreferrer">Inspect adapter registry <ExternalLink size={14} aria-hidden="true" /></a></div></div>
      </section>

      <section className="era-section era-evidence" aria-labelledby="architecture-boundaries">
        <div className="era-wrap era-essay-grid"><p className="era-side-label">Boundaries</p><div><h2 id="architecture-boundaries">Owned, inspectable, and still being tested.</h2><div className="era-architecture-boundaries"><article><h3>Sovereignty</h3><p>SIP states owner decision rights. Source and local file formats support a fork path. Independent export of a complete venture remains a product acceptance test.</p><Link href="/protocol">Read the SIP contract <ArrowRight size={15} aria-hidden="true" /></Link></article><article><h3>Network</h3><p>The graph profile is a proposal and local reference implementation. Federation between sovereign systems and external interoperability remain research.</p><a href={sourceUrl("protocol/README.md")} target="_blank" rel="noopener noreferrer">Read protocol boundary <ExternalLink size={14} aria-hidden="true" /></a></article><article><h3>Private and public memory</h3><p>Public Notes are curated into a separate allowlisted collection. Private vault material is not an input to the public site.</p><Link href="/notes">Inspect public Notes <ArrowRight size={15} aria-hidden="true" /></Link></article></div></div></div>
      </section>

      <section className="era-section era-horizon" aria-labelledby="architecture-developer"><div className="era-wrap era-essay-grid"><p className="era-side-label">Developer path</p><div><h2 id="architecture-developer">Run one local check.</h2><p className="era-lead">Clone the repository, install its pinned dependencies, build the TypeScript source, then run the SIP conformance and signing tests. The quickstart shows host-specific MCP configuration.</p><pre className="era-architecture-code"><code>npm ci{"\n"}npm run build{"\n"}node --test protocol/test/conform.test.mjs protocol/test/sign.test.mjs</code></pre><div className="era-inline-links"><Link href="/quickstart">Open quickstart <ArrowRight size={16} aria-hidden="true" /></Link><Link href="/proof">Read the evidence map <ArrowRight size={16} aria-hidden="true" /></Link><a href={sourceUrl("STACK.md")} target="_blank" rel="noopener noreferrer">Read the deeper ten-system taxonomy <ExternalLink size={14} aria-hidden="true" /></a></div></div></div></section>
    </div>
  );
}
