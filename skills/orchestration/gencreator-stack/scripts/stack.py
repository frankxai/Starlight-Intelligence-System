#!/usr/bin/env python3
"""
stack.py — gencreator-stack skill engine.

Four verbs:
    audit      Walk inventory, emit context/stack-constellation.md
    scaffold   Drop STACK.md template into a target repo (refuses overwrite)
    assign     Rebind one tier of a repo's STACK.md (--repo --tier --value)
    diff       Compare STACK.md intent vs filesystem reality, emit drift report

Owned by Starlight Intelligence System. Built on SIP.
No external deps — stdlib only.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# -------------------------------------------------------------------------
# Paths
# -------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_DIR = SCRIPT_DIR.parent
ASSETS_DIR = SKILL_DIR / "assets"
SUBSTRATE_ROOT = SKILL_DIR.parent.parent.parent  # Starlight-Intelligence-System/
CONTEXT_DIR = SUBSTRATE_ROOT / "context"
INVENTORY_PATH = ASSETS_DIR / "inventory.json"
TEMPLATE_PATH = ASSETS_DIR / "STACK.template.md"

TIER_KEYS = ["Substrate", "Reasoning", "Coding (primary)", "Coding (secondary)", "Research browser"]


# -------------------------------------------------------------------------
# Data
# -------------------------------------------------------------------------


@dataclass
class RepoEntry:
    brand: str
    brand_label: str
    path: Path
    role: str
    stack_md_expected: bool
    notes: str
    defaults: dict


@dataclass
class StackManifest:
    repo_path: Path
    brand: str
    role: str
    last_assigned: str
    tiers: dict[str, str] = field(default_factory=dict)
    mcps: list[str] = field(default_factory=list)
    assistants: list[str] = field(default_factory=list)
    raw: str = ""


# -------------------------------------------------------------------------
# Inventory + manifest IO
# -------------------------------------------------------------------------


def load_inventory() -> list[RepoEntry]:
    if not INVENTORY_PATH.exists():
        die(f"Inventory missing: {INVENTORY_PATH}")
    data = json.loads(INVENTORY_PATH.read_text(encoding="utf-8"))
    entries: list[RepoEntry] = []
    for brand_key, brand_block in data.get("brands", {}).items():
        defaults = {
            "reasoning": brand_block.get("default_reasoning"),
            "coding_primary": brand_block.get("default_coding_primary"),
            "coding_secondary": brand_block.get("default_coding_secondary"),
            "browser_space": brand_block.get("default_browser_space"),
            "mcps": brand_block.get("default_mcps", []),
        }
        for repo in brand_block.get("repos", []):
            entries.append(
                RepoEntry(
                    brand=brand_key,
                    brand_label=brand_block.get("label", brand_key),
                    path=Path(repo["path"]),
                    role=repo.get("role", "unknown"),
                    stack_md_expected=repo.get("stack_md_expected", True),
                    notes=repo.get("notes", ""),
                    defaults=defaults,
                )
            )
    return entries


def stack_md_path(repo_path: Path) -> Path:
    return repo_path / "STACK.md"


def parse_stack_md(text: str, repo_path: Path) -> StackManifest:
    """Forgiving parser — finds the tier table and the MCP list. Doesn't care about ordering."""
    brand = field_after(text, r"\*\*Brand:\*\*\s*(.+)") or "unknown"
    role = field_after(text, r"\*\*Role:\*\*\s*(\S+)") or "unknown"
    last_assigned = field_after(text, r"\*\*Last assigned:\*\*\s*(\S+)") or ""

    tiers: dict[str, str] = {}
    for key in TIER_KEYS:
        # Table row like: | Reasoning | Claude Project | notes |
        # Escape parens for regex.
        esc = re.escape(key)
        m = re.search(rf"^\|\s*{esc}\s*\|\s*([^|]+?)\s*\|", text, re.MULTILINE)
        if m:
            tiers[key] = m.group(1).strip()

    mcps: list[str] = []
    mcp_block = section_block(text, "## Native MCPs")
    if mcp_block:
        for line in mcp_block.splitlines():
            line = line.strip()
            if line.startswith("- "):
                val = line[2:].strip()
                if val and not val.startswith("{{"):
                    mcps.append(val)

    assistants: list[str] = []
    a_block = section_block(text, "## Custom GPTs / Gems / Spaces tied to this repo")
    if a_block:
        for line in a_block.splitlines():
            line = line.strip()
            if line.startswith("- "):
                val = line[2:].strip()
                if val and not val.startswith("{{"):
                    assistants.append(val)

    return StackManifest(
        repo_path=repo_path,
        brand=brand,
        role=role,
        last_assigned=last_assigned,
        tiers=tiers,
        mcps=mcps,
        assistants=assistants,
        raw=text,
    )


