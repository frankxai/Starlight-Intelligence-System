import { promises as fs } from "fs";
import path from "path";

/**
 * Reads the canonical SIP version from the repo-root SIP.md.
 *
 * Fallback to a known-good pin if the file is unreadable so the badge
 * route never 500s in production. The canonical source of truth is the
 * file itself; this helper exists only to keep the badge in sync.
 */
export async function getCanonicalSipVersion(): Promise<string> {
  const fallback = "v1.1.1";
  try {
    // site/ lives one directory below the repo root
    const sipPath = path.join(process.cwd(), "..", "SIP.md");
    const raw = await fs.readFile(sipPath, "utf8");
    // Match the line: `Version: \`v1.1.1\``
    const m = raw.match(/Version:\s*`?(v\d+\.\d+\.\d+(?:[-+][\w.]+)?)`?/);
    return m ? m[1] : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Light validation — accept anything that looks like SemVer with optional
 * leading "v", or the literal string "latest". We intentionally do NOT
 * verify the version exists in the spec — that's v0.2 work. For now any
 * reasonable semver renders as-is so adopters can pin freely.
 */
export function isValidVersionPin(input: string): boolean {
  if (input === "latest") return true;
  return /^v?\d+\.\d+\.\d+(?:[-+][\w.]+)?$/.test(input);
}

/**
 * Normalize a version string to always start with "v".
 */
export function normalizeVersion(input: string): string {
  return input.startsWith("v") ? input : `v${input}`;
}
