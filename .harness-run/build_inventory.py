"""Merge org repo lists + local-clone detection + heuristic profile classification."""
import json, os, sys

REPO_ROOT = r"C:/Users/frank/starlight/repos"
RUN = os.path.dirname(__file__)
ORGS = ["frankxai", "Arcanea-Labs", "oci-ai-architects"]

local = set(os.listdir(REPO_ROOT))

def classify(name, desc, lang):
    n = name.lower(); d = (desc or "").lower()
    if "mcp" in n: return "A-MCP"
    if any(k in n for k in ["skill", "agent", "acos", "creator-os", "plugin", "intelligence-system", "intelligence-os"]): return "B-SkillsAgents"
    if any(k in n for k in ["hook", "sdk", "claude-arcanea", "-lib"]): return "C-Library"
    if any(k in n for k in ["website", "app", "vercel", ".ai", "academy", "studio", "cockpit", "site"]) or lang in ("TypeScript","JavaScript") and any(k in d for k in ["site","web","app","platform"]): return "D-Platform"
    if any(k in n for k in ["lore","canon","vibe","world","arcanea-ecosystem","book","author"]): return "E-LoreContent"
    if any(k in n for k in ["-code","oh-my","gemini-","codex-","cli","claw","swarm","orchestrator"]): return "F-CLIHarness"
    return "Z-Unclassified"

merged = []
for org in ORGS:
    path = os.path.join(RUN, f"repos-{org}.json")
    if not os.path.exists(path): continue
    for r in json.load(open(path, encoding="utf-8")):
        name = r["name"]
        merged.append({
            "name": name, "org": org,
            "desc": r.get("description"),
            "lang": (r.get("primaryLanguage") or {}).get("name") if isinstance(r.get("primaryLanguage"), dict) else r.get("primaryLanguage"),
            "archived": r.get("isArchived"), "private": r.get("isPrivate"),
            "diskKB": r.get("diskUsage"), "pushedAt": r.get("pushedAt"),
            "url": r.get("url"),
            "localClone": name in local,
            "profile": classify(name, r.get("description"), (r.get("primaryLanguage") or {}).get("name") if isinstance(r.get("primaryLanguage"), dict) else None),
        })

merged.sort(key=lambda x: (not x["localClone"], x["archived"], x["name"].lower()))
json.dump(merged, open(os.path.join(RUN, "inventory.json"), "w", encoding="utf-8"), indent=2)

active = [m for m in merged if not m["archived"]]
print(f"total={len(merged)} active={len(active)} archived={len(merged)-len(active)} localClones={sum(1 for m in merged if m['localClone'])}")
print("\n-- local clones with profile --")
for m in merged:
    if m["localClone"]:
        print(f"  {m['profile']:16} {m['org']}/{m['name']:32} {m['lang'] or '-'}")
print("\n-- profile distribution (active) --")
from collections import Counter
for p,c in sorted(Counter(m['profile'] for m in active).items()):
    print(f"  {p:16} {c}")
