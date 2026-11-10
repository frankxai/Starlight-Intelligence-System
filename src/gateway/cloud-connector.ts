/**
 * Starlight Sovereign Cloud Connector
 * Connects local starlightd kernel & vaults to Starlight Managed Cloud.
 * Features zero-knowledge client-side encryption (AES-256-GCM), offline fallback,
 * and high-velocity JIT vMCP tool filtering.
 * 
 * Built on SIP v1.1.1
 */

import { scryptSync, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

export interface CloudConnectorOptions {
  cloudEndpoint?: string;
  apiKey: string;
  tenantId?: string;
  encryptionPassphrase?: string;
  offlineFallback?: boolean;
}

export interface CloudQueryOptions {
  tier?: string;
  namespace?: string;
  limit?: number;
  minScore?: number;
  includeDecayed?: boolean;
}

export class StarlightCloudConnector {
  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly tenantId?: string;
  private readonly encryptionKey: Buffer | null = null;
  private readonly offlineFallback: boolean;

  constructor(options: CloudConnectorOptions) {
    this.endpoint = (options.cloudEndpoint || 'https://api.starlightintelligence.ai').replace(/\/+$/, '');
    this.apiKey = options.apiKey;
    this.tenantId = options.tenantId;
    this.offlineFallback = options.offlineFallback !== false;

    if (options.encryptionPassphrase) {
      // Derive 256-bit symmetric key deterministically from passphrase
      this.encryptionKey = scryptSync(options.encryptionPassphrase, 'starlight-sovereign-salt-v1', 32);
    }
  }

  /**
   * Encrypts plaintext using AES-256-GCM (Zero-Knowledge BYOV mode)
   */
  public encrypt(plaintext: string): { ciphertext: string; iv: string; tag: string } {
    if (!this.encryptionKey) {
      throw new Error('Encryption passphrase was not provided to StarlightCloudConnector.');
    }
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');

    return {
      ciphertext,
      iv: iv.toString('hex'),
      tag,
    };
  }

  /**
   * Decrypts ciphertext using AES-256-GCM
   */
  public decrypt(ciphertext: string, ivHex: string, tagHex: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption passphrase was not provided to StarlightCloudConnector.');
    }
    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Queries memories from Starlight Cloud with automatic decryption of encrypted records.
   */
  public async query(queryText: string, options: CloudQueryOptions = {}): Promise<any> {
    const url = `${this.endpoint}/v1/memory/query`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
    if (this.tenantId) {
      headers['X-Starlight-Tenant'] = this.tenantId;
    }

    const payload = {
      query: queryText,
      ...options,
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Starlight Cloud query failed with HTTP ${res.status}: ${await res.text()}`);
      }

      const data = await res.json() as any;

      // Decrypt any client-encrypted records
      if (this.encryptionKey && data.results) {
        for (const item of data.results) {
          if (item.atom?.isEncrypted && item.atom?.metadata?._e2ee) {
            try {
              const { iv, tag } = item.atom.metadata._e2ee;
              item.atom.content = this.decrypt(item.atom.content, iv, tag);
            } catch {
              item.atom.content = '[DECRYPTION_FAILED]';
            }
          }
        }
      }

      return data;
    } catch (err: any) {
      if (this.offlineFallback) {
        return {
          query: queryText,
          count: 0,
          results: [],
          offlineNotice: `Cloud connection unavailable (${err.message}). Local vault mode active.`,
        };
      }
      throw err;
    }
  }

  /**
   * Ingests memory atom into Starlight Cloud, applying client-side encryption if enabled.
   */
  public async append(content: string, options: {
    tier?: string;
    namespace?: string;
    metadata?: Record<string, unknown>;
    tags?: string[];
  } = {}): Promise<any> {
    const url = `${this.endpoint}/v1/memory/append`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
    if (this.tenantId) {
      headers['X-Starlight-Tenant'] = this.tenantId;
    }

    let finalContent = content;
    let isEncrypted = false;
    let finalMetadata = { ...(options.metadata || {}) };

    if (this.encryptionKey) {
      const encrypted = this.encrypt(content);
      finalContent = encrypted.ciphertext;
      isEncrypted = true;
      finalMetadata._e2ee = {
        iv: encrypted.iv,
        tag: encrypted.tag,
      };
    }

    const payload = {
      content: finalContent,
      tier: options.tier,
      namespace: options.namespace,
      metadata: finalMetadata,
      tags: options.tags,
      isEncrypted,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Starlight Cloud append failed with HTTP ${res.status}: ${await res.text()}`);
    }

    return await res.json();
  }

  /**
   * Requests Virtual MCP (vMCP) JIT context filter from cloud edge.
   */
  public async synthesizeVmcp(intent: string, activeFilePath?: string): Promise<any> {
    const url = `${this.endpoint}/v1/vmcp/synthesize`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        agentId: 'local-starlightd',
        activeIntent: intent,
        activeFilePath,
      }),
    });

    if (!res.ok) {
      throw new Error(`vMCP synthesis failed with HTTP ${res.status}: ${await res.text()}`);
    }

    return await res.json();
  }

  /**
   * Acquires a distributed worktree lease across distributed swarms.
   */
  public async acquireLease(agentId: string, worktree: string, paths: string[], ttlSeconds: number = 120): Promise<any> {
    const url = `${this.endpoint}/v1/swarm/lease/acquire`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ agentId, worktree, paths, ttlSeconds }),
    });

    if (!res.ok) {
      throw new Error(`Starlight Cloud lease acquire failed with HTTP ${res.status}.`);
    }

    return await res.json();
  }

  /**
   * Releases a distributed worktree lease.
   */
  public async releaseLease(leaseId: string): Promise<any> {
    const url = `${this.endpoint}/v1/swarm/lease/release`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ leaseId }),
    });

    if (!res.ok) {
      throw new Error(`Starlight Cloud lease release failed with HTTP ${res.status}.`);
    }

    return await res.json();
  }
}
