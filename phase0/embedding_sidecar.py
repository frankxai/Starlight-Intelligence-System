"""
Phase 0 Step 6.5 — Embedding sidecar for semantic retrieval.

Pure-stdlib (no torch, no transformers, no chromadb) embedding via
hashing-TF + IDF + cosine similarity. Wraps any Substrate to add
semantic search alongside existing namespace/filter retrieval.

Why stdlib-only:
- 50 LOC of well-understood text retrieval
- ~80MB saved vs sentence-transformers / chromadb deps
- Substrate sovereignty preserved — clone-and-run works without pip install
- For SIS scope (~3000 atoms), hashing-TF + IDF produces sufficient signal
- Upgrade path documented: swap `HashingTFEmbedder` for any class with
  the same `embed(text) -> dict[int, float]` shape

This wires the FIRST measured semantic retrieval for SIS substrate.

Built on SIP — operational tier (Phase 0 6.5 first-bite).
"""

from __future__ import annotations

import math
import re
from collections import Counter, defaultdict
from typing import Any, Protocol

from sovereign_substrate import Atom, Substrate


# ─── Embedder protocol ────────────────────────────────────────────────────


class Embedder(Protocol):
    """Minimal embedder contract — any class with embed(text) -> sparse vector works."""

    def embed(self, text: str) -> dict[int, float]:
        ...


# ─── Hashing-TF + IDF embedder (stdlib only) ──────────────────────────────


_TOKEN_RE = re.compile(r"[A-Za-z][A-Za-z0-9_-]+")


def _tokenize(text: str) -> list[str]:
    """Lowercase + simple word tokens; drops digits-only + 1-char tokens."""
    return [t.lower() for t in _TOKEN_RE.findall(text or "")]


class HashingTFEmbedder:
    """Hashing trick + TF + optional IDF for sparse semantic-ish vectors.

    Pros: deterministic, no vocabulary build, handles unseen tokens gracefully.
    Cons: hash collisions; quality < real transformer embeddings.

    Sufficient for SIS Phase 0 first-bite (~3000-atom corpus).
    """

    def __init__(self, dim: int = 1024, use_idf: bool = True):
        self.dim = dim
        self.use_idf = use_idf
        # Document frequency for IDF: token_hash → docs_seen
        self._df: dict[int, int] = defaultdict(int)
        # Total docs seen — used in IDF denominator
        self._doc_count = 0

    def fit(self, corpus_texts: list[str]) -> None:
        """Build IDF stats from a corpus. Idempotent; rebuilds from scratch."""
        self._df = defaultdict(int)
        self._doc_count = 0
        for text in corpus_texts:
            tokens = set(_tokenize(text))
            self._doc_count += 1
            for tok in tokens:
                self._df[hash(tok) % self.dim] += 1

    def _idf(self, h: int) -> float:
        if not self.use_idf or self._doc_count == 0:
            return 1.0
        # smoothed IDF: log((1+N) / (1+df)) + 1
        return math.log((1 + self._doc_count) / (1 + self._df.get(h, 0))) + 1.0

    def embed(self, text: str) -> dict[int, float]:
        """Return sparse TF·IDF vector as {hash: weight}, L2-normalized."""
        tokens = _tokenize(text)
        if not tokens:
            return {}
        # Term frequency
        tf = Counter(hash(t) % self.dim for t in tokens)
        # TF · IDF
        vec = {h: count * self._idf(h) for h, count in tf.items()}
        # L2 normalize so cosine = dot product
        norm = math.sqrt(sum(v * v for v in vec.values()))
        if norm > 0:
            vec = {h: v / norm for h, v in vec.items()}
        return vec


def cosine(a: dict[int, float], b: dict[int, float]) -> float:
    """Cosine similarity of two sparse vectors (both L2-normalized → dot product)."""
    if not a or not b:
        return 0.0
    # Iterate the smaller dict for efficiency
    if len(a) > len(b):
        a, b = b, a
    return sum(v * b.get(h, 0.0) for h, v in a.items())


# ─── Sidecar — wraps a Substrate to add semantic search ───────────────────


class EmbeddingSidecar:
    """Wraps any Substrate (Path A sovereign, AgentDB tier-1, Letta, etc.) to
    add semantic search WITHOUT modifying the substrate itself.

    Usage:
        substrate = JsonlSovereign(jsonl_path)
        sidecar = EmbeddingSidecar(substrate)
        # commit atoms via substrate as normal; index them via sidecar
        for atom in atoms_to_commit:
            substrate.put(atom)
            sidecar.index(atom)
        # OR bulk index from existing substrate state
        sidecar.reindex_from_substrate()
        # Semantic retrieval
        results = sidecar.semantic_search("memory architecture stance", top_k=10)
    """

    def __init__(self, substrate: Substrate, embedder: Embedder | None = None):
        self.substrate = substrate
        self.embedder = embedder or HashingTFEmbedder(dim=1024, use_idf=True)
        # In-memory embedding index: {(namespace_tuple, key): sparse_vec}
        self._index: dict[tuple[tuple[str, ...], str], dict[int, float]] = {}

    def index(self, atom: Atom) -> None:
        """Index a single atom's text field."""
        text = atom.value.get("text", "")
        if text:
            self._index[(atom.namespace, atom.key)] = self.embedder.embed(text)

    def reindex_from_substrate(self, namespace_prefix: tuple[str, ...] = ()) -> int:
        """Bulk reindex from substrate. Fits IDF on the corpus first, then embeds.

        Returns the number of atoms indexed.
        """
        all_atoms = self.substrate.search(namespace_prefix, limit=10_000)
        texts = [a.value.get("text", "") for a in all_atoms if a.value.get("text")]
        if hasattr(self.embedder, "fit"):
            self.embedder.fit(texts)
        self._index.clear()
        for atom in all_atoms:
            self.index(atom)
        return len(self._index)

    def semantic_search(
        self,
        query: str,
        *,
        namespace_prefix: tuple[str, ...] = (),
        top_k: int = 10,
        min_score: float = 0.0,
    ) -> list[tuple[float, Atom]]:
        """Rank atoms by cosine similarity to query. Returns (score, atom) pairs."""
        if not query.strip() or not self._index:
            return []
        qvec = self.embedder.embed(query)
        scored: list[tuple[float, tuple[str, ...], str]] = []
        for (ns, key), avec in self._index.items():
            # Optional namespace prefix filter
            if namespace_prefix and ns[: len(namespace_prefix)] != namespace_prefix:
                continue
            score = cosine(qvec, avec)
            if score > min_score:
                scored.append((score, ns, key))
        scored.sort(key=lambda x: x[0], reverse=True)
        results: list[tuple[float, Atom]] = []
        for score, ns, key in scored[:top_k]:
            atom = self.substrate.get(ns, key)
            if atom is not None:
                results.append((score, atom))
        return results

    def health(self) -> dict[str, Any]:
        return {
            "sidecar": "embedding_sidecar",
            "embedder": type(self.embedder).__name__,
            "indexed_atoms": len(self._index),
            "substrate_health": self.substrate.health(),
        }
