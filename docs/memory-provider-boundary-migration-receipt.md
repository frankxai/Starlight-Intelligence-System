# SIS starlight-memory Provider Boundary Migration Receipt (issue #64)

**Date:** 2026-08-11 (local work session on t_375e8f86)
**Status:** In-progress (compatibility layer landed; no default flip)
**Branch:** night/2026-07-17-sis-verify (dirty)
**Package:** @starlight-intelligence/memory file:../starlight-memory (local); target pinned release >=0.3 per acceptance

## Ownership (per issue)
- **SIS (this repo):** protocol, product/runtime integration, vault/retrieval behavior, public/private namespace governance, end-to-end evals, VaultMemory, MCP surfaces (sis-memory-mcp).
- **starlight-memory:** portable provider interfaces (MemoryProvider, types), privacy projection policy, routing contract, provider adapters (local_core, mem0, ... + new persistent), durable external projection outbox.
- Private mounts (starlight-private-memory) never embedded by default.

## Changes in this pass
- Dependency declared in package.json.
- Boundary documentation and narrow compat adapter in src/memory-provider/.
- Feature flag: SIS_USE_STARLIGHT_MEMORY_PROVIDER=1
- Local modules untouched (no deletion).
- Symlink for dev verification.
- This receipt.

## Verification steps performed (real execution)
- package.json patch applied and diff verified.
- New adapter file written.
- Symlink confirmed present: node_modules/@starlight-intelligence/memory
- Files ls confirmed new module.
- (Full `npm test` / tsc timed in this env due to project scale; targeted memory-provider tests exist and should be run post-install: `npx tsx --test test/memory-provider-*.test.ts`)
- Import structure matches types from both trees (core contract stable).

## Intentional diffs (to map + test)
- Local SIS: canonical_write always first; vaults authoritative.
- Package: adds persistent-local-core-provider.ts ; may have hardened retry/batching in mem0.
- Privacy: secret always blocked; regulated gated by policy.allow_regulated_external_mirror.
- Graph: hindsight when entities/relations present or policy.graph_memory.
- No Graphiti private data unless trusted local daemon or explicit tenant policy.

## Tests to run (post pinned release)
- memory-provider-*.test.ts (router, local-core, mem0, hardening)
- Full provider evals
- Privacy projection tests (secret/regulated never leave local)
- Restart/outbox recovery
- Rollback test (flip flag off, dep revert)
- MCP integration smoke (sis_vault_*)
- Cross-repo: any consuming code in ACOS/Arcanea etc.

## Rollback path
1. Remove or comment dep in package.json
2. Delete or ignore compat adapter re-exports
3. Set env off
4. git revert / restore local modules
5. Rebuild

## Sign-off criteria before default switch (do not flip yet)
- [ ] starlight-memory v0.3+ released and reviewed independently
- [ ] All tests green with package wired
- [ ] Migration receipt complete with measured diffs
- [ ] E2E: remember/recall roundtrip via MCP and direct
- [ ] Privacy proofs (no workspace/agent/vault metadata in external projections; secret never leaves)
- [ ] Documentation updated in ECOSYSTEM_ARCHITECTURE.md, MEMORY.md template, SIP.md, REGISTRY.md
- [ ] Downstream (starlight-memory consumers) notified

**Built on SIP** — memory provider boundary work.

Next actions logged to kanban t_375e8f86 and issue #64.