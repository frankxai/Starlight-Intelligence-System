import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { CreatorWorkspace, createCreatorPacket } from "../src/creator-workspace.js";
import { TerminalRunJournal } from "../src/terminal-runtime.js";
import { runTerminalCli } from "../src/terminal-cli.js";

const roots: string[] = [];
afterEach(() => { for (const p of roots.splice(0)) rmSync(p, { recursive: true, force: true }); });
const brief = { version: "starlight.creator-brief.v1" as const, id: "creator-proof", audience: "Technical creators",
  intent: "Explain recoverable agent work", sources: [{ id: "source-1", title: "Execution notes", url: "https://example.org/notes",
    text: "An interrupted request can have an unknown outcome. Keep the attempt and inspect it before retrying." }] };
const draft = { version: "starlight.creator-draft.v1" as const, title: "Before you retry an agent",
  body: "A timeout does not prove that no work happened. Keep the attempt, inspect the worker and confirm its state before retrying.",
  claims: [{ text: "Interrupted requests can have unknown outcomes", sourceIds: ["source-1"] }],
  channels: [{ channel: "linkedin" as const, text: "Keep the attempt before you retry an agent.", sourceIds: ["source-1"] }],
  reviewNotes: ["Source mapping is structural; a human must check the claim."] };
async function setup() {
  const root = mkdtempSync(join(tmpdir(), "sis-creator-test-")); roots.push(root);
  const journal = new TerminalRunJournal(join(root, "journal"));
  const packet = createCreatorPacket(brief, "issue:144");
  await journal.execute(packet, { runtime: { id: "test-only", invoke: async () => ({ protocol: "starlight.worker.v1", taskId: packet.request.taskId,
    status: "completed", output: JSON.stringify(draft) }) }, timeoutMs: 1000,
    admit: async () => ({ authorityRef: "test-host", reservationRef: "test-only", budgetCeilingCents: 0, expiresAt: new Date(Date.now()+60_000).toISOString() }) });
  return { root, journal, workspace: new CreatorWorkspace(join(root, "workspace")) };
}
describe("recoverable creator workspace", () => {
  it("supports packet, capture, edit and export through the existing CLI", async () => {
    const f=await setup(), briefFile=join(f.root,"brief.json"), draftFile=join(f.root,"edit.json");
    writeFileSync(briefFile,JSON.stringify(brief)); writeFileSync(draftFile,JSON.stringify({...draft,title:"Edited through CLI"}));
    const packetResult=await runTerminalCli(["creator","packet","--file",briefFile,"--work-ref","issue:144"]);
    assert.equal(packetResult.exitCode,0,packetResult.stderr);
    assert.equal(JSON.parse(packetResult.stdout).domain,"gencreator");
    const result=await runTerminalCli(["creator","capture",brief.id,"--file",briefFile,"--journal",f.journal.directory,"--workspace",f.workspace.directory]);
    assert.equal(result.exitCode,0,result.stderr);
    const edited=await runTerminalCli(["creator","edit",brief.id,"--file",draftFile,"--expected",JSON.parse(result.stdout).sha256,"--workspace",f.workspace.directory]);
    assert.equal(edited.exitCode,0,edited.stderr);
    const exported=await runTerminalCli(["creator","export",brief.id,"--workspace",f.workspace.directory]);
    assert.equal(exported.exitCode,0,exported.stderr); assert.match(JSON.parse(exported.stdout).markdown,/Edited through CLI/);
  });
  it("captures a bound result, restarts, edits without overwriting and exports provenance", async () => {
    const f = await setup(); const first = f.workspace.capture(brief, f.journal);
    const reopened = new CreatorWorkspace(f.workspace.directory);
    const edited = reopened.edit(brief.id, { ...draft, title: "Check the attempt before retrying" }, first.sha256);
    assert.equal(edited.revision, 2); assert.equal(edited.parentSha256, first.sha256);
    assert.equal(JSON.parse(readFileSync(join(f.workspace.directory, `${brief.id}-000001.json`), "utf8")).draft.title, draft.title);
    const exported = reopened.export(brief.id);
    assert.match(exported.markdown, /Check the attempt/); assert.match(exported.markdown, /https:\/\/example.org\/notes/);
    assert.equal(exported.manifest.revisionSha256, edited.sha256);
    assert.equal(exported.manifest.markdownSha256,createHash("sha256").update(exported.markdown).digest("hex"));
    assert.equal(exported.manifest.verification, "pending-human-review");
  });
  it("rejects stale edits, unknown sources and source drift", async () => {
    const f = await setup(); const first = f.workspace.capture(brief, f.journal);
    f.workspace.edit(brief.id, { ...draft, title: "New title" }, first.sha256);
    assert.throws(() => f.workspace.edit(brief.id, draft, first.sha256), /stale/);
    assert.throws(() => f.workspace.edit(brief.id, { ...draft, claims: [{ text: "Invented", sourceIds: ["missing"] }] }, f.workspace.inspect(brief.id)!.sha256), /source/);
    assert.throws(() => f.workspace.capture({ ...brief, intent: "Changed task" }, f.journal), /bound/);
  });
  it("detects corruption and never silently uses an older revision", async () => {
    const f = await setup(); const first = f.workspace.capture(brief, f.journal);
    f.workspace.edit(brief.id, draft, first.sha256);
    writeFileSync(join(f.workspace.directory, `${brief.id}-000002.json`), "{}");
    assert.throws(() => f.workspace.inspect(brief.id), /revision/);
  });
  it("refuses traversal IDs and non-HTTPS source links", () => {
    assert.throws(() => createCreatorPacket({ ...brief, id: "../outside" }, "issue:144"));
    assert.throws(() => createCreatorPacket({ ...brief, sources: [{ ...brief.sources[0], url: "javascript:alert(1)" }] }, "issue:144"));
  });
  it("never captures an unconfirmed run or permits silent source replacement", async () => {
    const f=await setup();
    assert.throws(()=>f.workspace.capture({...brief,id:"absent"},f.journal),/confirmed/);
    assert.throws(()=>f.workspace.capture({...brief,sources:[{...brief.sources[0],text:"Different evidence"}]},f.journal),/bound/);
  });
  it("rejects changed output for an already captured attempt", async () => {
    const f=await setup(); f.workspace.capture(brief,f.journal);
    const p=join(f.journal.directory,brief.id+".json"), run=JSON.parse(readFileSync(p,"utf8"));
    run.receipt.output=JSON.stringify({...draft,title:"Different worker result"});
    run.outputSha256=createHash("sha256").update(run.receipt.output).digest("hex");
    writeFileSync(p,JSON.stringify(run));
    assert.throws(()=>f.workspace.capture(brief,f.journal),/origin/);
  });
});
