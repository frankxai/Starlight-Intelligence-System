// scripts/seed-pack-registry.ts
//
// Initialise packs/registry.json + the on-disk manifest.json files for
// the 3 sample packs (council / cockpit / claw). Idempotent: writes the
// same SHAs every time given the same content.
//
// Run: node --import tsx scripts/seed-pack-registry.ts

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  computeManifestSha,
  availableDir,
  installedDir,
  packsRoot,
  registryPath,
  type PackRegistry,
} from "../src/pack-runtime.js";
import type { Pack } from "../src/types.js";

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(dirname(__filename), "..");

/** Build a manifest skeleton; sha gets backfilled. */
function buildPack(input: Omit<Pack, "manifestSha">): Pack {
  return { ...input, manifestSha: "" };
}

const COUNCIL: Pack = buildPack({
  id: "council-template-pack",
  name: "Council Template Pack",
  version: "0.1.0",
  kind: "prompt",
  permissions: [],
  licenseTier: "free",
});

const COCKPIT: Pack = buildPack({
  id: "dashboard-cockpit-pack",
  name: "Dashboard Cockpit Pack",
  version: "0.1.0",
  kind: "agent",
  permissions: [
    "fs:read:HOME/.claude",
    "fs:write:HOME/.starlight/cockpit",
    "task-scheduler:register",
  ] as unknown as Pack["permissions"],
  licenseTier: "free",
});

const CLAW: Pack = buildPack({
  id: "claw-attestation-pack",
  name: "Claw Attestation Pack",
  version: "0.1.0",
  kind: "claw",
  permissions: ["fs:read:repo"] as unknown as Pack["permissions"],
  licenseTier: "free",
});

interface SeedSpec {
  pack: Pack;
  bucket: "installed" | "available";
}

const SPECS: SeedSpec[] = [
  { pack: COUNCIL, bucket: "installed" },
  { pack: COCKPIT, bucket: "available" },
  { pack: CLAW, bucket: "available" },
];

function writeManifest(packDir: string, pack: Pack): void {
  // First write WITHOUT manifestSha so computeManifestSha is stable
  // (the algo already skips manifest.json itself, but we want the file
  // to be present and parseable as Pack on first read).
  const placeholder = { ...pack, manifestSha: "" };
  mkdirSync(packDir, { recursive: true });
  writeFileSync(
    join(packDir, "manifest.json"),
    JSON.stringify(placeholder, null, 2) + "\n",
    "utf-8",
  );
  // Now compute sha and rewrite.
  const sha = computeManifestSha(packDir);
  const final: Pack = { ...pack, manifestSha: sha };
  writeFileSync(
    join(packDir, "manifest.json"),
    JSON.stringify(final, null, 2) + "\n",
    "utf-8",
  );
}

function seed(): void {
  mkdirSync(packsRoot(REPO_ROOT), { recursive: true });
  mkdirSync(installedDir(REPO_ROOT), { recursive: true });
  mkdirSync(availableDir(REPO_ROOT), { recursive: true });

  const installed: Pack[] = [];
  const available: Pack[] = [];
  const nowIso = new Date().toISOString();

  for (const spec of SPECS) {
    const dir =
      spec.bucket === "installed"
        ? installedDir(REPO_ROOT, spec.pack.id)
        : availableDir(REPO_ROOT, spec.pack.id);
    if (!existsSync(dir)) {
      console.warn(`[seed] WARN ${spec.pack.id}: ${dir} does not exist`);
      continue;
    }
    writeManifest(dir, spec.pack);
    const sha = computeManifestSha(dir);
    const finalPack: Pack = {
      ...spec.pack,
      manifestSha: sha,
      ...(spec.bucket === "installed" ? { installedAt: nowIso } : {}),
    };
    if (spec.bucket === "installed") installed.push(finalPack);
    else available.push(finalPack);
    console.log(
      `[seed] ${spec.bucket.padEnd(9)} ${spec.pack.id.padEnd(28)} sha=${sha.slice(0, 12)}…`,
    );
  }

  const registry: PackRegistry = {
    schema_version: "1.0",
    installed,
    available,
  };
  writeFileSync(
    registryPath(REPO_ROOT),
    JSON.stringify(registry, null, 2) + "\n",
    "utf-8",
  );
  console.log(`[seed] wrote ${registryPath(REPO_ROOT)}`);
}

seed();
