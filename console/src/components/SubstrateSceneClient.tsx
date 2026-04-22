"use client";

import dynamic from "next/dynamic";

/**
 * Client-only loader for the R3F scene.
 *
 * Why this file exists: Next 16 disallows `dynamic(..., { ssr: false })` from
 * Server Components. The substrate page is a Server Component (so it can carry
 * `metadata`), so the no-SSR dynamic import is moved into this thin client
 * wrapper.
 */
const SubstrateScene = dynamic(() => import("./SubstrateScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#050509] text-[12px] uppercase tracking-widest text-slate-500">
      loading substrate&hellip;
    </div>
  ),
});

export default function SubstrateSceneClient() {
  return <SubstrateScene />;
}
