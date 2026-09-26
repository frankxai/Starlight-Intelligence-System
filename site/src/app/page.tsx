import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { StarlightMark } from "@/components/StarlightMark";
import { mechanism, sourceUrl, workingNow } from "@/lib/next-era";

export const metadata: Metadata = {
  title: "Starlight — intelligence should compound",
  description:
    "Local-first intelligence infrastructure for owner-directed venture portfolios. See working memory, capability, and evidence tools; inspect what is still being built.",
  alternates: { canonical: "/" },
};

const constellation = [
  {
    name: "Starlight",
    role: "Infrastructure",
    detail: "Shared memory, capabilities, governed work, and evidence.",
    href: "/architecture",
    external: false,
  },
  {
    name: "Independent ventures",
    role: "Value and invention",
    detail: "Products and teams with their own decisions, customers, and future.",
    href: "/constitution",
    external: false,
  },
  {
    name: "FrankX",
    role: "Founder and operator",
    detail: "Public exploration, accountable authorship, and applied practice.",
    href: "https://frankx.ai",
    external: true,
  },
  {
    name: "Arcanea",
    role: "Culture and imagination",
    detail: "Worlds, art, and symbolic IP that ask which futures are worth making.",
    href: "https://arcanea.ai",
    external: true,
  },
  {
    name: "Starlight Notes",
    role: "Public knowledge",
    detail: "Curated ideas, evidence, questions, and values that can outlive a tool.",
    href: "/notes",
    external: false,
  },
] as const;

