import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const toolDir = dirname(fileURLToPath(import.meta.url));
export const repoRoot = resolve(toolDir, "..", "..");
export const registryPath = resolve(repoRoot, "foundry", "factories", "website-surfaces.json");

export const HOLD_LINE = "Do not deploy, merge, or take payment.";
export const REQUIRED_ROLES = ["customer", "design", "platform", "sentinel", "maker", "reviewer"];
export const SDLC = ["customer-job", "specify", "make", "independent-review", "ship-hold"];
const READ_ONLY_ROLES = new Set(["customer", "sentinel", "reviewer"]);

function err(code, message, surfaceId = null) {
  return { code, message, surfaceId };
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function spendLine(cap) {
  return `Spend cap: $${cap}.`;
}

export function validateRegistry(registry) {
  const errors = [];
  if (!isObject(registry)) return [err("registry-type", "Registry must be an object.")];
  if (registry.schemaVersion !== "1.0.0") {
    errors.push(err("schema-version", "schemaVersion must be 1.0.0."));
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(registry.observedOn ?? "")) {
    errors.push(err("observed-on", "observedOn must be YYYY-MM-DD."));
  }
  if (!Array.isArray(registry.surfaces) || registry.surfaces.length === 0) {
    errors.push(err("surfaces-missing", "surfaces must be a non-empty array."));
    return errors;
  }

  const ids = new Set();
  const productIds = new Set();
  const hostClaims = new Map();

  for (const surface of registry.surfaces) {
    if (!isObject(surface) || typeof surface.id !== "string") {
      errors.push(err("surface-id", "Every surface needs a string id."));
      continue;
    }
    const id = surface.id;
    if (ids.has(id)) errors.push(err("duplicate-id", `Duplicate surface id ${id}.`, id));
    ids.add(id);

    for (const key of ["host", "customerJob", "buyer", "narrative"]) {
      if (typeof surface[key] !== "string" || surface[key].trim().length < 12) {
        errors.push(err("required-text", `${key} must be a concrete string.`, id));
      }
    }
    if (!Array.isArray(surface.mustBeat) || surface.mustBeat.length < 2) {
      errors.push(err("must-beat", "Name at least two incumbents in mustBeat.", id));
    }
    if (surface.graphProductId !== null && typeof surface.graphProductId !== "string") {
      errors.push(err("product-id", "graphProductId must be a string or null.", id));
    }
    if (typeof surface.graphProductId === "string") {
      if (productIds.has(surface.graphProductId)) {
        errors.push(err("duplicate-product", `graphProductId ${surface.graphProductId} is repeated.`, id));
      }
      productIds.add(surface.graphProductId);
    }
    if (!Number.isInteger(surface.spendCapUsd) || surface.spendCapUsd < 1 || surface.spendCapUsd > 100) {
      errors.push(err("spend-cap", "spendCapUsd must be an integer from 1 to 100.", id));
    }

    const repo = surface.repo;
    if (!isObject(repo) || typeof repo.origin !== "string" || !repo.origin.startsWith("https://github.com/frankxai/")) {
      errors.push(err("repo-origin", "repo.origin must be a frankxai GitHub URL.", id));
    } else if (typeof repo.observedBranch !== "string" || typeof repo.writableNow !== "boolean") {
      errors.push(err("repo-lane", "repo needs observedBranch and writableNow.", id));
    }

    const production = surface.production;
    if (!isObject(production) || typeof production.claimsHost !== "boolean" || typeof production.deployNow !== "boolean") {
      errors.push(err("production", "production.claimsHost and production.deployNow are required.", id));
    } else {
      if (production.deployNow) {
        errors.push(err("deploy-held", "deployNow stays false until a human merges a reviewed PR.", id));
      }
      if (typeof production.gate !== "string" || typeof production.checkout !== "string") {
        errors.push(err("gate", "production.gate and production.checkout are required.", id));
      } else if (production.checkout !== "waitlist-only" && production.checkout !== "none") {
        errors.push(err("checkout", "Checkout is waitlist-only or none. No payment rail in this factory.", id));
      }
      if (production.claimsHost) {
        const prior = hostClaims.get(surface.host);
        if (prior) errors.push(err("host-collision", `${surface.host} is already claimed by ${prior}.`, id));
        hostClaims.set(surface.host, id);
      }
    }

    if (!Array.isArray(surface.fleet)) {
      errors.push(err("fleet", "fleet must be an array.", id));
    } else {
      const byRole = new Map();
      for (const member of surface.fleet) {
        if (!isObject(member) || typeof member.role !== "string") {
          errors.push(err("fleet-member", "Each fleet member needs a role.", id));
          continue;
        }
        if (byRole.has(member.role)) errors.push(err("duplicate-role", `Duplicate role ${member.role}.`, id));
        byRole.set(member.role, member);
        if (typeof member.harness !== "string" || typeof member.brief !== "string" || member.brief.length < 20) {
          errors.push(err("fleet-brief", `${member.role} needs a harness and a brief.`, id));
        }
        if (typeof member.writes !== "boolean") {
          errors.push(err("fleet-writes", `${member.role} must declare writes.`, id));
        } else if (READ_ONLY_ROLES.has(member.role) && member.writes) {
          errors.push(err("read-only-role", `${member.role} cannot write.`, id));
        }
      }
      for (const role of REQUIRED_ROLES) {
        if (!byRole.has(role)) errors.push(err("missing-role", `Missing fleet role ${role}.`, id));
      }
      const maker = byRole.get("maker");
      const reviewer = byRole.get("reviewer");
      if (maker && reviewer && maker.harness === reviewer.harness) {
        errors.push(err("maker-reviewer", "The reviewer harness must differ from the maker.", id));
      }
    }

    if (!Array.isArray(surface.sdlc) || surface.sdlc.map((step) => step?.id).join(",") !== SDLC.join(",")) {
      errors.push(err("sdlc", `sdlc must be ${SDLC.join(" -> ")}.`, id));
    } else {
      for (const step of surface.sdlc) {
        if (typeof step.owner !== "string" || typeof step.proof !== "string" || step.proof.length < 12) {
          errors.push(err("sdlc-proof", `${step.id} needs an owner and a proof.`, id));
        }
      }
    }

    const prompts = surface.prompts;
    if (!isObject(prompts)) {
      errors.push(err("prompts", "local and cloud prompts are required.", id));
    } else {
      for (const where of ["local", "cloud"]) {
        const text = prompts[where];
        if (typeof text !== "string" || text.length < 40) {
          errors.push(err("prompt-missing", `${where} prompt is missing.`, id));
          continue;
        }
        if (!text.includes(HOLD_LINE)) errors.push(err("prompt-hold", `${where} prompt must contain the hold line.`, id));
        if (!text.includes(spendLine(surface.spendCapUsd))) {
          errors.push(err("prompt-cap", `${where} prompt must include ${spendLine(surface.spendCapUsd)}`, id));
        }
        if (/--no-verify|push\s+--force|force-push|curl\s+\|/.test(text)) {
          errors.push(err("prompt-unsafe", `${where} prompt contains an unsafe instruction.`, id));
        }
      }
    }
  }

  return errors;
}

export function loadRegistry(path = registryPath) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function printList(registry) {
  for (const surface of registry.surfaces) {
    const claim = surface.production.claimsHost ? "claims host" : "does not claim host";
    const lane = surface.repo.writableNow ? "writable on its named branch" : "held";
    console.log(`${surface.id}  ${surface.host}  ${claim}  ${lane}`);
  }
}

function printPrompt(registry, id, where) {
  const surface = registry.surfaces.find((item) => item.id === id);
  if (!surface) {
    console.error(`Unknown surface ${id}.`);
    process.exit(1);
  }
  if (where !== "local" && where !== "cloud") {
    console.error("Prompt target must be local or cloud.");
    process.exit(1);
  }
  process.stdout.write(`${surface.prompts[where]}\n`);
}

function main() {
  const [command = "check", id, where] = process.argv.slice(2);
  const registry = loadRegistry();
  const errors = validateRegistry(registry);
  if (command === "check") {
    if (errors.length) {
      for (const error of errors) console.error(`${error.code}${error.surfaceId ? ` ${error.surfaceId}` : ""}: ${error.message}`);
      process.exit(1);
    }
    console.log(`website factory ok: ${registry.surfaces.length} surfaces, deployNow false on all.`);
    return;
  }
  if (errors.length) {
    console.error("Registry is invalid. Run check.");
    process.exit(1);
  }
  if (command === "list") {
    printList(registry);
    return;
  }
  if (command === "prompt") {
    printPrompt(registry, id, where);
    return;
  }
  console.error("Commands: check, list, prompt <id> <local|cloud>");
  process.exit(1);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
