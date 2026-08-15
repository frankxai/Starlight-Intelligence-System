import { FOUNDATION_PACK } from "@/lib/multi-agent-foundation";

export const dynamic = "force-static";

export function GET() {
  return Response.json(FOUNDATION_PACK, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Content-Disposition": "attachment; filename=starlight-multi-agent-foundation.v1.json",
    },
  });
}

