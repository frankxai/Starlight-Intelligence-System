import assert from "node:assert/strict";
import test from "node:test";
import {
  inspectCapabilityProviders,
  routeCapability,
  type CapabilityInventory,
} from "../src/capability-control-plane.js";

const inventory: CapabilityInventory = {
  version: 1,
  providers: [
    { id: "local", surface: "local", command: "local", capabilities: ["code"], costClass: "included", privacy: "workspace", evalScore: 0.9 },
    { id: "free-cloud", surface: "cloud", env: "FREE_KEY", capabilities: ["code"], costClass: "free-eligible", privacy: "remote", evalScore: 0.8 },
    { id: "paid", surface: "cloud", env: "PAID_KEY", capabilities: ["image"], costClass: "metered", privacy: "remote", evalScore: 0.95 },
  ],
};

test("provider inspection reports commands and credentials without exposing secrets", () => {
  const statuses = inspectCapabilityProviders(
    inventory,
    { FREE_KEY: "secret" },
    (command) => command === "local",
  );
  assert.deepEqual(statuses.map(({ id, available, availabilityReason }) => ({ id, available, availabilityReason })), [
    { id: "local", available: true, availabilityReason: "command" },
    { id: "free-cloud", available: true, availabilityReason: "credential" },
    { id: "paid", available: false, availabilityReason: "unavailable" },
  ]);
  assert.equal(JSON.stringify(statuses).includes("secret"), false);
});

test("routing balances availability, eval evidence, cost, and privacy", () => {
  const statuses = inspectCapabilityProviders(inventory, { FREE_KEY: "set" }, () => true);
  assert.equal(routeCapability(statuses, { capability: "code" })[0]?.id, "free-cloud");
  assert.deepEqual(
    routeCapability(statuses, { capability: "code", privacy: "workspace" }).map((item) => item.id),
    ["local"],
  );
});

test("routing rejects an empty capability", () => {
  assert.throws(() => routeCapability([], { capability: " " }), /required/);
});
