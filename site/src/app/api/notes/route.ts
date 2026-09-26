import { NextResponse } from "next/server";
import { listPublicNotes } from "@/lib/public-notes";

export function GET() {
  const notes = listPublicNotes().map((note) => ({
    id: note.id,
    slug: note.slug,
    title: note.title,
    kind: note.kind,
    status: note.status,
    confidence: note.confidence,
    created: note.created,
    currentRevision: note.revision,
    export: `/api/notes/${note.slug}`,
  }));

  return NextResponse.json({
    format: "starlight-public-notes-v1",
    schema: "urn:starlight:public-note:v1",
    count: notes.length,
    notes,
  });
}
