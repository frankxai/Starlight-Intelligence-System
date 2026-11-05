import type { Metadata } from "next";
import { ProvenanceClient } from "./ProvenanceClient";

export const metadata: Metadata = {
  title: "VIS 30-Point Gate & Rights Ledger — Starlight",
  description:
    "Visual Intelligence System (VIS) 30-point independent quality gate, first-party rights certification, and Cloudflare R2 multi-tier CDN architecture.",
};

export default function ProvenancePage() {
  return <ProvenanceClient />;
}
