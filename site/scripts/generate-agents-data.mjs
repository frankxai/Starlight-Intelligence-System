import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const REPO_ROOT = path.resolve(SITE_ROOT, "..");
const AGENTS_DIR = path.join(REPO_ROOT, "agents");
const OUTPUT_FILE = path.join(SITE_ROOT, "src", "data", "agents.json");

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

      let name = entry.name.replace(/\.md$/, "").replace(/^starlight-/, "");
      let title = name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      let tier = "Specialist";
      let domain = rel || "Universal";
      let voice = "architect";
      let mission = "";
      const activeSkills = [];

      const lines = raw.split("\n");
      let inFm = false;
      const fmLines = [];
      const bodyLines = [];

      for (const line of lines) {
        if (line.trim() === "---") {
          inFm = !inFm;
          continue;
        }
        if (inFm) fmLines.push(line);
        else bodyLines.push(line);
      }

      for (const fl of fmLines) {
        const match = fl.match(/^([a-zA-Z_-]+):\s*(.*)$/);
        if (match) {
          const k = match[1].toLowerCase();
          const v = match[2].trim().replace(/^['"]|['"]$/g, "");
          if (k === "name") {
            name = v.replace(/^starlight-/, "");
            title = name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          }
          if (k === "tier") tier = v;
          if (k === "domain") domain = v;
          if (k === "voice") voice = v;
        }
      }

      if (rel) {
        if (rel === "council") tier = "Council Archetype";
        else if (rel === "domain-stacks") tier = "Domain Sub-Stack";
        else if (rel.startsWith("energy")) tier = "Energy Intelligence";
        else if (rel.startsWith("marine")) tier = "Marine Intelligence";
        else if (rel.startsWith("people")) tier = "People Intelligence";
        else if (rel.startsWith("sound")) tier = "Sound Intelligence";
        else if (rel.startsWith("music")) tier = "Music IS";
      }

      for (const bl of bodyLines) {
        if (!mission && bl.startsWith("# Starlight Specialist:")) {
          title = bl.replace("# Starlight Specialist:", "").trim();
        } else if (!mission && bl.startsWith("# Starlight Leadership:")) {
          title = bl.replace("# Starlight Leadership:", "").trim();
          tier = "Leadership";
        } else if (!mission && bl.startsWith("# Starlight Front-Door:")) {
          title = bl.replace("# Starlight Front-Door:", "").trim();
          tier = "Front-Door";
        } else if (!mission && bl.startsWith("# Starlight Excavation:")) {
          title = bl.replace("# Starlight Excavation:", "").trim();
          tier = "Excavation";
        } else if (!mission && bl.startsWith("# Starlight Foundation:")) {
          title = bl.replace("# Starlight Foundation:", "").trim();
          tier = "Foundation";
        } else if (!mission && bl.startsWith("# Starlight Universal:")) {
          title = bl.replace("# Starlight Universal:", "").trim();
          tier = "Universal IS";
        } else if (!mission && bl.startsWith("## Mission")) {
          const idx = bodyLines.indexOf(bl);
          for (let i = idx + 1; i < Math.min(idx + 5, bodyLines.length); i++) {
            if (bodyLines[i].trim() && !bodyLines[i].startsWith("#")) {
              mission = bodyLines[i].trim();
              break;
            }
          }
        }
        if (bl.trim().startsWith("- `") && bl.includes("/")) {
          const m = bl.match(/`([^`]+)`/);
          if (m && !activeSkills.includes(m[1])) activeSkills.push(m[1]);
        }
      }

      const lowerName = name.toLowerCase();
      if (["concierge", "envoy", "voice-operator"].includes(lowerName)) {
        tier = "Front-Door";
      } else if (["genius"].includes(lowerName)) {
        tier = "Excavation";
      } else if (["orchestrator", "prime", "architect"].includes(lowerName)) {
        tier = "Leadership";
      } else if (["sage"].includes(lowerName)) {
        tier = "Foundation";
      } else if (["queen", "navigator", "sentinel", "weaver", "hermes", "evaluator"].includes(lowerName)) {
        tier = "Specialist";
      } else if (
        lowerName.startsWith("business") ||
        lowerName.startsWith("secondbrain") ||
        lowerName.startsWith("relational") ||
        lowerName.startsWith("embodiment") ||
        lowerName.startsWith("visionary") ||
        lowerName.startsWith("self") ||
        lowerName.startsWith("wealth") ||
        lowerName.startsWith("creator") ||
        lowerName.startsWith("code")
      ) {
        tier = "Universal IS";
      }

      list.push({
        id: name,
        title: title || name,
        tier: tier.charAt(0).toUpperCase() + tier.slice(1),
        domain: domain || "Universal",
        voice: voice || "architect",
        mission: mission || `Specialized intelligence for ${name}`,
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

console.log(`Generated ${agents.length} agents in ${OUTPUT_FILE}`);
