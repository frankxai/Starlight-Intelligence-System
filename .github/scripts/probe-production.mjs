// Production design canary. Drives headless Chrome over CDP (no dependencies) against a
// deployed origin and fails when a route scrolls sideways or shows forced-uppercase text.
// Usage: node scripts/probe-production.mjs [--base https://starlightintelligence.org] [--out dir]
// Env: CHROME (binary, default google-chrome), NO_SANDBOX=1 on CI.
import { spawn } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const BASE = arg("base", "https://starlightintelligence.org").replace(/\/$/, "");
const OUT = arg("out", "probe-results");
const CHROME = process.env.CHROME || "google-chrome";
const PORT = 9400 + Math.floor(Math.random() * 400);

// key routes get every viewport and a reduced-motion pass; the rest get the narrow and wide ends
const KEY = ["/", "/quickstart", "/architecture", "/queen", "/protocol"];
const OTHER = [
  "/yolo", "/verify", "/badge", "/verticals", "/docs", "/deploy", "/cockpit", "/queen/echo", "/cosmos",
  "/asteroids", "/palace", "/connect", "/constitution", "/download", "/knowledge-tree", "/research",
  "/featured", "/explainer", "/changelog", "/benediction",
];
const WIDTHS_ALL = [320, 390, 768, 1440];
const WIDTHS_ENDS = [320, 1440];
const SETTLE_MS = 2500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const profile = mkdtempSync(join(tmpdir(), "probe-chrome-"));
const flags = ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--no-first-run", "--disable-gpu", "--mute-audio", "about:blank"];
if (process.env.NO_SANDBOX) flags.unshift("--no-sandbox");
const chrome = spawn(CHROME, flags, { stdio: "ignore" });

const MEASURE = `(() => {
  const de = document.documentElement;
  const upper = [...document.querySelectorAll('body *')].filter(e =>
    [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) &&
    getComputedStyle(e).textTransform === 'uppercase').length;
  const sw = Math.max(de.scrollWidth, document.body.scrollWidth);
  return { overflowPx: sw - de.clientWidth, upper, title: document.title.slice(0, 80) };
})()`;

async function ready() {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`http://127.0.0.1:${PORT}/json/version`)).ok) return; } catch {}
    await sleep(500);
  }
  throw new Error("chrome did not start");
}

async function visit(path, width, reduced) {
  const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0, onLoad;
  const pending = new Map();
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
    else if (d.method === "Page.loadEventFired" && onLoad) onLoad();
  };
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  try {
    await send("Page.enable");
    await send("Emulation.setDeviceMetricsOverride", { width, height: width < 800 ? 844 : 900, deviceScaleFactor: 1, mobile: width <= 768 });
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: reduced ? "reduce" : "no-preference" }] });
    const loaded = new Promise((r) => (onLoad = r));
    await send("Page.navigate", { url: `${BASE}${path}?canary=${Date.now()}` });
    await Promise.race([loaded, sleep(30000)]);
    await sleep(SETTLE_MS);
    const value = (await send("Runtime.evaluate", { expression: MEASURE, returnByValue: true })).result?.result?.value;
    if (!value) return { error: "no measurement" };
    if (width === 390 && !reduced && path === "/") {
      const shot = await send("Page.captureScreenshot", { format: "png" });
      writeFileSync(join(OUT, "home-390.png"), Buffer.from(shot.result.data, "base64"));
    }
    return value;
  } finally {
    ws.close();
    await fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`).catch(() => {});
  }
}

mkdirSync(OUT, { recursive: true });
const rows = [];
try {
  await ready();
  for (const path of [...KEY, ...OTHER]) {
    const key = KEY.includes(path);
    for (const width of key ? WIDTHS_ALL : WIDTHS_ENDS) {
      for (const reduced of key ? [false, true] : [false]) {
        rows.push({ path, width, reducedMotion: reduced, ...(await visit(path, width, reduced)) });
      }
    }
  }
} finally {
  chrome.kill();
  await sleep(1000);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}

const violations = rows.filter((r) => r.error || r.overflowPx > 1 || r.upper > 0);
writeFileSync(join(OUT, "results.json"), JSON.stringify({ base: BASE, at: new Date().toISOString(), rows, violations }, null, 1));
const lines = violations.map((v) => `${v.path} @${v.width}${v.reducedMotion ? " (reduced motion)" : ""}: ${v.error ?? `overflow ${v.overflowPx}px, uppercase elements ${v.upper}`}`);
writeFileSync(join(OUT, "violations.txt"), lines.join("\n"));
console.log(`${rows.length} checks against ${BASE}: ${violations.length} violation(s)`);
for (const l of lines) console.log(`  ${l}`);
process.exit(violations.length ? 1 : 0);
