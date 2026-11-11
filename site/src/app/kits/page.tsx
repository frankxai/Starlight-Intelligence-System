import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, Check, Download, ExternalLink, FileText } from "lucide-react";
import { BUILD_KITS, LAUNCH_WORKBOOK } from "@/lib/build-kits";
import manifest from "../../../public/downloads/launch-workbook-manifest.json";
import styles from "./kits.module.css";

export const metadata: Metadata = {
  title: "Free builder kits and launch workbook",
  description: "Build a reusable workflow, shape a clear product offer or start a local intelligence system. Free source, editable worksheets and inspectable examples.",
  alternates: { canonical: "/kits" },
  openGraph: {
    title: "Make something useful. Give it a clear way in.",
    description: "Three practical starting points, with free source and an editable launch workbook.",
    url: "https://starlightintelligence.org/kits",
    type: "website",
  },
};

export default function KitsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="kits-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Starlight / Build something useful</p>
          <h1 id="kits-title">A good idea deserves<br /><em>a working first step.</em></h1>
          <p className={styles.intro}>Choose a job you want to finish. Take the source, the example and the checks that help you get there.</p>
          <div className={styles.actions}>
            <a className={styles.primary} href="#choose-a-kit">Find your starting point <ArrowDown size={16} /></a>
            <a className={styles.secondary} href="#launch-workbook">Explore the free workbook <ArrowRight size={16} /></a>
          </div>
          <div className={styles.promise}><span><Check size={14} /> Free to start</span><span><Check size={14} /> Inspectable source</span><span><Check size={14} /> Your own tools</span></div>
        </div>
        <aside className={styles.diagram} aria-label="A practical path from idea to useful product">
          <div className={styles.diagramLabel}><span>From possibility to proof</span><span>01 / 03</span></div>
          <div className={styles.diagramRow}><span>01</span><div><strong>Choose one job</strong><p>A buyer. An input. A useful result.</p></div><span className={styles.node} /></div>
          <div className={styles.diagramRow}><span>02</span><div><strong>Make it inspectable</strong><p>Working files and a complete example.</p></div><span className={styles.node} /></div>
          <div className={styles.diagramRow}><span>03</span><div><strong>Learn from first use</strong><p>A real attempt, recorded honestly.</p></div><span className={styles.node} /></div>
          <p className={styles.diagramFoot}>The work goes with you.</p>
        </aside>
      </section>

      <section id="choose-a-kit" className={styles.section} aria-labelledby="paths-title">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>01 / Choose the job</p><h2 id="paths-title">What are you here to make?</h2></div><p>Each path names the result, what you need and the limits. Start with one.</p></div>
        <div className={styles.kitGrid}>
          {BUILD_KITS.map((kit) => (
            <article key={kit.id} className={styles.kit} data-kit-id={kit.id}>
              <div className={styles.kitTop}><span>{kit.number}</span><span>{kit.audience}</span></div>
              <h3>{kit.title}</h3><p className={styles.kitDescription}>{kit.description}</p>
              <div className={styles.result}><span>You are working toward</span><p>{kit.outcome}</p></div>
              <ul>{kit.includes.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
              <a className={styles.kitAction} href={kit.href} data-kit-action="start">{kit.action}<ArrowRight size={16} /></a>
              <details className={styles.requirements}><summary>Requirements & scope</summary><p>{kit.requires}</p><p>{kit.boundary}</p><a href={kit.sourceHref} data-kit-action="source">Inspect source <ExternalLink size={12} /></a><span>{kit.status}</span></details>
            </article>
          ))}
        </div>
      </section>

      <section id="launch-workbook" className={styles.workbook} aria-labelledby="workbook-title" data-kit-id="launch-workbook">
        <div className={styles.workbookCover}>
          <div className={styles.coverTop}><span>Starlight fieldwork</span><span>Vol. 01</span></div>
          <div><FileText size={32} strokeWidth={1} /><h2 id="workbook-title">The launch<br /><em>workbook.</em></h2><p>One useful workflow.<br />An offer someone can understand.</p></div>
          <div className={styles.coverBottom}><span>Editable files · v{LAUNCH_WORKBOOK.version}</span><span>MIT</span></div>
        </div>
        <div className={styles.workbookContent}>
          <p className={styles.eyebrow}>02 / Take it into your own work</p>
          <h3>From scattered assets<br />to a complete first offer.</h3>
          <p>Bring a workflow or original asset you may share. Use the filled example, then write your offer, check delivery, enter real costs and choose a small launch test.</p>
          <div className={styles.fileList}>{LAUNCH_WORKBOOK.files.map((file) => <a key={file.name} href={`${LAUNCH_WORKBOOK.directory}/${file.name}`} data-kit-action="file" data-file-id={file.name}><div><strong>{file.label}</strong><span>{file.detail}</span></div><ArrowRight size={15} /></a>)}</div>
          <div className={styles.actions}><a className={styles.primary} href={LAUNCH_WORKBOOK.archive} download data-kit-action="download">Download the free pack <Download size={16} /></a><a className={styles.secondary} href={LAUNCH_WORKBOOK.source} data-kit-action="source">Browse source <ExternalLink size={14} /></a></div>
          <p className={styles.downloadMeta}>{LAUNCH_WORKBOOK.files.length} files · {Math.ceil(manifest.bytes / 1024)} KB ZIP · No signup · Text editor + optional spreadsheet app</p>
          <details className={styles.checksum}><summary>Verify the download</summary><p>SHA-256 of the ZIP:</p><code>{manifest.sha256}</code><a href="/downloads/launch-workbook-manifest.json">Open file manifest</a></details>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="first-use-title">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>03 / Make the first use count</p><h2 id="first-use-title">Show the work. Help someone try it.</h2></div><p>A useful example gives an article, a README and a demonstration something concrete to point to.</p></div>
        <ol className={styles.steps}>
          <li><span>01</span><h3>Start with a real input.</h3><p>Pick a small task and material you are allowed to use. Write what a successful output would look like.</p></li>
          <li><span>02</span><h3>Keep the evidence.</h3><p>Run the steps. Record what worked, what failed and what another person still needs to do.</p></li>
          <li><span>03</span><h3>Offer one clear next action.</h3><p>Link your explanation to the sample or download. Learn from actual attempts before expanding the offer.</p></li>
        </ol>
      </section>

      <section className={styles.terms} aria-label="Use, support and availability">
        <div><h3>Yours to use and adapt.</h3><p>The workbook is MIT licensed. Keep its notice when redistributing. Other packages and third-party services carry their own terms. The downloads are free; your chosen model, hosting and tools may have costs.</p></div>
        <div><h3>Self-serve, with honest boundaries.</h3><p>No account connections, managed hosting, checkout or customer acquisition are included. Report file defects through <a href="https://github.com/frankxai/Starlight-Intelligence-System/issues">GitHub issues</a>. Individual support, future updates and response times are not promised.</p></div>
        <div><h3>Source and installed access are different.</h3><p>Public source does not establish ChatGPT directory approval. Check the <Link href="/download#plugin-adoption">adoption guide</Link> for host and availability details. Keep private connections and customer data out of anything you share.</p></div>
      </section>
      <div className={styles.endnote}><span>Small enough to begin. Open enough to make your own.</span><Link href="/download">Explore all source & modules <ArrowRight size={16} /></Link></div>
    </div>
  );
}
