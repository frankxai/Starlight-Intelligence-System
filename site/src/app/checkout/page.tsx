import { Suspense } from "react";
import type { Metadata } from "next";
import { GalaxyField } from "@/components/cinematic/GalaxyField";
import { CheckoutClient } from "./CheckoutClient";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Checkout — Starlight Sovereign Cloud",
  description:
    "Complete your Starlight Managed Cloud subscription. Zero-knowledge encrypted backups, edge mesh synchronization, and pooled frontier AI routing.",
  alternates: {
    canonical: "/checkout",
  },
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#060609] text-slate-100">
      <section className="relative overflow-hidden border-b border-white/[0.06] px-6 pb-20 pt-16 md:pb-28 md:pt-20">
        <GalaxyField still="nursery" />
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(16,185,129,0.12),transparent_35%),radial-gradient(circle_at_20%_75%,rgba(6,182,212,0.10),transparent_30%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl">
          <div className="text-center">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-emerald-300">
              Sovereign cloud · secure activation
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.03em] text-white md:text-5xl">
              Activate Your Intelligence Fleet
            </h1>
          </div>

          <div className="mt-12">
            <Suspense
              fallback={
                <div className="flex min-h-[400px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                </div>
              }
            >
              <CheckoutClient />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
