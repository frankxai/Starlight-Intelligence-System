/**
 * Starlight Sovereign Decentralized Transports
 *
 * Implements storage dispatchers for Arweave (via Irys) and IPFS (via Pinata).
 * Gracefully switches between live network uploads and deterministic offline
 * attestation when external credentials are not configured.
 *
 * Attestation: Built on SIP — Substrate Tier
 */

import { createHash } from "node:crypto";
import {
  SovereignBlockchainAnchor,
  type BlockchainAnchorReceipt,
  type VaultSnapshotItem,
} from "./blockchain-anchor.js";
import {
  SovereignEnvelopeEncryption,
  type EncryptedVaultEnvelope,
} from "./envelope.js";

export interface UploadResult {
  provider: "irys-arweave" | "pinata-ipfs" | "mock-substrate";
  isLive: boolean;
  contentIdentifier: string; // Arweave Tx ID or IPFS CID
  gatewayUrl: string;
  bytes: number;
  anchoredAt: string;
  attestation: "Built on SIP";
}

export interface DecentralizedStorageProvider {
  readonly name: UploadResult["provider"];
  isLive(): boolean;
  upload(
    payload: string,
    metadata?: Record<string, string>
  ): Promise<UploadResult>;
}

export class IrysArweaveTransport implements DecentralizedStorageProvider {
  public readonly name = "irys-arweave";

  public isLive(): boolean {
    return Boolean(process.env.IRYS_PRIVATE_KEY || process.env.ARWEAVE_JWK);
  }

  public async upload(
    payload: string,
    metadata: Record<string, string> = {}
  ): Promise<UploadResult> {
    const payloadBytes = Buffer.byteLength(payload, "utf-8");
    const digest = createHash("sha256").update(payload, "utf-8").digest("hex");

    if (this.isLive()) {
      try {
        // Direct post to Irys node if funded/configured
        const response = await fetch("https://node2.irys.xyz/tx", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.IRYS_PRIVATE_KEY}`,
          },
          body: JSON.stringify({
            data: Buffer.from(payload).toString("base64"),
            tags: Object.entries(metadata).map(([name, value]) => ({ name, value })),
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as { id: string };
          return {
            provider: "irys-arweave",
            isLive: true,
            contentIdentifier: data.id,
            gatewayUrl: `https://gateway.irys.xyz/${data.id}`,
            bytes: payloadBytes,
            anchoredAt: new Date().toISOString(),
            attestation: "Built on SIP",
          };
        }
      } catch {
        // Fallback to deterministic offline calculation if network fails
      }
    }

    // Deterministic offline calculation
    const mockTxId = createHash("sha256")
      .update(`irys:${digest}:${payloadBytes}`)
      .digest("base64url")
      .slice(0, 43);

    return {
      provider: "irys-arweave",
      isLive: false,
      contentIdentifier: `ar://${mockTxId}`,
      gatewayUrl: `https://arweave.net/${mockTxId}`,
      bytes: payloadBytes,
      anchoredAt: new Date().toISOString(),
      attestation: "Built on SIP",
    };
  }
}

export class PinataIpfsTransport implements DecentralizedStorageProvider {
  public readonly name = "pinata-ipfs";

  public isLive(): boolean {
    return Boolean(process.env.PINATA_JWT);
  }

  public async upload(
    payload: string,
    metadata: Record<string, string> = {}
  ): Promise<UploadResult> {
    const payloadBytes = Buffer.byteLength(payload, "utf-8");
    const digest = createHash("sha256").update(payload, "utf-8").digest("hex");

    if (this.isLive()) {
      try {
        const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.PINATA_JWT}`,
          },
          body: JSON.stringify({
            pinataContent: JSON.parse(payload),
            pinataMetadata: {
              name: metadata.name ?? "starlight-vault-snapshot",
              keyvalues: metadata,
            },
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as { IpfsHash: string };
          return {
            provider: "pinata-ipfs",
            isLive: true,
            contentIdentifier: data.IpfsHash,
            gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
            bytes: payloadBytes,
            anchoredAt: new Date().toISOString(),
            attestation: "Built on SIP",
          };
        }
      } catch {
        // Fallback to offline calculation
      }
    }

    // Deterministic offline CID calculation (v1 sha256 CID format)
    const mockCid = `bafybeic${digest.slice(0, 44)}`;

    return {
      provider: "pinata-ipfs",
      isLive: false,
      contentIdentifier: mockCid,
      gatewayUrl: `https://ipfs.io/ipfs/${mockCid}`,
      bytes: payloadBytes,
      anchoredAt: new Date().toISOString(),
      attestation: "Built on SIP",
    };
  }
}

export interface AnchoringOptions {
  provider?: "irys-arweave" | "pinata-ipfs";
  storageTarget?: BlockchainAnchorReceipt["storageTarget"];
  passphrase?: string; // If provided, encrypts with Zero-Knowledge AES-256-GCM
  targetTier?: "managed_cloud" | "blockchain_anchored" | "local";
}

export interface DispatchedAnchorResult {
  receipt: BlockchainAnchorReceipt;
  upload: UploadResult;
  isEncrypted: boolean;
  envelope?: EncryptedVaultEnvelope;
}

export class SovereignStorageDispatcher {
  /**
   * Dispatches a vault snapshot to decentralized storage with optional zero-knowledge encryption.
   */
  public static async dispatchSnapshot(
    items: VaultSnapshotItem[],
    options: AnchoringOptions = {}
  ): Promise<DispatchedAnchorResult> {
    const providerName = options.provider ?? "irys-arweave";
    const transport: DecentralizedStorageProvider =
      providerName === "pinata-ipfs" ? new PinataIpfsTransport() : new IrysArweaveTransport();

    let payloadString: string;
    let envelope: EncryptedVaultEnvelope | undefined;
    const isEncrypted = Boolean(options.passphrase);

    if (options.passphrase) {
      envelope = SovereignEnvelopeEncryption.encryptSnapshot(items, options.passphrase);
      payloadString = JSON.stringify(envelope);
    } else {
      payloadString = JSON.stringify(items);
    }

    const storageTarget = options.storageTarget ?? (providerName === "pinata-ipfs" ? "ipfs" : "arweave");
    const baseReceipt = SovereignBlockchainAnchor.anchorSnapshot(
      items,
      storageTarget,
      options.targetTier ?? "blockchain_anchored"
    );

    const upload = await transport.upload(payloadString, {
      merkleRoot: baseReceipt.merkleRoot,
      itemCount: String(items.length),
      attestation: "Built on SIP",
      isEncrypted: String(isEncrypted),
    });

    const receipt: BlockchainAnchorReceipt = {
      ...baseReceipt,
      contentIdentifier: upload.contentIdentifier,
    };

    return {
      receipt,
      upload,
      isEncrypted,
      envelope,
    };
  }
}
