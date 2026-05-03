// @starlight/schemas — SovereignNode canonical entity type.
// Substrate ratified 2026-05-03 (docs/boards/2026-05-03-calculator-validation-substrate.md).
//
// Replaces ad-hoc tenant / user / instance patterns in infra-touching
// Domain Sub-Stacks. Composable profiles let a single node carry
// energy + compute + storage + workflow + security + cost concerns
// simultaneously.

import { z } from "zod";

import type {
  EnergyProfile,
  ComputeProfile,
  StorageProfile,
  WorkflowProfile,
  SecurityProfile,
  CostProfile,
} from "./profiles";

import {
  EnergyProfileSchema,
  ComputeProfileSchema,
  StorageProfileSchema,
  WorkflowProfileSchema,
  SecurityProfileSchema,
  CostProfileSchema,
} from "./profiles";

export const SovereignNodeKindSchema = z.enum([
  "person",
  "home",
  "family",
  "creator",
  "business",
  "installer",
  "community",
  "studio",
  "retreat",
  "property",
]);

export type SovereignNodeKind = z.infer<typeof SovereignNodeKindSchema>;

export const SovereignNodeMetadataSchema = z.object({
  created: z.string().describe("ISO-8601 date the node was first instantiated"),
  sovereign_owner: z
    .string()
    .describe("Handle / id of the sovereign with decision rights over this node"),
  notes: z.string().optional(),
});

export type SovereignNodeMetadata = z.infer<typeof SovereignNodeMetadataSchema>;

export const SovereignNodeSchema = z.object({
  id: z.string().describe("Stable, instance-private identifier for this node"),
  kind: SovereignNodeKindSchema,
  profiles: z
    .object({
      energy: EnergyProfileSchema.optional(),
      compute: ComputeProfileSchema.optional(),
      storage: StorageProfileSchema.optional(),
      workflow: WorkflowProfileSchema.optional(),
      security: SecurityProfileSchema.optional(),
      cost: CostProfileSchema.optional(),
    })
    .describe("Composable trait profiles. A node may opt into any combination."),
  metadata: SovereignNodeMetadataSchema,
});

export type SovereignNode = z.infer<typeof SovereignNodeSchema>;

// Convenience constructor — validates + freezes.
export function makeSovereignNode(input: SovereignNode): SovereignNode {
  return Object.freeze(SovereignNodeSchema.parse(input));
}
