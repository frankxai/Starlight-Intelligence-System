import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export interface AccessEnv {
  CF_ACCESS_TEAM_DOMAIN: string;
  CF_ACCESS_AUD: string;
  STARLIGHT_ALLOWED_EMAILS: string;
}

export interface StarlightActor {
  id: string;
  email: string;
  name?: string;
}

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public readonly status = 401,
  ) {
    super(message);
  }
}

function teamOrigin(teamDomain: string): string {
  const value = teamDomain.trim().replace(/\/$/, "");
  return value.startsWith("https://") ? value : `https://${value}`;
}

export async function verifyAccessToken(token: string, env: AccessEnv): Promise<JWTPayload> {
  const issuer = teamOrigin(env.CF_ACCESS_TEAM_DOMAIN);
  const keys = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
  const { payload } = await jwtVerify(token, keys, {
    issuer,
    audience: env.CF_ACCESS_AUD,
    algorithms: ["RS256"],
  });
  return payload;
}

export async function authenticateAccessRequest(
  request: Request,
  env: AccessEnv,
  verifier: (token: string, env: AccessEnv) => Promise<JWTPayload> = verifyAccessToken,
): Promise<StarlightActor> {
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) throw new AuthorizationError("Cloudflare Access authentication is required.");

  let claims: JWTPayload;
  try {
    claims = await verifier(token, env);
  } catch {
    throw new AuthorizationError("Cloudflare Access token is invalid or expired.");
  }

  const email = typeof claims.email === "string" ? claims.email.trim().toLowerCase() : "";
  const subject = typeof claims.sub === "string" ? claims.sub : "";
  if (!email || !subject) throw new AuthorizationError("Access token is missing identity claims.", 403);

  const allowed = new Set(
    env.STARLIGHT_ALLOWED_EMAILS.split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
  if (!allowed.has(email)) throw new AuthorizationError("This identity is not authorized for Starlight.", 403);

  return {
    id: subject,
    email,
    name: typeof claims.name === "string" ? claims.name : undefined,
  };
}

export function authorizationResponse(error: AuthorizationError): Response {
  return Response.json(
    { error: "unauthorized", message: error.message },
    {
      status: error.status,
      headers: {
        "Cache-Control": "no-store",
        "WWW-Authenticate": 'Bearer realm="starlight-intelligence"',
      },
    },
  );
}
