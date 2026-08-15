import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  compactDigest,
  constellationProtocol,
  readableToken,
} from "@/lib/constellation-protocol";
import styles from "./constellation.module.css";

export const metadata: Metadata = {
  title: "Constellation Protocol & Pack Ledger",
  description:
    "The public trust, provenance, graph, and packaging ledger for 50 Starlight agents across 10 governed houses.",
  alternates: { canonical: "/constellation" },
  openGraph: {
    type: "website",
    url: "/constellation",
    title: "Constellation Protocol & Pack Ledger",
    description:
      "Inspect public agent, prompt, eval, visual, skill, graph, and packaging receipts without mistaking a web manifest for runtime authority.",
  },
};

const downloads = [
  {
    name: "Public portfolio",
    file: "portfolio.public.json",
    description: "Fifty public-safe profiles with prompts, structural eval linkage, graphs, and receipts.",
  },
  {
    name: "Capability manifest",
    file: "capability-pack.manifest.json",
    description: "Pinned skill references and capability boundaries. Methods only; never tool grants.",
  },
  {
    name: "Visual provenance",
    file: "visual-provenance.manifest.json",
    description: "Fifty owned, inspected portraits with content hashes, dimensions, and source receipts.",
  },
  {
    name: "Release receipt",
    file: "release.manifest.json",
    description: "Byte counts and SHA-256 receipts binding the public release artifacts together.",
  },
  {
    name: "Protocol projection",
    file: "constellation-protocol.public.json",
    description: "This domain’s public packaging ledger, house graph, and immutable source chain.",
  },
  {
    name: "Agent pack",
    file: "agent-pack.manifest.json",
    description: "Fifty profile receipts plus ten team contracts, packaged as preview-only blueprints.",
  },
  {
    name: "Skill pack",
    file: "skill-pack.manifest.json",
    description: "Forty-nine reference-only skill dependencies and the portable constellation composer.",
  },
  {
    name: "Plugin pack index",
    file: "plugin-pack.index.json",
    description: "The validated Codex plugin inventory binding agents, teams, portraits, and packs.",
  },
  {
    name: "Marketplace pack",
    file: "marketplace-pack.manifest.json",
    description: "The local Starlight Estate listing receipt; installation remains a user action.",
  },
  {
    name: "Multi-agent foundation",
    file: "foundation/foundation-pack.v1.json",
    description: "Ten system objects, seven control roles, five topology patterns, and public adoption templates.",
  },
];

