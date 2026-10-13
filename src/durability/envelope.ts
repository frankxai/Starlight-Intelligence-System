/**
 * Starlight Sovereign Zero-Knowledge Envelope Encryption
 *
 * Provides client-side zero-knowledge encryption (AES-256-GCM) for vault memory
 * atoms and Horizon Notes before dispatch to public decentralized storage.
 *
 * Attestation: Built on SIP — Substrate Tier
 */

import { randomBytes, createCipheriv, createDecipheriv, pbkdf2Sync } from "node:crypto";
import { SovereignBlockchainAnchor, type VaultSnapshotItem } from "./blockchain-anchor.js";

export interface EncryptedVaultEnvelope {
  version: "1.0";
  algorithm: "AES-256-GCM";
  kdf: "PBKDF2-SHA256";
  iterations: number;
  saltHex: string;
  ivHex: string;
  authTagHex: string;
  ciphertext: string; // base64 encoded ciphertext
  merkleRoot: string; // Public Merkle root for zero-knowledge verification
  itemCount: number;
  createdAt: string;
  attestation: "Built on SIP";
}

export class SovereignEnvelopeEncryption {
  private static readonly ITERATIONS = 100_000;
  private static readonly KEY_LENGTH = 32; // 256 bits

  /**
   * Derives a 256-bit AES key from a passphrase and salt using PBKDF2-SHA256.
   */
  private static deriveKey(passphrase: string, salt: Buffer): Buffer {
    return pbkdf2Sync(passphrase, salt, this.ITERATIONS, this.KEY_LENGTH, "sha256");
  }

  /**
   * Encrypts an array of vault items into a Zero-Knowledge Encrypted Envelope.
   * The Merkle root is retained publicly in plaintext to allow inclusion proofs,
   * while the content payload is completely encrypted with AES-256-GCM.
   */
  public static encryptSnapshot(
    items: VaultSnapshotItem[],
    passphrase: string
  ): EncryptedVaultEnvelope {
    const itemHashes = items.map((item) => SovereignBlockchainAnchor.hashItem(item));
    const merkleRoot = SovereignBlockchainAnchor.computeMerkleRoot(itemHashes);

    const salt = randomBytes(16);
    const iv = randomBytes(12); // Standard 96-bit IV for AES-GCM
    const key = this.deriveKey(passphrase, salt);

    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const plaintext = JSON.stringify(items);
    
    let encrypted = cipher.update(plaintext, "utf-8", "base64");
    encrypted += cipher.final("base64");
    const authTag = cipher.getAuthTag();

    return {
      version: "1.0",
      algorithm: "AES-256-GCM",
      kdf: "PBKDF2-SHA256",
      iterations: this.ITERATIONS,
      saltHex: salt.toString("hex"),
      ivHex: iv.toString("hex"),
      authTagHex: authTag.toString("hex"),
      ciphertext: encrypted,
      merkleRoot,
      itemCount: items.length,
      createdAt: new Date().toISOString(),
      attestation: "Built on SIP",
    };
  }

  /**
   * Decrypts an encrypted envelope using the operator's passphrase and verifies
   * data integrity via AES-GCM authentication tag and Merkle root recalculation.
   */
  public static decryptSnapshot(
    envelope: EncryptedVaultEnvelope,
    passphrase: string
  ): VaultSnapshotItem[] {
    if (envelope.attestation !== "Built on SIP") {
      throw new Error("Invalid envelope: missing Built on SIP attestation");
    }

    const salt = Buffer.from(envelope.saltHex, "hex");
    const iv = Buffer.from(envelope.ivHex, "hex");
    const authTag = Buffer.from(envelope.authTagHex, "hex");
    const key = this.deriveKey(passphrase, salt);

    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted: string;
    try {
      decrypted = decipher.update(envelope.ciphertext, "base64", "utf-8");
      decrypted += decipher.final("utf-8");
    } catch {
      throw new Error("Decryption failed: invalid passphrase or corrupted ciphertext");
    }

    const items: VaultSnapshotItem[] = JSON.parse(decrypted);

    // Verify Merkle Root matches decrypted items
    const itemHashes = items.map((item) => SovereignBlockchainAnchor.hashItem(item));
    const computedRoot = SovereignBlockchainAnchor.computeMerkleRoot(itemHashes);
    if (computedRoot !== envelope.merkleRoot) {
      throw new Error("Decryption verification failed: Merkle root mismatch");
    }

    return items;
  }
}
