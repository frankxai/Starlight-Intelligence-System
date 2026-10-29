// The dispatcher sets ctx.props.tenantId from the hostname it owns. The tenant Worker
// takes its identity from there only: never from a header, path, query or body, so a
// caller cannot steer a request into another agent instance.
export function agentNameFor(props: unknown): string {
  const tenantId = (props as { tenantId?: unknown } | null)?.tenantId;
  if (typeof tenantId !== 'string' || tenantId === '') throw new Error('missing tenant identity');
  return tenantId;
}

export const OAUTH_CALLBACK_PATH = 'mcp-oauth-callback';
