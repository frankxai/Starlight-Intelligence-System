#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const header = readFileSync(
  join(SITE_ROOT, "src/components/Header.tsx"),
  "utf8",
);
const downloadPage = readFileSync(
  join(SITE_ROOT, "src/app/download/page.tsx"),
  "utf8",
);
const protocolPage = readFileSync(
  join(SITE_ROOT, "src/app/protocol/page.tsx"),
  "utf8",
);
const homePage = readFileSync(
  join(SITE_ROOT, "src/app/page.tsx"),
  "utf8",
);

const failures = [];

if (
  !header.includes("NAV_GROUPS.map((group, groupIndex)") ||
  !header.includes(
    "const alignPanelRight = groupIndex === NAV_GROUPS.length - 1;",
  ) ||
  !header.includes('alignPanelRight ? "right-0" : "left-0"')
) {
  failures.push(
    "the final desktop navigation panel must align to its trigger's right edge",
  );
}

if (
  !downloadPage.includes(
    '<span className="block">Start from</span>{" "}',
  ) ||
  !downloadPage.includes(
    '<span className="block bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">',
  )
) {
  failures.push(
    "the /download H1 must preserve its visual line break and a semantic space",
  );
}

if (/Start from\s*<br\s*\/?>/.test(downloadPage)) {
  failures.push(
    "the /download H1 must not concatenate its two phrases around a br element",
  );
}

if (
  !homePage.includes(
    'aria-label="Models learn from what we leave behind."',
  ) ||
  !homePage.includes('aria-label="Take the substrate. Keep the keys."')
) {
  failures.push(
    "the homepage split-style headings must expose complete accessible names with semantic spaces",
  );
}

if (!protocolPage.includes("overflow-x-auto")) {
  failures.push(
    "intentional table and pre horizontal scrollers must remain available",
  );
}

if (failures.length > 0) {
  console.error("Layout contract failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "Layout contract passed: the final navigation panel stays in-viewport, split-style headings expose semantic spaces, and nested scrollers remain.",
);
