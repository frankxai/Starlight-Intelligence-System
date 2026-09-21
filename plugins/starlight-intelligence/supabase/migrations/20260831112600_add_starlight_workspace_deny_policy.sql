begin;

create policy starlight_workspaces_deny_client_access
on public.starlight_workspaces
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

comment on policy starlight_workspaces_deny_client_access on public.starlight_workspaces is
  'Explicit deny-all policy: Starlight workspace state is available only through the authenticated MCP backend.';

commit;