def field_after(text: str, pattern: str) -> Optional[str]:
    m = re.search(pattern, text)
    return m.group(1).strip() if m else None


def section_block(text: str, heading: str) -> str:
    """Returns the body of a markdown section between this heading and the next ##/--- boundary."""
    pattern = re.escape(heading) + r"\s*\n(.*?)(?=\n##\s|\n---|\Z)"
    m = re.search(pattern, text, re.DOTALL)
    return m.group(1) if m else ""


# -------------------------------------------------------------------------
# Verb: audit
# -------------------------------------------------------------------------


def cmd_audit(args: argparse.Namespace) -> int:
    inventory = load_inventory()
    rows: list[str] = []
    gap_rows: list[str] = []
    brand_groups: dict[str, list[tuple[RepoEntry, Optional[StackManifest]]]] = {}

    for entry in inventory:
        manifest: Optional[StackManifest] = None
        smp = stack_md_path(entry.path)
        if smp.exists():
            try:
                manifest = parse_stack_md(smp.read_text(encoding="utf-8", errors="replace"), entry.path)
            except Exception as e:
                manifest = None
                gap_rows.append(f"- {entry.path} — STACK.md present but parse failed: {e}")
        brand_groups.setdefault(entry.brand_label, []).append((entry, manifest))

    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    out = [
        "# Stack Constellation",
        "",
        f"> Generated by `gencreator-stack/audit` at {now}. Do not edit by hand — re-run audit.",
        "",
        f"**Repos catalogued:** {len(inventory)}",
        f"**Manifests found:** {sum(1 for e in inventory if stack_md_path(e.path).exists())}",
        f"**Manifests expected:** {sum(1 for e in inventory if e.stack_md_expected)}",
        "",
        "---",
        "",
    ]

    for brand_label, items in brand_groups.items():
        out.append(f"## {brand_label}")
        out.append("")
        out.append("| Repo | Role | Reasoning | Coding (primary) | Coding (secondary) | Browser | MCPs | Manifest |")
        out.append("|---|---|---|---|---|---|---|---|")
        for entry, manifest in items:
            short_path = str(entry.path).replace("\\", "/")
            if manifest:
                r = manifest.tiers.get("Reasoning", "—")
                cp = manifest.tiers.get("Coding (primary)", "—")
                cs = manifest.tiers.get("Coding (secondary)", "—") or "—"
                br = manifest.tiers.get("Research browser", "—")
                mcps = ", ".join(manifest.mcps[:5]) + (f" +{len(manifest.mcps)-5}" if len(manifest.mcps) > 5 else "") if manifest.mcps else "—"
                status = "OK"
            else:
                r = entry.defaults.get("reasoning") or "—"
                cp = entry.defaults.get("coding_primary") or "—"
                cs = entry.defaults.get("coding_secondary") or "—"
                br = entry.defaults.get("browser_space") or "—"
                mcps = ", ".join(entry.defaults.get("mcps", [])[:5]) or "—"
                status = "MISSING — run scaffold" if entry.stack_md_expected else "n/a"
            out.append(f"| `{short_path}` | {entry.role} | {r} | {cp} | {cs} | {br} | {mcps} | {status} |")
        out.append("")

    if gap_rows:
        out.append("## Parse failures")
        out.append("")
        out.extend(gap_rows)
        out.append("")

    out.append("---")
    out.append("")
    out.append("**Built on SIP** · `gencreator-stack` audit v1.0.0")
    out.append("")

    CONTEXT_DIR.mkdir(parents=True, exist_ok=True)
    target = CONTEXT_DIR / "stack-constellation.md"
    target.write_text("\n".join(out), encoding="utf-8")
    print(f"Wrote constellation: {target}")
    return 0


# -------------------------------------------------------------------------
# Verb: scaffold
# -------------------------------------------------------------------------


