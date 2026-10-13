/**
 * The Edge Veil — Sanitization & Secret Scrubbing Gateway for Starlight Cloud
 * Built on SIP v1.1.1 — fails closed on raw credential leakage
 */

export interface VeilScrubResult {
  cleanText: string;
  scrubbedCount: number;
  detectedCategories: string[];
}

export class EdgeVeil {
  private static readonly PATTERNS: Array<{ category: string; regex: RegExp; replacement: string }> = [
    // OpenAI / Anthropic / Grok / Generic API keys
    {
      category: 'api_keys',
      regex: /(?:sk-[a-zA-Z0-9_-]{20,}|sk-ant-[a-zA-Z0-9_-]{20,}|ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82})/g,
      replacement: '[REDACTED_API_KEY]',
    },
    // Stripe secret keys
    {
      category: 'stripe_secrets',
      regex: /(?:sk_live|rk_live)_[a-zA-Z0-9]{24,}/g,
      replacement: '[REDACTED_STRIPE_KEY]',
    },
    // AWS Access Key ID
    {
      category: 'aws_credentials',
      regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g,
      replacement: '[REDACTED_AWS_KEY]',
    },
    // PEM Private Keys
    {
      category: 'private_keys',
      regex: /-----BEGIN(?: [A-Z0-9_-]+)? PRIVATE KEY-----[\s\S]*?-----END(?: [A-Z0-9_-]+)? PRIVATE KEY-----/g,
      replacement: '[REDACTED_PRIVATE_KEY]',
    },
    // JWT Tokens
    {
      category: 'jwt_tokens',
      regex: /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g,
      replacement: '[REDACTED_JWT_TOKEN]',
    },
    // Database connection strings containing passwords
    {
      category: 'db_connection_strings',
      regex: /(?:postgres|mysql|mongodb(?:\+srv)?):\/\/[^:\s]+:[^@\s]+@[a-zA-Z0-9.-]+(?::[0-9]+)?\/[^\s]*/g,
      replacement: '[REDACTED_DB_URI]',
    }
  ];

  /**
   * Sanitizes text by stripping detected credentials, API tokens, and private keys.
   */
  public static scrub(input: string): VeilScrubResult {
    let cleanText = input;
    let scrubbedCount = 0;
    const detectedCategories = new Set<string>();

    for (const rule of this.PATTERNS) {
      const matches = cleanText.match(rule.regex);
      if (matches && matches.length > 0) {
        scrubbedCount += matches.length;
        detectedCategories.add(rule.category);
        cleanText = cleanText.replace(rule.regex, rule.replacement);
      }
    }

    return {
      cleanText,
      scrubbedCount,
      detectedCategories: Array.from(detectedCategories),
    };
  }

  /**
   * Automatically classifies an input into one of the 6 Epistemic Tiers if not explicitly provided.
   */
  public static classifyTier(content: string, namespace?: string): import('./types.js').EpistemicTier {
    const text = content.toLowerCase();
    const ns = (namespace || '').toLowerCase();

    if (ns.includes('strategy') || text.includes('decision') || text.includes('trade-off') || text.includes('rationale')) {
      return 'strategic';
    }
    if (ns.includes('tech') || text.includes('function') || text.includes('api') || text.includes('schema') || text.includes('architecture') || text.includes('ast')) {
      return 'technical';
    }
    if (ns.includes('creative') || text.includes('aesthetic') || text.includes('voice') || text.includes('sound') || text.includes('visual') || text.includes('narrative')) {
      return 'creative';
    }
    if (ns.includes('operational') || text.includes('receipt') || text.includes('session') || text.includes('workflow') || text.includes('checklist') || text.includes('trace')) {
      return 'operational';
    }
    if (ns.includes('wisdom') || text.includes('principle') || text.includes('law') || text.includes('rule') || text.includes('lesson')) {
      return 'wisdom';
    }
    if (ns.includes('horizon') || text.includes('vision') || text.includes('roadmap') || text.includes('future') || text.includes('bet')) {
      return 'horizon';
    }

    return 'operational';
  }
}
