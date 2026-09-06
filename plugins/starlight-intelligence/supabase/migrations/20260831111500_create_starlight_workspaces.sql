begin;

create table if not exists public.starlight_workspaces (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  revision bigint not null check (revision >= 1),
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint starlight_workspaces_schema_version_check
    check ((state ->> 'schema_version')::integer = 1),
  constraint starlight_workspaces_revision_matches_state_check
    check ((state ->> 'revision')::bigint = revision)
);

comment on table public.starlight_workspaces is
  'Tenant-scoped authoritative state for the Starlight Intelligence cloud plugin; server-mediated only.';

alter table public.starlight_workspaces enable row level security;
alter table public.starlight_workspaces force row level security;

revoke all on table public.starlight_workspaces from anon, authenticated;
grant select, insert, update on table public.starlight_workspaces to service_role;

insert into public.tenants (slug, display_name, status)
values ('starlight-intelligence', 'Starlight Intelligence', 'active')
on conflict (slug) do update
set display_name = excluded.display_name,
    status = 'active',
    updated_at = now();

insert into public.starlight_workspaces (tenant_id, revision, state)
select
  id,
  1,
  $workspace$
  {
    "schema_version": 1,
    "revision": 1,
    "workspace": {
      "id": "workspace_starlight",
      "name": "Starlight Venture System",
      "doctrine": "Evidence before certainty. One accountable owner. Humans approve consequential state transitions.",
      "created_at": "2026-08-31T00:00:00.000Z",
      "updated_at": "2026-08-31T00:00:00.000Z"
    },
    "ventures": [
      {
        "id": "venture_starlight",
        "name": "Starlight Intelligence",
        "kind": "Venture operating system",
        "mission": "Make multi-venture intelligence governable, inspectable, and executable.",
        "status": "active",
        "health": "clear",
        "version": 1,
        "metrics": [
          { "key": "validated_workflows", "label": "Validated workflows", "value": 4, "unit": "flows", "target": 8, "trend": "up" },
          { "key": "evidence_coverage", "label": "Evidence coverage", "value": 72, "unit": "%", "target": 90, "trend": "up" }
        ],
        "objectives": [
          {
            "id": "objective_plugin_v1",
            "title": "Ship a credible universal Starlight plugin",
            "owner": "Founder",
            "status": "active",
            "progress": 62,
            "due_date": "2026-09-15"
          }
        ],
        "created_at": "2026-08-31T00:00:00.000Z",
        "updated_at": "2026-08-31T00:00:00.000Z"
      },
      {
        "id": "venture_frankx",
        "name": "FrankX",
        "kind": "Founder intelligence and education",
        "mission": "Turn frontier AI architecture into trusted public intelligence and products.",
        "status": "active",
        "health": "watch",
        "version": 1,
        "metrics": [
          { "key": "published_systems", "label": "Published systems", "value": 12, "unit": "assets", "target": 20, "trend": "up" },
          { "key": "monthly_revenue", "label": "Monthly revenue", "value": 1000, "unit": "EUR", "target": 10000, "trend": "flat" }
        ],
        "objectives": [
          {
            "id": "objective_authority_engine",
            "title": "Convert architectural depth into a compounding authority engine",
            "owner": "Founder",
            "status": "at_risk",
            "progress": 38,
            "due_date": "2026-09-30"
          }
        ],
        "created_at": "2026-08-31T00:00:00.000Z",
        "updated_at": "2026-08-31T00:00:00.000Z"
      },
      {
        "id": "venture_arcanea",
        "name": "Arcanea",
        "kind": "World, IP, and co-creation studio",
        "mission": "Build a living mythic universe across story, music, learning, and community.",
        "status": "active",
        "health": "watch",
        "version": 1,
        "metrics": [
          { "key": "canonical_entities", "label": "Canonical entities", "value": 84, "unit": "entities", "target": 120, "trend": "up" },
          { "key": "released_experiences", "label": "Released experiences", "value": 3, "unit": "releases", "target": 10, "trend": "flat" }
        ],
        "objectives": [
          {
            "id": "objective_canonical_release",
            "title": "Release one canonical cross-media Arcanea experience",
            "owner": "Founder",
            "status": "active",
            "progress": 31,
            "due_date": "2026-10-31"
          }
        ],
        "created_at": "2026-08-31T00:00:00.000Z",
        "updated_at": "2026-08-31T00:00:00.000Z"
      }
    ],
    "work_items": [
      {
        "id": "work_plugin_contract",
        "venture_id": "venture_starlight",
        "objective_id": "objective_plugin_v1",
        "title": "Validate plugin manifest, skills, tools, and MCP Apps resource",
        "description": "Produce a cloud-hosted package with a headless tool surface and decoupled command-center render.",
        "owner": "AI Architecture",
        "status": "in_progress",
        "priority": "critical",
        "due_date": "2026-09-02",
        "dependencies": [],
        "version": 1,
        "created_at": "2026-08-31T00:00:00.000Z",
        "updated_at": "2026-08-31T00:00:00.000Z"
      },
      {
        "id": "work_remote_auth",
        "venture_id": "venture_starlight",
        "objective_id": "objective_plugin_v1",
        "title": "Connect Cloudflare Access Managed OAuth",
        "owner": "Founder",
        "status": "ready",
        "priority": "high",
        "dependencies": ["work_plugin_contract"],
        "version": 1,
        "created_at": "2026-08-31T00:00:00.000Z",
        "updated_at": "2026-08-31T00:00:00.000Z"
      },
      {
        "id": "work_launch_narrative",
        "venture_id": "venture_frankx",
        "objective_id": "objective_authority_engine",
        "title": "Publish the Starlight plugin architecture narrative",
        "owner": "FrankX Editorial",
        "status": "ready",
        "priority": "high",
        "dependencies": ["work_plugin_contract"],
        "version": 1,
        "created_at": "2026-08-31T00:00:00.000Z",
        "updated_at": "2026-08-31T00:00:00.000Z"
      }
    ],
    "decisions": [
      {
        "id": "decision_plugin_shape",
        "venture_id": "venture_starlight",
        "title": "Use skills plus MCP plus selective UI",
        "context": "Starlight needs reusable reasoning, controlled state, and an inspectable portfolio surface across ChatGPT and Codex.",
        "decision": "Package focused skills with a governed MCP server; attach UI only to the final command-center render tool.",
        "tradeoffs": [
          "More surface area than a skills-only release",
          "Production publication requires a stable HTTPS MCP endpoint and user authorization"
        ],
        "owner": "Founder",
        "status": "approved",
        "evidence_ids": ["evidence_openai_architecture"],
        "review_date": "2026-10-01",
        "version": 1,
        "created_at": "2026-08-31T00:00:00.000Z",
        "updated_at": "2026-08-31T00:00:00.000Z"
      }
    ],
    "evidence": [
      {
        "id": "evidence_openai_architecture",
        "venture_id": "venture_starlight",
        "title": "OpenAI plugin architecture and MCP Apps guidance",
        "source_type": "url",
        "source_url": "https://developers.openai.com/plugins/concepts/plugin-architecture",
        "note": "Skills encode repeatable workflows; MCP provides controlled tools and state; UI is reserved for inspection, comparison, editing, confirmation, or navigation.",
        "supports_decision_ids": ["decision_plugin_shape"],
        "captured_at": "2026-08-31T00:00:00.000Z",
        "version": 1,
        "created_at": "2026-08-31T00:00:00.000Z",
        "updated_at": "2026-08-31T00:00:00.000Z"
      }
    ],
    "audit_events": []
  }
  $workspace$::jsonb
from public.tenants
where slug = 'starlight-intelligence'
on conflict (tenant_id) do nothing;

commit;
