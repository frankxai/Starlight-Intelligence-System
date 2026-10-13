/**
 * What a failure may say in public.
 *
 * A stage note travels in the receipt, and the receipt goes back to whoever
 * called the Desk. So a note must never carry text an upstream service chose:
 * an error body, a diagnostic, a fragment of the request, a server path. Each
 * error the Desk throws carries a fixed publicNote (a category and, at most,
 * an HTTP status); anything else becomes a generic note. Diagnostic detail
 * stays out of responses.
 *
 * Built on SIP — operational tier.
 */

export const GENERIC_FAILURE = "failed (internal error)";

export class PublicError extends Error {
  readonly publicNote: string;
  constructor(message: string, publicNote: string) {
    super(message);
    this.name = "PublicError";
    this.publicNote = publicNote;
  }
}

/** The note a caller may see for this error. Never the error's own message. */
export function publicNote(error: unknown): string {
  if (error && typeof error === "object" && "publicNote" in error) {
    const note = (error as { publicNote?: unknown }).publicNote;
    if (typeof note === "string" && note.length > 0) return note;
  }
  return GENERIC_FAILURE;
}
