/**
 * Entity registry loader — reads private/business-registry.json.
 *
 * Per Board REVISE-1 (2026-05-11): real entity data lives in `private/`, NEVER
 * in repo root or git. The template at business-registry.template.json is
 * schema-only with placeholder values.
 *
 * If private/business-registry.json doesn't exist, this module errors with
 * explicit copy-instructions rather than silently degrading.
 */

import { existsSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { join } from "node:path";

export type EntityType = "holding" | "operating-company" | "sole-trader" | "other";

export interface CurrentCash {
  amount: number;
  currency: string;
  last_updated: string; // ISO-8601
}

export interface Entity {
  name: string;
  type: EntityType;
  jurisdiction: string;
  currency_base: string;
  role: string;
  operates: string[];
  current_cash: CurrentCash;
}

export interface EntityRegistry {
  version: string;
  schema: string;
  entities: Entity[];
}

export class EntityRegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EntityRegistryError";
  }
}

const PRIVATE_PATH = ["private", "business-registry.json"];

export function loadRegistry(repoRoot: string): EntityRegistry {
  const path = join(repoRoot, ...PRIVATE_PATH);

  if (!existsSync(path)) {
    throw new EntityRegistryError(
      `private/business-registry.json not found.\n\n` +
        `Operator setup required:\n` +
        `  cp business-registry.template.json private/business-registry.json\n` +
        `Then fill in real entity values (post-counsel-conversation for jurisdictions).\n` +
        `\n` +
        `Per Board REVISE-1 (2026-05-11) — entity data is operator-private, never committed.`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    throw new EntityRegistryError(
      `private/business-registry.json is not valid JSON: ${(err as Error).message}`,
    );
  }

  validate(parsed);
  return parsed as EntityRegistry;
}

/**
 * Atomic update of `current_cash` for one entity — used by /finance-cash-tick command.
 */
export function updateCash(
  repoRoot: string,
  entityName: string,
  amount: number,
  currency: string,
): EntityRegistry {
  const reg = loadRegistry(repoRoot);
  const entity = reg.entities.find((e) => e.name === entityName);
  if (!entity) {
    throw new EntityRegistryError(`Entity "${entityName}" not found in registry`);
  }
  entity.current_cash = {
    amount,
    currency,
    last_updated: new Date().toISOString(),
  };

  const path = join(repoRoot, ...PRIVATE_PATH);
  const tempPath = `${path}.tmp-${Date.now()}`;
  writeFileSync(tempPath, JSON.stringify(reg, null, 2) + "\n", "utf8");
  renameSync(tempPath, path);
  return reg;
}

/**
 * Staleness check — per Board REVISE-2, cash > 14 days old must refuse runway
 * computation rather than silently compute on stale data.
 */
export function isCashStale(entity: Entity, asOfDate: Date = new Date()): boolean {
  const lastUpdated = new Date(entity.current_cash.last_updated);
  const ageDays = (asOfDate.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  return ageDays > 14;
}

function validate(parsed: unknown): asserts parsed is EntityRegistry {
  if (typeof parsed !== "object" || parsed === null) {
    throw new EntityRegistryError("registry must be an object");
  }
  const r = parsed as Record<string, unknown>;
  if (typeof r.version !== "string") {
    throw new EntityRegistryError("version field required");
  }
  if (!Array.isArray(r.entities)) {
    throw new EntityRegistryError("entities must be an array");
  }
  if (r.entities.length === 0) {
    throw new EntityRegistryError("at least one entity required");
  }
  for (const e of r.entities as Array<Record<string, unknown>>) {
    if (typeof e.name !== "string") throw new EntityRegistryError("every entity needs a name");
    if (typeof e.currency_base !== "string") {
      throw new EntityRegistryError(`entity "${e.name}" missing currency_base`);
    }
    const cash = e.current_cash as Record<string, unknown> | undefined;
    if (!cash || typeof cash !== "object") {
      throw new EntityRegistryError(`entity "${e.name}" missing current_cash object`);
    }
    if (typeof cash.amount !== "number") {
      throw new EntityRegistryError(`entity "${e.name}" missing current_cash.amount`);
    }
    if (typeof cash.last_updated !== "string") {
      throw new EntityRegistryError(`entity "${e.name}" missing current_cash.last_updated`);
    }
  }
}
