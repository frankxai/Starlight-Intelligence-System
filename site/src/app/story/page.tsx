import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { artifactExport, narrativeArtifacts } from "@/lib/narrative-artifacts";
import styles from "./story.module.css";

export const metadata: Metadata = {
  title: "The Starlight story",
  description: "Seven source-controlled chapters of the Starlight thesis, product, portfolio, and long horizon.",
  alternates: { canonical: "/story" },
};

export default function StoryPage() {
  return (
    <div className={`${styles.page} era`}>
      <header className={styles.intro}>
        <div className="era-wrap">
          <p className={styles.kicker}>The Starlight story / version 1</p>
          <h1>Light travels. Knowledge survives. Intelligence compounds.</h1>
          <p>Seven chapters connect the century-scale direction to the code and claims that can be inspected now. Each visual is a standalone, source-controlled vector export with accessible text and three presentation ratios.</p>
          <Link href="/proof">Start with the current evidence <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </header>
      <div className={styles.chapters}>
        {narrativeArtifacts.map((artifact) => (
          <section className={styles.chapter} id={artifact.slug} key={artifact.slug} aria-labelledby={`${artifact.slug}-title`}>
            <div className="era-wrap">
              <figure className={styles.figure}>
                <picture aria-hidden="true">
                  <source media="(max-width: 700px)" srcSet={artifactExport(artifact.slug, "portrait")} />
                  <img src={artifactExport(artifact.slug, "landscape")} alt="" width="1600" height="900" loading="lazy" />
                </picture>
                <figcaption className={styles.caption}>
                  <div><span>{artifact.number} / 07 · {artifact.eyebrow}</span><h2 id={`${artifact.slug}-title`}>{artifact.title}</h2></div>
                  <div><p>{artifact.subtitle}</p><p>{artifact.detail}</p><p className={styles.status}>{artifact.status}</p></div>
                  <p className="sr-only">{artifact.diagramAlt}</p>
                </figcaption>
              </figure>
              <div className={styles.actions} aria-label={`Formats for ${artifact.title}`}>
                <a href={artifactExport(artifact.slug, "landscape")} download><Download size={15} aria-hidden="true" /> 16:9 SVG</a>
                <a href={artifactExport(artifact.slug, "portrait")} download><Download size={15} aria-hidden="true" /> 4:5 SVG</a>
                <a href={artifactExport(artifact.slug, "square")} download><Download size={15} aria-hidden="true" /> 1:1 SVG</a>
                <Link href={artifact.href}>Inspect context <ArrowRight size={15} aria-hidden="true" /></Link>
              </div>
            </div>
          </section>
        ))}
      </div>
      <footer className={styles.close}><div className="era-wrap"><p>These artifacts distinguish current local proof from intended portfolio outcomes and long-horizon commitments.</p><Link href="/proof">Review the status of every claim <ArrowRight size={17} aria-hidden="true" /></Link></div></footer>
    </div>
  );
}
