#!/usr/bin/env node
/**
 * Owner CLI for session continuity. Import and status mirror the MCP tools; reconcile
 * is deliberately local-only, because an MCP caller can claim any actor identity.
 *
 *   starlight-continuity import <absolute-bundle-dir>
 *   starlight-continuity status [--json]
 *   starlight-continuity reconcile --work <id> --actor <owner> --decision admit|block --reason <text> [--acknowledge-paused]
 */
import { readFileSync, readSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { continuityStatus, importContinuityBundle, reconcileWork, type ContinuityStatus } from "./continuity-import.js";

export interface CliResult { exitCode: number; stdout: string; stderr: string }

/** The terminal the owner types into; agents and pipes have no interactive terminal. */
export interface OwnerTerminal { interactive: boolean; ask(question: string): string }

function readLineSync(): string {
  const buffer = Buffer.alloc(1);
  let line = "";
  while (readSync(0, buffer, 0, 1, null) === 1 && buffer[0] !== 0x0a) line += buffer.toString("utf8");
  return line.replace(/\r$/, "");
}

const processTerminal: OwnerTerminal = {
  interactive: Boolean(process.stdin.isTTY && process.stdout.isTTY),
  ask(question) { process.stdout.write(question); return readLineSync(); },
};

function paths() {
  const home = process.env.SIS_CONTINUITY_HOME ?? join(homedir(), ".starlight", "continuity");
  return { store: join(home, "store"), policy: join(home, "trust-policy.json") };
}

function flags(args: string[]): Map<string, string | true> {
  const out = new Map<string, string | true>();
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith("--")) throw new Error(`Unexpected argument ${args[i]}`);
    const next = args[i + 1];
    if (next !== undefined && !next.startsWith("--")) { out.set(args[i], next); i++; }
    else out.set(args[i], true);
  }
  return out;
}

export function renderStatus(status: ContinuityStatus): string {
  if (!status.works.length) return `No recovered work. ${status.imports} import(s); ${status.unattributedQuarantine} quarantined event(s) for unregistered work.\n`;
  const lines = status.works.map((w) => [
    `${w.workId}  [${w.state}]  owner ${w.ownerActorId ?? "unregistered"}`,
    `  intent: ${w.intent.distinctRequests} request(s) seen ${w.intent.observations} time(s) via ${w.intent.harnesses.join(", ")}; capture ${w.intent.captureCompleteness.join("/") || "unknown"}`,
    `  reported: ${w.reportedState ? `${w.reportedState.value} (${w.reportedState.verification})` : "unknown"}`,
    `  checkout: ${w.checkout ? `${w.checkout.origin} ${w.checkout.branch} @ ${w.checkout.head.slice(0, 12)}${w.checkout.dirty ? " with uncommitted work" : ""}` : "unknown"}`,
    `  admission: ${w.admission.admitted ? `admitted by ${w.admission.byActorId}` : "not admitted"}`,
    `  delivery: ${w.delivery.completed ? "completed with proof" : w.admission.admitted ? `missing ${w.delivery.missingProofs.join(", ") || "nothing"}` : "not started"}`,
    w.quarantined ? `  quarantined: ${w.quarantined} untrusted event(s)` : "",
  ].filter(Boolean).join("\n"));
  const footer = `\n${status.imports} import(s). Nothing resumes automatically; paused work needs owner reconciliation.\n`;
  return lines.join("\n\n") + "\n" + footer;
}

export function runContinuityCli(args: string[], terminal: OwnerTerminal = processTerminal): CliResult {
  const { store, policy } = paths();
  const readPolicy = () => JSON.parse(readFileSync(policy, "utf8")) as unknown;
  try {
    const [command, ...rest] = args;
    if (command === "import" && rest.length === 1) {
      const result = importContinuityBundle(rest[0], store, readPolicy());
      return { exitCode: result.status === "refused" ? 1 : 0, stdout: JSON.stringify(result) + "\n", stderr: result.refusal ? `${result.refusal}\n` : "" };
    }
    if (command === "status") {
      const status = continuityStatus(store, readPolicy());
      return { exitCode: 0, stdout: rest.includes("--json") ? JSON.stringify(status, null, 2) + "\n" : renderStatus(status), stderr: "" };
    }
    if (command === "reconcile") {
      const f = flags(rest);
      const decision = f.get("--decision");
      if (decision !== "admit" && decision !== "block") throw new Error("--decision must be admit or block");
      if (!terminal.interactive) throw new Error("Reconciliation needs the owner at an interactive terminal; agents and scripts cannot admit work.");
      const workId = String(f.get("--work") ?? "");
      const typedWorkId = terminal.ask(`Type the work ID to ${decision} ${workId}: `).trim();
      const event = reconcileWork(store, readPolicy(), {
        workId, actorId: String(f.get("--actor") ?? ""), decision,
        reason: String(f.get("--reason") ?? ""), acknowledgePaused: f.get("--acknowledge-paused") === true,
        confirmation: { method: "interactive-terminal", typedWorkId },
      });
      return { exitCode: 0, stdout: JSON.stringify({ recorded: event.kind, eventId: event.eventId, executionStarted: false }) + "\n", stderr: "" };
    }
    return { exitCode: 2, stdout: "", stderr: "Usage: starlight-continuity import <dir> | status [--json] | reconcile --work <id> --actor <owner> --decision admit|block --reason <text> [--acknowledge-paused]\n" };
  } catch (error) {
    return { exitCode: 1, stdout: "", stderr: `${error instanceof Error ? error.message : "Continuity command failed"}\n` };
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = runContinuityCli(process.argv.slice(2));
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  process.exitCode = result.exitCode;
}
