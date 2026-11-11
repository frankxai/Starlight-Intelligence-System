"use client";

import { Analytics } from "@vercel/analytics/next";

// Privacy: strip query strings and hashes from every event URL before it
// leaves the browser. The Next.js integration reports the bare pathname as
// path and the framework route pattern (e.g. /path/[stage]) as route.
function withoutUrlDetails<T extends { url: string }>(event: T): T | null {
  try {
    const url = new URL(event.url);
    url.search = "";
    url.hash = "";
    return { ...event, url: url.href };
  } catch {
    return null;
  }
}

export function VercelAnalytics() {
  return <Analytics beforeSend={withoutUrlDetails} />;
}
