/**
 * Sanitization Gateway (The Censor / The Veil)
 * 
 * Implements a local-first sanitization layer to scrub PII, secrets,
 * and sensitive data before it enters the Starlight Memory Graph
 * or is sent to cloud APIs.
 */

export interface SanitizationOptions {
  scrubSecrets?: boolean;
  scrubPII?: boolean;
  maskString?: string;
}

export class SanitizationGateway {
  private static readonly SECRET_PATTERNS = [
    // Common API Keys, Tokens, Secrets
    /sk-[a-zA-Z0-9]{48}/g, // OpenAI-style keys
    /xox[baprs]-[0-9a-zA-Z]{10,48}/g, // Slack tokens
    /(?:github_pat|ghp)_[a-zA-Z0-9]{36}/g, // GitHub tokens
    /(?:AIza[0-9A-Za-z-_]{35})/g, // Google API keys
    /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, // JWTs
    /bearer\s+[a-zA-Z0-9\-\._~]+/gi, // Bearer tokens
    /password["']?\s*:\s*["']([^"']+)["']/gi, // Passwords in JSON/objects
    /private_key["']?\s*:\s*["']([^"']+)["']/gi, // Private keys
  ];

  private static readonly PII_PATTERNS = [
    // Emails
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    // Phone numbers (US/Intl basic)
    /(?:\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/g,
    // SSN / Basic ID patterns (very simplified)
    /\b\d{3}-\d{2}-\d{4}\b/g,
  ];

  private options: Required<SanitizationOptions>;

  constructor(options?: SanitizationOptions) {
    this.options = {
      scrubSecrets: options?.scrubSecrets ?? true,
      scrubPII: options?.scrubPII ?? true,
      maskString: options?.maskString ?? '[REDACTED]',
    };
  }

  /**
   * Scrub text of identifiable or sensitive information.
   * Can be hooked into a local SLM for semantic PII scrubbing in the future.
   */
  public sanitize(input: string): string {
    if (!input) return input;
    let scrubbed = input;

    if (this.options.scrubSecrets) {
      for (const pattern of SanitizationGateway.SECRET_PATTERNS) {
        scrubbed = scrubbed.replace(pattern, this.options.maskString);
      }
    }

    if (this.options.scrubPII) {
      for (const pattern of SanitizationGateway.PII_PATTERNS) {
        scrubbed = scrubbed.replace(pattern, this.options.maskString);
      }
    }

    return scrubbed;
  }

  /**
   * Deep sanitize a context object.
   *
   * H2 fix (2026-05-12): bound the recursion (depth ≤ 64) and detect cycles
   * (WeakSet of visited refs). Without these, a deeply-nested or self-referential
   * payload crashes the process with "Maximum call stack size exceeded".
   */
  public sanitizeContext(
    context: Record<string, unknown>,
    depth = 0,
    seen: WeakSet<object> = new WeakSet()
  ): Record<string, unknown> {
    if (depth > 64) {
      return { __truncated: true } as Record<string, unknown>;
    }
    if (seen.has(context)) {
      return { __circular: true } as Record<string, unknown>;
    }
    seen.add(context);

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(context)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitize(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeContext(
          value as Record<string, unknown>,
          depth + 1,
          seen
        );
      } else {
        sanitized[key] = value; // keep numbers, booleans, etc.
      }
    }
    return sanitized;
  }
}
