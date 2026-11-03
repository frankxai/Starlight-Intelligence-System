import type { Metadata } from "next";
import { BrandLabClient } from "./BrandLabClient";

export const metadata: Metadata = {
  title: "Living Design Observatory & Visual Brand Lab — Starlight",
  description:
    "Interactive 7-chapter Living Design Observatory for Starlight Living Design Language (v3.0). Living foundations, mark lineage, typography, 151-agent sigils, motion stage, VIS 30-pt study archive, and Open Design Kit.",
};

export default function BrandLabPage() {
  return <BrandLabClient />;
}
