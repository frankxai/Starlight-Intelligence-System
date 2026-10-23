#!/usr/bin/env node
// Starlight Frontier Ledger v2 CLI. Zero dependencies.
//
//   node scripts/frontier/cli.mjs check   [--today YYYY-MM-DD] [--fail-stale]
//   node scripts/frontier/cli.mjs project [--write]
//   node scripts/frontier/cli.mjs ingest  <batch.jsonl> --batch <id> [--today D] [--write]
//   node scripts/frontier/cli.mjs watch   [--today D] [--limit N] [--ids a,b] [--write]
//   node scripts/frontier/cli.mjs report  --since D [--today D] [--out file.md]
//   node scripts/frontier/cli.mjs migrate-v1 [--today D] [--write]
//
// Writes happen only with --write. `watch` reads public GitHub metadata and
// uses GITHUB_TOKEN when present; it never writes to GitHub.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  validateLedger, projectUpstreams, migrateV1, ingest, watchReleases, buildReport, serialize,
} from "./lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LEDGER = resolve(ROOT, process.env.FRONTIER_LEDGER ?? "context/frontier/ledger.json");
const UPSTREAMS = resolve(ROOT, process.env.FRONTIER_UPSTREAMS ?? "context/empire/upstreams.json");

const args = process.argv.slice(2);
const cmd = args[0];
const flag = (name) => args.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};
const today = opt("today", new Date().toISOString().slice(0, 10));
if (!/^\d{4}-\d{2}-\d{2}$/.test(today) || Number.isNaN(Date.parse(`${today}T00:00:00Z`))) {
  console.error(`--today must be an ISO date (YYYY-MM-DD), got ${JSON.stringify(today)}`);
  process.exit(2);
}

const readJson = async (p) => JSON.parse(await readFile(p, "utf8"));
const writeJson = async (p, v) => {
  await mkdir(dirname(p), { recursive: true });
  await writeFile(p, serialize(v));
};
const readJsonl = async (p) =>
  (await readFile(p, "utf8"))
    .split("\n")
    .map((l, i) => ({ l: l.trim(), n: i + 1 }))
    .filter(({ l }) => l && !l.startsWith("//"))
    .map(({ l, n }) => {
      try {
        return JSON.parse(l);
      } catch {
        throw new Error(`${p}:${n} is not valid JSON`);
      }
    });

function summarize(changes) {
  const counts = {};
  for (const c of changes) counts[c.type] = (counts[c.type] ?? 0) + 1;
  return Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(" ") || "no changes";
}

async function githubObserver() {
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "starlight-frontier-ledger" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return async (owner, repo) => {
    const get = async (path) => {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}${path}`, { headers });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`GitHub ${res.status} for ${owner}/${repo}${path}`);
      return res.json();
    };
    const meta = await get("");
    if (!meta) return null;
    const rel = await get("/releases/latest");
    let tag = rel?.tag_name ?? null;
    const published = rel?.published_at?.slice(0, 10) ?? null;
    let htmlUrl = rel?.html_url ?? null;
    let tagSource = tag ? "release" : null;
    if (!tag) {
      // GitHub does not guarantee tag order; the lib records this fallback as secondary/low confidence.
      const tags = await get("/tags?per_page=1");
      tag = tags?.[0]?.name ?? null;
      tagSource = tag ? "tags" : null;
      htmlUrl = tag ? `https://github.com/${owner}/${repo}/releases/tag/${encodeURIComponent(tag)}` : null;
    }
    return { tag, tag_source: tagSource, published_at: published, html_url: htmlUrl, archived: Boolean(meta.archived), license: meta.license?.spdx_id ?? null };
  };
}

