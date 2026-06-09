"""
Letta MemFS adapter — Substrate ABC subclass for SIS Phase 0 dog-food.

Reference implementation under MIT license. Forks of SIP inherit this as
starting point. Phase 0 execution fills in the impl gaps.

Wires Letta's MemFS layer (markdown files in a local git repo at
~/.letta/agents/<id>/memory/) into the SIS Substrate ABC. Each atom becomes
a markdown file with YAML frontmatter carrying SIP attestation + vault tag.

PHASE 0 STATUS: SKELETON ONLY. Interface stubbed. Concrete impl is TODO.
DO NOT WIRE INTO substrates.toml UNTIL PHASE 0 EVAL COMPLETES.

Built on SIP — operational tier (Phase 0 spike).
"""

from __future__ import annotations

import json
import subprocess
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable, Sequence

# Import the existing SIS Substrate ABC. Path may need adjusting in private/.
# from service.memory.contract import Substrate, Atom
#
# For this skeleton, we define the interface inline so the file is self-contained
# and can be copied into private/voice-operator/service/memory/substrates/ for
# Phase 0 execution.


# ─── Atom shape (mirrors SIS Atom TypedDict) ──────────────────────────────


@dataclass
class Atom:
    """Mirror of the SIS Atom TypedDict from contract.py.

    Fields preserved across all substrates (per SIP file-contract):
        id           — globally unique atom id (UUID or content-hash)
        text         — the atom body
        tier         — "warm" | "cold" (hot is operational-only)
        namespace    — slash-path like "strategic/decisions" or "cross-repo/X"
        source       — origin marker like "/cross-repo-indexer#via=memory-bus"
        written_at   — ISO timestamp
        redacted     — bool; true if Guardian redacted PII before commit
        attestation  — SIP attestation string ("Built on SIP — <git-sha>")
    """
    id: str
    text: str
    tier: str
    namespace: str
    source: str
    written_at: str
    redacted: bool
    attestation: str


# ─── LettaMemFS substrate ──────────────────────────────────────────────────


class LettaMemFSSubstrate:
    """Substrate ABC subclass writing through Letta's MemFS layer.

    PHASE 0 SCOPE:
    - PUT (commit) and SEARCH (recall) are required for eval-50 to run
    - Other methods (HEALTH, AUDIT) can be stubs in Phase 0

    DESIGN NOTES:
    - Each Atom becomes a markdown file at:
        <memfs_root>/<vault>/<namespace>/<atom-id>.md
      where <vault> is one of {strategic, technical, creative, operational,
      wisdom, horizon} extracted from namespace prefix or explicit field.
    - File body = atom.text
    - YAML frontmatter carries all other Atom fields, including attestation
      (this is the load-bearing A1 + A2 axiom claim)
    - Letta's `system/` convention (auto-loaded into prompt) maps to
      atoms with tier="warm" + namespace starting with "substrate/"

    LETTA RUNTIME:
    - Docker pull letta/letta:latest
    - LETTA_MEMFS_PATH=~/.letta/agents/sis/memory
    - LETTA runs offline w/ Ollama: see https://docs.letta.com/guides/server/providers/ollama
    """

    def __init__(self, memfs_root: Path, vault_field_required: bool = True):
        self.memfs_root = Path(memfs_root)
        self.memfs_root.mkdir(parents=True, exist_ok=True)
        self.vault_field_required = vault_field_required
        # PHASE 0 TODO: initialize Letta client if needed for retrieval
        # self._letta_client = LettaClient(base_url="http://localhost:8283")

    # ─── Required Substrate ABC methods ───────────────────────────────────

    def commit(self, atom: Atom) -> None:
        """Write atom to MemFS as markdown + frontmatter.

        Attestation injection is mandatory. If atom.attestation is None or
        empty, fail closed — A1 axiom is non-waivable.
        """
        if not atom.attestation:
            raise ValueError(
                "Atom missing attestation — SIP §5 sovereignty clause requires "
                "per-atom attestation. Did you forget _current_attestation()?"
            )

        vault = self._extract_vault(atom.namespace)
        atom_dir = self.memfs_root / vault / atom.namespace.replace("/", "_")
        atom_dir.mkdir(parents=True, exist_ok=True)
        atom_path = atom_dir / f"{atom.id}.md"

        frontmatter = self._build_frontmatter(atom, vault)
        content = f"---\n{frontmatter}---\n\n{atom.text}\n"
        atom_path.write_text(content, encoding="utf-8")

        # PHASE 0 TODO: notify Letta engine of new file (if its index is
        # not filesystem-watcher-driven). Verify Letta picks up changes
        # without restart during Phase 0 6.2 smoke test.

    def recall(
        self,
        query: str,
        *,
        namespace: str | None = None,
        vault: str | None = None,
        top_k: int = 10,
    ) -> Sequence[Atom]:
        """Retrieve top-k atoms matching query.

        PHASE 0 TODO: implement actual retrieval via Letta MCP or HTTP API.
        Hybrid signal expected: semantic (Letta embedding) + filesystem
        namespace filter + frontmatter field filter.

        Return Atom objects parsed from markdown+frontmatter.
        """
        raise NotImplementedError("Phase 0 6.2 TODO — wire Letta retrieval")

    def health(self) -> dict[str, Any]:
        """Substrate health snapshot — same shape as other substrates."""
        # PHASE 0 TODO: include Letta engine reachability + memfs disk usage
        return {
            "substrate": "letta_memfs",
            "memfs_root": str(self.memfs_root),
            "memfs_exists": self.memfs_root.exists(),
            "atom_count_estimate": sum(1 for _ in self.memfs_root.rglob("*.md")),
        }

    # ─── Helpers ──────────────────────────────────────────────────────────

    def _extract_vault(self, namespace: str) -> str:
        """Map namespace to vault name.

        Prefix-match convention:
          'strategic/...'   → strategic vault
          'technical/...'   → technical vault
          'creative/...'    → creative vault
          'operational/...' → operational vault
          'wisdom/...'      → wisdom vault
          'horizon/...'     → horizon vault
          anything else     → operational (default; flag for review)
        """
        VAULTS = {"strategic", "technical", "creative", "operational", "wisdom", "horizon"}
        head = namespace.split("/", 1)[0]
        if head in VAULTS:
            return head
        # PHASE 0 TODO: log unrecognized prefixes — likely cross-repo atoms
        # that need a vault assignment heuristic
        return "operational"

    def _build_frontmatter(self, atom: Atom, vault: str) -> str:
        """Compose YAML frontmatter for the markdown file.

        Order matters for diff-friendliness — keep stable field order.
        """
        fields = {
            "id": atom.id,
            "vault": vault,
            "tier": atom.tier,
            "namespace": atom.namespace,
            "source": atom.source,
            "written_at": atom.written_at,
            "redacted": atom.redacted,
            "attestation": atom.attestation,
        }
        # Hand-roll YAML to avoid a pyyaml dep for the skeleton
        lines = [f"{k}: {self._yaml_value(v)}" for k, v in fields.items()]
        return "\n".join(lines) + "\n"

    def _yaml_value(self, v: Any) -> str:
        if isinstance(v, bool):
            return "true" if v else "false"
        if isinstance(v, str):
            # Quote strings that might confuse YAML
            if any(c in v for c in (':', '#', '\n')):
                return json.dumps(v)
            return v
        return str(v)


