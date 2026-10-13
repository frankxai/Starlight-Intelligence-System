import { z } from "zod";

export const ConnectionDetailsSchema = z.object({
  serverUrl: z.string().url(),
  roomName: z.string().min(1),
  participantToken: z.string().min(1),
  participantName: z.string(),
  expiresAt: z.number().int().positive(),
});

export type ConnectionDetails = z.infer<typeof ConnectionDetailsSchema>;
