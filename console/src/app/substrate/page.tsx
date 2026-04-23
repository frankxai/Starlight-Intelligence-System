import type { Metadata } from "next";
import { Suspense } from "react";
import SubstrateViewSwitcher from "@/components/SubstrateViewSwitcher";

export const metadata: Metadata = {
  title: "Substrate",
  description:
    "The Starlight substrate as a navigable graph. Six vaults, ten verticals, one core. 2D force-graph by default; 3D scene as the signature toggle.",
};

type ViewMode = "2d" | "3d";

/**
 * Server Component — reads `?view=` once for first paint, hands off to a
 * client switcher that owns the live URL state. Default is `2d` per the
 * Luminor REVISE: legibility > demo, with 3D one click away.
 */
export default async function SubstratePage({
  searchParams,
}: {
  // Next 16: searchParams is a Promise in Server Components.
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = params.view;
  const initial: ViewMode =
    (Array.isArray(raw) ? raw[0] : raw) === "3d" ? "3d" : "2d";

  return (
    <Suspense
      fallback={
        <div className="flex h-dvh w-full items-center justify-center bg-[#050509] text-[12px] uppercase tracking-widest text-slate-500">
          loading substrate&hellip;
        </div>
      }
    >
      <SubstrateViewSwitcher initialView={initial} />
    </Suspense>
  );
}
