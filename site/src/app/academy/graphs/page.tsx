import type { Metadata } from "next";
import { AcademyGraphObservatory } from "@/components/academy/AcademyGraphObservatory";
import { academyGraphModel } from "@/lib/academy-graphs";

const CANONICAL_URL = "https://starlightintelligence.org/academy/graphs";

export const metadata: Metadata = {
  title: "Academy Graph Observatory",
  description:
    "Inspect the open Graph Engineering Commons capability path, Mission Zero execution topology, human authority gate, and free-core contract.",
  alternates: { canonical: CANONICAL_URL },
  openGraph: {
    title: "Academy Graph Observatory — Mission Zero",
    description:
      "A fixture-backed, read-only proof loom for governed capability and execution graphs.",
    url: CANONICAL_URL,
    type: "website",
  },
};

export default function AcademyGraphsPage() {
  return <AcademyGraphObservatory model={academyGraphModel} />;
}

