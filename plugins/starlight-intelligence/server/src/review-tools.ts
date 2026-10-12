import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { getAgentInterfaces, prepareReviewHandoff } from "./review-handoff.mjs";

function result(message: string, structuredContent: Record<string, unknown>) {
  return { structuredContent, content: [{ type: "text" as const, text: message }] };
}

export function registerReviewTools(server: McpServer): void {
  server.registerTool(
    "get_agent_interfaces",
    {
      title: "Inspect agent interfaces",
      description: "Read dated public native-interface references. This catalog does not establish runtime connections, authorization or admission.",
      inputSchema: z.object({}).strict(),
      outputSchema: z.object({ catalog: z.unknown() }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async () => result("Interface reference catalog; runtime connections not evaluated.", { catalog: getAgentInterfaces() }),
  );
  server.registerTool(
    "prepare_review_handoff",
    {
      title: "Prepare a pinned code review",
      description: "Prepare an expiring read-only Claude GitHub, cloud or local handoff. No dispatch, admission, queue write or permission grant. The executor must verify the owner, source revisions, expiry and worker binding independently.",
      inputSchema: z.object({
        repository: z.string().min(3).max(200),
        pull_request: z.number().int().min(1).max(2147483647),
        base_sha: z.string().regex(/^[0-9a-f]{40}$/),
        head_sha: z.string().regex(/^[0-9a-f]{40}$/),
        reviewer: z.enum(["claude-github", "claude-cloud", "claude-local"]),
        max_minutes: z.number().int().min(1).max(25),
        focus: z.array(z.string().min(1).max(500)).min(1).max(10),
      }).strict(),
      outputSchema: z.object({ preparation: z.unknown() }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async (input) => {
      try {
        return result("Review prepared; authorization and pinned-source verification remain unevaluated. Keep outside the live inbox.", {
          preparation: prepareReviewHandoff(input),
        });
      } catch (error) {
        return { isError: true, content: [{ type: "text" as const, text: "Invalid review preparation input." }] };
      }
    },
  );
}

