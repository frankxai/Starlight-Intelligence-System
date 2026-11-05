import type { Metadata } from "next";
import { AgentsAtlasClient } from "./AgentsAtlasClient";

export const metadata: Metadata = {
  title: "151-Agent Sovereign Atlas — Starlight",
  description:
    "Interactive 151-Agent Sovereign Atlas. Discover every specialized mind in the Starlight council rendered with deterministic sacred-geometry vector sigils.",
};

export default function AgentsPage() {
  return <AgentsAtlasClient />;
}
