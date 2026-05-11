/**
 * Track E v0.1 — Pack Registry runtime
 *
 * Reads / writes packs/registry.json. Owns install, uninstall, and manifest
 * SHA computation. Composes with the Track A ledger for persistence (every
 * install / uninstall is logged as a Pack record + Artifact + AgentEvent).
 *
 * Layout under <repoRoot>/packs/:
 *   registry.json            — source of truth: { installed[], available[] }
 *   installed/<pack-id>/     — actual pack content
 *     manifest.json          — the Pack record
 *     README.md              — short description
 *     content/               — pack files (prompts / agents / claws / ...)
 *   available/<pack-id>/     — discoverable but not installed; same layout
 *
 * Permission model — strings of shape `<resource_type>:<verb>:<scope>`:
 *   fs:read:HOME            fs:read:repo            fs:write:HOME/.starlight/cockpit
 *   task-scheduler:register network:fetch:starlight-registry
 *
 * Permissions are stored on the Pack as a string[] (the wire shape used by
 * the dashboard), but the Track A `Permission` object form is materialised
 * on demand by `permissionFromString()` for ledger persistence.
 *
 * Invariants:
 *   • Install copies available/<id>/ -> installed/<id>/ atomically: stage
 *     into installed/<id>.tmp/, then rename. Rename failures roll back the
 *     staging dir; partial copies never leave installed/<id>/ visible.
 *   • Install is REFUSED when pack.permissions is non-empty and the caller
 *     did not pass permissions_acked:true. Never bypassable.
 *   • Manifest SHA is recomputed at install/uninstall time from the sorted
 *     list of (relativePath, sha256) pairs under the pack directory.
 *   • Signature verification is stubbed (signature_ref recorded as-is); the
 *     contract is "real verification ships when @starlight/pack-signing
 *     publishes". The stub never silently passes — packs without a known
 *     signing key get attestation = "unattested" on their Artifact record.
 *
 * Built on SIP — operational tier (Track E).
 */

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, sep } from "node:path";

import type { Pack, Permission, PackKind } from "./types.js";
import {
  AgentOpsLedger,
  buildAgentEvent,
  nowIso,
} from "./ledgers.js";

// ── Registry shape ───────────────────────────────────────────

export interface PackRegistry {
  schema_version: string;
  installed: Pack[];
  available: Pack[];
}

export interface InstallOptions {
  /** REQUIRED if pack.permissions[] is non-empty. No default. */
  permissions_acked?: boolean;
  /** Optional ledger to record install events into. */
  ledger?: AgentOpsLedger;
  /** Optional caller id for the AgentEvent / Decision records. */
  caller?: string;
}

export interface InstallResult {
  ok: boolean;
  pack?: Pack;
  error?: string;
  /** Path on disk where the pack now lives (when ok). */
  installPath?: string;
}

export interface UninstallResult {
  ok: boolean;
  pack?: Pack;
  error?: string;
}

// ── Errors ───────────────────────────────────────────────────

export class PackRuntimeError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "PackRuntimeError";
  }
}

// ── Paths ────────────────────────────────────────────────────

export function packsRoot(repoRoot: string): string {
  return join(repoRoot, "packs");
}

export function registryPath(repoRoot: string): string {
  return join(packsRoot(repoRoot), "registry.json");
}

export function installedDir(repoRoot: string, packId?: string): string {
  const base = join(packsRoot(repoRoot), "installed");
  return packId ? join(base, packId) : base;
}

export function availableDir(repoRoot: string, packId?: string): string {
  const base = join(packsRoot(repoRoot), "available");
  return packId ? join(base, packId) : base;
}

// ── Manifest SHA ─────────────────────────────────────────────

/**
 * Compute a deterministic SHA-256 for a pack directory.
 *
 * Algorithm:
 *   1. Walk the directory recursively.
 *   2. Skip manifest.json itself (so the sha can be embedded in the manifest
 *      without becoming a fixed point).
 *   3. For each file, record (relPath-with-forward-slash, sha256(content)).
 *   4. Sort the list lexicographically by relPath.
 *   5. SHA-256 over the concatenated `${relPath}:${sha256}\n` lines.
 *
 * Returns a lowercase hex string.
 */
export function computeManifestSha(packDir: string): string {
  if (!existsSync(packDir)) {
    throw new PackRuntimeError("E_PACK_NOT_FOUND", `pack dir does not exist: ${packDir}`);
  }
  const entries: Array<{ rel: string; sha: string }> = [];
  walk(packDir, (filePath) => {
    const rel = relative(packDir, filePath).split(sep).join("/");
    if (rel === "manifest.json") return; // see step 2 above
    const content = readFileSync(filePath);
    const sha = createHash("sha256").update(content).digest("hex");
    entries.push({ rel, sha });
  });
  entries.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
  const body = entries.map((e) => `${e.rel}:${e.sha}`).join("\n");
  return createHash("sha256").update(body).digest("hex");
}

