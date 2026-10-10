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
    // Complete PEM blocks, or incomplete blocks through end-of-input.
    /-{5}BEGIN (?:[A-Z0-9]+ )?PRIVATE KEY-{5}[\s\S]*?(?:-{5}END (?:[A-Z0-9]+ )?PRIVATE KEY-{5}|$)/g,
    // Common API Keys, Tokens, Secrets
    /\bsk-[a-zA-Z0-9_-]{48,}\b/g, // OpenAI-style keys, including longer project keys
    /\bsk-ant-[a-zA-Z0-9_-]{20,}\b/g,
    /\b(?:sk|rk)_(?:live|test)_[a-zA-Z0-9]{16,}\b/g,
    /\b(?:npm|whsec)_[a-zA-Z0-9]{20,}\b/g,
    /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g,
    /\bhf_[a-zA-Z0-9]{20,}\b/g,
    /xox[baprs]-[0-9a-zA-Z-]{10,}/g,
    /(?:github_pat|ghp)_[a-zA-Z0-9_]{36,}/g, // Mask the complete token suffix
    /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|rediss?):\/\/[^\s"'<>]+/gi,
    /(?:AIza[0-9A-Za-z-_]{35})/g, // Google API keys
    /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, // JWTs
    /bearer\s+[a-zA-Z0-9\-\._~]+/gi, // Bearer tokens
    /password["']?\s*:\s*["']([^"']+)["']/gi, // Passwords in JSON/objects
    /private_key["']?\s*:\s*["']([^"']+)["']/gi, // Private keys
  ];

  private static readonly SECRET_FIELD = /^(?:password|passwd|secret|token|(?:access|refresh|auth)[_-]?token|api[_-]?key|private[_-]?key|client[_-]?secret|aws[_-]?secret[_-]?access[_-]?key)$/i;

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
        scrubbed = scrubbed.replace(pattern, () => this.options.maskString);
      }
    }

    if (this.options.scrubPII) {
      for (const pattern of SanitizationGateway.PII_PATTERNS) {
        scrubbed = scrubbed.replace(pattern, () => this.options.maskString);
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
      let next: unknown;
      if (this.options.scrubSecrets && SanitizationGateway.SECRET_FIELD.test(key)) {
        next = this.options.maskString;
      } else if (typeof value === 'string') {
        next = this.sanitize(value);
      } else if (typeof value === 'object' && value !== null) {
        next = this.sanitizeContext(
          value as Record<string, unknown>,
          depth + 1,
          seen
        );
      } else {
        next = value; // keep numbers, booleans, etc.
      }
      // Data keys such as __proto__ must not invoke inherited object setters.
      Object.defineProperty(sanitized, key, { value: next, enumerable: true, writable: true, configurable: true });
    }
    return sanitized;
  }
}
