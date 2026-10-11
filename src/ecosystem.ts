/** Public package discovery never installs packages, starts agents or reads credentials. */
export const ECOSYSTEM_PACKAGES = Object.freeze([
  { name: "@starlight-intelligence/system", role: "orchestration", exports: ["./runtime-bridge", "./terminal-runtime", "./creator-workspace", "./ecosystem"] },
  { name: "@starlight-intelligence/memory", role: "memory", exports: [] },
  { name: "@starlight-intelligence/creator-mcp", role: "creation", exports: [] },
  { name: "@arcanea/starlight-intelligence-system", role: "compatibility", exports: ["./runtime-bridge", "./terminal-runtime", "./creator-workspace", "./ecosystem"] },
].map(item => Object.freeze({ ...item, exports: Object.freeze(item.exports) })));

export interface PackageObservation {
  name: string;
  role: string;
  status: "manifest-checked" | "blocked" | "unavailable";
  version?: string;
  integrity?: string;
  issues: string[];
  installation: "not-tested";
}

const VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const MAX_METADATA_BYTES = 131_072;
const REGISTRY = "https://registry.npmjs.org";
function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function inspectPackageManifest(name: string, value: unknown): PackageObservation {
  const expected = ECOSYSTEM_PACKAGES.find(item => item.name === name);
  if (!expected) throw new Error("Package is outside the admitted ecosystem catalog");
  const observation: PackageObservation = { name, role: expected.role, status: "blocked", issues: [], installation: "not-tested" };
  if (!object(value) || value.name !== name || typeof value.version !== "string" || !VERSION.test(value.version)) {
    observation.issues.push("Invalid registry package identity");
    return observation;
  }
  observation.version = value.version;
  const dist = value.dist;
  if (!object(dist) || typeof dist.integrity !== "string" || !/^sha512-[A-Za-z0-9+/]{86}==$/.test(dist.integrity)) {
    observation.issues.push("Missing valid SHA512 registry integrity");
  } else observation.integrity = dist.integrity;
  for (const field of ["dependencies", "optionalDependencies"]) {
    if (value[field] === undefined) continue;
    if (!object(value[field])) { observation.issues.push("Invalid dependency map"); continue; }
    for (const range of Object.values(value[field])) {
      // Published workspace/local paths cannot be used by independent consumers.
      if (typeof range !== "string" || /^(workspace|file|link|portal):/i.test(range.trim())) {
        observation.issues.push("Published dependency requires an unpublished local workspace");
        break;
      }
    }
  }
  for (const entry of expected.exports) {
    if (!object(value.exports) || !Object.hasOwn(value.exports, entry)) {
      observation.issues.push("Missing SDK export: " + entry);
    }
  }
  observation.status = observation.issues.length ? "blocked" : "manifest-checked";
  return observation;
}

/** A bounded current metadata observation, not installation or transitive security certification. */
export async function inspectEcosystem(options: { fetch?: typeof fetch; timeoutMs?: number } = {}) {
  const timeoutMs = options.timeoutMs ?? 10_000;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30_000) throw new Error("Invalid registry timeout");
  const request = options.fetch ?? fetch;
  const packages = await Promise.all(ECOSYSTEM_PACKAGES.map(async item => {
    const signal = AbortSignal.timeout(timeoutMs);
    try {
      const response = await request(REGISTRY + "/" + encodeURIComponent(item.name) + "/latest", {
        redirect: "error", credentials: "omit", signal, headers: { accept: "application/json", "cache-control": "no-cache" },
      });
      if (!response.ok || !response.body) throw new Error("Unavailable registry response");
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let bytes = 0;
      try {
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          bytes += chunk.value.byteLength;
          if (bytes > MAX_METADATA_BYTES) throw new Error("Registry metadata exceeds 128 KiB");
          chunks.push(chunk.value);
        }
      } finally {
        // Cancellation of a tee'd stream may wait for its other consumer. Do not
        // let cleanup turn an already bounded observation into a hanging call.
        void reader.cancel().catch(() => undefined);
      }
      const body = Buffer.concat(chunks);
      return inspectPackageManifest(item.name, JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body)));
    } catch {
      return { name: item.name, role: item.role, status: "unavailable" as const,
        issues: ["Registry response unavailable, invalid, timed out or oversized"], installation: "not-tested" as const };
    }
  }));
  return { version: "starlight.ecosystem-observation.v1", observedAt: new Date().toISOString(), registry: REGISTRY,
    organization: "starlight-intelligence", packages, authority: "public-registry-metadata-only",
    agentExecution: "not-started", credentials: "not-read", transitiveSecurity: "not-audited" };
}
