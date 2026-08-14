import projection from "@/data/constellation-protocol.public.json";

export type ProtocolAgent = {
  id: string;
  display_name: string;
  role_title: string;
  role_kind: "conductor" | "specialist";
  status: string;
  skill_refs: string[];
  capabilities: string[];
  non_capabilities: string[];
  stop_conditions: string[];
  escalation_conditions: string[];
  graph: {
    depends_on: string[];
    routes_to: string[];
  };
  receipts: {
    card_sha256: string;
    prompt_sha256: string;
    eval_sha256: string;
  };
  visual: {
    href: string;
    sha256: string;
    width: number;
    height: number;
    inspection_status: string;
    rights_status: string;
  };
  profile_url: string;
};

export type ProtocolHouse = {
  id: string;
  name: string;
  purpose: string;
  lead_agent_id: string;
  shared_stop_conditions: string[];
  shared_escalation_conditions: string[];
  agents: ProtocolAgent[];
};

export type PackagingRecord = {
  primitive: string;
  state: string;
  artifact: string | null;
  authority: string;
};

export type ConstellationProtocolProjection = {
  schema_version: string;
  generated_on: string;
  status: string;
  truth_contract: {
    website_is_projection: boolean;
    grants_authority: boolean;
    private_memory_included: boolean;
    live_eval_status: string;
    runtime_install_status: string;
    claim: string;
  };
  source: {
    canonical_repository: string;
    canonical_commit: string;
    canonical_catalog_sha256: string;
    public_projection_sha256: string;
    public_release_sha256: string;
    capability_pack_digest: string;
    visual_manifest_sha256: string;
  };
  counts: {
    swarms: number;
    agents: number;
    cards: number;
    prompt_contracts: number;
    eval_suites: number;
    graph_edges: number;
    capability_packs: number;
  };
  packaging_ledger: PackagingRecord[];
  trust_chain: string[];
  houses: ProtocolHouse[];
};

export const constellationProtocol =
  projection as ConstellationProtocolProjection;

export const compactDigest = (digest: string) =>
  digest.replace("sha256:", "").slice(0, 12);

export const readableToken = (value: string) =>
  value.replaceAll("_", " ").replaceAll("-", " ");
