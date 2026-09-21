// The in-toto predicate type of a SIP receipt is
// https://starlightintelligence.org/protocol/receipt/v0.1.0 — a type URI should
// dereference to its definition, so it serves the receipt schema itself.
import receiptSchema from "../../../../../../protocol/receipt.v0.1.0.schema.json";

export const dynamic = "force-static";

export function GET() {
  return Response.json(receiptSchema, {
    headers: {
      "Content-Type": "application/schema+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
