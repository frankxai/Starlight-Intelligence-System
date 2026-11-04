import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const REPO_ROOT = path.resolve(SITE_ROOT, "..");
const AGENTS_DIR = path.join(REPO_ROOT, "agents");
const SKILL_RULES_FILE = path.join(REPO_ROOT, "skills", "skill-rules.json");
const OUTPUT_FILE = path.join(SITE_ROOT, "src", "data", "agents.json");
const OUTPUT_ATLAS_FILE = path.join(SITE_ROOT, "src", "data", "agents-atlas.json");

// Load known skills from skill-rules.json if present
const knownSkills = new Set();
try {
  const rulesRaw = await fs.readFile(SKILL_RULES_FILE, "utf8");
  const rulesJson = JSON.parse(rulesRaw);
  if (Array.isArray(rulesJson.rules)) {
    for (const r of rulesJson.rules) {
      if (r.skill) knownSkills.add(r.skill.toLowerCase().trim());
    }
  }
} catch {
  // skill rules optional
}

function cleanSkill(str) {
  if (!str) return null;
  let s = str.trim().replace(/^['"`]|['"`]$/g, "");
  s = s.replace(/^skills\//, "").replace(/\.md$/, "");
  const m = s.match(/([a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)/);
  return m ? m[1].toLowerCase() : null;
}

function normalizeCategory(fileId, profileName, domain, tier, rel) {
  const lowerId = fileId.toLowerCase();
  const lowerProfile = (profileName || "").toLowerCase();
  const lowerDomain = (domain || "").toLowerCase();
  const lowerTier = (tier || "").toLowerCase();
  const lowerRel = (rel || "").toLowerCase();

  // 1. Front-Door
  if (
    ["starlight-concierge", "starlight-envoy", "starlight-voice-operator"].includes(lowerId) ||
    ["concierge", "envoy", "voice-operator"].includes(lowerProfile) ||
    lowerTier === "front-door" ||
    lowerDomain === "intake"
  ) {
    return "Front-Door";
  }

  // 2. Excavation
  if (
    lowerId === "starlight-genius" ||
    lowerProfile === "genius" ||
    lowerTier === "excavation"
  ) {
    return "Excavation";
  }

  // 3. Leadership
  if (
    ["starlight-orchestrator", "starlight-prime", "starlight-architect"].includes(lowerId) ||
    ["orchestrator", "prime", "architect"].includes(lowerProfile) ||
    lowerTier === "leadership"
  ) {
    return "Leadership";
  }

  // 4. Foundation
  if (
    lowerId === "starlight-sage" ||
    lowerProfile === "sage" ||
    lowerTier === "foundation"
  ) {
    return "Foundation";
  }

  // 5. Council
  if (
    lowerRel === "council" ||
    lowerTier.includes("council") ||
    lowerId.includes("council")
  ) {
    return "Council";
  }

  // 6. Domain Sub-Stack verticals
  const domainKeywords = [
    "marine",
    "space",
    "sound",
    "music",
    "people",
    "energy",
    "crypto",
    "longevity",
    "legal",
    "domain-stacks",
    "domain-stack",
    "vertical",
    "adapter",
    "partner",
  ];
  const isDomainSubStack = domainKeywords.some(
    (kw) =>
      lowerRel.includes(kw) ||
      lowerId.includes(kw) ||
      lowerProfile.includes(kw) ||
      lowerDomain.includes(kw) ||
      lowerTier.includes(kw)
  );
  if (isDomainSubStack) {
    return "Domain Sub-Stack";
  }

  // 7. Universal IS
  const isUniversal =
    lowerId.startsWith("starlight-business") ||
    lowerId.startsWith("starlight-secondbrain") ||
    lowerId.startsWith("starlight-relational") ||
    lowerId.startsWith("starlight-embodiment") ||
    lowerId.startsWith("starlight-visionary") ||
    lowerId.startsWith("starlight-self") ||
    lowerId.startsWith("starlight-wealth") ||
    lowerId.startsWith("starlight-creator") ||
    lowerId.startsWith("starlight-code") ||
    lowerDomain.includes("universal") ||
    lowerTier.includes("universal");
  if (isUniversal) {
    return "Universal IS";
  }

  // 8. Specialist default
  return "Specialist";
}

async function walk(dir, rel = "") {
  let list = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      list = list.concat(await walk(path.join(dir, entry.name), path.join(rel, entry.name)));
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".md") &&
      entry.name !== "AGENT_REGISTRY.md" &&
      entry.name !== "CODING_AGENTS_REGISTRY.md"
    ) {
      const fullPath = path.join(dir, entry.name);
      const raw = await fs.readFile(fullPath, "utf8");

      // 1. Parse ONLY the leading YAML frontmatter block
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
      const fmLines = fmMatch ? fmMatch[1].split(/\r?\n/) : [];
      const body = fmMatch ? raw.slice(fmMatch[0].length) : raw;

      let fmName = "";
      let fmTier = "";
      let fmDomain = "";
      let fmVoice = "";

      for (const fl of fmLines) {
        const match = fl.match(/^([a-zA-Z_-]+):\s*(.*)$/);
        if (match) {
          const k = match[1].toLowerCase();
          const v = match[2].trim().replace(/^['"]|['"]$/g, "");
          if (k === "name") fmName = v.replace(/^starlight-/, "");
          if (k === "tier") fmTier = v;
          if (k === "domain") fmDomain = v;
          if (k === "voice") fmVoice = v;
        }
      }

      // Filename-based runtime ID
      const fileId = entry.name.replace(/\.md$/, "");
      const shortFileId = fileId.replace(/^starlight-/, "");
      const profileName = fmName || shortFileId;

      // Extract Title
      let title = "";
      const h1Match = body.match(/^#\s+(?:Starlight\s+(?:Specialist:\s*|Leadership:\s*|Front-Door:\s*|Excavation:\s*|Foundation:\s*|Universal:\s*)?)?([^\r\n]+)/m);
      if (h1Match) {
        title = h1Match[1].replace(/^Starlight\s+/i, "").trim();
      }
      if (!title) {
        title = profileName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      }

      // Domain & Voice
      const domain = fmDomain || rel || "Universal";
      const voice = fmVoice || "architect";

      // Extract Mission from ## Mission, ## Identity, ## Role, or Blockquote
      let mission = "";
      const missionMatch = body.match(/##\s+Mission\s*\r?\n+([\s\S]*?)(?=\r?\n##|\r?\n---|\r?\n\r?\n\r?\n|$)/i);
      if (missionMatch) {
        const lines = missionMatch[1].split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
        if (lines.length > 0) mission = lines[0];
      }

      if (!mission) {
        const roleMatch = body.match(/##\s+Role\s*\r?\n+([\s\S]*?)(?=\r?\n##|\r?\n---|\r?\n\r?\n\r?\n|$)/i);
        if (roleMatch) {
          const lines = roleMatch[1].split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
          if (lines.length > 0) mission = lines[0];
        }
      }

      if (!mission) {
        const bqMatch = body.match(/^>\s+([^\r\n]+)/m);
        if (bqMatch) {
          mission = bqMatch[1].trim();
        }
      }

      if (!mission) {
        const identMatch = body.match(/##\s+Identity\s*\r?\n+([\s\S]*?)(?=\r?\n##|\r?\n---|\r?\n\r?\n\r?\n|$)/i);
        if (identMatch) {
          const lines = identMatch[1].split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#") && !l.startsWith("**Tier") && !l.startsWith("**Domain") && !l.startsWith("**Activates"));
          if (lines.length > 0) mission = lines[0];
        }
      }

      if (!mission && voice && voice.length > 20 && !voice.startsWith("architect")) {
        mission = voice;
      }

      if (!mission) {
        mission = `Specialized intelligence for ${profileName}`;
      }

      // Extract Skills: Markdown tables and list items
      const activeSkills = [];
      const addSkill = (s) => {
        const clean = cleanSkill(s);
        if (clean && !activeSkills.includes(clean)) {
          activeSkills.push(clean);
        }
      };

      // 1. Skill tables under ## Skill Activations or ## Active Skills
      const skillSectionMatch = body.match(/##\s+(?:Skill Activations|Active Skills|Skills)[\s\S]*?(?=\r?\n##|\r?\n---|\r?\n\r?\n\r?\n|$)/i);
      const searchTarget = skillSectionMatch ? skillSectionMatch[0] : body;

      // Match table rows: | skill/name | ... |
      const tableRows = searchTarget.matchAll(/\|\s*`?([a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+(?:\.md)?)`?\s*\|/g);
      for (const row of tableRows) {
        addSkill(row[1]);
      }

      // Match list items: - `skill/name`
      const listItems = searchTarget.matchAll(/-\s+`?([a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+(?:\.md)?)`?/g);
      for (const li of listItems) {
        addSkill(li[1]);
      }

      // Match inline skill mentions matching known skills
      for (const ks of knownSkills) {
        if (searchTarget.toLowerCase().includes(ks)) {
          addSkill(ks);
        }
      }

      // Category and Tier
      const category = normalizeCategory(fileId, profileName, domain, fmTier, rel);
      let tier = fmTier ? fmTier.charAt(0).toUpperCase() + fmTier.slice(1) : category;

      list.push({
        id: fileId,
        profileName: profileName,
        title: title || profileName,
        tier: tier,
        category: category,
        domain: domain,
        voice: voice,
        mission: mission,
        file: path.join(rel, entry.name).replace(/\\/g, "/"),
        skills: activeSkills,
      });
    }
  }

  return list;
}

const agents = await walk(AGENTS_DIR);
agents.sort((a, b) => a.id.localeCompare(b.id));

await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
await fs.writeFile(OUTPUT_FILE, JSON.stringify(agents, null, 2), "utf8");
await fs.writeFile(OUTPUT_ATLAS_FILE, JSON.stringify(agents, null, 2), "utf8");

// Also write to public/data if public exists
const PUBLIC_DATA_DIR = path.join(SITE_ROOT, "public", "data");
try {
  await fs.mkdir(PUBLIC_DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(PUBLIC_DATA_DIR, "agents-atlas.json"), JSON.stringify(agents, null, 2), "utf8");
} catch {
  // ignore
}

console.log(`Generated ${agents.length} agents in ${OUTPUT_FILE} and ${OUTPUT_ATLAS_FILE}`);
