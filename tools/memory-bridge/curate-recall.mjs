#!/usr/bin/env node
/**
 * curate-recall — query memory-bus and write an Obsidian-formatted note.
 *
 * Spawns the memory-bus MCP (python stdio server) as a child process, performs
 * the standard MCP handshake (initialize → notifications/initialized), then
 * calls memory_recall with the user-supplied query. The matched atoms are
 * rendered as a single markdown note with frontmatter, [[atom-id]] backlinks,
 * and a per-atom blockquote so the file reads cleanly in Obsidian.
 *
 * Usage:
 *   node tools/memory-bridge/curate-recall.mjs "voice operator v2" --slug=voice-v2-recall --k=12
 *
 * Output: memory/curated/<slug>.md  (vault root = memory/)
 *
 * The bridge intentionally talks JSON-RPC by spawning the MCP rather than
 * importing memory-bus internals — this keeps the bridge agnostic to the
 * memory-bus substrate (chroma today, postgres+vector tomorrow).
 */

import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..", "..");
const MCP_PATH = resolve(REPO, "private", "memory-bus", "server.py");
const OUT_DIR = resolve(REPO, "memory", "curated");

function parseArgs(argv) {
  const args = { query: null, slug: null, k: 8, namespace: null };
  for (const raw of argv) {
    if (raw.startsWith("--slug=")) args.slug = raw.slice(7);
    else if (raw.startsWith("--k=")) args.k = Number(raw.slice(4));
    else if (raw.startsWith("--namespace=")) args.namespace = raw.slice(12);
    else if (!args.query) args.query = raw;
  }
  if (!args.query) throw new Error('usage: curate-recall "<query>" [--slug=NAME] [--k=N] [--namespace=NS]');
  if (!args.slug) args.slug = args.query.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  return args;
}

function slugifyAtom(id) {
  return String(id).replace(/[^a-z0-9-]/gi, "").slice(0, 32);
}

async function callMemoryBus({ query, k, namespace }) {
  return new Promise((resolveP, rejectP) => {
    const py = spawn("python", [MCP_PATH], { stdio: ["pipe", "pipe", "pipe"] });
    let buf = "";
    let stderr = "";
    let step = "init";
    const responses = [];

    function send(obj) {
      py.stdin.write(JSON.stringify(obj) + "\n");
    }

    py.stdout.on("data", (chunk) => {
      buf += chunk.toString("utf8");
      // memory-bus emits newline-delimited JSON-RPC
      let nl;
      while ((nl = buf.indexOf("\n")) !== -1) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        let msg;
        try {
          msg = JSON.parse(line);
        } catch {
          continue;
        }
        responses.push(msg);
        if (step === "init" && msg.id === 1) {
          // initialized — send the notification then call the tool
          send({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });
          step = "recall";
          send({
            jsonrpc: "2.0",
            id: 2,
            method: "tools/call",
            params: {
              name: "memory_recall",
              arguments: { query, k, ...(namespace ? { namespace } : {}) },
            },
          });
        } else if (step === "recall" && msg.id === 2) {
          py.kill();
          if (msg.error) return rejectP(new Error(`memory-bus error: ${JSON.stringify(msg.error)}`));
          resolveP(msg.result);
        }
      }
    });

    py.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });

    py.on("error", (err) => rejectP(err));
    py.on("exit", (code) => {
      if (responses.length === 0) {
        rejectP(new Error(`memory-bus exited code=${code} stderr=${stderr.slice(0, 500)}`));
      }
    });

    // kick off handshake
    send({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "curate-recall", version: "0.1.0" },
      },
    });
  });
}

function extractAtoms(result) {
  // MCP tool result shape: { content: [{type: "text", text: "..."}], isError?: bool }
  // memory-bus returns the JSON-encoded atom array inside content[0].text.
  if (!result?.content) return [];
  const text = result.content.find((c) => c.type === "text")?.text;
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function renderNote({ query, slug, atoms, namespace }) {
  const now = new Date().toISOString();
  const lines = [];
  lines.push("---");
  lines.push(`title: ${slug}`);
  lines.push(`source: mempalace-curate-recall`);
  lines.push(`query: ${JSON.stringify(query)}`);
  if (namespace) lines.push(`namespace: ${namespace}`);
  lines.push(`recalled_at: ${now}`);
  lines.push(`atom_count: ${atoms.length}`);
  lines.push("tags: [curated, mempalace, recall]");
  lines.push("---");
  lines.push("");
  lines.push(`# ${slug}`);
  lines.push("");
  lines.push(`> Recalled from MemPalace on ${now} for query \`${query}\`. ${atoms.length} atoms.`);
  lines.push("");
  lines.push(`*Built on SIP — curate-recall v0.1*`);
  lines.push("");

  if (atoms.length === 0) {
    lines.push("_No atoms matched. Either the query is too narrow or this concept lives only in Obsidian._");
    return lines.join("\n");
  }

  for (const a of atoms) {
    const atomId = slugifyAtom(a.id || "atom");
    const score = typeof a.score === "number" ? a.score.toFixed(3) : "?";
    const ns = a.namespace || namespace || "default";
    lines.push(`## [[${atomId}]]`);
    lines.push(`*namespace: \`${ns}\` · score: \`${score}\`*`);
    lines.push("");
    const body = (a.text || "").trim();
    for (const para of body.split(/\n\n+/)) {
      lines.push("> " + para.split("\n").join("\n> "));
      lines.push("");
    }
    lines.push("");
  }

  return lines.join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  process.stderr.write(`[curate-recall] query=${JSON.stringify(args.query)} k=${args.k}\n`);

  const result = await callMemoryBus({
    query: args.query,
    k: args.k,
    namespace: args.namespace,
  });
  const atoms = extractAtoms(result);
  const note = renderNote({ ...args, atoms });

  await mkdir(OUT_DIR, { recursive: true });
  const outPath = resolve(OUT_DIR, `${args.slug}.md`);
  await writeFile(outPath, note, "utf8");

  process.stdout.write(`${outPath}\n`);
  process.stderr.write(`[curate-recall] wrote ${atoms.length} atoms\n`);
}

main().catch((err) => {
  process.stderr.write(`[curate-recall] failed: ${err.message}\n`);
  process.exit(1);
});
