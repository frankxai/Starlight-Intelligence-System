import { getPluginStarterLatestManifest } from "@/lib/plugin-starter-download";

export const revalidate = 3600;

export function GET() {
  return Response.json(getPluginStarterLatestManifest(), {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
