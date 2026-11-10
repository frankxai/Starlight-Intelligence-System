import type { Metadata } from "next";
import { TeammatesDocsClient } from "./TeammatesDocsClient";

export const metadata: Metadata = {
  title: "Starlight Teammates & AI Genius | Architecture & Developer Guide",
  description:
    "Developer reference for Starlight Teammates REST & SSE APIs, Frontier Model Engine (Sonnet 5.5, Argon 4, Opus 5.5, Sol 6.1), MicroVM Sandboxes, and AI Genius Freedom Path.",
  alternates: { canonical: "/docs/teammates" },
  openGraph: {
    title: "Starlight Teammates & AI Genius Architecture Guide",
    description:
      "Autonomous digital workers, isolated MicroVM sandboxes, multi-model cascade, and sovereign creator freedom paths.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Starlight Teammates & AI Genius Architecture Guide",
    description:
      "Autonomous digital workers, isolated MicroVM sandboxes, multi-model cascade, and sovereign creator freedom paths.",
  },
};

export default function TeammatesDocsPage() {
  return <TeammatesDocsClient />;
}
