// PWA manifest for /cockpit/spec-trace, served as a Route Handler.
//
// Next.js 16's `app/manifest.ts` convention is reserved for the site-wide manifest at /
// (root of /app). Because Spec-Trace is a sub-route with its own installable identity,
// we serve a scoped .webmanifest via a Route Handler at this path:
//   /cockpit/spec-trace/manifest.webmanifest
//
// The <link rel="manifest"> in page.tsx metadata points at this URL.
// Caching: default Route Handler caching (static, immutable manifest body).

export const dynamic = "force-static";

const MANIFEST = {
  name: "Spec-Trace — Starlight",
  short_name: "Spec-Trace",
  description:
    "Console for sovereign spec authorship: list specs, trace commits/PRs, dispatch to agents. Talks to a local daemon.",
  start_url: "/cockpit/spec-trace",
  scope: "/cockpit/spec-trace",
  display: "standalone",
  orientation: "any",
  background_color: "#0A0A0B",
  theme_color: "#0A0A0B",
  categories: ["productivity", "developer"],
  icons: [
    {
      src: "/favicon.ico",
      sizes: "any",
      type: "image/x-icon",
    },
  ],
};

export function GET() {
  return new Response(JSON.stringify(MANIFEST, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
