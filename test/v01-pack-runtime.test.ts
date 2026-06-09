/**
 * Track E v0.1 — Pack runtime conformance harness
 *
 * Tests src/pack-runtime.ts:
 *   • permissions_acked gate REFUSES install when pack declares permissions
 *   • permissions_acked:true installs cleanly + persists to ledger + registry
 *   • uninstall removes from installed/ + flips registry
 *   • malformed manifest is rejected — no partial state on disk
 *   • atomic install: mid-copy failure leaves no installed/<id>/ visible
 *   • manifest SHA is deterministic + recomputed on install
 *   • signature verification stub never returns verified:true
 *
 * Built on SIP — operational tier (Track E).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  AgentOpsLedger,
  readAgentEventsForDay,
} from "../src/ledgers.js";
import {
  PackRuntimeError,
  availableDir,
  computeManifestSha,
  installPack,
  installedDir,
  listPacks,
  readRegistry,
  registryPath,
  uninstallPack,
  validateManifest,
  verifySignature,
  writeRegistry,
} from "../src/pack-runtime.js";
import type { Pack } from "../src/types.js";

type TestPack = Pack;

function withTempRoot<T>(fn: (root: string) => T): T {
  const dir = mkdtempSync(join(tmpdir(), "sis-packs-"));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Seed an available pack at packs/available/<id>/ with one content file.
 * Optionally include a manifest.json on disk (default: yes).
 */
function seedAvailablePack(
  root: string,
  pack: TestPack,
  options: {
    contentFiles?: Record<string, string>;
    writeManifest?: boolean;
    malformedManifest?: string;
  } = {},
): TestPack {
  const dir = availableDir(root, pack.id);
  mkdirSync(join(dir, "content"), { recursive: true });
  const files = options.contentFiles ?? { "content/hello.md": "# hello\n" };
  for (const [rel, body] of Object.entries(files)) {
    const full = join(dir, rel);
    mkdirSync(join(dir, rel, "..").replace(/[/\\]?\.$/, ""), { recursive: true });
    writeFileSync(full, body, "utf-8");
  }
  writeFileSync(join(dir, "README.md"), `# ${pack.name}\n`, "utf-8");

  if (options.malformedManifest !== undefined) {
    writeFileSync(join(dir, "manifest.json"), options.malformedManifest, "utf-8");
  } else if (options.writeManifest !== false) {
    // Write manifest, then recompute sha against the disk state.
    writeFileSync(
      join(dir, "manifest.json"),
      JSON.stringify({ ...pack, manifestSha: "" }, null, 2),
      "utf-8",
    );
    const sha = computeManifestSha(dir);
    pack = { ...pack, manifestSha: sha };
    writeFileSync(
      join(dir, "manifest.json"),
      JSON.stringify(pack, null, 2),
      "utf-8",
    );
  }

  // Add to registry.available
  const reg = readRegistry(root);
  reg.available.push(pack);
  writeRegistry(root, reg);
  return pack;
}

function makePack(overrides: Partial<TestPack> = {}): TestPack {
  return {
    id: "test-pack",
    name: "Test Pack",
    version: "0.0.1",
    kind: "prompt",
    permissions: [],
    licenseTier: "free",
    manifestSha: "0".repeat(64),
    ...overrides,
  };
}

