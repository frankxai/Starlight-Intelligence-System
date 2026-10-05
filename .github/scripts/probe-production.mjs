// Production design canary. Drives headless Chrome over CDP (no dependencies) against a deployed
// origin. It fails the run on the checks named in --fail-on and only reports the rest.
//
// Usage: node probe-production.mjs [--base https://starlightintelligence.org] [--out dir]
//                                  [--fail-on overflow,uppercase] [--max-sitemap 40]
// Env:   CHROME (binary, default google-chrome), NO_SANDBOX=1 on CI.
//
// Checks per page and viewport:
//   overflow    document scrolls sideways by more than 1px (all widths)
//   uppercase   elements the CSS forces to uppercase via text-transform (all widths)
//   sourcecaps  elements whose own text is typed in capitals (2+ words, 8+ letters)
//   touch       interactive targets under 24x24 CSS px, excluding links inside running text (390 px)
//   contrast    text under WCAG AA against a plain-colour background (1440 px; gradients/images skipped)
//   focus       first 12 Tab stops with no visible focus indicator (1440 px)
import { spawn } from "node:child_process";
import { appendFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const BASE = arg("base", "https://starlightintelligence.org").replace(/\/$/, "");
const OUT = arg("out", "probe-results");
const BASE_ORIGIN = new URL(BASE).origin;
const FAIL_ON = new Set(arg("fail-on", "overflow,uppercase").split(",").map((s) => s.trim()).filter(Boolean));
const MAX_SITEMAP = Number(arg("max-sitemap", "40"));
const CHROME = process.env.CHROME || "google-chrome";
const PORT = 9400 + Math.floor(Math.random() * 400);

const KEY = ["/", "/quickstart", "/architecture", "/queen", "/protocol"];
const WIDTHS_ALL = [320, 390, 768, 1440];
const WIDTHS_ENDS = [320, 1440];
const SETTLE_MS = 2500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let sitemapStats = { locs: 0, accepted: 0 };
// Sitemap paths, thinned so a family of dynamic pages (cards, articles) contributes two samples.
async function sitemapRoutes() {
  try {
    const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    // Only same-origin http(s) locs are followed; anything else (other hosts, mailto:, data:) is dropped.
    const paths = locs
      .map((loc) => {
        try {
          const u = new URL(loc);
          if (!/^https?:$/.test(u.protocol) || u.origin !== BASE_ORIGIN) return null;
          return u.pathname.replace(/\/$/, "") || "/";
        } catch { return null; }
      })
      .filter((p) => p && p.startsWith("/"));
    sitemapStats = { locs: locs.length, accepted: paths.length };
    const seen = new Map();
    const picked = [];
    for (const p of [...new Set(paths)]) {
      const parts = p.split("/").filter(Boolean);
      const family = parts.length > 1 ? parts.slice(0, -1).join("/") : null;
      if (family) {
        const n = seen.get(family) ?? 0;
        seen.set(family, n + 1);
        if (n >= 2) continue;
      }
      picked.push(p);
    }
    return picked.slice(0, MAX_SITEMAP);
  } catch {
    return [];
  }
}

const profile = mkdtempSync(join(tmpdir(), "probe-chrome-"));
const flags = ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--no-first-run", "--disable-gpu", "--mute-audio", "about:blank"];
if (process.env.NO_SANDBOX) flags.unshift("--no-sandbox");
const chrome = spawn(CHROME, flags, { stdio: "ignore" });

const BASIC = `(() => {
  const de = document.documentElement;
  const upper = [], caps = [];
  for (const e of document.querySelectorAll('body *')) {
    const own = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').replace(/\\s+/g, ' ').trim();
    if (!own) continue;
    if (getComputedStyle(e).textTransform === 'uppercase') { upper.push(own.slice(0, 50)); continue; }
    const letters = own.replace(/[^A-Za-z]/g, '');
    if (letters.length >= 8 && own.split(' ').length >= 2 && letters === letters.toUpperCase()) caps.push(own.slice(0, 50));
  }
  const sw = Math.max(de.scrollWidth, document.body.scrollWidth);
  return { overflowPx: sw - de.clientWidth, uppercase: upper.length, uppercaseSamples: upper.slice(0, 4),
    sourcecaps: caps.length, sourcecapsSamples: caps.slice(0, 4), title: document.title.slice(0, 80) };
})()`;

const TOUCH = `(() => {
  const out = [];
  const sel = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [tabindex]:not([tabindex="-1"])';
  for (const e of document.querySelectorAll(sel)) {
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = e.getBoundingClientRect();
    if (r.width <= 2 || r.height <= 2) continue;
    if (e.checkVisibility && !e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
    if (e.matches('a') && cs.display === 'inline' && e.parentElement && /^(P|LI|SPAN|SMALL|DD|BLOCKQUOTE|H[1-6])$/.test(e.parentElement.tagName) && e.parentElement.textContent.trim().length > e.textContent.trim().length + 12) continue;
    if (Math.min(r.width, r.height) < 24) out.push((e.tagName + ' ' + (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 24) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)));
  }
  return { count: out.length, samples: out.slice(0, 5) };
})()`;

const CONTRAST = `(() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const rgba = (c) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const over = (top, bot) => { const a = top[3]; return [top[0] * a + bot[0] * (1 - a), top[1] * a + bot[1] * (1 - a), top[2] * a + bot[2] * (1 - a), 1]; };
  const fails = []; let checked = 0;
  const vh = innerHeight;
  for (const e of document.querySelectorAll('body *')) {
    const own = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').trim();
    if (!own || !/[A-Za-z0-9]/.test(own)) continue;
    const r = e.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || r.bottom < 0 || r.top > vh * 3) continue;
    if (e.checkVisibility && !e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
    const cs = getComputedStyle(e);
    if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 1) continue;
    let bg = null, unknown = false, a = e;
    const layers = [];
    while (a && a.nodeType === 1) {
      const s = getComputedStyle(a);
      if (s.backgroundImage !== 'none') { unknown = true; break; }
      const c = rgba(s.backgroundColor);
      if (c[3] > 0) { layers.push(c); if (c[3] >= 0.99) break; }
      a = a.parentElement;
    }
    if (unknown) continue;
    bg = layers.length && layers[layers.length - 1][3] >= 0.99 ? layers[layers.length - 1] : [255, 255, 255, 1];
    for (let i = layers.length - 2; i >= 0; i--) bg = over(layers[i], bg);
    const fgRaw = rgba(cs.color);
    const fg = over(fgRaw, bg);
    const L1 = lum(fg), L2 = lum(bg);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight, 10) >= 700;
    const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
    checked++;
    if (ratio < need) fails.push(e.tagName + ' "' + own.slice(0, 28) + '" ' + ratio.toFixed(2) + ' < ' + need);
  }
  return { checked, count: fails.length, samples: fails.slice(0, 5) };
})()`;

const FOCUS = `(() => { const e = document.activeElement; if (!e || e === document.body) return null; const s = getComputedStyle(e); const r = e.getBoundingClientRect();
  const outline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
  const shadow = s.boxShadow !== 'none' && !/^(rgba\\(0, 0, 0, 0\\) 0px 0px 0px 0px,? ?)+$/.test(s.boxShadow);
  const shown = e.checkVisibility ? e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) : true;
  return { tag: e.tagName, text: (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 24), visible: r.width > 0 && r.height > 0, shown, indicator: outline || shadow }; })()`;

async function ready() {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`http://127.0.0.1:${PORT}/json/version`)).ok) return; } catch {}
    await sleep(500);
  }
  throw new Error("chrome did not start");
}

