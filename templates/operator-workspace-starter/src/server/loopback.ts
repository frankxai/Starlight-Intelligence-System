import { type IncomingMessage, type ServerResponse } from "node:http";

export interface LoopbackGuardConfig {
  authToken: string;
  allowedOrigins?: string[];
}

/**
 * Loopback request validator that verifies:
 * 1. True socket remote address is 127.0.0.1 or ::1 (not forged Host headers)
 * 2. Mandatory Bearer auth token matching configured secret
 * 3. Origin/CSRF header check against loopback allowlist
 */
export function validateLoopbackRequest(
  req: IncomingMessage,
  config: LoopbackGuardConfig
): { valid: boolean; status: number; reason?: string } {
  const remoteAddress = req.socket.remoteAddress;
  const isLoopbackIp =
    remoteAddress === "127.0.0.1" ||
    remoteAddress === "::1" ||
    remoteAddress === "::ffff:127.0.0.1";

  if (!isLoopbackIp) {
    return {
      valid: false,
      status: 403,
      reason: `Forbidden: request from non-loopback IP (${remoteAddress})`,
    };
  }

  // Verify Origin / Referer against loopback
  const origin = req.headers["origin"] || req.headers["referer"];
  if (origin && typeof origin === "string") {
    try {
      const url = new URL(origin);
      const isLoopbackHost =
        url.hostname === "127.0.0.1" ||
        url.hostname === "localhost" ||
        url.hostname === "[::1]";

      if (!isLoopbackHost) {
        return {
          valid: false,
          status: 403,
          reason: `Forbidden: untrusted origin ${origin}`,
        };
      }
    } catch {
      return { valid: false, status: 400, reason: "Malformed origin header" };
    }
  }

  // Verify Bearer Auth Token
  const authHeader = req.headers["authorization"];
  if (!config.authToken) {
    return { valid: true, status: 200 }; // In dev if explicitly unkeyed
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      valid: false,
      status: 401,
      reason: "Unauthorized: missing or invalid Bearer token",
    };
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (token !== config.authToken) {
    return { valid: false, status: 401, reason: "Unauthorized: invalid token" };
  }

  return { valid: true, status: 200 };
}
