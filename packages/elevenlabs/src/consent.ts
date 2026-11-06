import { createHmac, timingSafeEqual } from "node:crypto";
import {
  ElevenLabsIntegrationError,
  canonicalJson,
  isSafeIdentifier,
  isIsoTimestamp,
  type VoiceConsentApprovalGate,
} from "./contracts.js";

/**
 * Server-side trusted approval authority (review blocker #1 fix).
 *
 * A caller-asserted `VoiceConsentApprovalGate` object proves nothing about who
 * approved the text: any tool caller can construct `decidedBy: "user:frank"` and
 * `voiceRightsConfirmed: true`. Production hosts must instead resolve consent
 * server-side: the platform backend (which holds the signing key) issues a
 * signed approval token after a real human approval, and the pipeline verifies
 * that token against the authority before any paid synthesis.
 *
 * The token binds: the approval gate payload, tenant, purpose, issuing
 * authority, issuance time, and an HMAC-SHA256 signature over the canonical
 * payload. Verification checks signature (constant-time), expiry, revocation,
 * and tenant binding before the standard gate checks run.
 */

export const STARLIGHT_APPROVAL_TOKEN_VERSION = "starlight.approval.v1" as const;

export interface SignedApprovalPayload {
  readonly version: typeof STARLIGHT_APPROVAL_TOKEN_VERSION;
  readonly gate: VoiceConsentApprovalGate;
  /** Tenant / workspace the approval was issued for. */
  readonly tenantId: string;
  /** Free-form purpose binding (e.g. "frankx-resources-launch"). */
  readonly purpose?: string;
  /** Identity of the issuing authority (e.g. "starlight-consent-service"). */
  readonly issuedBy: string;
  readonly issuedAt: string;
  /** Absolute expiry of the token itself (independent of gate.expiresAt). */
  readonly tokenExpiresAt: string;
}

export interface ApprovalIssueParams {
  readonly gate: VoiceConsentApprovalGate;
  readonly tenantId: string;
  readonly purpose?: string;
  readonly issuedBy?: string;
  readonly tokenTtlSeconds?: number;
  readonly nowMs?: number;
}

export interface ApprovalVerifyContext {
  /** Expected tenant; verification fails closed on mismatch (cross-tenant replay). */
  readonly expectedTenantId?: string;
  /** Optional purpose binding check. */
  readonly expectedPurpose?: string;
  readonly nowMs?: number;
}

export interface ApprovalRevocationChecker {
  /** Returns true when the approval gate id has been revoked. */
  (gateId: string, tenantId: string): boolean | Promise<boolean>;
}

export interface ApprovalAuthority {
  /** Issues a signed, self-contained approval token (server-side use only). */
  issue(params: ApprovalIssueParams): string;
  /**
   * Verifies a token server-side: signature, version, tenant, expiry, and
   * revocation. Returns the trusted gate on success; throws on any failure.
   */
  verify(token: string, context?: ApprovalVerifyContext): Promise<VoiceConsentApprovalGate>;
  /** Marks a gate id as revoked (in-memory authorities). */
  revoke(gateId: string): void;
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function constantTimeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length || a.length === 0) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
  } catch {
    return false;
  }
}

function assertTrustedGateShape(gate: VoiceConsentApprovalGate): void {
  if (!gate || typeof gate !== "object") {
    throw new ElevenLabsIntegrationError("consent_token_invalid", "Approval token payload has no gate.");
  }
  if (!isSafeIdentifier(gate.id) || !isSafeIdentifier(gate.runId)) {
    throw new ElevenLabsIntegrationError("consent_token_invalid", "Approval token gate id/runId are not safe identifiers.");
  }
  if (gate.status !== "approved") {
    throw new ElevenLabsIntegrationError(
      "consent_not_approved",
      `Approval token gate '${gate.id}' has status '${gate.status}'; synthesis requires 'approved'.`
    );
  }
  if (!gate.decidedBy || !gate.decidedBy.trim()) {
    throw new ElevenLabsIntegrationError("consent_token_invalid", "Approval token gate is missing the approving principal.");
  }
  if (!isIsoTimestamp(gate.requestedAt) || !isIsoTimestamp(gate.decidedAt ?? "")) {
    throw new ElevenLabsIntegrationError("consent_token_invalid", "Approval token gate timestamps are not valid ISO-8601.");
  }
  if (!/^[a-f0-9]{64}$/.test(gate.approvedTextSha256)) {
    throw new ElevenLabsIntegrationError("consent_token_invalid", "Approval token gate has an invalid approvedTextSha256 digest.");
  }
  if (gate.voiceRightsConfirmed !== true) {
    throw new ElevenLabsIntegrationError(
      "consent_rights_unconfirmed",
      "Approval token gate does not confirm voice synthesis rights."
    );
  }
}

/**
 * HMAC-SHA256 approval authority. The signing key lives only on the server
 * (constructor argument or `STARLIGHT_APPROVAL_SIGNING_KEY`); it is never
 * serialized into tokens, errors, or provenance records.
 */
export class HmacApprovalAuthority implements ApprovalAuthority {
  private readonly signingKey: string;
  private readonly defaultIssuedBy: string;
  private readonly revocationChecker?: ApprovalRevocationChecker;
  private readonly revokedGateIds = new Set<string>();

