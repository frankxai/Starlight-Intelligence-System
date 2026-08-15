import type { Metadata } from "next";
import Link from "next/link";
import { constellationProtocol, compactDigest } from "@/lib/constellation-protocol";
import {
  CONTROL_ROLES,
  FOUNDATION_OBJECTS,
  FOUNDATION_PACK,
  RUNTIME_TRUTH_STATES,
  TEMPLATE_DOWNLOADS,
  TOPOLOGY_CONTRACTS,
  VISUAL_EXPANSION_50,
  VISUAL_SCENE_TYPES,
} from "@/lib/multi-agent-foundation";
import styles from "./foundation.module.css";

export const metadata: Metadata = {
  title: "Multi-Agent Systems Foundation | Starlight Intelligence",
  description:
    "Open contracts and templates for agent profiles, swarm topology, task packets, memory and tool policies, handoffs, run receipts, and safe evolution.",
  alternates: { canonical: "https://starlightintelligence.org/constellation/foundation" },
};

const chain = [
  ["Human mission", "owned"],
  ["Profiles", "designed"],
  ["Topology", "composed"],
  ["Task packet", "bounded"],
  ["Run", "receipted"],
  ["Verdict", "independent"],
  ["Evolution", "lineage"],
] as const;

export default function MultiAgentFoundationProtocolPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="foundation-protocol-title">
        <div className={styles.heroInner}>
          <div className={styles.releaseLine}>
            <span>Open protocol layer · Foundation pack v1</span>
            <span>Authority granted · false</span>
          </div>
          <div className={styles.heroLayout}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Starlight multi-agent foundation</p>
              <h1 id="foundation-protocol-title">A swarm is a chain of contracts.</h1>
              <p>
                Profiles, topology, packets, memory, tools, receipts, and version lineage turn a group of agents
                into a system people can inspect, govern, install, reject, and safely evolve.
              </p>
              <div className={styles.heroActions}>
                <a href="#objects">Inspect the object registry <span aria-hidden="true">↓</span></a>
                <a href="/downloads/constellation/foundation/foundation-pack.v1.json" download>
                  Download foundation pack <span aria-hidden="true">↗</span>
                </a>
              </div>
              <dl className={styles.heroFacts}>
                <div><dt>Objects</dt><dd>{FOUNDATION_PACK.counts.protocol_objects}</dd></div>
                <div><dt>Control roles</dt><dd>{FOUNDATION_PACK.counts.control_roles}</dd></div>
                <div><dt>Mapped agents</dt><dd>{FOUNDATION_PACK.counts.canonical_agents}</dd></div>
                <div><dt>Live eval</dt><dd>{FOUNDATION_PACK.truth_contract.live_eval_status}</dd></div>
              </dl>
            </div>
            <figure className={styles.chain} aria-labelledby="chain-title">
              <figcaption id="chain-title">
                <span>Reference contract chain</span>
                <b>Every transition declares an artifact and evidence state.</b>
              </figcaption>
              <ol>
                {chain.map(([name, state], index) => (
                  <li key={name}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{name}</strong>
                    <code>{state}</code>
                  </li>
                ))}
              </ol>
              <footer>
                <span>Source catalog</span>
                <code>{compactDigest(constellationProtocol.source.canonical_catalog_sha256)}</code>
              </footer>
            </figure>
          </div>
        </div>
      </section>

      <nav className={styles.localNav} aria-label="Foundation protocol sections">
        <a href="#objects">Objects</a>
        <a href="#roles">Roles</a>
        <a href="#states">Truth states</a>
        <a href="#topology">Topologies</a>
        <a href="#downloads">Templates</a>
        <a href="#visual-expansion">Visual matrix</a>
      </nav>

      <section className={styles.objectSection} id="objects" aria-labelledby="objects-title">
        <div className={styles.wrap}>
          <header className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Protocol object registry</p>
            <h2 id="objects-title">Ten objects carry the whole system.</h2>
            <p>Keep implementations flexible and contracts explicit. Models and runtimes may change; ownership and evidence do not become optional.</p>
          </header>
          <ol className={styles.objectLedger}>
            {FOUNDATION_OBJECTS.map(([id, schema, purpose], index) => (
              <li key={id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{id.replaceAll("_", " ")}</h3><code>{schema}</code></div>
                <p>{purpose}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.rolesSection} id="roles" aria-labelledby="roles-title">
        <div className={styles.wrap}>
          <header className={styles.sectionHeaderDark}>
            <p className={styles.eyebrow}>Control roles</p>
            <h2 id="roles-title">Responsibility is the stable primitive.</h2>
            <p>These roles describe ownership. They are not a requirement to create seven personalities or keep seven models active.</p>
          </header>
          <div className={styles.roleGrid}>
            {CONTROL_ROLES.map(([id, kind, ownership], index) => (
              <article key={id} data-human={id === "human_sovereign" ? "true" : undefined}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{id.replaceAll("_", " ")}</h3><code>{kind}</code></div>
                <p>{ownership}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.stateSection} id="states" aria-labelledby="states-title">
        <div className={styles.wrap}>
          <header className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Runtime truth vocabulary</p>
            <h2 id="states-title">Designed is not installed. Installed is not verified.</h2>
            <p>Use explicit states so a good-looking pack, green scheduler, or present endpoint cannot silently become a production claim.</p>
          </header>
          <ol className={styles.stateFlow}>
            {RUNTIME_TRUTH_STATES.map(([id, meaning], index) => (
              <li key={id} data-hold={id === "held" ? "true" : undefined}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{id}</h3>
                <p>{meaning}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.topologySection} id="topology" aria-labelledby="topology-title">
        <div className={styles.wrap}>
          <header className={styles.sectionHeaderDark}>
            <p className={styles.eyebrow}>Topology contracts</p>
            <h2 id="topology-title">Five shapes cover most bounded workflows.</h2>
            <p>Active council size should normally stay between three and five. Direct consensus loops should not exceed seven.</p>
          </header>
          <ol className={styles.topologyLedger}>
            {TOPOLOGY_CONTRACTS.map(([id, contract], index) => (
              <li key={id}><span>{String(index + 1).padStart(2, "0")}</span><h3>{id.replaceAll("-", " ")}</h3><p>{contract}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.downloadSection} id="downloads" aria-labelledby="downloads-title">
        <div className={styles.wrap}>
          <header className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Foundation template pack</p>
            <h2 id="downloads-title">Start from explicit files.</h2>
            <p>These public templates are intentionally conservative. Replace placeholders, validate the result, and keep authority outside the pack until a runtime admits it.</p>
          </header>
          <div className={styles.downloadLedger}>
            <a className={styles.packDownload} href="/downloads/constellation/foundation/foundation-pack.v1.json" download>
              <span>00</span><div><b>foundation-pack.v1.json</b><small>Registry, roles, patterns, truth states, counts, and source projection.</small></div><strong>JSON ↓</strong>
            </a>
            {TEMPLATE_DOWNLOADS.map(([file, purpose], index) => (
              <a key={file} href={`/downloads/constellation/foundation/${file}`} download>
                <span>{String(index + 1).padStart(2, "0")}</span><div><b>{file}</b><small>{purpose}</small></div><strong>{file.endsWith(".md") ? "MD" : "JSON"} ↓</strong>
              </a>
            ))}
            <a href="/downloads/constellation/foundation/visual-expansion-50.v1.json" download>
              <span>07</span><div><b>visual-expansion-50.v1.json</b><small>Five purposeful scene types for each of the ten canonical swarms.</small></div><strong>JSON ↓</strong>
            </a>
          </div>
          <aside className={styles.packTruth}>
            <div><span>Canonical agent source</span><code>{constellationProtocol.source.canonical_repository}@{constellationProtocol.source.canonical_commit}</code></div>
            <div><span>Capability pack</span><code>{compactDigest(constellationProtocol.source.capability_pack_digest)}</code></div>
            <div><span>Private memory</span><code>false</code></div>
            <div><span>Runtime authority</span><code>false</code></div>
          </aside>
        </div>
      </section>

      <section className={styles.visualSection} id="visual-expansion" aria-labelledby="visual-title">
        <div className={styles.wrap}>
          <header className={styles.sectionHeaderDark}>
            <p className={styles.eyebrow}>Visual production protocol · 50 briefs</p>
            <h2 id="visual-title">Asset generation begins with a job.</h2>
            <p>Five scene families repeat across ten houses. Generated media carries identity and story; exact labels, graphs, interfaces, and claims remain in code.</p>
          </header>
          <ol className={styles.sceneLegend}>
            {VISUAL_SCENE_TYPES.map(([id, ratio, purpose, surface], index) => (
              <li key={id}><span>{String(index + 1).padStart(2, "0")}</span><div><b>{id.replaceAll("-", " ")}</b><code>{ratio} · {surface}</code></div><p>{purpose}</p></li>
            ))}
          </ol>
          <div className={styles.matrixRegion} role="region" aria-label="Fifty asset briefs" tabIndex={0}>
            <table>
              <caption>Five planned visual assets for each of the ten public Starlight swarms.</caption>
              <thead><tr><th>Run</th><th>House</th><th>Scene</th><th>Ratio</th><th>Surface</th><th>State</th></tr></thead>
              <tbody>
                {VISUAL_EXPANSION_50.map((asset) => (
                  <tr key={asset.id}>
                    <td>{String(asset.sequence).padStart(2, "0")}/50</td>
                    <td>{asset.house_name}</td>
                    <td>{asset.scene_type.replaceAll("-", " ")}</td>
                    <td>{asset.aspect_ratio}</td>
                    <td>{asset.target_surface}</td>
                    <td>{asset.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={styles.handoff} aria-labelledby="handoff-title">
        <div className={styles.wrap}>
          <div className={styles.handoffLayout}>
            <div>
              <p className={styles.eyebrow}>One canon · three jobs</p>
              <h2 id="handoff-title">Design in public. Prove at the boundary.</h2>
              <p>{FOUNDATION_PACK.truth_contract.claim}</p>
            </div>
            <div className={styles.routes}>
              <a href="https://starlightintelligence.ai/constellation/foundation"><b>.ai</b><span>Field guide, workflow visualizations, all 50 profiles, and public-safe builder.</span></a>
              <Link href="/constellation"><b>.org</b><span>Canonical pack receipts, provenance, agent graph, and public trust states.</span></Link>
              <a href="https://starlightintelligence.academy/constellation-lab/foundations"><b>.academy</b><span>Six operator moves and a blueprint completion checklist.</span></a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

