import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import catalog from "./capabilities.json";

export const brandSchema = z.enum(["starlight", "gencreator", "arcanea", "frankx"]);
export const catalogInput = z.object({ brand: brandSchema.optional(), query: z.string().trim().max(200).optional() }).strict();
export const workflowInput = z.object({
  workflow_id: z.enum(["visual-release", "creator-edition", "world-production", "learn-build"]),
  brand: brandSchema,
  title: z.string().trim().min(1).max(160).optional(),
}).strict();

export function getCapabilityCatalog(input: z.infer<typeof catalogInput> = {}) {
  const parsed = catalogInput.parse(input);
  const query = parsed.query?.toLowerCase() ?? "";
  return {
    ...catalog,
    capabilities: catalog.capabilities.filter((item) => (!parsed.brand || item.brand === parsed.brand) &&
      (!query || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query))),
    workflows: catalog.workflows.filter((item) => !parsed.brand || item.brands.includes(parsed.brand)),
  };
}

export function prepareConnectedWorkflow(input: z.infer<typeof workflowInput>) {
  const parsed = workflowInput.parse(input);
  const workflow = catalog.workflows.find((item) => item.id === parsed.workflow_id)!;
  if (!workflow.brands.includes(parsed.brand)) throw new Error("This workflow does not support the selected brand.");
  return {
    format: "starlight.workflow_packet.v1",
    state: "prepared",
    executes: false,
    title: parsed.title ?? workflow.name,
    brand: parsed.brand,
    source_revision: catalog.revision,
    observed_at: catalog.observed_at,
    workflow,
    capabilities: catalog.capabilities.filter((item) => workflow.capability_ids.includes(item.id)),
    source_receipts: catalog.sources,
    evidence: Object.fromEntries(workflow.evidence_fields.map((field) => [field, null])),
    next_action: workflow.stages[0],
    authority: "Use the user's existing scope and account permissions for actual work. This packet performs no provider action.",
  };
}

export function registerConnectedTools(server: McpServer): void {
  const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
  server.registerTool("get_capability_catalog", {
    title: "Explore connected capabilities",
    description: "Find source-backed Starlight and creator capabilities, their setup requirements, and cross-brand workflow references. Catalog entries are observations, not live account connections.",
    inputSchema: catalogInput, outputSchema: z.object({ catalog: z.unknown() }), annotations,
  }, async (input) => ({ content: [{ type: "text", text: "Connected capability references and setup requirements." }], structuredContent: { catalog: getCapabilityCatalog(input) } }));
  server.registerTool("prepare_connected_workflow", {
    title: "Prepare a connected workflow",
    description: "Prepare a brand-scoped workflow packet with stages, required connections, evidence fields, and acceptance criteria. This performs no external action.",
    inputSchema: workflowInput, outputSchema: z.object({ packet: z.unknown() }), annotations,
  }, async (input) => {
    try { return { content: [{ type: "text", text: "Workflow prepared. Resolve current source before execution." }], structuredContent: { packet: prepareConnectedWorkflow(input) } }; }
    catch { return { isError: true, content: [{ type: "text", text: "The workflow and brand combination is unsupported." }] }; }
  });
}
