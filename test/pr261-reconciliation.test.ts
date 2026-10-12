/**
 * PR261 Reconciliation & Execution Routing Test
 *
 * Verifies Issue #323 reconciliation:
 * - Upstream registry contains music-intelligence-os and agentic-music-producer-os entries.
 * - verticals/music-is/README.md and STACK.md retain label policies, Notion bindings, and canon
 *   while pointing execution to existing operated core runtimes without runtime duplication.
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { repoRootFromTestFile } from "./_lib/repo.js";

const REPO_ROOT = repoRootFromTestFile(import.meta.url);

describe("PR261 Label Reconciliation & Upstream Routing", () => {
  it("context/empire/upstreams.json contains music-intelligence-os and agentic-music-producer-os", async () => {
    const upstreamsPath = join(REPO_ROOT, "context", "empire", "upstreams.json");
    const raw = await readFile(upstreamsPath, "utf8");
    const parsed = JSON.parse(raw);

    const ids = new Set(parsed.upstreams.map((u: { id: string }) => u.id));
    assert.ok(
      ids.has("music-intelligence-os"),
      "upstreams.json must contain music-intelligence-os",
    );
    assert.ok(
      ids.has("agentic-music-producer-os"),
      "upstreams.json must contain agentic-music-producer-os",
    );

    const mio = parsed.upstreams.find((u: { id: string }) => u.id === "music-intelligence-os");
    assert.equal(mio.repository, "https://github.com/frankxai/music-intelligence-os");
    assert.equal(mio.class, "runtime_dependency");

    const amp = parsed.upstreams.find((u: { id: string }) => u.id === "agentic-music-producer-os");
    assert.equal(amp.repository, "https://github.com/frankxai/agentic-music-producer-os");
    assert.equal(amp.class, "runtime_dependency");
  });

  it("verticals/music-is/README.md records PR261 reconciliation and execution pointers", async () => {
    const readmePath = join(REPO_ROOT, "verticals", "music-is", "README.md");
    const content = await readFile(readmePath, "utf8");

    assert.match(content, /PR261 Reconciliation/i);
    assert.match(content, /frankxai\/music-intelligence-os/);
    assert.match(content, /frankxai\/agentic-music-producer-os/);
    assert.match(content, /catalog truth|master\.csv/);
  });

  it("verticals/music-is/STACK.md records studio execution core orchestration pointers", async () => {
    const stackPath = join(REPO_ROOT, "verticals", "music-is", "STACK.md");
    const content = await readFile(stackPath, "utf8");

    assert.match(content, /frankxai\/music-intelligence-os/);
    assert.match(content, /frankxai\/agentic-music-producer-os/);
  });
});
