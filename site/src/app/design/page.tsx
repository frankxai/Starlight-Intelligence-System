import type { Metadata } from "next";
import { DesignReaderClient } from "./DesignReaderClient";

export const metadata: Metadata = {
  title: "Living Design v3.0 Specification Reader — Starlight",
  description:
    "Canonical public specification reader for Starlight Living Design Language (v3.0). Machine-readable @google/design.md YAML export, tokens, and laws.",
};

export default function DesignPage() {
  return <DesignReaderClient />;
}
