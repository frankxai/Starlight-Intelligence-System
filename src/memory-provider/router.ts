import type { ProviderRoute, SISMemoryRecord, TenantMemoryPolicy } from "./types.js";

const LOCAL_CORE_ROUTE: ProviderRoute = {
  provider: "local_core",
  mode: "canonical_write",
  reason: "SIS canonical event log and vaults are always authoritative",
};

function isExternallyBlocked(record: SISMemoryRecord, policy: TenantMemoryPolicy): boolean {
  if (record.privacy_class === "secret") return true;
  if (record.privacy_class === "regulated" && !policy.allow_regulated_external_mirror) return true;
  return false;
}

function hasGraphShape(record: SISMemoryRecord): boolean {
  return record.entities.length > 0 || record.relations.length > 0;
}

export function routeMemoryRecord(record: SISMemoryRecord, policy: TenantMemoryPolicy): ProviderRoute[] {
  const routes: ProviderRoute[] = [LOCAL_CORE_ROUTE];

  if (isExternallyBlocked(record, policy)) return routes;

  if (policy.local_only) {
    routes.push({
      provider: policy.local_provider ?? "holographic",
      mode: "derived_local_write",
      reason: "Tenant policy requires local-only derived memory after SIS canonical write",
    });
    return routes;
  }

  if (policy.local_compositional_recall) {
    routes.push({
      provider: policy.local_provider ?? "holographic",
      mode: "derived_local_write",
      reason: "Local compositional recall/trust scoring requested",
    });
  }

  if (policy.knowledge_browsing) {
    routes.push({
      provider: "openviking",
      mode: "derived_local_write",
      reason: "Tiered self-hosted knowledge browsing requested",
    });
  }

  if (policy.developer_cli_memory) {
    routes.push({
      provider: "byterover",
      mode: "derived_local_write",
      reason: "Developer CLI memory requested behind SIS gateway",
    });
  }

  if (policy.default_cloud_memory) {
    routes.push({
      provider: policy.default_cloud_memory,
      mode: "redacted_fact_write",
      reason: "Policy allows default cloud memory mirror after redaction/summarization",
    });
  }

  if (policy.graph_memory || hasGraphShape(record)) {
    routes.push({
      provider: "hindsight",
      mode: "graph_projection",
      reason: "Entity/relation shape benefits from graph recall and reflection",
    });
  }

  if (policy.enterprise_connectors) {
    routes.push({
      provider: "supermemory",
      mode: "document_or_session_ingest",
      reason: "Enterprise connector/session-graph context requested",
    });
  }

  if (policy.peer_modeling) {
    routes.push({
      provider: "honcho",
      mode: "peer_observation",
      reason: "Peer/user modeling requested for multi-agent alignment",
    });
  }

  return dedupeRoutes(routes);
}

function dedupeRoutes(routes: ProviderRoute[]): ProviderRoute[] {
  const seen = new Set<string>();
  const out: ProviderRoute[] = [];
  for (const route of routes) {
    const key = `${route.provider}:${route.mode}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(route);
  }
  return out;
}
