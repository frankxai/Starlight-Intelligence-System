import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The version this repository actually ships, read from the package manifest
 * instead of being restated in prose. `site/` sits one directory below the repo
 * root, so the manifest is `../package.json` during build and dev.
 *
 * The pin below only covers a runtime bundle that cannot see the repo root
 * (same pattern as `getCanonicalSipVersion`). Keep it in step with
 * package.json when the package version changes.
 */
const PACKAGE_VERSION_FALLBACK = "8.5.2";

export function getShippedVersion(): string {
  try {
    const manifest = JSON.parse(
      readFileSync(join(process.cwd(), "..", "package.json"), "utf8")
    ) as { version?: string };
    return manifest.version ?? PACKAGE_VERSION_FALLBACK;
  } catch {
    return PACKAGE_VERSION_FALLBACK;
  }
}