export default function ConstellationProtocolPage() {
  const catalog = constellationProtocol;

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="constellation-title">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>PUBLIC ARTIFACT LEDGER · BUILT ON SIP</p>
            <h1 id="constellation-title">The constellation, as proof.</h1>
            <p className={styles.heroLede}>
              Fifty named agents across ten governed houses—published as profiles, prompt
              contracts, skill references, eval fixtures, graph edges, visual receipts,
              and explicitly bounded packaging states.
            </p>
            <div className={styles.heroActions}>
              <a href="#packaging">Inspect the pack ledger</a>
              <a href="/downloads/constellation/constellation-protocol.public.json" download>
                Download protocol JSON
              </a>
            </div>
            <p className={styles.heroBoundary}>
              This surface installs nothing and grants no authority. Live model evaluation
              remains <strong>{catalog.truth_contract.live_eval_status}</strong>.
            </p>
          </div>

          <article className={styles.releaseCard} aria-labelledby="release-card-title">
            <header>
              <span>CONSTELLATION RELEASE</span>
              <span>v1.0.0 · DRAFT</span>
            </header>
            <div className={styles.releaseTitle}>
              <div>
                <p>TRUST ENVELOPE</p>
                <h2 id="release-card-title">Public projection</h2>
              </div>
              <span className={styles.structural}>STRUCTURAL PASS</span>
            </div>
            <dl>
              <div><dt>canonical</dt><dd>{compactDigest(catalog.source.canonical_catalog_sha256)}</dd></div>
              <div><dt>projection</dt><dd>{compactDigest(catalog.source.public_projection_sha256)}</dd></div>
              <div><dt>release</dt><dd>{compactDigest(catalog.source.public_release_sha256)}</dd></div>
              <div><dt>capability pack</dt><dd>{compactDigest(catalog.source.capability_pack_digest)}</dd></div>
              <div><dt>visual manifest</dt><dd>{compactDigest(catalog.source.visual_manifest_sha256)}</dd></div>
            </dl>
            <footer>
              <span>private memory</span><strong>EXCLUDED</strong>
              <span>runtime authority</span><strong>NONE</strong>
            </footer>
          </article>
        </div>
      </section>

      <section className={styles.metrics} aria-label="Constellation release counts">
        <div><strong>{catalog.counts.swarms}</strong><span>houses</span></div>
        <div><strong>{catalog.counts.agents}</strong><span>agent profiles</span></div>
        <div><strong>{catalog.counts.prompt_contracts}</strong><span>prompt contracts</span></div>
        <div><strong>{catalog.counts.eval_suites}</strong><span>structural eval suites</span></div>
        <div><strong>{catalog.counts.graph_edges}</strong><span>explicit graph edges</span></div>
      </section>

      <section className={styles.trustSection} aria-labelledby="trust-title">
        <div className={styles.sectionIntro}>
          <p>01 / TRUST CHAIN</p>
          <h2 id="trust-title">A receipt at every boundary.</h2>
          <span>
            A portrait is not an identity grant. A prompt is not a tool grant. A manifest
            is not an install. A structural eval is not model-quality proof.
          </span>
        </div>
        <ol className={styles.trustChain}>
          {catalog.trust_chain.map((item, index) => (
            <li key={item}>
              <code>{String(index + 1).padStart(2, "0")}</code>
              <p>{item}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.packaging} id="packaging" aria-labelledby="packaging-title">
        <div className={styles.sectionIntro}>
          <p>02 / PACKAGING LEDGER</p>
          <h2 id="packaging-title">Ready, held, and absent are different states.</h2>
          <span>
            The ledger refuses the convenient fiction that every public artifact is already
            an installable marketplace product.
          </span>
        </div>
        <div className={styles.packagingTable} role="table" aria-label="Constellation packaging states">
          <div className={styles.packagingHead} role="row">
            <span role="columnheader">Primitive</span>
            <span role="columnheader">State</span>
            <span role="columnheader">Artifact</span>
            <span role="columnheader">Authority boundary</span>
          </div>
          {catalog.packaging_ledger.map((record) => {
            const isReady = record.state.includes("ready");
            return (
              <div className={styles.packagingRow} role="row" key={record.primitive}>
                <strong role="cell">{readableToken(record.primitive)}</strong>
                <span role="cell" className={isReady ? styles.ready : styles.held}>
                  {readableToken(record.state)}
                </span>
                <code role="cell">{record.artifact ?? "—"}</code>
                <span role="cell">{readableToken(record.authority)}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.downloads} aria-labelledby="downloads-title">
        <div className={styles.sectionIntro}>
          <p>03 / IMMUTABLE PUBLIC ARTIFACTS</p>
          <h2 id="downloads-title">Download the evidence, not a promise.</h2>
        </div>
        <div className={styles.downloadGrid}>
          {downloads.map((artifact, index) => (
            <a
              href={`/downloads/constellation/${artifact.file}`}
              download
              key={artifact.file}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{artifact.name}</h3>
              <p>{artifact.description}</p>
              <code>{artifact.file}</code>
            </a>
          ))}
        </div>
      </section>

      <nav className={styles.houseIndex} aria-label="Jump to a constellation house">
        {catalog.houses.map((house, index) => (
          <a href={`#${house.id}`} key={house.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {house.name}
          </a>
        ))}
      </nav>

      <div className={styles.houses}>
        {catalog.houses.map((house, houseIndex) => {
          const accent = ["#d6ae62", "#e77d38", "#67d9e6", "#e65aab", "#65c696"][houseIndex % 5];
          const houseStyle = { "--house-accent": accent } as CSSProperties;

          return (
            <section
              id={house.id}
              className={styles.house}
              style={houseStyle}
              key={house.id}
              aria-labelledby={`${house.id}-title`}
            >
              <header className={styles.houseHeader}>
                <div>
                  <p>HOUSE {String(houseIndex + 1).padStart(2, "0")} · {house.id}</p>
                  <h2 id={`${house.id}-title`}>{house.name}</h2>
                </div>
                <div>
                  <p>{house.purpose}</p>
                  <dl>
                    <div><dt>lead</dt><dd>{house.lead_agent_id}</dd></div>
                    <div><dt>members</dt><dd>{house.agents.length}</dd></div>
                  </dl>
                </div>
              </header>

              <div className={styles.agentLedger}>
                {house.agents.map((agent) => (
                  <article key={agent.id}>
                    <figure>
                      <Image
                        src={agent.visual.href}
                        alt={`${agent.display_name}, ${agent.role_title}`}
                        width={agent.visual.width}
                        height={agent.visual.height}
                        sizes="(max-width: 720px) 34vw, 150px"
                      />
                      <figcaption>{agent.role_kind}</figcaption>
                    </figure>
                    <div className={styles.agentIdentity}>
                      <span>{agent.role_title}</span>
                      <h3>{agent.display_name}</h3>
                      <code>{agent.id}</code>
                    </div>
                    <div className={styles.agentSkills}>
                      <span>SKILL REFERENCES</span>
                      <p>{agent.skill_refs.join(" · ")}</p>
                      <span>GRAPH ROUTES</span>
                      <p>{agent.graph.routes_to.length} outbound · {agent.graph.depends_on.length} dependencies</p>
                    </div>
                    <dl className={styles.receipts}>
                      <div><dt>card</dt><dd>{compactDigest(agent.receipts.card_sha256)}</dd></div>
                      <div><dt>prompt</dt><dd>{compactDigest(agent.receipts.prompt_sha256)}</dd></div>
                      <div><dt>eval</dt><dd>{compactDigest(agent.receipts.eval_sha256)}</dd></div>
                      <div><dt>visual</dt><dd>{compactDigest(agent.visual.sha256)}</dd></div>
                    </dl>
                    <div className={styles.agentBoundary}>
                      <span>DOES NOT AUTHORIZE</span>
                      <p>{agent.non_capabilities.join(" · ")}</p>
                      <a href={agent.profile_url}>Inspect full dossier on .ai ↗</a>
                    </div>
                  </article>
                ))}
              </div>

              <aside className={styles.houseBoundary}>
                <div><span>STOP</span><p>{house.shared_stop_conditions[0]}</p></div>
                <div><span>ESCALATE</span><p>{house.shared_escalation_conditions[0]}</p></div>
              </aside>
            </section>
          );
        })}
      </div>

      <section className={styles.surfaceMap} aria-labelledby="surface-map-title">
        <div>
          <p>04 / PUBLIC SURFACE MAP</p>
          <h2 id="surface-map-title">One canon. Three jobs.</h2>
        </div>
        <div className={styles.surfaceLinks}>
          <a href="https://starlightintelligence.ai/constellation">
            <span>.ai</span>
            <strong>Story, profiles, and sovereign swarm builder</strong>
            <small>Explore the visual experience ↗</small>
          </a>
          <Link href="/constellation">
            <span>.org</span>
            <strong>Protocol, provenance, and public pack receipts</strong>
            <small>You are here</small>
          </Link>
          <a href="https://starlightintelligence.academy/constellation-lab">
            <span>.academy</span>
            <strong>Operator curriculum and composition practice</strong>
            <small>Enter the learning lab ↗</small>
          </a>
        </div>
        <pre className={styles.attestation}>{`---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.1
- Projection: starlight.constellation_protocol_projection.v1
- Catalog: ${compactDigest(catalog.source.canonical_catalog_sha256)}
- Private memory: excluded
- Runtime authority: none
Generated: ${catalog.generated_on}
---`}</pre>
      </section>
    </div>
  );
}
