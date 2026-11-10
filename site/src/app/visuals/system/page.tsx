import type { Metadata } from "next";
import { SystemBenchClient } from "./SystemBenchClient";

export const metadata: Metadata = {
  title: "Component Specimen Bench — Starlight Living Design",
  description:
    "Interactive component specimen bench for Starlight Living Design System (v3.0). Test GlassSurface, ApprovalCard, StatusBadge, EvidenceDisclosure, and 24 Signal SVG icons.",
};

export default function SystemPage() {
  return <SystemBenchClient />;
}