describe("Track E v0.1 — Pack runtime", () => {
  describe("manifest validation", () => {
    it("accepts a well-formed pack", () => {
      const v = validateManifest(makePack());
      assert.equal(v.ok, true);
      assert.equal(v.errors.length, 0);
    });

    it("rejects missing required fields", () => {
      const v = validateManifest({ id: "x" });
      assert.equal(v.ok, false);
      assert.ok(v.errors.some((e) => /missing required field: name/.test(e)));
      assert.ok(v.errors.some((e) => /missing required field: kind/.test(e)));
    });

    it("rejects an invalid kind", () => {
      const v = validateManifest(makePack({ kind: "totally-not-a-kind" as Pack["kind"] }));
      assert.equal(v.ok, false);
      assert.ok(v.errors.some((e) => /kind:/.test(e)));
    });

    it("rejects malformed permission strings", () => {
      const v = validateManifest(
        makePack({ permissions: ["no-colon"] as unknown as Pack["permissions"] }),
      );
      assert.equal(v.ok, false);
      assert.ok(v.errors.some((e) => /permissions\[0\]/.test(e)));
    });
  });

  describe("manifest SHA", () => {
    it("is deterministic for the same content", () => {
      withTempRoot((root) => {
        const pack = makePack({ id: "deterministic-pack" });
        seedAvailablePack(root, pack, { contentFiles: { "content/a.md": "AAA" } });
        const a = computeManifestSha(availableDir(root, pack.id));
        const b = computeManifestSha(availableDir(root, pack.id));
        assert.equal(a, b);
        assert.match(a, /^[0-9a-f]{64}$/);
      });
    });

    it("changes when content changes", () => {
      withTempRoot((root) => {
        const pack = makePack({ id: "mut-pack" });
        seedAvailablePack(root, pack, { contentFiles: { "content/a.md": "AAA" } });
        const before = computeManifestSha(availableDir(root, pack.id));
        writeFileSync(
          join(availableDir(root, pack.id), "content", "a.md"),
          "BBB",
          "utf-8",
        );
        const after = computeManifestSha(availableDir(root, pack.id));
        assert.notEqual(before, after);
      });
    });

    it("ignores manifest.json itself (no fixed-point requirement)", () => {
      withTempRoot((root) => {
        const pack = makePack({ id: "fp-pack" });
        seedAvailablePack(root, pack, { writeManifest: true });
        const sha1 = computeManifestSha(availableDir(root, pack.id));
        // Mutate ONLY manifest.json — sha should not change.
        writeFileSync(
          join(availableDir(root, pack.id), "manifest.json"),
          JSON.stringify({ ...pack, version: "9.9.9", manifestSha: "different" }),
          "utf-8",
        );
        const sha2 = computeManifestSha(availableDir(root, pack.id));
        assert.equal(sha1, sha2);
      });
    });
  });

  describe("install — permission gate", () => {
    it("REFUSES install when pack has permissions and permissions_acked is missing", () => {
      withTempRoot((root) => {
        const pack = seedAvailablePack(
          root,
          makePack({
            id: "perm-pack",
            permissions: ["fs:read:HOME"] as unknown as Pack["permissions"],
          }),
        );
        const r = installPack(root, pack.id);
        assert.equal(r.ok, false);
        assert.match(r.error ?? "", /permissions_acked:true required/);
        // No partial state on disk.
        assert.equal(existsSync(installedDir(root, pack.id)), false);
        // Registry unchanged.
        const reg = readRegistry(root);
        assert.equal(reg.installed.length, 0);
        assert.equal(reg.available.length, 1);
      });
    });

    it("REFUSES install when permissions_acked is explicitly false", () => {
      withTempRoot((root) => {
        const pack = seedAvailablePack(
          root,
          makePack({
            id: "perm-pack-2",
            permissions: ["fs:write:HOME/foo"] as unknown as Pack["permissions"],
          }),
        );
        const r = installPack(root, pack.id, { permissions_acked: false });
        assert.equal(r.ok, false);
        assert.match(r.error ?? "", /permissions_acked:true required/);
      });
    });

    it("ALLOWS install of a no-permission pack without permissions_acked", () => {
      withTempRoot((root) => {
        const pack = seedAvailablePack(root, makePack({ id: "noperm-pack" }));
        const r = installPack(root, pack.id);
        assert.equal(r.ok, true, r.error);
        assert.ok(r.pack);
        assert.equal(r.pack?.id, "noperm-pack");
        assert.ok(existsSync(installedDir(root, pack.id)));
      });
    });

    it("INSTALLS when permissions_acked:true is provided", () => {
      withTempRoot((root) => {
        const pack = seedAvailablePack(
          root,
          makePack({
            id: "ack-pack",
            permissions: ["fs:read:HOME"] as unknown as Pack["permissions"],
          }),
        );
        const r = installPack(root, pack.id, { permissions_acked: true });
        assert.equal(r.ok, true, r.error);
        assert.ok(r.pack?.installedAt, "installedAt should be set");
        // Registry updated.
        const reg = readRegistry(root);
        assert.equal(reg.installed.length, 1);
        assert.equal(reg.installed[0].id, "ack-pack");
        assert.equal(reg.available.length, 0);
      });
    });
  });

  describe("install — ledger integration", () => {
    it("records a pack.install AgentEvent when a ledger is provided", () => {
      withTempRoot((root) => {
        const ledger = new AgentOpsLedger(root);
        try {
          const pack = seedAvailablePack(root, makePack({ id: "ledgered-pack" }));
          const r = installPack(root, pack.id, { ledger, caller: "test-runner" });
          assert.equal(r.ok, true, r.error);
          const today = new Date().toISOString().slice(0, 10);
          const events = readAgentEventsForDay(root, today);
          const installEvents = events.filter((e) => e.eventType === "pack.install");
          assert.ok(installEvents.length >= 1, "expected a pack.install AgentEvent");
          assert.equal(installEvents[0].agentId, "test-runner");
        } finally {
          ledger.close();
        }
      });
    });
  });

  describe("install — malformed manifest", () => {
    it("rejects install when manifest.json is unparseable + leaves no partial state", () => {
      withTempRoot((root) => {
        // Seed the registry without a manifest on disk first, then write a bad one.
        const pack = makePack({ id: "bad-manifest-pack" });
        const dir = availableDir(root, pack.id);
        mkdirSync(join(dir, "content"), { recursive: true });
        writeFileSync(join(dir, "content/x.md"), "x", "utf-8");
        writeFileSync(join(dir, "manifest.json"), "{ NOT JSON", "utf-8");
        const reg = readRegistry(root);
        reg.available.push(pack);
        writeRegistry(root, reg);

        const r = installPack(root, pack.id);
        assert.equal(r.ok, false);
        assert.match(r.error ?? "", /not valid JSON|manifest validation/);
        // Nothing committed.
        assert.equal(existsSync(installedDir(root, pack.id)), false);
        assert.equal(existsSync(installedDir(root, pack.id) + ".tmp"), false);
      });
    });

    it("rejects install when manifest is shape-invalid", () => {
      withTempRoot((root) => {
        const pack = makePack({ id: "shape-bad-pack" });
        const dir = availableDir(root, pack.id);
        mkdirSync(join(dir, "content"), { recursive: true });
        writeFileSync(join(dir, "content/x.md"), "x", "utf-8");
        // Manifest missing required fields.
        writeFileSync(
          join(dir, "manifest.json"),
          JSON.stringify({ id: "shape-bad-pack", name: "x" }),
          "utf-8",
        );
        const reg = readRegistry(root);
        reg.available.push(pack);
        writeRegistry(root, reg);

        const r = installPack(root, pack.id);
        assert.equal(r.ok, false);
        assert.match(r.error ?? "", /manifest validation failed/);
        assert.equal(existsSync(installedDir(root, pack.id)), false);
      });
    });

    it("rejects install when manifest.id mismatches registry id", () => {
      withTempRoot((root) => {
        const dir = availableDir(root, "mismatched-pack");
        mkdirSync(join(dir, "content"), { recursive: true });
        writeFileSync(join(dir, "content/x.md"), "x", "utf-8");
        writeFileSync(
          join(dir, "manifest.json"),
          JSON.stringify(makePack({ id: "actually-different-id" })),
          "utf-8",
        );
        const reg = readRegistry(root);
        reg.available.push(makePack({ id: "mismatched-pack" }));
        writeRegistry(root, reg);

        const r = installPack(root, "mismatched-pack");
        assert.equal(r.ok, false);
        assert.match(r.error ?? "", /does not match registry id/);
      });
    });
  });

  describe("install — atomicity", () => {
    it("does not leave installed/<id>/ visible when target already exists", () => {
      withTempRoot((root) => {
        const pack = seedAvailablePack(root, makePack({ id: "collide-pack" }));
        // Pre-create the target.
        mkdirSync(installedDir(root, pack.id), { recursive: true });
        writeFileSync(
          join(installedDir(root, pack.id), "stale.txt"),
          "stale",
          "utf-8",
        );
        const r = installPack(root, pack.id);
        assert.equal(r.ok, false);
        assert.match(r.error ?? "", /already installed/);
        // The pre-existing target was NOT touched.
        assert.ok(existsSync(join(installedDir(root, pack.id), "stale.txt")));
        // No staging directory left behind.
        assert.equal(existsSync(installedDir(root, pack.id) + ".tmp"), false);
      });
    });

    it("cleans up the staging directory if a prior install crashed mid-copy", () => {
      withTempRoot((root) => {
        const pack = seedAvailablePack(root, makePack({ id: "staged-pack" }));
        // Simulate a leftover .tmp from a prior crashed install.
        const staging = installedDir(root, pack.id) + ".tmp";
        mkdirSync(staging, { recursive: true });
        writeFileSync(join(staging, "leftover.txt"), "x", "utf-8");
        // Install should sweep the staging dir and proceed.
        const r = installPack(root, pack.id);
        assert.equal(r.ok, true, r.error);
        assert.equal(
          existsSync(staging),
          false,
          "staging dir must be gone after successful install",
        );
        assert.ok(existsSync(installedDir(root, pack.id)));
      });
    });
  });

  describe("uninstall", () => {
    it("removes installed/<id>/ and flips registry back to available", () => {
      withTempRoot((root) => {
        const pack = seedAvailablePack(root, makePack({ id: "un-pack" }));
        const installRes = installPack(root, pack.id);
        assert.equal(installRes.ok, true, installRes.error);
        assert.ok(existsSync(installedDir(root, pack.id)));

        const r = uninstallPack(root, pack.id);
        assert.equal(r.ok, true, r.error);
        assert.equal(existsSync(installedDir(root, pack.id)), false);
        const reg = readRegistry(root);
        assert.equal(reg.installed.length, 0);
        assert.equal(reg.available.length, 1);
        assert.equal(reg.available[0].id, "un-pack");
      });
    });

    it("returns ok:false when the pack is not installed", () => {
      withTempRoot((root) => {
        const r = uninstallPack(root, "no-such-pack");
        assert.equal(r.ok, false);
        assert.match(r.error ?? "", /not installed/);
      });
    });

    it("records a pack.uninstall AgentEvent when a ledger is provided", () => {
      withTempRoot((root) => {
        const ledger = new AgentOpsLedger(root);
        try {
          const pack = seedAvailablePack(root, makePack({ id: "un-ledgered-pack" }));
          installPack(root, pack.id);
          uninstallPack(root, pack.id, { ledger, caller: "test-runner" });
          const today = new Date().toISOString().slice(0, 10);
          const events = readAgentEventsForDay(root, today);
          assert.ok(
            events.some((e) => e.eventType === "pack.uninstall"),
            "expected a pack.uninstall AgentEvent",
          );
        } finally {
          ledger.close();
        }
      });
    });
  });

  describe("list", () => {
    it("returns both buckets from registry.json", () => {
      withTempRoot((root) => {
        seedAvailablePack(root, makePack({ id: "a-pack" }));
        seedAvailablePack(root, makePack({ id: "b-pack" }));
        const r = installPack(root, "a-pack");
        assert.equal(r.ok, true);

        const out = listPacks(root);
        assert.equal(out.installed.length, 1);
        assert.equal(out.installed[0].id, "a-pack");
        assert.equal(out.available.length, 1);
        assert.equal(out.available[0].id, "b-pack");
      });
    });

    it("refreshes manifestSha lazily when the on-disk content has drifted", () => {
      withTempRoot((root) => {
        const pack = seedAvailablePack(root, makePack({ id: "drift-pack" }));
        const r = installPack(root, pack.id);
        assert.equal(r.ok, true);
        const installedSha = r.pack!.manifestSha;
        // Mutate a content file post-install.
        writeFileSync(
          join(installedDir(root, pack.id), "content", "hello.md"),
          "MUTATED",
          "utf-8",
        );
        const list = listPacks(root);
        assert.notEqual(list.installed[0].manifestSha, installedSha);
      });
    });
  });

  describe("signature verification (stubbed)", () => {
    it("never returns verified:true from the stub", () => {
      const pack = makePack({ signatureRef: "sig:demo:abcdef" });
      const r = verifySignature(pack);
      assert.equal(r.verified, false);
      assert.match(r.reason, /no-signing-key|no-signature-ref/);
    });

    it("flags no-signature-ref when the pack has no signature", () => {
      const r = verifySignature(makePack());
      assert.equal(r.verified, false);
      assert.equal(r.reason, "no-signature-ref");
    });
  });

  describe("real registry on disk (Track E pre-seed)", () => {
    it("packs/registry.json exists and parses cleanly", () => {
      const r = readRegistry(process.cwd());
      assert.equal(r.schema_version, "1.0");
      assert.ok(r.installed.length + r.available.length >= 3, "expected ≥3 seeded packs");
    });

    it("the 3 sample packs are present", () => {
      const r = readRegistry(process.cwd());
      const all = [...r.installed, ...r.available].map((p) => p.id);
      for (const expected of [
        "council-template-pack",
        "dashboard-cockpit-pack",
        "claw-attestation-pack",
      ]) {
        assert.ok(all.includes(expected), `missing seeded pack: ${expected}`);
      }
    });

    it("council-template-pack is installed by default", () => {
      const r = readRegistry(process.cwd());
      assert.ok(
        r.installed.some((p) => p.id === "council-template-pack"),
        "council-template-pack should be in the installed bucket",
      );
    });

    it("PackRuntimeError is exported (so callers can `instanceof` it)", () => {
      assert.ok(PackRuntimeError);
      assert.equal(typeof PackRuntimeError, "function");
    });

    it("registryPath returns the canonical location", () => {
      const p = registryPath("/tmp/x");
      assert.ok(p.endsWith("registry.json"));
      assert.ok(p.includes("packs"));
    });
  });
});
