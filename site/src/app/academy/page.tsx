import type { Metadata } from "next";
import { AcademyAtlas } from "@/components/academy/AcademyAtlas";
import { academyAtlasModel } from "@/lib/academy-atlas";

const CANONICAL_URL = "https://starlightintelligence.org/academy";

export const metadata: Metadata = {
  title: "Academy Atlas — Forty Open Learning Paths",
  description:
    "Explore forty proposed Academy domain packs across Starlight, GenCreator, Arcanea, Freedom Systems, and the Institutional Commons—with learner personas, open paths, community experiences, and transparent managed-capacity hypotheses.",
  alternates: { canonical: CANONICAL_URL },
  openGraph: {
    title: "Academy Atlas — Forty paths. One open academy.",
    description:
      "A source-explicit portfolio for students, creators, experts, teams, and institutions. Learning stays open; paid tiers fund managed capacity.",
    url: CANONICAL_URL,
    type: "website",
  },
};

export default function AcademyPage() {
  return <AcademyAtlas model={academyAtlasModel} />;
}
