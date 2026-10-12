import { z } from "zod";

/**
 * Universal event envelope for Starlight Operator ACP runs.
 * Guarantees that credentials are never embedded in the event stream.
 */
export const EventEnvelopeSchema = z.object({
  runId: z.string().uuid(),
  providerSessionId: z.string(),
  sequence: z.number().int().nonnegative(),
  timestamp: z.string().datetime(),
  capability: z.enum([
    "session.start",
    "session.stream",
    "session.approve",
    "session.cancel",
    "session.resume",
    "session.artifacts",
    "tool.call",
    "tool.result",
    "turn.complete",
    "error"
  ]),
  status: z.enum([
    "disconnected",
    "connecting",
    "ready",
    "listening",
    "processing",
    "approval_required",
    "cancelled",
    "failed",
    "completed"
  ]),
  permissionRequestId: z.string().optional(),
  payload: z.record(z.unknown()).default({}),
  artifactReferences: z.array(z.string()).default([]),
});

export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;

export interface PermissionRequest {
  id: string;
  runId: string;
  toolName: string;
  arguments: Record<string, unknown>;
  reason?: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}
