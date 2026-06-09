#!/usr/bin/env python3
"""Spec-Trace CLI helper.

Operates on the canonical sidecar directory at <repo>/memory/spec-trace/ and
the indexed-copy directory at ~/.claude/projects/<slug>/memory/.

Subcommands:
    list-specs            List all sidecars with status + commit count.
    show-trace <spec-id>  Print a sidecar's contents.
    link-commit <sha> <spec-id>
                          Manually append a commit-event to a sidecar (recovery
                          path if the post-commit hook missed a commit).
    sync                  Regenerate indexed copies from canonical.
    init <spec-id>        Create an empty sidecar (without a real commit).

Fail-open invariant matches the hook: this CLI never silently corrupts an
existing sidecar — all writes are idempotent and atomic.

Built on SIP — operational tier · 2026-05-11
"""

from __future__ import annotations

import argparse
import datetime as dt
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Iterable


def repo_root() -> Path:
    """Return the git repo root (cwd-relative)."""
    out = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        capture_output=True,
        text=True,
        check=False,
    )
    if out.returncode != 0:
        raise SystemExit("Not inside a git repository.")
    return Path(out.stdout.strip())


def canonical_dir(root: Path) -> Path:
    return root / "memory" / "spec-trace"


def project_slug(repo_path: Path) -> str:
    """Encode an absolute repo path as a Claude auto-memory project slug.

    Claude Code convention (verified by inspection):
        C:\\Users\\frank\\Starlight-Intelligence-System
            -> C--Users-frank-Starlight-Intelligence-System
        /home/user/repo
            -> home-user-repo (leading dash stripped)

    The colon + first separator BOTH become dashes, yielding the double-dash
    after the drive letter. Convert ':', '/', and '\\' all to '-' (NOT dropping
    the colon).
    """
    raw = str(repo_path.resolve())
    slug = raw.replace(":", "-").replace("\\", "-").replace("/", "-")
    return slug.lstrip("-")


def indexed_dir_for(repo_path: Path) -> Path:
    home = Path(os.environ.get("USERPROFILE") or os.environ.get("HOME") or ".")
    return home / ".claude" / "projects" / project_slug(repo_path) / "memory"


def indexed_path_for(repo_path: Path, spec_id: str) -> Path:
    return indexed_dir_for(repo_path) / f"spec-trace_{spec_id}.md"


def iso_now() -> str:
    return dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def list_specs(args: argparse.Namespace) -> int:
    root = repo_root()
    cdir = canonical_dir(root)
    if not cdir.exists():
        print("(no spec-trace sidecars yet — first commit with `Spec:` trailer will create some)")
        return 0
    # Exclude README.md (which documents the sidecar convention itself,
    # not a per-spec sidecar). Sidecar names start with a 4-digit year.
    sidecars = sorted(
        s for s in cdir.glob("*.md")
        if s.name != "README.md" and re.match(r"\d{4}-", s.name)
    )
    if not sidecars:
        print("(no spec-trace sidecars)")
        return 0

    print(f"{len(sidecars)} spec-trace sidecar(s):\n")
    for s in sidecars:
        spec_id = s.stem
        text = s.read_text(encoding="utf-8", errors="replace")
        commits = len(re.findall(r"^- \d{4}-\d{2}-\d{2}T", text, re.MULTILINE))
        m = re.search(r"^classification:\s*(\S+)", text, re.MULTILINE)
        classification = m.group(1) if m else "?"
        m2 = re.search(r"^board_verdict:\s*(\S+)", text, re.MULTILINE)
        verdict = m2.group(1) if m2 else "?"
        idx_present = "yes" if indexed_path_for(root, spec_id).exists() else "no"
        print(f"  {spec_id}")
        print(f"    classification: {classification}  verdict: {verdict}  commits: {commits}  indexed: {idx_present}")
    return 0


def show_trace(args: argparse.Namespace) -> int:
    root = repo_root()
    path = canonical_dir(root) / f"{args.spec_id}.md"
    if not path.exists():
        print(f"No sidecar for spec '{args.spec_id}' at {path}", file=sys.stderr)
        return 1
    sys.stdout.write(path.read_text(encoding="utf-8", errors="replace"))
    return 0


def _seed_sidecar(root: Path, spec_id: str) -> Path:
    """Create a fresh sidecar with frontmatter seeded from the spec doc if found."""
    spec_doc = root / "docs" / "superpowers" / "specs" / f"{spec_id}.md"
    spec_path_rel = (
        f"docs/superpowers/specs/{spec_id}.md" if spec_doc.exists() else "UNRESOLVED"
    )
    cdir = canonical_dir(root)
    cdir.mkdir(parents=True, exist_ok=True)
    path = cdir / f"{spec_id}.md"
    if path.exists():
        return path

    body = (
        f"---\n"
        f"spec_id: {spec_id}\n"
        f"spec_path: {spec_path_rel}\n"
        f"created: {iso_now()}\n"
        f"classification: operational\n"
        f"board_verdict: none\n"
        f"board_verdict_at: null\n"
        f"project: {root.name}\n"
        f"repo_root: {root.resolve().as_posix()}\n"
        f"---\n\n"
        f"## Dispatches\n\n"
        f"## Commits\n\n"
        f"## PRs\n\n"
        f"## Notes\n\n"
    )
    path.write_text(body, encoding="utf-8")
    return path


