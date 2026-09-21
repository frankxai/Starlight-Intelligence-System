import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import commandCenterHtml from "../../web/dist/component.html";
import commandCenterSkill from "../../skills/starlight-command-center/SKILL.md";
import decisionSkill from "../../skills/starlight-decision-ledger/SKILL.md";
import executionSkill from "../../skills/starlight-execution/SKILL.md";
import knowledgeSkill from "../../skills/starlight-knowledge/SKILL.md";
import { StarlightError, StarlightStore } from "./store.js";
import type { RecordType } from "./types.js";

const TEMPLATE_URI = "ui://starlight/command-center/v2.html";
const RESOURCE_MIME_TYPE = "text/html;profile=mcp-app";

interface ActorContext {
  id: string;
  email: string;
  name?: string;
}

interface SkillDefinition {
  name: string;
  description: string;
  uri: string;
  text: string;
}

const SKILLS: SkillDefinition[] = [
  {
    name: "starlight-command-center",
    description:
      "Inspect a venture portfolio, identify operating pressure, and render a Starlight command center when the user asks for status, priorities, risks, or a visual operating view.",
    uri: "skill://starlight-intelligence/starlight-command-center/SKILL.md",
    text: commandCenterSkill,
  },
  {
    name: "starlight-decision-ledger",
    description:
      "Preserve a consequential venture decision, its tradeoffs, owner, review date, and supporting evidence when the user asks to decide, approve, reject, document, or audit a decision.",
    uri: "skill://starlight-intelligence/starlight-decision-ledger/SKILL.md",
    text: decisionSkill,
  },
  {
    name: "starlight-execution",
    description:
      "Convert objectives into governed work items and move existing work through explicit states when the user asks to plan, assign, start, block, complete, or cancel execution.",
    uri: "skill://starlight-intelligence/starlight-execution/SKILL.md",
    text: executionSkill,
  },
  {
    name: "starlight-knowledge",
    description:
      "Retrieve records from the Starlight operating graph when the user asks what is known about a venture, objective, work item, decision, or piece of evidence.",
    uri: "skill://starlight-intelligence/starlight-knowledge/SKILL.md",
    text: knowledgeSkill,
  },
];

function textResult(message: string, structuredContent?: Record<string, unknown>) {
  return {
    ...(structuredContent ? { structuredContent } : {}),
    content: [{ type: "text" as const, text: message }],
  };
}

function errorResult(error: unknown) {
  const code = error instanceof StarlightError ? error.code : "INTERNAL";
  const message = error instanceof Error ? error.message : String(error);
  return {
    isError: true,
    content: [{ type: "text" as const, text: `${code}: ${message}` }],
  };
}

function actorLabel(actor: ActorContext): string {
  return actor.name ? `${actor.name} <${actor.email}>` : actor.email;
}

