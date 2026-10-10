import * as crypto from "node:crypto";
import { type ConnectionDetails } from "../types/connection.js";

export interface TokenGeneratorConfig {
  livekitUrl: string;
  apiKey: string;
  apiSecret: string;
  ttlSeconds?: number;
}

function base64UrlEncode(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf-8") : input;
  return buf.toString("base64url");
}

function signJwt(header: object, payload: object, secret: string): string {
  const encHeader = base64UrlEncode(JSON.stringify(header));
  const encPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encHeader}.${encPayload}`;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(signatureInput);
  const signature = base64UrlEncode(hmac.digest());
  return `${signatureInput}.${signature}`;
}

/**
 * Creates short-lived ephemeral participant tokens for WebRTC voice rooms.
 * Uses livekit-server-sdk when available, with a standard-library HMAC-SHA256
 * fallback for lightweight or test environments without extra node_modules.
 */
export async function createParticipantToken(
  config: TokenGeneratorConfig,
  roomName: string,
  participantName: string
): Promise<ConnectionDetails> {
  if (!config.apiKey || !config.apiSecret) {
    throw new Error("Missing LiveKit API credentials on server");
  }

  const ttl = config.ttlSeconds ?? 600; // 10 minutes default
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + ttl;

  let participantToken = "";

  try {
    const { AccessToken } = await import("livekit-server-sdk");
    const token = new AccessToken(config.apiKey, config.apiSecret, {
      identity: participantName,
      ttl: `${ttl}s`,
    });
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });
    participantToken = await token.toJwt();
  } catch {
    // Standard-library fallback: produce standard LiveKit JWT
    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
      sub: participantName,
      iss: config.apiKey,
      nbf: now,
      exp: expiresAt,
      video: {
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      },
    };
    participantToken = signJwt(header, payload, config.apiSecret);
  }

  return {
    serverUrl: config.livekitUrl,
    roomName,
    participantToken,
    participantName,
    expiresAt,
  };
}
