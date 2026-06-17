import { getSipStarterLatestManifest } from "@/lib/sip-download";

export const revalidate = 3600;

export function GET() {
  return Response.json(getSipStarterLatestManifest(), {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
