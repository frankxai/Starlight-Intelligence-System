import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { evidenceItems, SOURCE_COMMIT, sourceUrl } from "@/lib/next-era";

export const metadata: Metadata = {
  title: "Proof and product status",
  description: "A source-linked status map for Starlight's working local tools, staged integrations, research, and horizon claims.",
  alternates: { canonical: "/proof" },
};

function statusClass(status: string) {
  if (status === "Live locally") return "era-status era-status-live";
  if (status === "Staged") return "era-status era-status-staged";
  if (status === "Research") return "era-status era-status-research";
  return "era-status era-status-horizon";
}

export default function ProofPage() {
  return (
    <div className="era era-proof-page">
      <header className="era-section era-horizon era-subhero">
        <div className="era-wrap era-essay-grid"><p className="era-side-label">Proof, before promise</p><div><h1>What works. What still needs proof.</h1><p className="era-lead">Each status below is tied to current source, a test where available, and a boundary on what may be claimed. The reference point is main at <code>{SOURCE_COMMIT.slice(0, 8)}</code>, audited 23 September 2026.</p></div></div>
      </header>
      <section className="era-section era-evidence" aria-labelledby="proof-definitions">
        <div className="era-wrap era-essay-grid"><p className="era-side-label">Claim language</p><div><h2 id="proof-definitions">Four words with distinct meanings.</h2><dl className="era-definitions"><div><dt>Live locally</dt><dd>Executable code and a verification path in the repository. It says nothing about hosted uptime or customer outcomes.</dd></div><div><dt>Staged</dt><dd>Material implementation exists, but an end-to-end promise or deployed state is incomplete.</dd></div><div><dt>Research</dt><dd>Exploration or specification exists without sufficient product implementation.</dd></div><div><dt>Horizon</dt><dd>A deliberate long-duration ambition, not a present product capability.</dd></div></dl></div></div>
      </section>
      <section className="era-section era-evidence" aria-labelledby="proof-map">
        <div className="era-wrap"><div className="era-section-heading"><p className="era-side-label">Capability map</p><div><h2 id="proof-map">Inspect the source.</h2><p>These links pin to the audited commit. Tests verify local behavior; they do not establish venture-level impact.</p></div></div><div className="era-evidence-table">
          {evidenceItems.map((item) => <article className="era-evidence-row" key={item.name}><div><span className={statusClass(item.status)}>{item.status}</span><h3>{item.name}</h3></div><p>{item.finding}</p><p className="era-boundary">{item.boundary}</p><div className="era-source-links"><a href={sourceUrl(item.source)} target="_blank" rel="noopener noreferrer">Source <ExternalLink size={14} aria-hidden="true" /></a>{item.test && <a href={sourceUrl(item.test)} target="_blank" rel="noopener noreferrer">Test <ExternalLink size={14} aria-hidden="true" /></a>}</div></article>)}
        </div></div>
      </section>
      <section className="era-section era-compound" aria-labelledby="proof-thesis"><div className="era-wrap era-essay-grid"><p className="era-side-label">A measurable thesis</p><div><h2 id="proof-thesis">When does intelligence compound?</h2><p className="era-lead">When a verified capability is reused in another venture and improves a real outcome compared with its baseline.</p><div className="era-record"><div><span>01 · Source</span><strong>Venture and capability version</strong></div><div><span>02 · Verification</span><strong>Test or signed receipt</strong></div><div><span>03 · Transfer</span><strong>Permission and adaptation</strong></div><div><span>04 · Outcome</span><strong>Baseline and observed change</strong></div></div><p className="era-caveat">No complete qualifying transfer record is evidenced on audited main. The baseline is unmeasured. Seed workspace revenue, health, release states, and coverage are demo data and do not appear here as traction.</p></div></div></section>
      <section className="era-section era-evidence" aria-labelledby="proof-developer"><div className="era-wrap era-essay-grid"><p className="era-side-label">Developer path</p><div><h2 id="proof-developer">From claim to a local check.</h2><ol className="era-developer-steps"><li><strong>Read the implementation.</strong><a href={sourceUrl("src/memory.ts")} target="_blank" rel="noopener noreferrer">JSONL memory <ExternalLink size={14} aria-hidden="true" /></a></li><li><strong>Run a representative test.</strong><code>node --test protocol/test/conform.test.mjs protocol/test/sign.test.mjs</code></li><li><strong>Inspect sovereignty.</strong><a href={sourceUrl("SIP.md")} target="_blank" rel="noopener noreferrer">SIP contract <ExternalLink size={14} aria-hidden="true" /></a><span>Local source and file formats can be copied or forked; a hosted federation is not claimed.</span></li><li><strong>Try the build.</strong><Link href="/quickstart">Open the working quickstart <ArrowRight size={15} aria-hidden="true" /></Link></li></ol><p className="era-caveat">A “Built on SIP” label declares composition. Use the receipt verifier when a cryptographic proof is required. Private memory stays outside this public site.</p></div></div></section>
      <section className="era-section era-close"><div className="era-wrap era-close-inner"><div><p className="era-side-label">Next step</p><h2>Try one capability locally.</h2></div><Link className="era-button era-button-primary" href="/quickstart">Open quickstart <ArrowRight size={18} aria-hidden="true" /></Link></div></section>
    </div>
  );
}
