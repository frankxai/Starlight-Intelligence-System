"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import SubstrateGraph2D from "./SubstrateGraph2D";
import SubstrateHud from "./SubstrateHud";
import SubstrateSceneClient from "./SubstrateSceneClient";

type ViewMode = "2d" | "3d";

/**
 * Client wrapper that owns the view-mode toggle.
 *
 * URL state via ?view=2d|3d. Renderer (2D force / 3D R3F) swaps on
 * mount/unmount; the HUD is shared across both views so V&V chrome
 * stays continuous when the user toggles.
 */
export default function SubstrateViewSwitcher({
  initialView,
}: {
  initialView: ViewMode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const view: ViewMode = useMemo(() => {
    const raw = searchParams.get("view");
    if (raw === "3d") return "3d";
    if (raw === "2d") return "2d";
    return initialView;
  }, [searchParams, initialView]);

  const setView = useCallback(
    (next: ViewMode) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", next);
      router.replace(`/substrate?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      {/* Vellum paper-grain overlay — covers viewport, behind HUD */}
      <div className="vellum-grain" aria-hidden />

      {/* Renderer */}
      <div className="absolute inset-0">
        {view === "2d" ? <SubstrateGraph2D /> : <SubstrateSceneClient />}
      </div>

      {/* V&V HUD overlay */}
      <SubstrateHud view={view} setView={setView} />
    </div>
  );
}
