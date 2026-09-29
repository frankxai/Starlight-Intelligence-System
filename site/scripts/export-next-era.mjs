import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.resolve(here, "../content/narrative-artifacts");
const outputDir = path.resolve(here, "../public/next-era");
const fontDir = path.resolve(here, "../assets/fonts");
const interFont = readFileSync(path.join(fontDir, "inter-latin-variable.woff2")).toString("base64");
const newsreaderFont = readFileSync(path.join(fontDir, "newsreader-latin-variable.woff2")).toString("base64");
const formats = {
  landscape: { width: 1600, height: 900, label: "16:9" },
  portrait: { width: 1200, height: 1500, label: "4:5" },
  square: { width: 1200, height: 1200, label: "1:1" },
};

const escapeXml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
})[character]);

function wrap(value, maxChars) {
  const words = value.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = (line + " " + word).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

function linesSvg(lines, x, y, lineHeight, className) {
  return lines.map((line, index) => `<text x="${x}" y="${y + index * lineHeight}" class="${className}">${escapeXml(line)}</text>`).join("\n");
}

function motifSvg(item, box, colors, social) {
  const motif = item.motif;
  const { x, y, width, height } = box;
  const right = x + width;
  const middle = y + height / 2;
  const stroke = colors.line;
  const strong = colors.strong;
  const label = colors.muted;
  const line = (x1, y1, x2, y2, weight = 1) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${weight}"/>`;
  const circle = (cx, cy, r, fill = strong) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
  const word = (text, x1, y1, fill = label, className = "motif-label") => `<text x="${x1}" y="${y1}" class="${className}" fill="${fill}">${escapeXml(text)}</text>`;
  if (social && motif === "portfolio") {
    const branches = [["VENTURES", "OWN VALUE"], ["FRANKX", "FOUNDER"], ["ARCANEA", "CULTURE"], ["NOTES", "KNOWLEDGE"]];
    const cellWidth = width / 2;
    const rowHeight = (height - 45) / 2;
    return `${word("STARLIGHT / SHARED INFRASTRUCTURE", x, y + 23, strong)}${line(x, y + 38, right, y + 38, 2)}` + branches.map(([name, role], i) => {
      const px = x + (i % 2) * cellWidth;
      const py = y + 47 + Math.floor(i / 2) * rowHeight;
      return `${line(px + 4, py, px + cellWidth - 18, py)}${word(name, px + 4, py + 43, strong)}${word(role, px + 4, py + 80, label, "motif-secondary")}`;
    }).join("");
  }
  if (social && motif === "loop") {
    const labels = ["CREATE", "CAPTURE", "VERIFY", "TRANSFER", "OPERATE", "LEARN"];
    const cellWidth = width / 3;
    const rowHeight = (height - 54) / 2;
    return labels.map((name, i) => {
      const px = x + (i % 3) * cellWidth;
      const py = y + Math.floor(i / 3) * rowHeight;
      return `${line(px, py + 12, px + cellWidth - 20, py + 12, 2)}${word(name, px, py + 52, strong)}`;
    }).join("") + `${line(right - 8, y + height - 30, x + 12, y + height - 30, 2)}<path d="M ${x + 12} ${y + height - 30} l 16 -9 v 18 z" fill="${strong}"/>${word("NEXT VENTURE / STRONGER START", x + 65, y + height - 1, strong)}`;
  }
  if (social && motif === "instrument") {
    if (!Array.isArray(item.primitives) || item.primitives.length !== 7) throw new Error("Product artifact needs seven sourced primitives");
    const live = item.primitives.filter((part) => part.status === "Live locally").map((part) => part.name.toUpperCase());
    const staged = item.primitives.filter((part) => part.status === "Staged").map((part) => part.name.toUpperCase());
    if (live.length !== 2 || staged.length !== 5) throw new Error("Social proof layout must be revised when primitive statuses change");
    return `${word("LIVE LOCALLY", x, y + height * .14, strong)}${word(live.join("  ·  "), x, y + height * .32, strong, "motif-primary")}${line(x, y + height * .42, right, y + height * .42, 2)}${word("STAGED", x, y + height * .58, strong)}${word(staged.slice(0, 3).join("  ·  "), x, y + height * .79)}${word(staged.slice(3).join("  ·  "), x, y + height * .97)}`;
  }
  if (social && motif === "horizons") {
    const stages = [["NOW", "LOCAL TOOLS"], ["NEXT", "MEASURE REUSE"], ["GENERATIONS", "KNOWLEDGE"]];
    const cell = width / 3;
    return stages.map(([name, detail], i) => {
      const px = x + i * cell;
      return `${line(px, y + 14, px, y + height - 14, 2)}${word(name, px + 12, y + 58, strong)}${word(detail, px + 12, y + height - 26, label, "motif-secondary")}`;
    }).join("");
  }
  if (social && motif === "audience") {
    const paths = [["CREATORS", "AUTHORSHIP"], ["DEVELOPERS", "CODE"], ["OPERATORS", "REUSE"], ["PARTNERS", "EVIDENCE"]];
    const cellWidth = width / 2;
    const rowHeight = height / 2;
    return paths.map(([name, reason], i) => {
      const px = x + (i % 2) * cellWidth;
      const py = y + Math.floor(i / 2) * rowHeight;
      return `${line(px, py + 8, px + cellWidth - 18, py + 8, 2)}${word(name, px, py + 49, strong)}${word(reason, px, py + 85, label, "motif-secondary")}`;
    }).join("");
  }
  if (motif === "signal" || motif === "orientation") {
    const ticks = Array.from({ length: 11 }, (_, i) => {
      const px = x + (width * i) / 10;
      const isMajor = i % 5 === 0;
      return line(px, middle - (isMajor ? 40 : 16), px, middle + (isMajor ? 40 : 16));
    }).join("");
    return `${line(x, middle, right, middle, 2)}${ticks}${circle(x + width * .16, middle, 7)}${circle(x + width * .83, middle, 7)}${word(motif === "signal" ? "SOURCE" : "ORIENTATION", x, middle + 80)}${word(motif === "signal" ? "TRANSFER" : "ARRIVAL", right - (social ? 260 : 130), middle + 80)}`;
  }
  if (motif === "portfolio") {
    const branches = [["VENTURES", "INDEPENDENT VALUE"], ["FRANKX", "FOUNDER / PUBLIC"], ["ARCANEA", "CULTURE / WORLDS"], ["NOTES", "CURATED KNOWLEDGE"]];
    const cell = width / branches.length;
    const railY = y + 32;
    return `${word("STARLIGHT / SHARED INFRASTRUCTURE", x, y + 16, strong)}${line(x, railY, right, railY, 2)}` + branches.map(([name, role], i) => {
      const px = x + i * cell;
      const cx = px + cell / 2;
      return `${line(cx, railY, cx, y + 58)}${line(px + 10, y + 58, px + cell - 10, y + 58)}${word(name, px + 12, y + 84, strong)}${word(role, px + 12, y + 111)}`;
    }).join("");
  }
  if (motif === "loop") {
    const labels = ["CREATE", "CAPTURE", "VERIFY", "TRANSFER", "OPERATE", "LEARN"];
    const cell = width / labels.length;
    const top = y + 24;
    const steps = labels.map((name, i) => {
      const px = x + i * cell;
      return `${line(px, top, px + cell - 20, top, 2)}${circle(px, top, 5)}${word(name, px, y + 59, strong)}${word(String(i + 1).padStart(2, "0"), px, y + 84)}`;
    }).join("");
    const returnY = y + 108;
    return `${steps}${line(right - 10, top, right - 10, returnY, 2)}${line(right - 10, returnY, x + 12, returnY, 2)}<path d="M ${x + 12} ${returnY} l 12 -7 v 14 z" fill="${strong}"/>${word("NEXT VENTURE / STRONGER START", x + width * .35, y + 123, strong)}`;
  }
  if (motif === "instrument") {
    if (!Array.isArray(item.primitives) || item.primitives.length !== 7) throw new Error("Product artifact needs seven sourced primitives");
    const cell = width / item.primitives.length;
    return item.primitives.map((part, i) => {
      const px = x + i * cell;
      const status = part.status === "Live locally" ? "LIVE LOCAL" : part.status.toUpperCase();
      return `${line(px, y + 13, px + cell - 12, y + 13, 2)}${word(part.name.toUpperCase(), px, y + 49, strong)}${word(status, px, y + 82)}${circle(px + 5, y + 108, 4, part.status === "Live locally" ? strong : label)}`;
    }).join("");
  }
  if (motif === "horizons") {
    const labels = ["NOW", "NEXT", "GENERATIONS"];
    return labels.map((name, i) => {
      const px = x + (i * width) / 3;
      return `${line(px, y + 15, px, y + height - 15, 2)}${word(name, px + 18, y + 46)}${word(i === 0 ? "LOCAL PROOF" : i === 1 ? "MEASURED REUSE" : "DURABLE KNOWLEDGE", px + 18, y + height - 28)}`;
    }).join("");
  }
  if (motif === "audience") {
    const paths = [["CREATORS", "KEEP AUTHORSHIP"], ["DEVELOPERS", "INSPECT CODE"], ["OPERATORS", "TEST REUSE"], ["PARTNERS", "CHALLENGE PROOF"]];
    return paths.map(([name, reason], i) => {
      const px = x + (i * width) / 4;
      return `${line(px, y + 15, px + width / 4 - 14, y + 15, 2)}${word(name, px, y + 49, strong)}${word(reason, px, y + 81)}${circle(px + 5, y + height - 25, 5)}`;
    }).join("");
  }
  throw new Error(`Unknown motif: ${motif}`);
}

function render(item, format) {
  const { width, height, label } = format;
  const landscape = width > height * 1.5;
  const social = !landscape;
  const margin = landscape ? 100 : 76;
  const dark = item.mode === "horizon";
  const color = dark
    ? { bg: "#0c171d", fg: "#f2f0e9", muted: "#a6bdb8", line: "#4a6968", strong: "#afd8ce" }
    : { bg: "#f2f0e9", fg: "#17272d", muted: "#3d6863", line: "#9caeaa", strong: "#185c58" };
  const titleSize = landscape ? 96 : 76;
  const titleLines = wrap(item.title, landscape ? 25 : 23);
  const titleY = landscape ? 210 : 238;
  const subtitleY = titleY + titleLines.length * (titleSize * 1.08) + (landscape ? 31 : 36);
  const subtitleText = social ? item.socialSubtitle : item.subtitle;
  const detailText = social ? item.socialDetail : item.detail;
  if (!subtitleText || !detailText) throw new Error(`Missing format copy: ${item.slug}`);
  const subtitleLines = wrap(subtitleText, landscape ? 76 : 40);
  const subtitleSize = landscape ? 27 : 42;
  const subtitleLineHeight = landscape ? 41 : 55;
  const detailSize = landscape ? 21 : 32;
  const detailLineHeight = landscape ? 31 : 43;
  const detailY = subtitleY + subtitleLines.length * subtitleLineHeight + (landscape ? 37 : 26);
  const detailLines = wrap(detailText, landscape ? 91 : 49);
  const motifTop = Math.max(detailY + detailLines.length * detailLineHeight + 28, landscape ? 620 : height * (height > 1200 ? .56 : .63));
  const motifBottom = height - (landscape ? 145 : 165);
  if (motifTop >= motifBottom - 30) throw new Error(`Text exceeds ${label} artboard: ${item.slug}`);
  const title = linesSvg(titleLines, margin, titleY, titleSize * 1.08, "title");
  const subtitle = linesSvg(subtitleLines, margin, subtitleY, subtitleLineHeight, "subtitle");
  const detail = linesSvg(detailLines, margin, detailY, detailLineHeight, "detail");
  const motif = motifSvg(item, { x: margin, y: motifTop, width: width - margin * 2, height: motifBottom - motifTop }, color, social);
  const description = `${item.title} ${item.subtitle} ${item.detail} ${item.diagramAlt} ${item.status}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
<title id="title">${escapeXml(item.number)} — ${escapeXml(item.title)}</title>
<desc id="desc">${escapeXml(description)}</desc>
<style>
@font-face{font-family:StarlightInter;src:url(data:font/woff2;base64,${interFont}) format('woff2');font-style:normal;font-weight:100 900}
@font-face{font-family:StarlightNewsreader;src:url(data:font/woff2;base64,${newsreaderFont}) format('woff2');font-style:normal;font-weight:200 800}
.eyebrow,.index,.status{font-family:StarlightInter,Arial,sans-serif;font-size:${social ? 24 : 16}px;font-weight:700;letter-spacing:${social ? 0 : 1}px}
.motif-label{font-family:StarlightInter,Arial,sans-serif;font-size:${social ? 38 : 16}px;font-weight:700;letter-spacing:${social ? 0 : 1}px}
.motif-secondary{font-family:StarlightInter,Arial,sans-serif;font-size:${social ? 30 : 16}px;font-weight:700;letter-spacing:0}
.motif-primary{font-family:StarlightInter,Arial,sans-serif;font-size:${social ? 44 : 16}px;font-weight:700;letter-spacing:0}
.title{font-family:StarlightNewsreader,Georgia,serif;font-size:${titleSize}px;font-weight:440;letter-spacing:-2px;fill:${color.fg}}
.subtitle{font-family:StarlightInter,Arial,sans-serif;font-size:${subtitleSize}px;font-weight:520;fill:${color.fg}}
.detail{font-family:StarlightInter,Arial,sans-serif;font-size:${detailSize}px;fill:${color.muted}}
.eyebrow,.index,.status{fill:${color.muted}}
</style>
<rect width="${width}" height="${height}" fill="${color.bg}"/>
<line x1="${margin}" y1="104" x2="${width - margin}" y2="104" stroke="${color.line}"/>
<text x="${margin}" y="79" class="eyebrow">${escapeXml(item.eyebrow.toUpperCase())}</text>
<text x="${width - margin}" y="79" class="index" text-anchor="end">${escapeXml(item.number)} / 07</text>
${title}
${subtitle}
${detail}
${motif}
<line x1="${margin}" y1="${height - (social ? 126 : 106)}" x2="${width - margin}" y2="${height - (social ? 126 : 106)}" stroke="${color.line}"/>
<text x="${margin}" y="${height - (social ? 82 : 65)}" class="status">${escapeXml(item.status.toUpperCase())}</text>
<text x="${width - margin}" y="${height - (social && item.actionUrl ? 37 : social ? 82 : 65)}" class="status" text-anchor="end">${escapeXml(item.actionUrl ?? `STARLIGHT / ${label}`)}</text>
</svg>\n`;
}

mkdirSync(outputDir, { recursive: true });
const files = readdirSync(contentDir).filter((file) => /^\d\d-.*\.json$/.test(file)).sort();
if (files.length !== 7) throw new Error(`Expected seven narrative artifacts, got ${files.length}`);
for (const file of files) {
  const item = JSON.parse(readFileSync(path.join(contentDir, file), "utf8"));
  for (const [name, format] of Object.entries(formats)) {
    const output = path.join(outputDir, `${item.slug}-${name}.svg`);
    writeFileSync(output, render(item, format), "utf8");
    process.stdout.write(`${path.relative(path.resolve(here, ".."), output)}\n`);
  }
}
