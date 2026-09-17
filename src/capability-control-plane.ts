import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export type ProviderSurface = "local" | "desktop" | "cloud";
export type CostClass = "free-eligible" | "included" | "metered";
export type PrivacyBoundary = "workspace" | "remote";

export interface CapabilityProvider {
  id: string;
  surface: ProviderSurface;
  command?: string;
  env?: string;
  capabilities: string[];
  costClass: CostClass;
  privacy: PrivacyBoundary;
  evalScore: number;
}

export interface ProviderStatus extends CapabilityProvider {
  available: boolean;
  availabilityReason: "command" | "credential" | "unavailable";
}

export interface RouteRequest {
  capability: string;
  privacy?: "workspace" | "remote-ok";
  preferFree?: boolean;
}

export interface RouteCandidate extends ProviderStatus {
  score: number;
  reasons: string[];
}

export interface CapabilityInventory {
  version: number;
  providers: CapabilityProvider[];
}

export function loadCapabilityInventory(repoRoot: string): CapabilityInventory {
  const path = join(repoRoot, "config", "capability-providers.json");
  const parsed = JSON.parse(readFileSync(path, "utf8")) as CapabilityInventory;
  if (parsed.version !== 1 || !Array.isArray(parsed.providers)) {
    throw new Error(`Unsupported capability inventory: ${path}`);
  }
  return parsed;
}

function commandAvailable(command: string, env: NodeJS.ProcessEnv): boolean {
  const finder = process.platform === "win32" ? "where" : "which";
  try {
    execFileSync(finder, [command], { env, stdio: "ignore", timeout: 2_000 });
    return true;
  } catch {
    return false;
  }
}

export function inspectCapabilityProviders(
  inventory: CapabilityInventory,
  env: NodeJS.ProcessEnv = process.env,
  commandProbe = commandAvailable,
): ProviderStatus[] {
  return inventory.providers.map((provider) => {
    const hasCommand = provider.command ? commandProbe(provider.command, env) : false;
    const hasCredential = provider.env ? Boolean(env[provider.env]) : false;
    return {
      ...provider,
      available: hasCommand || hasCredential,
      availabilityReason: hasCommand ? "command" : hasCredential ? "credential" : "unavailable",
    };
  });
}

export function routeCapability(
  providers: ProviderStatus[],
  request: RouteRequest,
): RouteCandidate[] {
  const capability = request.capability.trim().toLowerCase();
  if (!capability) throw new Error("A capability is required.");

  return providers
    .filter((provider) => provider.capabilities.includes(capability))
    .filter((provider) => request.privacy !== "workspace" || provider.privacy === "workspace")
    .map((provider) => {
      const reasons: string[] = [];
      let score = provider.evalScore * 100;
      if (provider.available) {
        score += 40;
        reasons.push(`available via ${provider.availabilityReason}`);
      } else {
        score -= 100;
        reasons.push("not detected");
      }
      if (request.preferFree !== false && provider.costClass === "free-eligible") {
        score += 30;
        reasons.push("free-eligible; verify account quota before dispatch");
      }
      if (provider.costClass === "included") {
        score += 10;
        reasons.push("included access; quota not assumed");
      }
      if (provider.privacy === "workspace") {
        score += 8;
        reasons.push("workspace privacy boundary");
      }
      return { ...provider, score: Math.round(score * 100) / 100, reasons };
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export function findPackageRoot(start: string): string {
  let current = resolve(start);
  while (!existsSync(join(current, "config", "capability-providers.json"))) {
    const parent = dirname(current);
    if (parent === current) throw new Error("Could not find capability provider inventory.");
    current = parent;
  }
  return current;
}
