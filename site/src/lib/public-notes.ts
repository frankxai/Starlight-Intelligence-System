import "server-only";

import compoundingNote from "../../content/public-notes/intelligence-should-compound.json";

export interface PublicNote {
  schemaVersion: "1.0.0";
  revision: string;
  id: string;
  slug: string;
  kind: "essay" | "principle" | "question" | "discovery" | "warning" | "hope";
  visibility: "public";
  status: "working-thesis" | "substantiated" | "open-question" | "superseded";
  confidence: "low" | "moderate" | "high";
  title: string;
  thesis: string;
  evidence: { label: string; claim: string; url: string }[];
  interpretation: string;
  aspiration: string;
  author: { name: string; role: string };
  created: string;
  revisions: { version: string; date: string; summary: string }[];
  provenance: { curation: string; source: string; auditedCommit: string };
}

// This import list is the publication boundary. Internal notes and vaults are
// never enumerated, fetched, or imported into the public Notes route.
const PUBLIC_NOTES: Readonly<Record<string, PublicNote>> = Object.freeze({
  "intelligence-should-compound": compoundingNote as PublicNote,
});

export function listPublicNotes(): PublicNote[] {
  return Object.values(PUBLIC_NOTES);
}

export function getPublicNote(slug: string): PublicNote | null {
  return Object.hasOwn(PUBLIC_NOTES, slug) ? PUBLIC_NOTES[slug] : null;
}
