import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

// The site imports the repo-level metrics ledger (`src/lib/metrics.ts` reads
// ../../../metrics/current.json), so Turbopack's resolution root has to be the
// repo, not the site directory. Derived from this file's own location rather
// than from cwd: `path.resolve(".")` silently changed meaning depending on
// whether the build was invoked from the repo root or from site/.
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Content Security Policy.
//
// Tight by default (default-src 'self'). Notable concessions explained inline.
// 'unsafe-inline' on script-src is required by the JSON-LD <script type="application/ld+json">
// injection in app/layout.tsx — replace with nonce-based CSP via middleware when ready.
// 'unsafe-inline' on style-src is required by Tailwind's runtime style-injection;
// hashable in a future hardening pass.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: REPO_ROOT,
  },
  // Strip the X-Powered-By: Next.js leak from response headers.
  poweredByHeader: false,
  // Default compression — Vercel sets this independently, but explicit is better.
  compress: true,
  // Allow Next.js Image Optimization for GitHub avatars used in vault registry.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
