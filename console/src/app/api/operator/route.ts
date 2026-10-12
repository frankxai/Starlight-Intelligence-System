import { NextResponse } from "next/server";
import os from "node:os";
import {
  appendCapture,
  buildRisks,
  estimateDiskFreeGb,
  fetchVoice,
  loadAllEntries,
  parseLedgerToday,
  pickSignalFeed,
  readHeartbeat,
  searchEntries,
  vaultDir,
  type VaultName,
  VAULT_NAMES,
} from "@/lib/operator-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  const [bundle, voice, fleet, ledger, diskFreeGb] = await Promise.all([
    loadAllEntries(),
    fetchVoice(),
    readHeartbeat(),
    parseLedgerToday(),
    estimateDiskFreeGb(),
  ]);

  const totalEntries = bundle.stats.reduce((a, s) => a + s.entries, 0);
  const risks = await buildRisks({
    bookOnline: fleet.bookOnline,
    voiceReachable: voice.reachable,
    vaultTotal: totalEntries,
    diskFreeGb,
  });

  const search = q ? searchEntries(bundle.entries, q, 14) : [];
  const signal = pickSignalFeed(bundle.entries, 8);

  return NextResponse.json(
    {
      ok: true as const,
      generatedAt: new Date().toISOString(),
      host: {
        hostname: os.hostname(),
        platform: `${os.platform()} ${os.release()}`,
        role: "C940 · sovereign brain",
      },
      vaults: {
        dir: vaultDir(),
        totalEntries,
        totalBytes: bundle.totalBytes,
        items: bundle.stats,
      },
      signal,
      search: { q, results: search },
      today: {
        ledger: ledger,
        risks,
        diskFreeGb,
      },
      voice,
      fleet,
      actions: [
        {
          id: "search",
          label: "Search memory",
          hint: "Type in the command bar",
        },
        {
          id: "capture",
          label: "Capture",
          hint: "Save a note to a vault",
        },
        {
          id: "substrate",
          label: "Substrate",
          href: "/substrate",
        },
        {
          id: "voice",
          label: "Voice console",
          href: "http://127.0.0.1:8765/dashboard/cockpit.html",
          external: true,
        },
        {
          id: "protocol",
          label: "Protocol site",
          href: "https://starlightintelligence.org",
          external: true,
        },
      ],
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: Request) {
  let body: {
    action?: string;
    content?: string;
    vault?: string;
    q?: string;
    tags?: string[];
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const action = body.action ?? "capture";

  if (action === "search") {
    const q = (body.q ?? "").trim();
    if (!q) {
      return NextResponse.json({ ok: false, error: "Empty query" }, { status: 400 });
    }
    const { entries } = await loadAllEntries();
    return NextResponse.json({
      ok: true,
      q,
      results: searchEntries(entries, q, 14),
    });
  }

  if (action === "capture") {
    const content = (body.content ?? "").trim();
    if (content.length < 3) {
      return NextResponse.json(
        { ok: false, error: "Write at least a few words." },
        { status: 400 },
      );
    }
    if (content.length > 8000) {
      return NextResponse.json(
        { ok: false, error: "Capture too long (8k max)." },
        { status: 400 },
      );
    }
    const vaultRaw = (body.vault ?? "operational") as VaultName;
    const vault = VAULT_NAMES.includes(vaultRaw) ? vaultRaw : "operational";
    const entry = await appendCapture({
      content,
      vault,
      tags: body.tags ?? ["operator-capture"],
    });
    return NextResponse.json({ ok: true, entry });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
