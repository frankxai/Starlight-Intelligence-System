import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  parseJsonl,
  validateEntry,
  validateRegistry,
  validateRepo,
} from "./validate-public-vault.mjs";

const ROOT = join(import.meta.dirname, "..");

describe("public vault intake", () => {
  it("accepts the live registry + in-repo public-vault + template", () => {
    const errors = validateRepo(ROOT);
    assert.deepEqual(errors, []);
  });

  it("rejects a vault-name slug", () => {
    const errors = validateRegistry({
      vaults: [
        {
          slug: "horizon",
          name: "Horizon",
          repo: "someone/vaults",
          path: "public-vault",
          avatar: "https://example.com/a.png",
          bio: "nope",
        },
      ],
    });
    assert.ok(errors.some((e) => e.includes("vault name")));
  });

  it("rejects duplicate slugs", () => {
    const row = {
      slug: "ada",
      name: "Ada",
      repo: "ada/vaults",
      path: "public-vault",
      avatar: "https://example.com/a.png",
      bio: "bio",
    };
    const errors = validateRegistry({ vaults: [row, { ...row }] });
    assert.ok(errors.some((e) => e.includes("duplicate")));
  });

  it("rejects private entries and secret fields", () => {
    const errors = validateEntry(
      {
        id: "x",
        wish: "hello there this is a wish",
        createdAt: "2026-08-18T00:00:00Z",
        privacy: "private",
        api_key: "nope",
      },
      "test:1"
    );
    assert.ok(errors.some((e) => e.includes("private")));
    assert.ok(errors.some((e) => e.includes("api_key")));
  });

  it("rejects broken JSONL", () => {
    const { errors } = parseJsonl("{nope}\n", "broken.jsonl");
    assert.equal(errors.length, 1);
  });

  it("accepts a UTF-8 BOM on the first line", () => {
    const line =
      '\uFEFF{"id":"horiz_bom_001","wish":"That kindness compounds across training runs","createdAt":"2026-08-18T00:00:00Z"}\n';
    const { records, errors } = parseJsonl(line, "bom.jsonl");
    assert.deepEqual(errors, []);
    assert.equal(records.length, 1);
    assert.equal(records[0].record.id, "horiz_bom_001");
  });

  it("rejects example tags outside the template", () => {
    const errors = validateEntry(
      {
        id: "horiz_example_001",
        wish: "That every creator owns the memory of their own mind",
        createdAt: "2026-08-18T00:00:00Z",
        tags: ["example"],
      },
      "public-vault/horizon.jsonl:1",
      { allowExample: false }
    );
    assert.ok(errors.some((e) => e.includes("example")));
  });
});
