// @starlight/schemas — Composable profile shapes for SovereignNode.
// Each profile has explicit inputs/assumptions/provenance so any derived
// calculation has a traceable origin (per the calculator pattern at
// @starlight/calculators).

import { z } from "zod";

const ProvenanceSchema = z.object({
  source: z.string().describe("Where the profile values came from (user input, calculator, integration)"),
  recorded_at: z.string().describe("ISO-8601 timestamp when the values were captured"),
  confidence: z.enum(["high", "medium", "low"]).optional(),
});

// ── EnergyProfile ──
export const EnergyProfileSchema = z.object({
  annual_demand_kwh: z.number().nonnegative().optional(),
  peak_demand_kw: z.number().nonnegative().optional(),
  generation: z
    .object({
      source: z.enum(["solar_pv", "wind", "thermal", "grid_only", "mixed"]),
      capacity_kw: z.number().nonnegative().optional(),
      annual_yield_kwh: z.number().nonnegative().optional(),
    })
    .optional(),
  storage: z
    .object({
      capacity_kwh: z.number().nonnegative(),
      depth_of_discharge: z.number().min(0).max(1).optional(),
      chemistry: z.string().optional(),
    })
    .optional(),
  grid: z
    .object({
      connected: z.boolean(),
      tariff_eur_per_kwh: z.number().nonnegative().optional(),
      feed_in_eur_per_kwh: z.number().nonnegative().optional(),
      jurisdiction: z.string().describe("Country/region code, e.g. 'DE-BY' or 'US-CA'"),
    })
    .optional(),
  assumptions: z.array(z.string()).default([]),
  provenance: ProvenanceSchema,
});
export type EnergyProfile = z.infer<typeof EnergyProfileSchema>;

// ── ComputeProfile ──
export const ComputeProfileSchema = z.object({
  cpu: z.object({ class: z.string(), cores: z.number().int().positive() }).optional(),
  gpu: z
    .object({
      class: z.string(),
      vram_gb: z.number().nonnegative(),
      count: z.number().int().positive().default(1),
    })
    .optional(),
  ram_gb: z.number().int().nonnegative().optional(),
  cloud_accounts: z.array(z.string()).default([]),
  quotas: z.record(z.string(), z.number()).optional(),
  assumptions: z.array(z.string()).default([]),
  provenance: ProvenanceSchema,
});
export type ComputeProfile = z.infer<typeof ComputeProfileSchema>;

// ── StorageProfile ──
export const StorageProfileSchema = z.object({
  total_capacity_gb: z.number().nonnegative().optional(),
  class: z.enum(["ssd", "hdd", "nvme", "object", "hybrid"]).optional(),
  backup_policy: z
    .object({
      cadence: z.enum(["hourly", "daily", "weekly", "monthly", "none"]),
      retention_days: z.number().int().nonnegative(),
    })
    .optional(),
  assumptions: z.array(z.string()).default([]),
  provenance: ProvenanceSchema,
});
export type StorageProfile = z.infer<typeof StorageProfileSchema>;

// ── WorkflowProfile ──
export const WorkflowProfileSchema = z.object({
  active_workflows: z.array(z.string()).default([]),
  schedule: z.record(z.string(), z.string()).optional(),
  agents: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
  provenance: ProvenanceSchema,
});
export type WorkflowProfile = z.infer<typeof WorkflowProfileSchema>;

// ── SecurityProfile ──
export const SecurityProfileSchema = z.object({
  auth_model: z.enum(["sso", "password", "passwordless", "mfa_required", "none"]).optional(),
  secrets_store: z.string().optional(),
  audit_policy: z.enum(["full", "high_risk_only", "none"]).optional(),
  assumptions: z.array(z.string()).default([]),
  provenance: ProvenanceSchema,
});
export type SecurityProfile = z.infer<typeof SecurityProfileSchema>;

// ── CostProfile ──
export const CostProfileSchema = z.object({
  currency: z.string().describe("ISO-4217 code, e.g. 'EUR' / 'USD'"),
  monthly_budget: z.number().nonnegative().optional(),
  payback_horizon_years: z.number().nonnegative().optional(),
  hurdle_rate: z.number().optional().describe("Discount rate / hurdle rate for ROI calculations"),
  assumptions: z.array(z.string()).default([]),
  provenance: ProvenanceSchema,
});
export type CostProfile = z.infer<typeof CostProfileSchema>;