export default function HomePage() {
  return (
    <div className="era">
      <section className="era-hero era-horizon" aria-labelledby="era-title">
        <div className="era-wrap era-hero-grid">
          <div className="era-hero-copy">
            <div className="era-brandline"><StarlightMark size={27} /><span>Starlight Intelligence</span></div>
            <h1 id="era-title">Intelligence should <em>compound.</em></h1>
            <p className="era-hero-category">Local-first intelligence infrastructure for owner-directed venture portfolios.</p>
            <p className="era-hero-support">Build with human and AI teams. Keep what they learn. Verify what works. Give the next independent venture a stronger starting point.</p>
            <Link className="era-button era-button-primary" href="/proof">See the evidence <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
          <aside className="era-instrument" aria-label="Working Starlight components">
            <div className="era-instrument-top"><span>Current local proof</span><span>Source snapshot · 23 Sep 2026</span></div>
            {workingNow.map((item, index) => (
              <a className="era-instrument-row" href={sourceUrl(item.source)} key={item.name} target="_blank" rel="noopener noreferrer">
                <span className="era-instrument-index">0{index + 1}</span>
                <span><strong>{item.name}</strong><small>{item.source}</small></span>
                <ExternalLink size={15} aria-hidden="true" />
              </a>
            ))}
            <p className="era-instrument-note">Local code and tests are inspectable. Portfolio outcomes still need measured transfer receipts.</p>
          </aside>
        </div>
      </section>

      <section className="era-section era-evidence" aria-labelledby="era-problem">
        <div className="era-wrap era-essay-grid">
          <p className="era-side-label">The problem</p>
          <div>
            <h2 id="era-problem">Teams generate intelligence, then lose it.</h2>
            <p className="era-lead">Decisions disappear into conversations. A useful workflow stays trapped in one project. A new team reconstructs context another team already earned.</p>
            <div className="era-loss-grid">
              <p><strong>Forgotten decisions</strong><span>Why a choice was made becomes hard to recover.</span></p>
              <p><strong>Duplicated work</strong><span>Patterns are rebuilt because they were never verified or portable.</span></p>
              <p><strong>Vendor-bound context</strong><span>Knowledge stays inside a tool instead of with its owner.</span></p>
            </div>
          </div>
        </div>
      </section>

      <section className="era-section era-horizon era-mechanism" aria-labelledby="era-mechanism">
        <div className="era-wrap">
          <div className="era-section-heading"><p className="era-side-label">How it works</p><div><h2 id="era-mechanism">From work to reusable capability.</h2><p>Create real value first. Keep the evidence that lets another venture use the learning responsibly.</p></div></div>
          <ol className="era-step-grid">
            {mechanism.map((step, index) => (
              <li key={step.name}><span className="era-step-number">0{index + 1}</span><h3>{step.name}</h3><p>{step.detail}</p>{step.name === "Transfer" && <span className="era-step-status">End-to-end outcome staged</span>}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="era-section era-evidence" aria-labelledby="era-working">
        <div className="era-wrap era-essay-grid">
          <p className="era-side-label">What works today</p>
          <div>
            <h2 id="era-working">A working local substrate. An unfinished portfolio loop.</h2>
            <p className="era-lead">Memory and signed-receipt tools pass local tests. Foundry has working skill-package paths, while its OpenAI plugin projection is blocked on audited main. Command, transfer, and autonomous operation need further proof.</p>
            <div className="era-proof-list">
              {workingNow.map((item) => (
                <article key={item.name}>
                  <span className="era-status era-status-live">{item.status}</span>
                  <h3>{item.name}</h3>
                  <p>{item.finding}</p>
                  <a href={sourceUrl(item.test ?? item.source)} target="_blank" rel="noopener noreferrer">Inspect {item.test ? "test" : "source"}<ExternalLink size={14} aria-hidden="true" /></a>
                </article>
              ))}
            </div>
            <Link className="era-text-link" href="/proof">See the full claim and evidence map <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="era-section era-compound" aria-labelledby="era-compound">
        <div className="era-wrap era-essay-grid">
          <p className="era-side-label">The product test</p>
          <div>
            <h2 id="era-compound">Venture N+1 should begin more capable.</h2>
            <p className="era-lead">The thesis becomes real only when a capability crosses a venture boundary and improves a measured outcome.</p>
            <div className="era-record" role="group" aria-label="Required fields for a verified capability transfer">
              <div><span>Source venture</span><strong>Where it was proven</strong></div>
              <div><span>Capability + receipt</span><strong>What can be checked</strong></div>
              <div><span>Destination venture</span><strong>Where it was adapted</strong></div>
              <div><span>Baseline → outcome</span><strong>What actually improved</strong></div>
            </div>
            <p className="era-caveat">This is an acceptance contract, not a claimed completed transfer. The current baseline is unmeasured.</p>
          </div>
        </div>
      </section>

      <section className="era-section era-evidence" aria-labelledby="era-portfolio">
        <div className="era-wrap era-essay-grid">
          <p className="era-side-label">The portfolio</p>
          <div>
            <h2 id="era-portfolio">A constellation of distinct ventures.</h2>
            <p className="era-lead">Shared capability should strengthen a venture without absorbing its identity or authority.</p>
            <div className="era-constellation">
              {constellation.map((item) => <a key={item.name} href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined}><small>{item.role}</small><strong>{item.name}</strong><span>{item.detail}</span><ArrowRight size={16} aria-hidden="true" /></a>)}
            </div>
          </div>
        </div>
      </section>

      <section className="era-section era-evidence era-sovereign" aria-labelledby="era-sovereign">
        <div className="era-wrap era-essay-grid">
          <p className="era-side-label">Sovereign architecture</p>
          <div>
            <h2 id="era-sovereign">The owner keeps the keys and the context.</h2>
            <p className="era-lead">SIP states the decision-rights contract. Local files and source code offer an export path. Signed receipts are a separate, verifiable claim of provenance.</p>
            <div className="era-inline-links"><Link href="/protocol">Read SIP <ArrowRight size={16} aria-hidden="true" /></Link><Link href="/architecture">See the architecture <ArrowRight size={16} aria-hidden="true" /></Link><Link href="/quickstart">Try the local tools <ArrowRight size={16} aria-hidden="true" /></Link></div>
          </div>
        </div>
      </section>

      <section className="era-section era-horizon era-future" aria-labelledby="era-future">
        <div className="era-wrap era-essay-grid">
          <p className="era-side-label">The long horizon</p>
          <div>
            <h2 id="era-future">Light travels. Knowledge survives. Intelligence compounds.</h2>
            <p className="era-lead">Stars helped people orient across distance and time. Starlight is an attempt to make useful knowledge survive changing tools, teams, and ventures. Over generations, the ambition reaches toward scientific discovery and a flourishing civilization.</p>
            <p className="era-caveat">That is a direction for the work, not a description of present product capability.</p>
            <Link className="era-text-link" href="/story">Read the Starlight story <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="era-section era-close" aria-labelledby="era-close">
        <div className="era-wrap era-close-inner"><div><p className="era-side-label">Start with what can be checked</p><h2 id="era-close">Follow the proof into the product.</h2></div><Link className="era-button era-button-primary" href="/proof">See the evidence <ArrowRight size={18} aria-hidden="true" /></Link></div>
      </section>
    </div>
  );
}