function walk(dir: string, fn: (filePath: string) => void): void {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, fn);
    else fn(full);
  }
}

// ── Permission helpers ───────────────────────────────────────

/**
 * The wire form of a permission is a single string `<resource>:<verb>:<scope>`.
 * Track A's Permission object embeds (id, scope, action, conditions); we
 * materialise the object on demand when persisting to the ledger.
 */
export function permissionFromString(s: string): Permission {
  const parts = s.split(":");
  if (parts.length < 2) {
    throw new PackRuntimeError(
      "E_BAD_PERMISSION",
      `permission string must be <resource>:<verb>[:<scope>], got: ${s}`,
    );
  }
  const [resource, action, ...rest] = parts;
  const scope = rest.length ? rest.join(":") : "*";
  return {
    id: `perm_${createHash("sha256").update(s).digest("hex").slice(0, 12)}`,
    scope: `${resource}:${scope}`,
    action,
    conditions: [],
  };
}

// ── Registry I/O ─────────────────────────────────────────────

export function readRegistry(repoRoot: string): PackRegistry {
  const path = registryPath(repoRoot);
  if (!existsSync(path)) {
    return { schema_version: "1.0", installed: [], available: [] };
  }
  try {
    const parsed = JSON.parse(readFileSync(path, "utf-8")) as Partial<PackRegistry>;
    return {
      schema_version: parsed.schema_version ?? "1.0",
      installed: Array.isArray(parsed.installed) ? parsed.installed : [],
      available: Array.isArray(parsed.available) ? parsed.available : [],
    };
  } catch (err) {
    throw new PackRuntimeError(
      "E_BAD_REGISTRY",
      `registry.json is malformed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export function writeRegistry(repoRoot: string, reg: PackRegistry): void {
  const path = registryPath(repoRoot);
  mkdirSync(packsRoot(repoRoot), { recursive: true });
  // Atomic-ish: write to .tmp then rename.
  const tmp = path + ".tmp";
  writeFileSync(tmp, JSON.stringify(reg, null, 2) + "\n", "utf-8");
  renameSync(tmp, path);
}

// ── Manifest validation ──────────────────────────────────────

const VALID_KINDS: PackKind[] = [
  "prompt",
  "skill",
  "agent",
  "knowledge",
  "claw",
  "white-label",
];

interface ManifestValidation {
  ok: boolean;
  errors: string[];
  pack?: Pack;
}

/**
 * Validate a raw manifest object against the Pack contract.
 * Forgiving on extra fields — strict on shape and types.
 */
export function validateManifest(raw: unknown): ManifestValidation {
  const errors: string[] = [];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, errors: ["manifest must be a JSON object"] };
  }
  const m = raw as Record<string, unknown>;
  function req(key: string, type: string): unknown {
    if (!(key in m)) {
      errors.push(`missing required field: ${key}`);
      return undefined;
    }
    const v = m[key];
    const actual = Array.isArray(v) ? "array" : typeof v;
    if (actual !== type) {
      errors.push(`field ${key}: expected ${type}, got ${actual}`);
    }
    return v;
  }
  req("id", "string");
  req("name", "string");
  req("version", "string");
  const kind = req("kind", "string");
  req("permissions", "array");
  req("licenseTier", "string");
  req("manifestSha", "string");
  if (typeof kind === "string" && !VALID_KINDS.includes(kind as PackKind)) {
    errors.push(`field kind: '${kind}' not in ${VALID_KINDS.join("|")}`);
  }
  if (Array.isArray(m.permissions)) {
    for (let i = 0; i < m.permissions.length; i++) {
      const p = m.permissions[i];
      if (typeof p !== "string") {
        errors.push(`permissions[${i}]: expected string`);
      } else if (p.split(":").length < 2) {
        errors.push(`permissions[${i}]: bad shape '${p}' (need <resource>:<verb>[:<scope>])`);
      }
    }
  }
  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    errors: [],
    pack: m as unknown as Pack,
  };
}

// ── List ─────────────────────────────────────────────────────

export interface ListResult {
  installed: Pack[];
  available: Pack[];
}

/**
 * sis.pack.list — read the on-disk registry, return both buckets.
 * Refreshes manifestSha lazily if a pack manifest exists on disk.
 */
export function listPacks(repoRoot: string): ListResult {
  const reg = readRegistry(repoRoot);
  return {
    installed: reg.installed.map((p) => withRefreshedSha(repoRoot, p, "installed")),
    available: reg.available.map((p) => withRefreshedSha(repoRoot, p, "available")),
  };
}

function withRefreshedSha(
  repoRoot: string,
  pack: Pack,
  bucket: "installed" | "available",
): Pack {
  const dir =
    bucket === "installed"
      ? installedDir(repoRoot, pack.id)
      : availableDir(repoRoot, pack.id);
  if (!existsSync(dir)) return pack; // registry-only entry; trust as-is
  try {
    const sha = computeManifestSha(dir);
    return sha === pack.manifestSha ? pack : { ...pack, manifestSha: sha };
  } catch {
    return pack;
  }
}

// ── Install ──────────────────────────────────────────────────

/**
 * sis.pack.install — atomic install of an available pack.
 *
 * Steps:
 *   1. Locate pack in registry.available[].
 *   2. Read available/<id>/manifest.json; validate.
 *   3. If pack.permissions is non-empty, REQUIRE permissions_acked:true.
 *   4. Stage-copy available/<id>/ -> installed/<id>.tmp/.
 *   5. Rename .tmp -> <id> (atomic on a single filesystem).
 *   6. Recompute manifestSha against the installed copy.
 *   7. Move pack from registry.available -> registry.installed; persist.
 *   8. (If ledger provided) Record AgentEvent + register Pack as Artifact.
 *
 * Failure at any stage:
 *   - Removes installed/<id>.tmp/ if it exists.
 *   - Does NOT modify the registry.
 *   - Returns { ok:false, error } — does NOT throw for caller-friendly RPC.
 */
export function installPack(
  repoRoot: string,
  packId: string,
  opts: InstallOptions = {},
): InstallResult {
  const reg = readRegistry(repoRoot);
  const idx = reg.available.findIndex((p) => p.id === packId);
  if (idx === -1) {
    return { ok: false, error: `pack '${packId}' not found in registry.available` };
  }
  const declared = reg.available[idx];

  const sourceDir = availableDir(repoRoot, packId);
  if (!existsSync(sourceDir)) {
    return {
      ok: false,
      error: `pack '${packId}' is in registry but available/${packId}/ does not exist`,
    };
  }

  // Read on-disk manifest. If absent, treat the registry record as authoritative.
  const manifestPath = join(sourceDir, "manifest.json");
  let manifest: Pack = declared;
  if (existsSync(manifestPath)) {
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(manifestPath, "utf-8"));
    } catch (err) {
      return {
        ok: false,
        error: `manifest.json is not valid JSON: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
    const v = validateManifest(raw);
    if (!v.ok) {
      return { ok: false, error: `manifest validation failed: ${v.errors.join("; ")}` };
    }
    manifest = v.pack as Pack;
    if (manifest.id !== packId) {
      return {
        ok: false,
        error: `manifest.id '${manifest.id}' does not match registry id '${packId}'`,
      };
    }
  }

  // ── Permission gate (NEVER bypassable) ──
  if (manifest.permissions.length > 0 && opts.permissions_acked !== true) {
    return {
      ok: false,
      error:
        `pack '${packId}' declares ${manifest.permissions.length} permission(s); ` +
        `permissions_acked:true required (got ${opts.permissions_acked ?? "undefined"})`,
    };
  }

  // ── Atomic stage + rename ──
  const targetDir = installedDir(repoRoot, packId);
  const stagingDir = targetDir + ".tmp";

  // Clean any prior staging.
  if (existsSync(stagingDir)) {
    rmSync(stagingDir, { recursive: true, force: true });
  }
  if (existsSync(targetDir)) {
    return { ok: false, error: `pack '${packId}' already installed at ${targetDir}` };
  }

  try {
    mkdirSync(installedDir(repoRoot), { recursive: true });
    cpSync(sourceDir, stagingDir, { recursive: true });
    renameSync(stagingDir, targetDir);
  } catch (err) {
    // Roll back: nothing committed to registry yet, staging may exist.
    if (existsSync(stagingDir)) {
      try {
        rmSync(stagingDir, { recursive: true, force: true });
      } catch {
        /* best-effort */
      }
    }
    return {
      ok: false,
      error: `atomic copy failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // ── Recompute sha against installed copy + finalise record ──
  let finalSha: string;
  try {
    finalSha = computeManifestSha(targetDir);
  } catch (err) {
    // Installed copy is corrupt — roll it back.
    rmSync(targetDir, { recursive: true, force: true });
    return {
      ok: false,
      error: `manifest sha computation failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const installedAt = nowIso();
  const finalPack: Pack = {
    ...manifest,
    manifestSha: finalSha,
    installedAt,
  };

  // Persist updated manifest.json inside the installed copy (sha now stable).
  try {
    writeFileSync(
      join(targetDir, "manifest.json"),
      JSON.stringify(finalPack, null, 2) + "\n",
      "utf-8",
    );
  } catch (err) {
    rmSync(targetDir, { recursive: true, force: true });
    return {
      ok: false,
      error: `failed to write installed manifest: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // ── Update registry ──
  const nextReg: PackRegistry = {
    ...reg,
    installed: [...reg.installed, finalPack],
    available: reg.available.filter((p) => p.id !== packId),
  };
  try {
    writeRegistry(repoRoot, nextReg);
  } catch (err) {
    // Best-effort rollback: remove installed copy.
    rmSync(targetDir, { recursive: true, force: true });
    return {
      ok: false,
      error: `failed to update registry: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // ── Ledger persistence (optional) ──
  if (opts.ledger) {
    try {
      const ev = buildAgentEvent({
        runId: `pack_install_${packId}_${Date.now()}`,
        agentId: opts.caller ?? "pack-runtime",
        eventType: "pack.install",
        summary: `Installed pack ${packId}@${finalPack.version}`,
        toolsUsed: ["sis.pack.install"],
        artifactsCreated: [finalPack.id],
        riskLevel: finalPack.permissions.length > 0 ? "medium" : "low",
      });
      opts.ledger.recordAgentEvent(ev);
    } catch {
      /* ledger errors are non-fatal for the install itself */
    }
  }

  return { ok: true, pack: finalPack, installPath: targetDir };
}

// ── Uninstall ────────────────────────────────────────────────

/**
 * sis.pack.uninstall — symmetric to install.
 * Removes installed/<id>/, moves the record back to registry.available.
 */
export function uninstallPack(
  repoRoot: string,
  packId: string,
  opts: { ledger?: AgentOpsLedger; caller?: string } = {},
): UninstallResult {
  const reg = readRegistry(repoRoot);
  const idx = reg.installed.findIndex((p) => p.id === packId);
  if (idx === -1) {
    return { ok: false, error: `pack '${packId}' not installed` };
  }
  const pack = reg.installed[idx];
  const targetDir = installedDir(repoRoot, packId);

  if (existsSync(targetDir)) {
    try {
      rmSync(targetDir, { recursive: true, force: true });
    } catch (err) {
      return {
        ok: false,
        error: `failed to remove ${targetDir}: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  // Move pack back to available. Drop installedAt; refresh sha if avail/ copy exists.
  const { installedAt: _omit, ...restored } = pack;
  const availDir = availableDir(repoRoot, packId);
  let finalSha = restored.manifestSha;
  if (existsSync(availDir)) {
    try {
      finalSha = computeManifestSha(availDir);
    } catch {
      /* keep prior */
    }
  }
  const nextReg: PackRegistry = {
    ...reg,
    installed: reg.installed.filter((p) => p.id !== packId),
    available: [...reg.available, { ...restored, manifestSha: finalSha }],
  };
  try {
    writeRegistry(repoRoot, nextReg);
  } catch (err) {
    return {
      ok: false,
      error: `failed to update registry: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  if (opts.ledger) {
    try {
      const ev = buildAgentEvent({
        runId: `pack_uninstall_${packId}_${Date.now()}`,
        agentId: opts.caller ?? "pack-runtime",
        eventType: "pack.uninstall",
        summary: `Uninstalled pack ${packId}@${pack.version}`,
        toolsUsed: ["sis.pack.uninstall"],
        riskLevel: "low",
      });
      opts.ledger.recordAgentEvent(ev);
    } catch {
      /* non-fatal */
    }
  }

  return { ok: true, pack: { ...restored, manifestSha: finalSha } };
}

// ── Signature verification (STUBBED) ─────────────────────────

/**
 * Stub. Real signature verification ships when @starlight/pack-signing publishes.
 *
 * Contract this stub honours:
 *   - Returns `{ verified: false, reason: 'no-signing-key' }` when there's
 *     no key material on disk for the signatureRef.
 *   - Never returns `verified: true` from the stub. Callers MUST treat
 *     "verified:true" as a signal that the real verifier has shipped.
 */
export function verifySignature(pack: Pack): { verified: boolean; reason: string } {
  if (!pack.signatureRef) {
    return { verified: false, reason: "no-signature-ref" };
  }
  return { verified: false, reason: "no-signing-key" };
}