async function visit(path, width, reduced, deep) {
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
  const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true })).result?.result?.value;
  try {
    await send("Page.enable");
    await send("Emulation.setDeviceMetricsOverride", { width, height: width < 800 ? 844 : 900, deviceScaleFactor: 1, mobile: width <= 768 });
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: reduced ? "reduce" : "no-preference" }] });
    const loaded = new Promise((r) => (onLoad = r));
    const target = new URL(`${path}${path.includes("?") ? "&" : "?"}canary=${Date.now()}`, `${BASE}/`);
    if (target.origin !== BASE_ORIGIN) throw new Error(`refusing to leave ${BASE_ORIGIN}: ${target.href}`);
    await send("Page.navigate", { url: target.href });
    await Promise.race([loaded, sleep(30000)]);
    await sleep(SETTLE_MS);
    const row = await evaluate(BASIC);
    if (!row) return { error: "no measurement" };
    if (deep && width <= 768) row.touch = await evaluate(TOUCH);
    if (deep && width >= 1440) {
      row.contrast = await evaluate(CONTRAST);
      const bad = [];
      for (let k = 0; k < 12; k++) {
        await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
        await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
        const f = await evaluate(FOCUS);
        if (f && f.visible && !f.shown) bad.push(`${f.tag} ${f.text} (focus lands on an invisible element)`);
        else if (f && f.visible && !f.indicator) bad.push(`${f.tag} ${f.text} (no visible focus indicator)`);
      }
      row.focus = { count: bad.length, samples: bad.slice(0, 5) };
    }
    if (width === 390 && !reduced && path === "/") {
      const shot = await send("Page.captureScreenshot", { format: "png" });
      writeFileSync(join(OUT, "home-390.png"), Buffer.from(shot.result.data, "base64"));
    }
    return row;
  } finally {
    ws.close();
    await fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`).catch(() => {});
  }
}

mkdirSync(OUT, { recursive: true });
const rows = [];
try {
  await ready();
  const fromMap = (await sitemapRoutes()).filter((p) => !KEY.includes(p));
  const routes = [...KEY, ...fromMap];
  for (const path of routes) {
    const key = KEY.includes(path);
    for (const width of key ? WIDTHS_ALL : WIDTHS_ENDS) {
      for (const reduced of key ? [false, true] : [false]) {
        const deep = !reduced && (width === 390 || width === 1440);
        rows.push({ path, width, reducedMotion: reduced, ...(await visit(path, width, reduced, deep)) });
      }
    }
  }
} finally {
  chrome.kill();
  await sleep(1000);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}

const metric = {
  overflow: (r) => (r.overflowPx > 1 ? `overflow ${r.overflowPx}px` : null),
  uppercase: (r) => (r.uppercase > 0 ? `${r.uppercase} forced-uppercase element(s), e.g. "${r.uppercaseSamples[0]}"` : null),
  sourcecaps: (r) => (r.sourcecaps > 0 ? `${r.sourcecaps} element(s) typed in capitals, e.g. "${r.sourcecapsSamples[0]}"` : null),
  touch: (r) => (r.touch?.count > 0 ? `${r.touch.count} touch target(s) under 24px, e.g. ${r.touch.samples[0]}` : null),
  contrast: (r) => (r.contrast?.count > 0 ? `${r.contrast.count} low-contrast text item(s), e.g. ${r.contrast.samples[0]}` : null),
  focus: (r) => (r.focus?.count > 0 ? `${r.focus.count} bad Tab stop(s), e.g. ${r.focus.samples[0]}` : null),
};
const findings = { failing: [], reported: [] };
for (const r of rows) {
  const where = `${r.path} @${r.width}${r.reducedMotion ? " (reduced motion)" : ""}`;
  if (r.error) { findings.failing.push(`${where}: ${r.error}`); continue; }
  for (const [name, fn] of Object.entries(metric)) {
    const msg = fn(r);
    if (msg) (FAIL_ON.has(name) ? findings.failing : findings.reported).push(`[${name}] ${where}: ${msg}`);
  }
}
const totals = Object.fromEntries(Object.keys(metric).map((m) => [m, [...findings.failing, ...findings.reported].filter((l) => l.startsWith(`[${m}]`)).length]));
writeFileSync(join(OUT, "results.json"), JSON.stringify({ base: BASE, at: new Date().toISOString(), failOn: [...FAIL_ON], totals, rows, findings }, null, 1));
writeFileSync(join(OUT, "violations.txt"), findings.failing.join("\n"));
const summary = [`${rows.length} checks against ${BASE}: ${findings.failing.length} failing, ${findings.reported.length} reported (report-only)`,
  `sitemap: ${sitemapStats.locs} urls, ${sitemapStats.accepted} same-origin`,
  `findings by check: ${Object.entries(totals).map(([k, v]) => `${k}=${v}`).join(" ")}`];
console.log(summary.join("\n"));
for (const l of findings.failing) console.log(`  FAIL ${l}`);
for (const l of findings.reported.slice(0, 30)) console.log(`  note ${l}`);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Design canary: ${BASE}\n\n${summary.join("\n\n")}\n\n` + (findings.failing.length ? "**Failing**\n\n" + findings.failing.map((l) => `- ${l}`).join("\n") + "\n\n" : "") + (findings.reported.length ? "**Reported (not failing)**\n\n" + findings.reported.slice(0, 40).map((l) => `- ${l}`).join("\n") + "\n" : ""));
}
process.exit(findings.failing.length ? 1 : 0);
