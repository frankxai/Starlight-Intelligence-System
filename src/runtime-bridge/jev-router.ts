import { boundedJson, record } from "./contracts.js";

/** Explicit public-data pilot. This does not grant network, tool or spend authority. */
export interface JevRouterPolicy {
  classification: "public";
  region: "global";
  costTier: "low" | "medium" | "high";
  /** Concrete slugs from a host-verified pool snapshot; patterns and aliases are refused. */
  models: string[];
  pool: { models: string[]; verifiedAt: string };
  maxCompletionTokens: number;
}

export interface JevRouterRequest {
  endpoint: "https://openrouter.ai/api/v1/chat/completions";
  headers: { "Content-Type": "application/json"; "X-OpenRouter-Metadata": "enabled" };
  body: {
    model: "typesafe/jev-router";
    messages: { role: "user"; content: string }[];
    plugins: { id: "jev-router"; cost_tier: JevRouterPolicy["costTier"]; models: string[] }[];
    max_completion_tokens: number;
    stream: false;
  };
  approvedModels: string[];
}

export interface JevRouteReceipt {
  accepted: boolean;
  reason: "accepted" | "invalid-response" | "missing-metadata" | "include-ignored" | "unapproved-model";
  servedModel?: string;
  advisorModel?: string;
  /** Post-response admission cannot undo transmission or certify billed cost. */
  authority: "untrusted-provider-report";
}

const slug = /^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._:-]*$/;
const MAX_POOL_AGE_MS = 60 * 60 * 1000;

function modelList(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.length <= 64
    && value.every(item => typeof item === "string" && item.length <= 256 && slug.test(item)
      && item !== "typesafe/jev-router")
    && new Set(value).size === value.length;
}

/** The trusted host supplies classification and a current pool; task text supplies neither. */
export function prepareJevRouterRequest(input: string, policy: JevRouterPolicy, now = Date.now()): JevRouterRequest {
  if (!record(policy) || policy.classification !== "public" || policy.region !== "global"
    || !["low", "medium", "high"].includes(policy.costTier)
    || !modelList(policy.models) || !record(policy.pool) || !modelList(policy.pool.models)
    || !Number.isInteger(policy.maxCompletionTokens) || policy.maxCompletionTokens < 1
    || policy.maxCompletionTokens > 4096) throw new Error("Invalid public Jev Router policy");
  const verifiedAt = typeof policy.pool.verifiedAt === "string" ? Date.parse(policy.pool.verifiedAt) : NaN;
  if (!Number.isFinite(now) || !Number.isFinite(verifiedAt) || verifiedAt > now
    || now - verifiedAt > MAX_POOL_AGE_MS) throw new Error("Jev Router pool snapshot is stale or invalid");
  if (!policy.models.every(model => policy.pool.models.includes(model))) {
    throw new Error("Approved models are absent from the verified Jev Router pool");
  }
  if (typeof input !== "string" || !input.trim() || Buffer.byteLength(input, "utf8") > 16_384) {
    throw new Error("Jev Router input must be nonempty and at most 16 KiB");
  }
  const request: JevRouterRequest = {
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    headers: { "Content-Type": "application/json", "X-OpenRouter-Metadata": "enabled" },
    body: { model: "typesafe/jev-router", messages: [{ role: "user", content: input }],
      plugins: [{ id: "jev-router", cost_tier: policy.costTier, models: [...policy.models] }],
      max_completion_tokens: policy.maxCompletionTokens, stream: false },
    approvedModels: [...policy.models],
  };
  boundedJson(request);
  return request;
}

/** Reject uncertainty before displaying or acting on output. Never certify tools or a review pass. */
export function inspectJevRouterResponse(value: unknown, approvedModels: readonly string[]): JevRouteReceipt {
  const reject = (reason: JevRouteReceipt["reason"]): JevRouteReceipt => ({
    accepted: false, reason, authority: "untrusted-provider-report",
  });
  if (!modelList(approvedModels) || !record(value)) return reject("invalid-response");
  try { boundedJson(value); } catch { return reject("invalid-response"); }
  if (typeof value.model !== "string" || !slug.test(value.model)
    || !Array.isArray(value.choices) || value.choices.length !== 1
    || !record(value.choices[0]) || !record(value.choices[0].message)
    || typeof value.choices[0].message.content !== "string"
    || !value.choices[0].message.content.trim()
    || value.choices[0].finish_reason !== "stop"
    || Object.hasOwn(value.choices[0].message, "tool_calls")) return reject("invalid-response");
  if (!record(value.openrouter_metadata) || !Array.isArray(value.openrouter_metadata.pipeline)) {
    return reject("missing-metadata");
  }
  const stages = value.openrouter_metadata.pipeline.filter(stage => record(stage) && stage.name === "jev-router");
  if (stages.length !== 1 || !record(stages[0]) || !record(stages[0].data)) return reject("missing-metadata");
  const data = stages[0].data;
  if (Object.hasOwn(data, "list_fallback")) return reject("include-ignored");
  if (!modelList(data.resolved_models) || !data.resolved_models.includes(value.model)) return reject("missing-metadata");
  const models = [...data.resolved_models];
  if (Object.hasOwn(data, "advisor_model") && data.advisor_model !== null) {
    if (typeof data.advisor_model !== "string" || !slug.test(data.advisor_model)) return reject("invalid-response");
    models.push(data.advisor_model);
  }
  if (!models.every(model => approvedModels.includes(model))) return reject("unapproved-model");
  return { accepted: true, reason: "accepted", servedModel: value.model,
    ...(typeof data.advisor_model === "string" ? { advisorModel: data.advisor_model } : {}),
    authority: "untrusted-provider-report" };
}
