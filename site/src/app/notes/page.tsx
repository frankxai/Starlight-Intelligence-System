import type { Metadata } from "next";
import Link from "next/link";
import { getPublicNote } from "@/lib/public-notes";
import styles from "./notes.module.css";

export const metadata: Metadata = {
  title: "Starlight Notes",
  description:
    "Public, source-linked notes that separate evidence, interpretation, and aspiration and can be exported as JSON.",
  alternates: { canonical: "/notes" },
};

export default function NotesPage() {
  const note = getPublicNote("intelligence-should-compound");
  if (!note) throw new Error("The curated public note is missing");

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>Starlight Notes · Public archive</p>
          <h1>Knowledge worth carrying forward.</h1>
          <p className={styles.lead}>
            A public record for principles, discoveries, questions, warnings, and
            hopes. Each note separates what the sources show from what we infer
            and what we hope to build.
          </p>
          <p className={styles.featured}>
            First public record <span aria-hidden="true">/</span>{" "}
            <a href="#note-title">{note.title}</a>
          </p>
          <div className={styles.introLinks}>
            <a href={`/api/notes/${note.slug}?download=1`}>Download this note as JSON</a>
            <Link href="/vaults">Browse the existing public vaults</Link>
          </div>
        </header>

        <article className={styles.note} aria-labelledby="note-title">
          <header className={styles.noteHeader}>
            <div className={styles.meta}>
              <span>Public note 001</span>
              <span>{note.status.replaceAll("-", " ")}</span>
              <time dateTime={note.created}>{new Date(`${note.created}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</time>
            </div>
            <h2 id="note-title">{note.title}</h2>
            <p className={styles.thesis}>{note.thesis}</p>
          </header>

          <div className={styles.sections}>
            <section aria-labelledby="note-evidence">
              <div className={styles.sectionHeading}>
                <span aria-hidden="true">01</span>
                <h3 id="note-evidence">Evidence</h3>
              </div>
              <p className={styles.sectionLead}>What current source supports.</p>
              <ul className={styles.evidenceList}>
                {note.evidence.map((item) => (
                  <li key={item.url}>
                    <p>{item.claim}</p>
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      Inspect {item.label.toLowerCase()} <span aria-hidden="true">↗</span>
                      <span className={styles.srOnly}>(opens in new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="note-interpretation">
              <div className={styles.sectionHeading}>
                <span aria-hidden="true">02</span>
                <h3 id="note-interpretation">Interpretation</h3>
              </div>
              <p>{note.interpretation}</p>
              <p className={styles.qualifier}>Confidence: {note.confidence}. This is a testable product thesis.</p>
            </section>

            <section aria-labelledby="note-aspiration">
              <div className={styles.sectionHeading}>
                <span aria-hidden="true">03</span>
                <h3 id="note-aspiration">Aspiration</h3>
              </div>
              <p>{note.aspiration}</p>
            </section>
          </div>

          <footer className={styles.noteFooter}>
            <dl>
              <div><dt>Author</dt><dd>{note.author.name}<br /><span>{note.author.role}</span></dd></div>
              <div><dt>Provenance</dt><dd><a href={note.provenance.source} target="_blank" rel="noopener noreferrer">Issue #197 <span aria-hidden="true">↗</span><span className={styles.srOnly}>(opens in new tab)</span></a><br /><span>Audited main {note.provenance.auditedCommit.slice(0, 8)}</span></dd></div>
              <div><dt>Revision</dt><dd>{note.revision} · {note.revisions.at(-1)?.summary}</dd></div>
            </dl>
          </footer>
        </article>

        <section className={styles.boundary} aria-labelledby="notes-boundary">
          <div>
            <p className={styles.eyebrow}>Archive boundary</p>
            <h2 id="notes-boundary">Public by deliberate selection.</h2>
          </div>
          <div>
            <p>
              This archive currently contains one curated example. It is a versioned
              JSON file in the repository, exposed through a read-only API. Internal
              session notes, private memory, and founder vault material are not
              connected to this publication path.
            </p>
            <p>
              Exporting the record is possible today. Long-term preservation,
              independent verification, and measured cross-venture transfer remain
              work to prove.
            </p>
            <div className={styles.boundaryLinks}>
              <a href="/api/notes">Read the collection API</a>
              <Link href="/proof">See the product evidence</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
