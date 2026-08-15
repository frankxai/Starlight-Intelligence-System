import { VISUAL_EXPANSION_50 } from "@/lib/multi-agent-foundation";

export const dynamic = "force-static";

export function GET() {
  return Response.json(
    {
      schema_version: "starlight.visual_expansion_matrix.v1",
      id: "starlight-constellation-visual-expansion-50",
      generated_on: "2026-08-15",
      status: "planned",
      count: VISUAL_EXPANSION_50.length,
      source_method: "generated-owned",
      truth_contract: {
        generated_assets_complete: false,
        exact_text_in_code: true,
        requires_export_inspection: true,
        requires_score_at_least: 26,
      },
      assets: VISUAL_EXPANSION_50,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "Content-Disposition": "attachment; filename=starlight-visual-expansion-50.v1.json",
      },
    },
  );
}

