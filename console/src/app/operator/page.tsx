import type { Metadata } from "next";
import os from "node:os";
import OperatorClient from "./OperatorClient";
import {
  buildRisks,
  estimateDiskFreeGb,
  fetchVoice,
  loadAllEntries,
  parseLedgerToday,
  pickSignalFeed,
  readHeartbeat,
  vaultDir,
} from "@/lib/operator-data";

export const metadata: Metadata = {
  title: "Operator",
  description: "Run C940 today — search memory, capture, act.",
};

export const dynamic = "force-dynamic";

async function loadInitial() {
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

  return {
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
    signal: pickSignalFeed(bundle.entries, 8),
    search: { q: "", results: [] as never[] },
    today: {
      ledger,
      risks,
      diskFreeGb,
    },
    voice,
    fleet,
    actions: [],
  };
}

export default async function OperatorPage() {
  const initial = await loadInitial();
  return (
    <>
      <div className="vellum-grain" aria-hidden />
      <OperatorClient initialData={initial} />
    </>
  );
}
