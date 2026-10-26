-- Migration: 0001_init_memory_atoms.sql
-- Target D1 Database: starlight-production-db (175513dc-1a47-4ba3-961f-78c54603af16)
-- Worker: starlight-cloud-worker (services/starlight-cloud-worker/src/index.ts)
-- Apply locally:  npx wrangler d1 migrations apply starlight-production-db --local
-- Apply remotely: npx wrangler d1 migrations apply starlight-production-db --remote (requires human gate)

CREATE TABLE IF NOT EXISTS memory_atoms (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('strategic', 'technical', 'creative', 'operational', 'wisdom', 'horizon')),
  namespace TEXT NOT NULL DEFAULT 'global',
  content TEXT NOT NULL,
  metadata TEXT NOT NULL DEFAULT '{}',
  tags TEXT NOT NULL DEFAULT '[]',
  is_encrypted INTEGER NOT NULL DEFAULT 0,
  half_life_days INTEGER NOT NULL DEFAULT 90,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_memory_atoms_tenant_created
  ON memory_atoms (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_memory_atoms_tenant_tier_ns
  ON memory_atoms (tenant_id, tier, namespace, created_at DESC);

CREATE TABLE IF NOT EXISTS swarm_leases (
  lease_key TEXT PRIMARY KEY,
  lease_token TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  scope TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_swarm_leases_tenant_expires
  ON swarm_leases (tenant_id, expires_at);

