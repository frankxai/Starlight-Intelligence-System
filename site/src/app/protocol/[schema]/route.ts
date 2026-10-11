// Serves the published SIP schemas at the URLs their `$id` fields name, e.g.
// https://starlightintelligence.org/protocol/receipt.v0.1.0.schema.json.
// Any other name under /protocol/ 404s.
import receiptSchema from "../../../../../protocol/receipt.v0.1.0.schema.json";
import graphSchema from "../../../../../protocol/sip-graph.v0.1.0.schema.json";

const SCHEMAS: Record<string, unknown> = {
  "receipt.v0.1.0.schema.json": receiptSchema,
  "sip-graph.v0.1.0.schema.json": graphSchema,
};

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(SCHEMAS).map((schema) => ({ schema }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ schema: string }> }) {
  const { schema } = await params;
  const body = SCHEMAS[schema];
  if (!body) return new Response("Not found", { status: 404 });
  return Response.json(body, {
    headers: {
      "Content-Type": "application/schema+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
