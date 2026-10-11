#!/usr/bin/env node
// Sign a SIP graph conformance receipt (SIP-native profile: Ed25519 + DSSE + in-toto).
//
//   node protocol/sign.mjs keygen <dir>
//   node protocol/sign.mjs <receipt.json> --key <private.pem> [--out <envelope.json>]
//
// Exit 0 on success, 1 when the receipt may not be signed (not a PASS), 2 on a
// usage or read error. Zero dependencies. Offline. Nothing leaves the machine.

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { generateKeyPairSync } from "node:crypto";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { keyIdOf, signReceipt } from "./lib/dsse.mjs";

const USAGE = `sip-sign — SIP-native receipt signing (Ed25519, DSSE v1, in-toto Statement v1)

  node protocol/sign.mjs keygen <dir>
      Writes <dir>/sip-signing.key (private, keep it out of git) and
      <dir>/sip-signing.pub (public, publish it next to your receipts).

  node protocol/sign.mjs <receipt.json> --key <sip-signing.key> [--out <envelope.json>]
      Signs a receipt produced by conform.mjs --json. Refuses a FAIL receipt.`;

function keygen(dir) {
  const target = resolve(dir);
  const keyPath = join(target, "sip-signing.key");
  const pubPath = join(target, "sip-signing.pub");
  mkdirSync(target, { recursive: true });
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  try {
    // "wx": create only, so an existing key is never overwritten, with no check-then-write race.
    writeFileSync(keyPath, privateKey.export({ type: "pkcs8", format: "pem" }), { mode: 0o600, flag: "wx" });
  } catch (err) {
    console.error(
      err.code === "EEXIST"
        ? `sip-sign: ${keyPath} already exists; refusing to overwrite a signing key`
        : `sip-sign: cannot write ${keyPath}: ${err.message}`
    );
    return 2;
  }
  writeFileSync(pubPath, publicKey.export({ type: "spki", format: "pem" }));
  const ignorePath = join(target, ".gitignore");
  if (!existsSync(ignorePath)) writeFileSync(ignorePath, "sip-signing.key\n");
  console.log(`  private key  ${keyPath}  (never commit this; ${ignorePath} ignores it)`);
  console.log(`  public key   ${pubPath}`);
  console.log(`  keyid        ${keyIdOf(publicKey)}`);
  if (process.platform === "win32") {
    console.log("  note         Windows ignores file modes: the key is protected only by this folder's ACL.");
    console.log(`               To restrict it: icacls "${keyPath}" /inheritance:r /grant:r "%USERNAME%:F"`);
  } else if (statSync(keyPath).mode & 0o077) {
    console.log(`  warning      the key is readable by other users; run: chmod 600 ${keyPath}`);
  }
  return 0;
}

function main(argv) {
  if (argv[0] === "keygen") {
    if (!argv[1]) {
      console.log(USAGE);
      return 2;
    }
    return keygen(argv[1]);
  }

  const args = { path: null, key: null, out: null };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--key") args.key = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--help" || a === "-h") args.help = true;
    else if (!args.path) args.path = a;
  }
  if (args.help || !args.path || !args.key) {
    console.log(USAGE);
    return args.help ? 0 : 2;
  }

  let receipt;
  let keyPem;
  try {
    receipt = JSON.parse(readFileSync(resolve(args.path), "utf8"));
    keyPem = readFileSync(resolve(args.key), "utf8");
  } catch (err) {
    console.error(`sip-sign: ${err.message}`);
    return 2;
  }

  let envelope;
  try {
    envelope = signReceipt(receipt, keyPem);
  } catch (err) {
    console.error(`sip-sign: ${err.message}`);
    return err.message.startsWith("refusing") ? 1 : 2;
  }

  const out = args.out ?? args.path.replace(/\.json$/i, "") + ".dsse.json";
  try {
    writeFileSync(resolve(out), `${JSON.stringify(envelope, null, 2)}\n`);
  } catch (err) {
    console.error(`sip-sign: cannot write ${out}: ${err.message}`);
    return 2;
  }
  console.log(`  signed       ${receipt.subject ?? receipt.profileId ?? args.path}`);
  console.log(`  keyid        ${envelope.signatures[0].keyid}`);
  console.log(`  envelope     ${out}`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exit(main(process.argv.slice(2)));
}

export { main };
