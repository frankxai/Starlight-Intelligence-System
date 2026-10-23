"use client";

import { Analytics } from "@vercel/analytics/react";
import { usePathname } from "next/navigation";

// Privacy: strip query strings and hashes from every event URL before it
// leaves the browser, and report the bare pathname as route/path.
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
  const path = usePathname() || "/";
  return <Analytics framework="next" route={path} path={path} beforeSend={withoutUrlDetails} />;
}