def cmd_scaffold(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    if not repo.exists():
        die(f"Repo path does not exist: {repo}")
    target = stack_md_path(repo)
    if target.exists() and not args.force:
        die(f"STACK.md already exists at {target}. Use --force to overwrite (Frank-ack required).")

    inventory = load_inventory()
    entry = next((e for e in inventory if e.path.resolve() == repo), None)
    if not entry:
        print(f"WARN: repo {repo} not in inventory.json — using generic defaults.", file=sys.stderr)

    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    siblings = []
    if entry:
        siblings = [str(r.path).replace("\\", "/") for r in inventory if r.brand == entry.brand and r.path != entry.path]

    replacements = {
        "{{REPO_NAME}}": repo.name,
        "{{REPO_PATH}}": str(repo).replace("\\", "/"),
        "{{BRAND}}": entry.brand_label if entry else "(unknown — add to inventory.json)",
        "{{ROLE}}": entry.role if entry else "unknown",
        "{{ISO_TIMESTAMP}}": now,
        "{{REASONING_PICK}}": (entry.defaults.get("reasoning") if entry else "Claude Project: (set)") or "",
        "{{CODING_PRIMARY}}": (entry.defaults.get("coding_primary") if entry else "Claude Code") or "",
        "{{CODING_SECONDARY}}": (entry.defaults.get("coding_secondary") if entry else "") or "(none)",
        "{{BROWSER_SPACE}}": (entry.defaults.get("browser_space") if entry else "Arc Space: (set)") or "",
        "{{MCP_LIST}}": "\n- ".join(entry.defaults.get("mcps", [])) if entry and entry.defaults.get("mcps") else "(add MCPs)",
        "{{ASSISTANTS_LIST}}": "(add Custom GPTs / Gems / Spaces)",
        "{{REASONING_RATIONALE}}": "(why this surface)",
        "{{CODING_RATIONALE}}": "(why this agent)",
        "{{BROWSER_RATIONALE}}": "(why this browser space)",
        "{{SIBLING_REPOS}}": "\n- ".join(siblings) if siblings else "(none)",
    }
    rendered = template
    for k, v in replacements.items():
        rendered = rendered.replace(k, v)

    target.write_text(rendered, encoding="utf-8")
    print(f"Scaffolded STACK.md at {target}")
    return 0


# -------------------------------------------------------------------------
# Verb: assign
# -------------------------------------------------------------------------


def cmd_assign(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    target = stack_md_path(repo)
    if not target.exists():
        die(f"No STACK.md at {target}. Run scaffold first.")
    if args.tier not in TIER_KEYS:
        die(f"Unknown tier: {args.tier}. Pick from: {TIER_KEYS}")

    text = target.read_text(encoding="utf-8")
    esc = re.escape(args.tier)
    pattern = rf"^(\|\s*{esc}\s*\|\s*)([^|]+?)(\s*\|)"

    def repl(m: re.Match) -> str:
        return f"{m.group(1)}{args.value}{m.group(3)}"

    new_text, n = re.subn(pattern, repl, text, flags=re.MULTILINE)
    if n == 0:
        die(f"Could not find tier row '{args.tier}' in {target}. Manifest may be malformed.")

    # Append change log row
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    log_pattern = r"(\| Date \| Tier touched \| Change \| Reason \|\n\|[^\n]+\|\n)"
    log_row = f"| {now} | {args.tier} | -> {args.value} | {args.reason or '(no reason given)'} |\n"
    new_text2, ln = re.subn(log_pattern, lambda m: m.group(1) + log_row, new_text)
    if ln == 0:
        # No change log table found — append one
        new_text2 = new_text + f"\n\n_Auto-appended log: {now} · {args.tier} -> {args.value} · {args.reason or 'no reason'}_\n"

    # Update last_assigned
    new_text2 = re.sub(r"(\*\*Last assigned:\*\*\s*)\S+", rf"\g<1>{now}", new_text2)

    target.write_text(new_text2, encoding="utf-8")
    print(f"Updated {args.tier} -> {args.value} in {target}")
    return 0


# -------------------------------------------------------------------------
# Verb: diff
# -------------------------------------------------------------------------


def cmd_diff(args: argparse.Namespace) -> int:
    inventory = load_inventory()
    report: list[str] = []
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    report.append(f"# Stack Drift — {now}")
    report.append("")
    report.append("> Generated by `gencreator-stack/diff`. Green = manifest matches reality. Yellow = partial match. Red = manifest says X, reality has no trace of X.")
    report.append("")

    total_green = total_yellow = total_red = 0

    for entry in inventory:
        smp = stack_md_path(entry.path)
        if not smp.exists():
            if entry.stack_md_expected:
                report.append(f"## RED — {entry.path}")
                report.append(f"- No STACK.md but expected for brand `{entry.brand_label}`. Run scaffold.")
                report.append("")
                total_red += 1
            continue

        try:
            manifest = parse_stack_md(smp.read_text(encoding="utf-8", errors="replace"), entry.path)
        except Exception as e:
            report.append(f"## RED — {entry.path}")
            report.append(f"- STACK.md present but parse failed: {e}")
            report.append("")
            total_red += 1
            continue

        findings: list[tuple[str, str]] = []  # (severity, line)

        # Check coding agent claims vs filesystem
        coding_primary = (manifest.tiers.get("Coding (primary)") or "").lower()
        coding_secondary = (manifest.tiers.get("Coding (secondary)") or "").lower()

        if "claude code" in coding_primary:
            claude_dir = entry.path / ".claude"
            claude_md = entry.path / "CLAUDE.md"
            if not claude_dir.exists() and not claude_md.exists():
                findings.append(("RED", "Manifest claims Claude Code primary but no `.claude/` nor `CLAUDE.md` found"))
            elif not claude_dir.exists():
                findings.append(("YELLOW", "CLAUDE.md exists but no `.claude/` directory — fine if intentional"))

        if "cursor" in coding_primary or "cursor" in coding_secondary:
            cursor_dir = entry.path / ".cursor"
            cursor_rules = entry.path / ".cursorrules"
            if not cursor_dir.exists() and not cursor_rules.exists():
                findings.append(("RED", "Manifest claims Cursor but no `.cursor/` nor `.cursorrules`"))

        if "codex" in coding_primary or "codex" in coding_secondary:
            if not (entry.path / ".codex").exists():
                findings.append(("YELLOW", "Manifest claims Codex CLI but no `.codex/` config found (may be global)"))

        if "gemini" in coding_primary or "gemini" in coding_secondary:
            if not (entry.path / ".gemini").exists():
                findings.append(("YELLOW", "Manifest claims Gemini CLI but no `.gemini/` config found (may be global)"))

        # Check MCP claims vs .mcp.json
        mcp_file = entry.path / ".mcp.json"
        mcp_configured: list[str] = []
        if mcp_file.exists():
            try:
                mcp_data = json.loads(mcp_file.read_text(encoding="utf-8"))
                mcp_configured = list((mcp_data.get("mcpServers") or {}).keys())
            except Exception as e:
                findings.append(("YELLOW", f"`.mcp.json` present but failed to parse: {e}"))

        for claimed in manifest.mcps:
            claimed_lower = claimed.lower()
            # Generous match: "vercel" claimed matches "vercel" or "vercel-mcp"
            token = re.split(r"[\s\-_]", claimed_lower)[0] if claimed_lower else ""
            if not token:
                continue
            if mcp_configured and not any(token in c.lower() for c in mcp_configured):
                findings.append(("YELLOW", f"Manifest claims MCP `{claimed}` but `.mcp.json` has no matching server"))

        if findings:
            severity = "RED" if any(s == "RED" for s, _ in findings) else "YELLOW"
            if severity == "RED":
                total_red += 1
            else:
                total_yellow += 1
            report.append(f"## {severity} — {entry.path}")
            for sev, line in findings:
                report.append(f"- **{sev}**: {line}")
            report.append("")
        else:
            total_green += 1
            report.append(f"## GREEN — {entry.path}")
            report.append("- Manifest matches reality.")
            report.append("")

    # Summary header
    summary = [
        f"**Summary:** GREEN={total_green} · YELLOW={total_yellow} · RED={total_red}",
        "",
    ]
    final = report[:2] + summary + report[2:]
    final.append("---")
    final.append("")
    final.append("**Built on SIP** · `gencreator-stack` diff v1.0.0")

    CONTEXT_DIR.mkdir(parents=True, exist_ok=True)
    safe_ts = now.replace(":", "").replace("+0000", "Z")
    target = CONTEXT_DIR / f"stack-drift-{safe_ts}.md"
    target.write_text("\n".join(final), encoding="utf-8")
    print(f"Wrote drift report: {target}")
    print(f"Summary: GREEN={total_green} YELLOW={total_yellow} RED={total_red}")
    return 0 if total_red == 0 else 1


# -------------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------------


def die(msg: str) -> None:
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(2)


def main() -> int:
    p = argparse.ArgumentParser(prog="stack", description="gencreator-stack engine")
    sub = p.add_subparsers(dest="verb", required=True)

    sp_audit = sub.add_parser("audit", help="Walk inventory, emit stack-constellation.md")
    sp_audit.set_defaults(func=cmd_audit)

    sp_scaffold = sub.add_parser("scaffold", help="Drop STACK.md into a target repo")
    sp_scaffold.add_argument("--repo", required=True, help="Path to target repo")
    sp_scaffold.add_argument("--force", action="store_true", help="Overwrite existing STACK.md")
    sp_scaffold.set_defaults(func=cmd_scaffold)

    sp_assign = sub.add_parser("assign", help="Rebind one tier in a repo's STACK.md")
    sp_assign.add_argument("--repo", required=True)
    sp_assign.add_argument("--tier", required=True, help=f"One of: {TIER_KEYS}")
    sp_assign.add_argument("--value", required=True, help="New binding value")
    sp_assign.add_argument("--reason", default=None, help="Why this change")
    sp_assign.set_defaults(func=cmd_assign)

    sp_diff = sub.add_parser("diff", help="Detect drift between STACK.md and reality")
    sp_diff.set_defaults(func=cmd_diff)

    args = p.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
