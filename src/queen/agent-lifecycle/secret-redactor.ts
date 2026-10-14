/**
 * Starlight Queen — Secret Redactor & PII Veil Gateway
 *
 * Automatically redacts API keys, secret tokens, credentials, and sensitive
 * environment values from captured prompt/output handovers and summaries,
 * without altering or corrupting original source transcripts on disk.
 *
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

export interface RedactionResult {
  redactedText: string;
  matchCount: number;
  categoriesFound: string[];
}

const REDACTION_PATTERNS: Array<{ category: string; regex: RegExp; replacement: string }> = [
  // Anthropic API keys (placed before general sk-)
  {
    category: 'anthropic_api_key',
    regex: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g,
    replacement: '[REDACTED_ANTHROPIC_KEY]',
  },
  // OpenAI & general sk- keys (excluding sk-ant-)
  {
    category: 'openai_api_key',
    regex: /\bsk-(?!ant-)[A-Za-z0-9_-]{20,}\b/g,
    replacement: '[REDACTED_OPENAI_KEY]',
  },
  // GitHub Personal Access Tokens
  {
    category: 'github_pat',
    regex: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}\b/g,
    replacement: '[REDACTED_GITHUB_TOKEN]',
  },
  // GitHub Fine-grained PATs
  {
    category: 'github_fine_grained_pat',
    regex: /\bgithub_pat_[A-Za-z0-9_]{40,}\b/g,
    replacement: '[REDACTED_GITHUB_PAT]',
  },
  // Supabase keys
  {
    category: 'supabase_key',
    regex: /\bsb_secret_[A-Za-z0-9_-]{16,}\b/g,
    replacement: '[REDACTED_SUPABASE_KEY]',
  },
  // JWT tokens (3 parts dot-separated base64)
  {
    category: 'jwt_token',
    regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
    replacement: '[REDACTED_JWT_TOKEN]',
  },
  // AWS Access Key ID
  {
    category: 'aws_access_key',
    regex: /\bAKIA[0-9A-Z]{16}\b/g,
    replacement: '[REDACTED_AWS_KEY_ID]',
  },
  // Private keys (RSA, EC, OpenSSH, PGP)
  {
    category: 'private_key',
    regex: /-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+PRIVATE KEY-----/g,
    replacement: '[REDACTED_PRIVATE_KEY_BLOCK]',
  },
  // Bearer tokens in headers or strings
  {
    category: 'bearer_token',
    regex: /Bearer\s+([A-Za-z0-9\-_.~+/]+=*)/gi,
    replacement: 'Bearer [REDACTED_BEARER_TOKEN]',
  },
  // Generic password assignments
  {
    category: 'password_assignment',
    regex: /(password|passwd|api_secret|client_secret)\s*[:=]\s*['"][^'"]{6,}['"]/gi,
    replacement: '$1="[REDACTED_SECRET]"',
  },
];

export class SecretRedactor {
  /**
   * Redacts sensitive patterns in a string and returns the sanitized text and statistics.
   */
  public static redact(text: string): RedactionResult {
    if (!text || typeof text !== 'string') {
      return { redactedText: text || '', matchCount: 0, categoriesFound: [] };
    }

    let sanitized = text;
    let matchCount = 0;
    const categoriesFound = new Set<string>();

    for (const item of REDACTION_PATTERNS) {
      const matches = sanitized.match(item.regex);
      if (matches && matches.length > 0) {
        matchCount += matches.length;
        categoriesFound.add(item.category);
        sanitized = sanitized.replace(item.regex, item.replacement);
      }
    }

    return {
      redactedText: sanitized,
      matchCount,
      categoriesFound: Array.from(categoriesFound),
    };
  }

  /**
   * Deeply redacts an arbitrary JSON-compatible object or array in-place or returns a sanitized clone.
   */
  public static redactDeep<T>(value: T): T {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      return SecretRedactor.redact(value).redactedText as unknown as T;
    }
    if (Array.isArray(value)) {
      return value.map((item) => SecretRedactor.redactDeep(item)) as unknown as T;
    }
    if (typeof value === 'object') {
      const copy: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        if (/secret|token|password|auth|credential|api_?key/i.test(k) && typeof v === 'string') {
          copy[k] = '[REDACTED_KEY_VALUE]';
        } else {
          copy[k] = SecretRedactor.redactDeep(v);
        }
      }
      return copy as unknown as T;
    }
    return value;
  }
}