function registerDataTools(server: McpServer, store: StarlightStore, actor: ActorContext): void {
  server.registerTool(
    "get_portfolio_snapshot",
    {
      title: "Get portfolio snapshot",
      description:
        "Read the authoritative venture portfolio state. Call this before analyzing status or rendering the command center.",
      inputSchema: z.object({
        venture_ids: z.array(z.string()).max(25).optional(),
        include_closed: z.boolean().default(false),
      }),
      outputSchema: z.object({ snapshot: z.unknown() }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: {
        "openai/toolInvocation/invoking": "Reading the portfolio…",
        "openai/toolInvocation/invoked": "Portfolio snapshot ready.",
      },
    },
    async ({ venture_ids, include_closed }) => {
      try {
        const snapshot = await store.getSnapshot({ venture_ids, include_closed });
        return textResult(
          `Portfolio revision ${snapshot.revision}: ${snapshot.summary.ventures} ventures, ${snapshot.summary.active_work} active work items, ${snapshot.summary.blocked_work} blocked.`,
          { snapshot },
        );
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "search_workspace",
    {
      title: "Search workspace",
      description: "Find ventures, objectives, work items, decisions, or evidence in the Starlight operating graph.",
      inputSchema: z.object({
        query: z.string().trim().min(1).max(500),
        venture_id: z.string().optional(),
        types: z
          .array(z.enum(["venture", "objective", "work_item", "decision", "evidence"]))
          .max(5)
          .optional(),
        limit: z.number().int().min(1).max(25).default(10),
      }),
      outputSchema: z.object({ results: z.array(z.unknown()) }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ query, venture_id, types, limit }) => {
      try {
        const results = await store.search({ query, venture_id, types, limit });
        return textResult(`Found ${results.length} matching records.`, { results });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "get_record",
    {
      title: "Get record",
      description: "Fetch one authoritative Starlight record by its stable ID before citing or changing it.",
      inputSchema: z.object({ id: z.string().min(1).max(200) }),
      outputSchema: z.object({ type: z.string(), record: z.unknown(), venture_id: z.string().optional() }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ id }) => {
      try {
        const result = await store.getRecord(id);
        return textResult(`Fetched ${result.type} ${id}.`, result as unknown as Record<string, unknown>);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "search",
    {
      title: "Search Starlight knowledge",
      description: "Search the private Starlight operating graph for company-knowledge retrieval.",
      inputSchema: z.object({ query: z.string().min(1).max(500) }),
      outputSchema: z.object({
        results: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            text: z.string(),
            url: z.string().url().optional(),
          }),
        ),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ query }) => {
      try {
        const matches = await store.search({ query, limit: 10 });
        const results = matches.map((match) => ({
          id: match.id,
          title: match.title,
          text: `${match.type}: ${match.snippet}`,
          ...(match.source_url ? { url: match.source_url } : {}),
        }));
        return textResult(`Found ${results.length} Starlight knowledge results.`, { results });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "fetch",
    {
      title: "Fetch Starlight knowledge",
      description: "Fetch one private Starlight record returned by search.",
      inputSchema: z.object({ id: z.string().min(1).max(200) }),
      outputSchema: z.object({
        id: z.string(),
        title: z.string(),
        text: z.string(),
        url: z.string().url().optional(),
        metadata: z.record(z.string(), z.unknown()),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ id }) => {
      try {
        const fetched = await store.getRecord(id);
        const record = fetched.record as Record<string, unknown>;
        const result = {
          id,
          title: String(record.title ?? record.name ?? id),
          text: JSON.stringify(record, null, 2),
          ...(typeof record.source_url === "string" ? { url: record.source_url } : {}),
          metadata: { type: fetched.type, ...(fetched.venture_id ? { venture_id: fetched.venture_id } : {}) },
        };
        return textResult(`Fetched ${fetched.type} ${id}.`, result);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "create_work_item",
    {
      title: "Create work item",
      description: "Create one accountable work item inside an existing venture and optional objective.",
      inputSchema: z.object({
        venture_id: z.string(),
        objective_id: z.string().optional(),
        title: z.string().min(3).max(240),
        description: z.string().max(4000).optional(),
        owner: z.string().min(1).max(160),
        priority: z.enum(["low", "medium", "high", "critical"]),
        due_date: z.iso.date().optional(),
        dependencies: z.array(z.string()).max(25).optional(),
      }),
      outputSchema: z.object({ work_item: z.unknown(), revision: z.number().int() }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
      _meta: {
        "openai/toolInvocation/invoking": "Creating governed work…",
        "openai/toolInvocation/invoked": "Work item created.",
      },
    },
    async (input) => {
      try {
        const result = await store.createWorkItem({ ...input, actor: actorLabel(actor) });
        return textResult(
          `Created ${result.work_item.id} in ${result.work_item.status} at portfolio revision ${result.revision}.`,
          result as unknown as Record<string, unknown>,
        );
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "transition_work_item",
    {
      title: "Transition work item",
      description:
        "Move an existing work item to a new state using optimistic concurrency. done and cancelled require explicit user confirmation.",
      inputSchema: z.object({
        work_item_id: z.string(),
        expected_version: z.number().int().min(1),
        status: z.enum(["backlog", "ready", "in_progress", "blocked", "done", "cancelled"]),
        rationale: z.string().min(3).max(1000),
        user_confirmed: z.boolean().default(false),
      }),
      outputSchema: z.object({ work_item: z.unknown(), revision: z.number().int() }),
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
      _meta: {
        "openai/toolInvocation/invoking": "Transitioning work…",
        "openai/toolInvocation/invoked": "Work state updated.",
      },
    },
    async (input) => {
      try {
        const result = await store.transitionWorkItem({ ...input, actor: actorLabel(actor) });
        return textResult(
          `${result.work_item.id} is now ${result.work_item.status} at version ${result.work_item.version}.`,
          result as unknown as Record<string, unknown>,
        );
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "record_decision",
    {
      title: "Record decision",
      description:
        "Record a venture decision with context, tradeoffs, ownership, evidence, and review date. approved and rejected require explicit confirmation.",
      inputSchema: z.object({
        venture_id: z.string(),
        title: z.string().min(3).max(240),
        context: z.string().min(3).max(8000),
        decision: z.string().min(3).max(4000),
        tradeoffs: z.array(z.string().max(1000)).max(20).optional(),
        owner: z.string().min(1).max(160),
        status: z.enum(["proposed", "approved", "rejected", "superseded"]),
        evidence_ids: z.array(z.string()).max(50).optional(),
        review_date: z.iso.date().optional(),
        user_confirmed: z.boolean().default(false),
      }),
      outputSchema: z.object({ decision: z.unknown(), revision: z.number().int() }),
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
      _meta: {
        "openai/toolInvocation/invoking": "Writing the decision ledger…",
        "openai/toolInvocation/invoked": "Decision recorded.",
      },
    },
    async (input) => {
      try {
        const result = await store.recordDecision({ ...input, actor: actorLabel(actor) });
        return textResult(
          `Recorded ${result.decision.id} as ${result.decision.status} at revision ${result.revision}.`,
          result as unknown as Record<string, unknown>,
        );
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "register_evidence",
    {
      title: "Register evidence",
      description: "Register a source, document, metric, or observation and link it to existing decisions.",
      inputSchema: z.object({
        venture_id: z.string(),
        title: z.string().min(3).max(240),
        source_type: z.enum(["url", "document", "metric", "observation"]),
        source_url: z.url().optional(),
        note: z.string().max(8000).optional(),
        supports_decision_ids: z.array(z.string()).max(50).optional(),
        captured_at: z.iso.datetime().optional(),
      }),
      outputSchema: z.object({ evidence: z.unknown(), revision: z.number().int() }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
      _meta: {
        "openai/toolInvocation/invoking": "Registering evidence…",
        "openai/toolInvocation/invoked": "Evidence registered.",
      },
    },
    async (input) => {
      try {
        const result = await store.registerEvidence({ ...input, actor: actorLabel(actor) });
        return textResult(
          `Registered ${result.evidence.id} at revision ${result.revision}.`,
          result as unknown as Record<string, unknown>,
        );
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}

function registerCommandCenter(server: McpServer, store: StarlightStore): void {
  server.registerResource(
    "Starlight Command Center",
    TEMPLATE_URI,
    {
      title: "Starlight Command Center",
      description: "Interactive portfolio posture, work pressure, and decision ledger.",
      mimeType: RESOURCE_MIME_TYPE,
      _meta: {
        ui: {
          prefersBorder: false,
          domain: "https://mcp.starlightintelligence.ai",
          csp: { connectDomains: [], resourceDomains: [] },
        },
      },
    },
    async () => ({
      contents: [{ uri: TEMPLATE_URI, mimeType: RESOURCE_MIME_TYPE, text: commandCenterHtml }],
    }),
  );

  server.registerTool(
    "render_command_center",
    {
      title: "Render command center",
      description:
        "Render a fresh authoritative portfolio snapshot. Optional venture filters narrow the view; caller-supplied snapshots are ignored.",
      inputSchema: z.object({
        snapshot: z.unknown().optional(),
        venture_ids: z.array(z.string()).max(25).optional(),
        include_closed: z.boolean().default(false),
      }),
      outputSchema: z.object({ snapshot: z.unknown() }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: {
        ui: { resourceUri: TEMPLATE_URI },
        "openai/outputTemplate": TEMPLATE_URI,
        "openai/toolInvocation/invoking": "Composing the command center…",
        "openai/toolInvocation/invoked": "Command center ready.",
      },
    },
    async ({ venture_ids, include_closed }) => {
      try {
        const validated = await store.getRenderSnapshot({ venture_ids, include_closed });
        return textResult(`Rendering Starlight portfolio revision ${validated.revision}.`, { snapshot: validated });
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return `sha256:${Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

async function skillEntry(skill: SkillDefinition) {
  return {
    uri: skill.uri,
    frontmatter: { name: skill.name, description: skill.description },
    resources: [{ uri: skill.uri, digest: await sha256(skill.text) }],
  };
}

function registerSkills(server: McpServer): void {
  for (const skill of SKILLS) {
    server.registerResource(
      `${skill.name} skill`,
      skill.uri,
      { title: skill.name, description: skill.description, mimeType: "text/markdown" },
      async () => ({ contents: [{ uri: skill.uri, mimeType: "text/markdown", text: skill.text }] }),
    );
  }

  const resourceSchema = z.object({ uri: z.string(), digest: z.string() });
  const entrySchema = z.object({
    uri: z.string(),
    frontmatter: z.record(z.string(), z.string()),
    resources: z.array(resourceSchema),
  });
  server.server.setRequestHandler(
    "skills/list",
    {
      params: z.object({ cursor: z.string().optional() }),
      result: z.object({ skills: z.array(entrySchema), nextCursor: z.string().optional() }),
    },
    async ({ cursor }) => ({ skills: cursor ? [] : await Promise.all(SKILLS.map(skillEntry)) }),
  );
  server.server.setRequestHandler(
    "skills/get",
    {
      params: z.object({ uri: z.string() }),
      result: z.object({ skill: entrySchema }),
    },
    async ({ uri }) => {
      const skill = SKILLS.find((candidate) => candidate.uri === uri);
      if (!skill) throw new StarlightError("NOT_FOUND", `Unknown skill: ${uri}`);
      return { skill: await skillEntry(skill) };
    },
  );
}

export function createStarlightServer(options: {
  store: StarlightStore;
  actor: ActorContext;
}): McpServer {
  const server = new McpServer(
    { name: "starlight-intelligence", version: "0.2.0" },
    {
      instructions:
        "Read authoritative state before mutation. Fetch an existing record before changing it and preserve its version. Terminal work states and approved/rejected decisions require explicit user confirmation. Use get_portfolio_snapshot to analyze state; render_command_center re-reads authoritative data using the same venture filters. Never infer completion, approval, or evidence.",
      capabilities: {
        extensions: { "io.modelcontextprotocol/skills": {} },
      } as never,
    },
  );
  registerDataTools(server, options.store, options.actor);
  registerCommandCenter(server, options.store);
  registerSkills(server);
  return server;
}

export const starlightToolNames = [
  "get_portfolio_snapshot",
  "search_workspace",
  "get_record",
  "search",
  "fetch",
  "create_work_item",
  "transition_work_item",
  "record_decision",
  "register_evidence",
  "render_command_center",
] as const;

export type StarlightRecordType = RecordType;