async function main() {
  switch (cmd) {
    case "check": {
      const ledger = await readJson(LEDGER);
      const { errors, warnings, stale } = validateLedger(ledger, { today });
      let drift = false;
      if (ledger.registers?.upstreams) {
        // Byte-level comparison: the register must be exactly the generated serialisation.
        drift = serialize(projectUpstreams(ledger)) !== (await readFile(UPSTREAMS, "utf8"));
        if (drift) errors.push("context/empire/upstreams.json differs from the ledger projection; run `node scripts/frontier/cli.mjs project --write`");
      }
      for (const w of warnings) console.warn(`warn: ${w}`);
      for (const s of stale) console.warn(`stale: ${s.id} last verified ${s.last_verified} (${s.age_days}d > ${s.limit_days}d)`);
      if (flag("fail-stale") && stale.length) errors.push(`${stale.length} stale records`);
      if (errors.length) {
        console.error("Frontier ledger check failed:");
        for (const e of errors) console.error(`- ${e}`);
        process.exit(1);
      }
      console.log(`Frontier ledger valid: ${ledger.records.length} records, ${ledger.sources.length} sources, ${ledger.contradictions.filter((k) => k.status === "open").length} open contradictions, ${stale.length} stale, upstream projection ${drift ? "DRIFT" : "in sync"}.`);
      break;
    }
    case "project": {
      const projected = projectUpstreams(await readJson(LEDGER));
      if (flag("write")) await writeJson(UPSTREAMS, projected);
      else process.stdout.write(`${JSON.stringify(projected, null, 2)}\n`);
      break;
    }
    case "ingest": {
      const file = args[1];
      const batchId = opt("batch");
      if (!file || !batchId) throw new Error("usage: ingest <batch.jsonl> --batch <id>");
      const before = await readJson(LEDGER);
      let result;
      try {
        result = ingest(before, await readJsonl(resolve(file)), { batchId, today });
      } catch (e) {
        console.error(`Ingest refused; nothing written: ${e.message}`);
        process.exit(1);
      }
      const { ledger, changes, rejected } = result;
      const { errors } = validateLedger(ledger, { today });
      for (const r of rejected) console.warn(`rejected: ${r.reason}: ${JSON.stringify(r.item).slice(0, 160)}`);
      console.log(`ingest ${batchId}: ${summarize(changes)}; rejected=${rejected.length}`);
      if (errors.length) {
        console.error("Ingest would produce an invalid ledger; nothing written:");
        for (const e of errors) console.error(`- ${e}`);
        process.exit(1);
      }
      if (flag("write")) await writeJson(LEDGER, ledger);
      break;
    }
    case "watch": {
      const before = await readJson(LEDGER);
      const ids = opt("ids") ? opt("ids").split(",") : undefined;
      const limit = opt("limit") === undefined ? Infinity : Number(opt("limit"));
      if (!(limit > 0)) throw new Error("--limit must be a positive number");
      const { candidates, errors: obsErrors, checked, aborted } = await watchReleases(before, await githubObserver(), { today, limit, ids });
      const runId = `watch-${new Date().toISOString().replace(/[-:]/g, "").slice(0, 13).toLowerCase()}`;
      const { ledger, changes, rejected } = ingest(before, candidates, { batchId: runId, today, by: `agent:${runId}` });
      for (const e of obsErrors) console.warn(`observe failed: ${e.id}: ${e.error}`);
      for (const r of rejected) console.warn(`rejected: ${r.reason}`);
      console.log(`watch checked=${checked} failed=${obsErrors.length}${aborted ? " ABORTED (rate limited)" : ""}: ${summarize(changes)}`);
      if (checked > 0 && obsErrors.length === checked) {
        console.error("Every observation failed; nothing written.");
        process.exit(1);
      }
      const { errors } = validateLedger(ledger, { today });
      if (errors.length) {
        for (const e of errors) console.error(`- ${e}`);
        process.exit(1);
      }
      if (flag("write")) await writeJson(LEDGER, ledger);
      break;
    }
    case "report": {
      const since = opt("since");
      if (!since) throw new Error("usage: report --since YYYY-MM-DD");
      const md = buildReport(await readJson(LEDGER), { today, since });
      const out = opt("out");
      if (out) {
        await mkdir(dirname(resolve(out)), { recursive: true });
        await writeFile(resolve(out), `${md}\n`);
      } else process.stdout.write(`${md}\n`);
      break;
    }
    case "migrate-v1": {
      const ledger = migrateV1(await readJson(UPSTREAMS), {
        today,
        researchDoc: "https://github.com/frankxai/Starlight-Intelligence-System/blob/main/docs/research/2026-08-12-agent-harness-memory-frontier.md",
      });
      if (flag("write")) await writeJson(LEDGER, ledger);
      else process.stdout.write(`${JSON.stringify(ledger, null, 2)}\n`);
      break;
    }
    default:
      console.error("usage: cli.mjs <check|project|ingest|watch|report|migrate-v1> [options]");
      process.exit(2);
  }
}

main().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});