  constructor(options?: {
    /** Signing secret. Falls back to process.env.STARLIGHT_APPROVAL_SIGNING_KEY. */
    signingKey?: string | (() => string);
    issuedBy?: string;
    revocationChecker?: ApprovalRevocationChecker;
  }) {
    const raw =
      typeof options?.signingKey === "function"
        ? options.signingKey()
        : options?.signingKey ?? process.env.STARLIGHT_APPROVAL_SIGNING_KEY ?? "";
    const trimmed = typeof raw === "string" ? raw.trim() : "";
    if (!trimmed || trimmed.length < 32 || /\s/.test(trimmed)) {
      throw new ElevenLabsIntegrationError(
        "credential_missing",
        "Approval authority signing key must be at least 32 characters without whitespace (STARLIGHT_APPROVAL_SIGNING_KEY)."
      );
    }
    this.signingKey = trimmed;
    this.defaultIssuedBy = options?.issuedBy ?? "starlight-consent-service";
    this.revocationChecker = options?.revocationChecker;
  }

  issue(params: ApprovalIssueParams): string {
    assertTrustedGateShape(params.gate);
    if (!isSafeIdentifier(params.tenantId)) {
      throw new ElevenLabsIntegrationError("input_invalid", "Approval tenantId must be a safe identifier.");
    }
    const nowMs = params.nowMs ?? Date.now();
    const issuedAt = new Date(nowMs).toISOString();
    const ttlSeconds = params.tokenTtlSeconds ?? 3600;
    if (!Number.isSafeInteger(ttlSeconds) || ttlSeconds < 60 || ttlSeconds > 86_400) {
      throw new ElevenLabsIntegrationError("input_invalid", "Approval token TTL must be between 60 and 86400 seconds.");
    }
    const payload: SignedApprovalPayload = {
      version: STARLIGHT_APPROVAL_TOKEN_VERSION,
      gate: params.gate,
      tenantId: params.tenantId,
      ...(params.purpose !== undefined ? { purpose: params.purpose } : {}),
      issuedBy: params.issuedBy ?? this.defaultIssuedBy,
      issuedAt,
      tokenExpiresAt: new Date(nowMs + ttlSeconds * 1000).toISOString(),
    };
    const encodedPayload = base64UrlEncode(canonicalJson(payload));
    const signature = createHmac("sha256", this.signingKey).update(encodedPayload).digest("base64url");
    return `v1.${encodedPayload}.${signature}`;
  }

  async verify(token: string, context?: ApprovalVerifyContext): Promise<VoiceConsentApprovalGate> {
    if (typeof token !== "string" || token.length === 0) {
      throw new ElevenLabsIntegrationError("consent_token_invalid", "Approval token is required.");
    }
    const parts = token.split(".");
    if (parts.length !== 3 || parts[0] !== "v1" || !parts[1] || !parts[2]) {
      throw new ElevenLabsIntegrationError("consent_token_invalid", "Approval token is malformed.");
    }
    const expectedSignature = createHmac("sha256", this.signingKey).update(parts[1]).digest("base64url");
    if (!constantTimeEqualHex(parts[2], expectedSignature)) {
      throw new ElevenLabsIntegrationError(
        "consent_token_invalid",
        "Approval token signature verification failed; the token was forged or tampered with."
      );
    }

    let payload: SignedApprovalPayload;
    try {
      payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as SignedApprovalPayload;
    } catch {
      throw new ElevenLabsIntegrationError("consent_token_invalid", "Approval token payload is not valid JSON.");
    }

    if (payload.version !== STARLIGHT_APPROVAL_TOKEN_VERSION) {
      throw new ElevenLabsIntegrationError("consent_token_invalid", "Approval token version is unsupported.");
    }
    if (!payload.tenantId || !payload.issuedBy || !isIsoTimestamp(payload.issuedAt) || !isIsoTimestamp(payload.tokenExpiresAt)) {
      throw new ElevenLabsIntegrationError("consent_token_invalid", "Approval token payload is missing required bindings.");
    }

    const nowMs = context?.nowMs ?? Date.now();
    if (Date.parse(payload.tokenExpiresAt) <= nowMs) {
      throw new ElevenLabsIntegrationError(
        "consent_expired",
        `Approval token expired at ${payload.tokenExpiresAt}.`
      );
    }

    if (context?.expectedTenantId !== undefined && payload.tenantId !== context.expectedTenantId) {
      throw new ElevenLabsIntegrationError(
        "consent_tenant_mismatch",
        `Approval token was issued for tenant '${payload.tenantId}', but this host serves '${context.expectedTenantId}'.`
      );
    }
    if (context?.expectedPurpose !== undefined && payload.purpose !== context.expectedPurpose) {
      throw new ElevenLabsIntegrationError(
        "consent_token_invalid",
        "Approval token purpose binding does not match the expected purpose."
      );
    }

    assertTrustedGateShape(payload.gate);

    if (this.revokedGateIds.has(payload.gate.id)) {
      throw new ElevenLabsIntegrationError(
        "consent_revoked",
        `Approval '${payload.gate.id}' has been revoked by the issuing authority.`
      );
    }
    if (this.revocationChecker) {
      const revoked = await this.revocationChecker(payload.gate.id, payload.tenantId);
      if (revoked) {
        throw new ElevenLabsIntegrationError(
          "consent_revoked",
          `Approval '${payload.gate.id}' has been revoked by the issuing authority.`
        );
      }
    }

    return payload.gate;
  }

  revoke(gateId: string): void {
    if (!isSafeIdentifier(gateId)) {
      throw new ElevenLabsIntegrationError("input_invalid", "Revoked gate id must be a safe identifier.");
    }
    this.revokedGateIds.add(gateId);
  }
}

/**
 * In-memory approval authority for tests and local development.
 * The same HMAC verification path as production; the key never leaves the process.
 */
export class InMemoryApprovalAuthority extends HmacApprovalAuthority {
  constructor(options?: { signingKey?: string; issuedBy?: string; revocationChecker?: ApprovalRevocationChecker }) {
    super({ signingKey: options?.signingKey ?? "test-approval-signing-key-0123456789abcdef0123456789", ...options });
  }
}
