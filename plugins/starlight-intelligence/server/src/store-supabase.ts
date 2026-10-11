import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { StarlightError, type WorkspaceAdapter } from "./store.js";
import type { WorkspaceState } from "./types.js";

interface WorkspaceRow {
  revision: number;
  state: WorkspaceState;
}

export class SupabaseWorkspaceAdapter implements WorkspaceAdapter {
  private tenantId: string | undefined;

  constructor(
    private readonly client: SupabaseClient,
    private readonly tenantSlug: string,
  ) {}

  static fromCredentials(options: {
    url: string;
    secretKey: string;
    tenantSlug: string;
  }): SupabaseWorkspaceAdapter {
    const client = createClient(options.url, options.secretKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { "X-Client-Info": "starlight-intelligence-mcp/0.2.0" } },
    });
    return new SupabaseWorkspaceAdapter(client, options.tenantSlug);
  }

  private async resolveTenantId(): Promise<string> {
    if (this.tenantId) return this.tenantId;
    const { data, error } = await this.client
      .from("tenants")
      .select("id")
      .eq("slug", this.tenantSlug)
      .eq("status", "active")
      .single();
    if (error || !data?.id) {
      throw new StarlightError("NOT_FOUND", `Active tenant not found: ${this.tenantSlug}`);
    }
    this.tenantId = String(data.id);
    return this.tenantId;
  }

  async read(): Promise<WorkspaceState> {
    const tenantId = await this.resolveTenantId();
    const { data, error } = await this.client
      .from("starlight_workspaces")
      .select("revision,state")
      .eq("tenant_id", tenantId)
      .single<WorkspaceRow>();
    if (error || !data) {
      throw new StarlightError("NOT_FOUND", `Workspace not found for tenant: ${this.tenantSlug}`);
    }
    if (data.state.revision !== data.revision) {
      throw new StarlightError("VALIDATION", "Workspace row and document revisions do not match.");
    }
    return structuredClone(data.state);
  }

  async write(expectedRevision: number, state: WorkspaceState): Promise<boolean> {
    const tenantId = await this.resolveTenantId();
    const { data, error } = await this.client
      .from("starlight_workspaces")
      .update({ revision: state.revision, state, updated_at: state.workspace.updated_at })
      .eq("tenant_id", tenantId)
      .eq("revision", expectedRevision)
      .select("revision")
      .maybeSingle();
    if (error) throw new Error(`Supabase workspace write failed: ${error.message}`);
    return data?.revision === state.revision;
  }
}
