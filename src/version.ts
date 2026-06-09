/**
 * Starlight Intelligence System — Version source-of-truth module.
 *
 * Centralizes version resolution so package.json + SIP.md drift cannot
 * silently propagate to MCP serverInfo, CLI banners, or downstream consumers.
 *
 * Single source of truth for:
 *   - getPackageVersion() — operational layer (npm package), matches package.json
 *   - getSipVersion()     — substrate spec version, matches SIP.md `Version:` line
 *   - getPackageRoot()    — package root directory (walks up from caller)
 *
 * Used by:
 *   - src/mcp-server.ts       — serverInfo.version (operational MCP)
 *   - src/starlight-mcp.ts    — serverInfo.version (substrate MCP)
 *   - src/cli.ts (planned)    — `starlight version` command (currently has
 *                                inline copy; consolidate when cli.ts WIP lands)
 *
 * Resolution strategy:
 *   1. Walk up from this file's directory (`dist/` when consumed as installed
 *      package, `src/` when developed locally) to find package.json with the
 *      canonical name.
 *   2. For SIP version: if SIP.md is co-located (development), read its
 *      `Version:` line. If not (consumer install — SIP.md is not in
 *      package.json `files` array), fall back to SIP_VERSION_FALLBACK.
 *
 * Drift defense:
 *   - SIP_VERSION_FALLBACK MUST be updated when SIP.md `Version:` is bumped.
 *   - v80 platform-prompt symmetry test asserts SIP.md version line is
 *     reachable from canonical source-of-truth files; future extension can
 *     also assert SIP_VERSION_FALLBACK matches SIP.md.
 *
 * Built on SIP — operational tier (version registry).
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PKG_NAME = "@arcanea/starlight-intelligence-system";

/**
 * Hardcoded fallback for SIP version when SIP.md isn't shipped (consumer
 * install). MUST track SIP.md `Version:` line. Bump on every SIP version
 * change.
 *
 * 2026-05-07: in sync with SIP.md v1.1.1 (commit 97c7edc, encoded-self
 * forkable boundary amendment).
 */
const SIP_VERSION_FALLBACK = "v1.1.1";

function callerDir(): string {
  try {
    return dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
}

function searchDirs(): string[] {
  const here = callerDir();
  return [
    // dist/.. or src/.. → repo / package root
    join(here, ".."),
    // dist/ or src/
    here,
    // process.cwd() as last resort (covers awkward bin invocations)
    process.cwd(),
  ];
}

function readJsonSafe(path: string): Record<string, unknown> | null {
  try {
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf-8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Resolve the package root — directory containing the canonical package.json.
 * Falls back to process.cwd() if not found (e.g., installed via tarball without
 * standard layout).
 */
export function getPackageRoot(): string {
  for (const dir of searchDirs()) {
    const pkg = readJsonSafe(join(dir, "package.json"));
    if (pkg && pkg.name === PKG_NAME) return dir;
  }
  return process.cwd();
}

/**
 * Operational layer (npm package) version. Reads from package.json `version`
 * field. Single source of truth for MCP serverInfo, CLI banner, and any
 * runtime "what version of SIS is this" query.
 */
export function getPackageVersion(): string {
  const root = getPackageRoot();
  const pkg = readJsonSafe(join(root, "package.json"));
  if (pkg && typeof pkg.version === "string") return pkg.version;
  return "unknown";
}

/**
 * Substrate spec version. Reads SIP.md `Version:` line if available
 * (development); falls back to hardcoded constant otherwise (consumer
 * install — SIP.md is not in package.json `files`).
 *
 * Returns format: `v1.1.1` (with leading "v" — matches SIP.md style). Strip
 * the prefix at the call site if needed (e.g., MCP serverInfo conventions).
 */
export function getSipVersion(): string {
  const root = getPackageRoot();
  const sipPath = join(root, "SIP.md");
  if (existsSync(sipPath)) {
    try {
      const text = readFileSync(sipPath, "utf-8");
      const match = text.match(/^Version:\s*`(v[\d.]+)`/m);
      if (match) return match[1]!;
    } catch {
      // Fall through to hardcoded
    }
  }
  return SIP_VERSION_FALLBACK;
}
