import type { Metadata } from "next";
import { GraphAtlasClient } from "./GraphAtlasClient";
import styles from "./graph-atlas.module.css";
import { graphAtlas } from "@/lib/graph-atlas-data.generated";

export const metadata: Metadata = {
  title: "Agentic Graph Atlas",
  description:
    "Explore reusable workflow graphs, source contracts and a dependency-free adoption kit. Reference architecture, not live telemetry.",
  alternates: { canonical: "/graph-atlas" },
};

const adoptionUrl = "https://github.com/frankxai/Starlight-Intelligence-System/tree/agent/hermes/sis-operational-work-graph/tools/graph-adoption";

export default function GraphAtlasPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.eyebrow}>Starlight Intelligence · Reference architecture · Community preview</div>
        <div className={styles.heroGrid}>
          <div>
            <h1>Make your agent<br />workflows inspectable.</h1>
            <p className={styles.lede}>
              See what each step reads, who owns it, and what evidence closes it. Explore shared patterns for software, design, content and research, then try one in your own repository.
            </p>
          </div>
          <aside className={styles.thesisNote} aria-label="Architecture thesis">
            <span>Architecture thesis</span>
            <p>{graphAtlas.thesis}</p>
            <div className={styles.provenance}>Authored reference model. Target nodes are proposed capabilities, not deployed services.</div>
          </aside>
        </div>
      </header>

      <section className={styles.census} aria-labelledby="census-title">
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.kicker}>Start with your repository</span>
            <h2 id="census-title">One workflow. A checkable contract.</h2>
          </div>
          <p>
            Node.js and Git are enough for the report-only kit. No API keys, dependencies, database or background agent. Keep your existing harness and instructions.
          </p>
        </div>
        <div className={styles.quickstart}>
          <pre><code>{"node tools/graph-adoption/cli.mjs inspect .\nnode tools/graph-adoption/cli.mjs check .\nnode --test tools/graph-adoption/core.test.mjs"}</code></pre>
          <a href={adoptionUrl}>Read the preview quickstart and source ↗</a>
        </div>
        <div className={styles.evidenceAlert}>
          <span>What a check proves</span>
          <p>
            The kit checks local files, source hashes and manifest conformance. It does not authenticate agents, run your checks, certify outcomes or authorize publishing. Your private repository inventory never becomes this public page.
          </p>
        </div>
      </section>

      <div>
        <GraphAtlasClient />

        <section className={styles.laws} aria-labelledby="laws-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>Control laws</span>
              <h2 id="laws-title">Autonomy earns its right to continue.</h2>
            </div>
            <p>These are implementation requirements. Some have local checks; external authorization and outcome verification remain host responsibilities.</p>
          </div>
          <div className={styles.lawGrid}>
            {graphAtlas.policies.map((policy, index) => (
              <article className={styles.law} key={policy.id}>
                <div className={styles.lawIndex}>{String(index + 1).padStart(2, "0")}</div>
                <h3>{policy.title}</h3>
                <p>{policy.why}</p>
                <div className={styles.enforcement}><span>Enforcement</span>{policy.enforcement}</div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.economics} aria-labelledby="economics-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>Graph economics</span>
              <h2 id="economics-title">Spend intelligence where parallelism changes the decision.</h2>
            </div>
            <p>Deterministic pre-passes, code reducers, and independent verification turn token budgets into architecture.</p>
          </div>
          <div className={styles.effortTable} role="table" aria-label="Effort model">
            <div className={styles.effortHead} role="row">
              <span role="columnheader">Class</span><span role="columnheader">Fan-out</span><span role="columnheader">Model calls</span><span role="columnheader">Use</span>
            </div>
            {graphAtlas.effortModel.map((row) => (
              <div className={styles.effortRow} role="row" key={row.class}>
                <strong role="cell">{row.class}</strong><span role="cell">{row.fanOut}</span><span role="cell">{row.modelCalls}</span><span role="cell">{row.use}</span>
              </div>
            ))}
          </div>
          <blockquote className={styles.metricEquation}>
            <span>The metric that matters</span>
            Verified outcome value ÷ (tokens + compute + cycle time + human decisions + risk)
          </blockquote>
        </section>

        <section className={styles.benchmarks} aria-labelledby="benchmark-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>Primary-source benchmark</span>
              <h2 id="benchmark-title">Adopt the strongest mechanisms. Keep the Starlight contract.</h2>
            </div>
            <p>Primary-source patterns to compare and adopt. This preview makes no claim of benchmark superiority.</p>
          </div>
          <div className={styles.benchmarkGrid}>
            {graphAtlas.benchmarks.map((benchmark) => (
              <article key={benchmark.name} className={styles.benchmarkCard}>
                <h3><a href={benchmark.url} target="_blank" rel="noreferrer">{benchmark.name}<span aria-hidden="true"> ↗</span></a></h3>
                <p>{benchmark.pattern}</p>
                <div><span>Starlight move</span>{benchmark.adopt}</div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.roadmap} aria-labelledby="roadmap-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>Target sequence</span>
              <h2 id="roadmap-title">Build the compounding control plane.</h2>
            </div>
            <p>First make truth executable. Then compile context. Then close routes on value. Productize only what has receipts.</p>
          </div>
          <ol className={styles.roadmapList}>
            {graphAtlas.roadmap.map((phase) => (
              <li key={phase.phase}>
                <div className={styles.phaseLabel}>{phase.phase}</div>
                <h3>{phase.title}</h3>
                <ul>{phase.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <footer className={styles.pageFooter}>
        <div>Starlight Agentic Graph Atlas · schema {graphAtlas.schema}</div>
        <div>Machine-readable source, report-only adoption, executable loop tests.</div>
      </footer>
    </div>
  );
}