# ─── Phase 0 migration helper ───────────────────────────────────────────────


def migrate_from_chromadb(
    chromadb_path: Path,
    letta_substrate: LettaMemFSSubstrate,
    *,
    dry_run: bool = True,
) -> dict[str, int]:
    """Walk live ChromaDB store and write each atom into Letta MemFS.

    PHASE 0 6.5 — required before eval-50 runs against Letta candidate.
    Attestation preservation MUST be verified at migration time, not later.

    Returns counts: {atoms_read, atoms_written, attestation_preserved,
                     attestation_missing, errors}.
    """
    counts = {
        "atoms_read": 0,
        "atoms_written": 0,
        "attestation_preserved": 0,
        "attestation_missing": 0,
        "errors": 0,
    }
    # PHASE 0 TODO: use chromadb client to enumerate collection
    # for each row: build Atom → letta_substrate.commit(atom)
    # increment counts; if dry_run: don't actually write
    return counts


def _current_attestation() -> str:
    """Return 'Built on SIP — <short-sha>' for the current HEAD.

    Mirrors the helper in private/voice-operator/service/memory/router.py.
    """
    try:
        sha = subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"], text=True
        ).strip()
        return f"Built on SIP — {sha}"
    except subprocess.CalledProcessError:
        return "Built on SIP — unknown"


# ─── Smoke test stub ────────────────────────────────────────────────────────


if __name__ == "__main__":
    # PHASE 0 6.2 smoke: instantiate + write 10 random atoms + commit
    # Real smoke lives in tests/ during Phase 0 execution
    import tempfile

    with tempfile.TemporaryDirectory() as tmp:
        substrate = LettaMemFSSubstrate(memfs_root=Path(tmp))
        atom = Atom(
            id="mem_test_0001",
            text="Phase 0 skeleton smoke — Letta MemFS adapter ready.",
            tier="warm",
            namespace="operational/phase0-smoke",
            source="/phase0-skeleton-smoke",
            written_at=datetime.now(timezone.utc).isoformat(),
            redacted=False,
            attestation=_current_attestation(),
        )
        substrate.commit(atom)
        h = substrate.health()
        assert h["atom_count_estimate"] == 1, f"expected 1 atom, got {h}"
        print("Letta MemFS skeleton smoke: OK")