def link_commit(args: argparse.Namespace) -> int:
    """Manually append a commit event to a spec sidecar (hook-bypass recovery)."""
    root = repo_root()
    path = _seed_sidecar(root, args.spec_id)
    short_sha = args.sha[:7]
    if f"`{short_sha}`" in path.read_text(encoding="utf-8", errors="replace"):
        print(f"Already linked: {short_sha} → {args.spec_id}")
        return 0

    # Resolve commit metadata from git if available
    info = subprocess.run(
        ["git", "show", "-s", "--format=%h%n%D%n%s", args.sha],
        capture_output=True,
        text=True,
        check=False,
    )
    if info.returncode == 0:
        lines = info.stdout.strip().split("\n", 2)
        full_sha = lines[0] if lines else short_sha
        refs = lines[1] if len(lines) > 1 else ""
        subject = lines[2] if len(lines) > 2 else "(unknown)"
        branch = refs.split(",")[0].strip() if refs else "?"
    else:
        full_sha = short_sha
        branch = "?"
        subject = "(manual link)"

    line = f"- {iso_now()} · `{full_sha}` · `{branch}` · {subject}"
    text = path.read_text(encoding="utf-8", errors="replace")
    if "## Commits" in text:
        text = text.replace("## Commits\n", f"## Commits\n{line}\n", 1)
    else:
        text = text.rstrip() + f"\n\n## Commits\n{line}\n"
    path.write_text(text, encoding="utf-8")

    # Mirror to indexed copy
    idx_path = indexed_path_for(root, args.spec_id)
    if idx_path.parent.exists():
        try:
            shutil.copyfile(path, idx_path)
        except OSError as e:
            print(f"warning: indexed-copy write failed: {e}", file=sys.stderr)
    print(f"Linked {full_sha} → {args.spec_id}")
    return 0


def sync(args: argparse.Namespace) -> int:
    """Regenerate indexed copies from canonical sidecars."""
    root = repo_root()
    cdir = canonical_dir(root)
    if not cdir.exists():
        print("(no canonical sidecars to sync)")
        return 0
    idx_dir = indexed_dir_for(root)
    if not idx_dir.exists():
        print(f"Auto-memory dir absent: {idx_dir}")
        print("Indexed copies will not be created until this directory exists.")
        return 0

    # Exclude README.md from sync (only actual sidecars, which start with a year)
    sidecars = sorted(
        s for s in cdir.glob("*.md")
        if s.name != "README.md" and re.match(r"\d{4}-", s.name)
    )
    wrote = 0
    for s in sidecars:
        spec_id = s.stem
        target = idx_dir / f"spec-trace_{spec_id}.md"
        try:
            shutil.copyfile(s, target)
            wrote += 1
        except OSError as e:
            print(f"warning: failed to write {target}: {e}", file=sys.stderr)
    print(f"Synced {wrote} of {len(sidecars)} sidecar(s) -> {idx_dir}")
    return 0


def init_sidecar(args: argparse.Namespace) -> int:
    """Create an empty sidecar without a real commit (rare; usually the hook does this)."""
    root = repo_root()
    path = _seed_sidecar(root, args.spec_id)
    print(f"Sidecar at {path.relative_to(root)}")
    return 0


def main(argv: Iterable[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="spec-trace", description="SIS Spec-Trace CLI")
    sub = p.add_subparsers(dest="cmd", required=True)

    sp_list = sub.add_parser("list-specs", help="List all sidecars")
    sp_list.set_defaults(func=list_specs)

    sp_show = sub.add_parser("show-trace", help="Print a sidecar's contents")
    sp_show.add_argument("spec_id")
    sp_show.set_defaults(func=show_trace)

    sp_link = sub.add_parser("link-commit", help="Manually link a commit to a spec")
    sp_link.add_argument("sha")
    sp_link.add_argument("spec_id")
    sp_link.set_defaults(func=link_commit)

    sp_sync = sub.add_parser("sync", help="Regenerate indexed copies from canonical")
    sp_sync.set_defaults(func=sync)

    sp_init = sub.add_parser("init", help="Create an empty sidecar")
    sp_init.add_argument("spec_id")
    sp_init.set_defaults(func=init_sidecar)

    args = p.parse_args(list(argv) if argv is not None else None)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
