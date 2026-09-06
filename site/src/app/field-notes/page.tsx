import type { Metadata } from "next";
import Image from "next/image";
import { FieldNotesMotion } from "@/components/FieldNotesMotion";
import { publicFieldNotes } from "@/lib/field-notes";
import styles from "./field-notes.module.css";

export const metadata: Metadata = {
  title: "Field Notes — Protocol, Proof, and Public Memory",
  description:
    "Six visual field notes on persistent memory, attestation, human authority, forkability, and public stewardship.",
  alternates: { canonical: "/field-notes" },
};

const chapters = [
  {
    number: "V",
    title: "Make trust inspectable",
    note: "Remember · convene · attest",
    cards: publicFieldNotes.slice(0, 3),
  },
  {
    number: "VI",
    title: "Return agency to the public",
    note: "Authorize · fork · return",
    cards: publicFieldNotes.slice(3),
  },
];

export default function PublicFieldNotesPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="field-notes-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Protocol field notes · chapter 15—20</p>
          <h1 id="field-notes-title">Keep the proof close to the people.</h1>
          <p>
            Six large-format studies render persistent memory, attestation, human
            authority, forkability, and public stewardship as lived relationships.
          </p>
          <div className={styles.actions}>
            <a href="#public-field-notes">Read the visual record</a>
            <a href="/protocol">Inspect the protocol</a>
          </div>
        </div>
        <aside className={styles.contract} aria-label="Public proof contract">
          <p>Public proof contract</p>
          <dl>
            <div><dt>Memory</dt><dd>Persistent and source-aware</dd></div>
            <div><dt>Authority</dt><dd>Human and explicitly named</dd></div>
            <div><dt>Evidence</dt><dd>Inspectable after the run</dd></div>
            <div><dt>Ownership</dt><dd>Local-first and forkable</dd></div>
          </dl>
        </aside>
      </section>

      <div className={styles.proofLine} aria-label="Proof principles">
        <span>Human authority</span>
        <span>Inspectable evidence</span>
        <span>Forkable memory</span>
      </div>

      <section
        id="public-field-notes"
        className={styles.field}
        data-field-notes
        data-motion="static"
        aria-labelledby="public-field-notes-title"
      >
        <div className={styles.fieldIntro}>
          <p className={styles.eyebrow}>A public operating memory</p>
          <h2 id="public-field-notes-title">From record to shared stewardship.</h2>
          <p>
            The responsive starlight stays local to each image: a subtle trace of context
            moving toward proof, authority, and a record others can inherit.
          </p>
        </div>

        {chapters.map((chapter) => (
          <section className={styles.chapter} data-field-chapter key={chapter.number}>
            <header className={styles.chapterHeader}>
              <span>{chapter.number}</span>
              <h3>{chapter.title}</h3>
              <p>{chapter.note}</p>
            </header>
            <div className={styles.grid}>
              {chapter.cards.map((card) => (
                <article className={styles.card} data-field-card key={card.id}>
                  <div className={styles.media} data-field-media>
                    <Image
                      className={styles.image}
                      data-field-image
                      src={card.image}
                      alt={card.alt}
                      width={1120}
                      height={1400}
                      sizes="(max-width: 720px) 92vw, (max-width: 1100px) 45vw, 31vw"
                      loading={card.id === "15" ? "eager" : "lazy"}
                    />
                    <span className={styles.vignette} aria-hidden="true" />
                    <span className={styles.glow} data-field-glow aria-hidden="true" />
                    <span className={styles.stars} data-field-stars aria-hidden="true" />
                    <span className={styles.trace} aria-hidden="true" />
                    <span className={styles.frameNumber} aria-hidden="true">Public / {card.id}</span>
                  </div>
                  <div className={styles.caption}>
                    <p><span>{card.id}</span>{card.stage}</p>
                    <h4>{card.title}</h4>
                    <strong>{card.principle}</strong>
                    <span>{card.detail}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
        <FieldNotesMotion />
      </section>

      <section className={styles.constellation} aria-labelledby="constellation-title">
        <div>
          <p className={styles.eyebrow}>Companion chapters</p>
          <h2 id="constellation-title">The record continues.</h2>
        </div>
        <p className={styles.publication}>
          <span>01—07 · Awaiting publication</span> Academy practice
        </p>
        <p className={styles.publication}>
          <span>08—14 · Awaiting publication</span> Applied system
        </p>
      </section>

      <p className={styles.disclosure}>
        Illustrative generated art · not deployment, customer, participant, or governance
        evidence · inspect the Protocol, public vaults, and source repository for technical proof.
      </p>
    </div>
  );
}
