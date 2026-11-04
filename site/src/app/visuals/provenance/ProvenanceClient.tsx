"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldIcon,
  CheckIcon,
  SearchIcon,
  SparkIcon,
  OrbitIcon,
  SunIcon,
  MoonIcon,
  CloseIcon,
  DownloadIcon,
} from "@/components/icons";
import { StatusBadge, EvidenceDisclosure, ModalDialog } from "@/components/system";
import curatedStudies from "@/data/curated-studies.json";

export function ProvenanceClient() {
  const [theme, setTheme] = React.useState<"ink" | "paper">("ink");
  const [search, setSearch] = React.useState("");
  const [tierFilter, setTierFilter] = React.useState("All");
  const [selectedItem, setSelectedItem] = React.useState<any>(null);

  React.useEffect(() => {
    if (!selectedItem) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedItem(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedItem]);

  const studies = curatedStudies as any[];

  const filtered = studies.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.filename.toLowerCase().includes(search.toLowerCase()) ||
      item.role.toLowerCase().includes(search.toLowerCase()) ||
      item.prompt_hash.toLowerCase().includes(search.toLowerCase());
    const matchTier =
      tierFilter === "All" ||
      (tierFilter === "Hero" && item.vis_score >= 28) ||
      (tierFilter === "Approved" && item.vis_score >= 26 && item.vis_score < 28) ||
      (tierFilter === "Study" && item.vis_score < 26);
    return matchSearch && matchTier;
  });

  return (
    <div
      data-theme={theme}
      className={`min-h-screen transition-colors duration-300 font-sans ${
        theme === "paper" ? "bg-[#efede7] text-[#0e131b]" : "bg-[#070a10] text-[#ede6d8]"
      }`}
    >
      {/* Header */}
      <header className="border-b border-[var(--sl-border,rgba(237,230,216,0.12))] px-6 py-14">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--sl-gold,#c9a15c)]/40 bg-[var(--sl-gold,#c9a15c)]/10 px-3.5 py-1 text-xs font-mono text-[var(--sl-gold,#c9a15c)] mb-3">
              <ShieldIcon size={14} />
              <span>Visual Intelligence System · Provenance SSOT</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--sl-fg,#ede6d8)]">
              VIS 30-Point Quality Gate & Rights Ledger
            </h1>
            <p className="mt-2 text-sm text-[var(--sl-fg-muted,#8b93a1)] max-w-2xl">
              Independent cross-family visual evaluation, first-party rights certification, and multi-tier Cloudflare R2 CDN architecture.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setTheme(theme === "ink" ? "paper" : "ink")}
              aria-label="Toggle theme"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--sl-border,rgba(237,230,216,0.14))] text-xs font-mono text-[var(--sl-fg,#ede6d8)] hover:bg-white/5 transition-micro"
            >
              {theme === "ink" ? <SunIcon size={14} /> : <MoonIcon size={14} />}
              <span>{theme === "ink" ? "Ink Mode" : "Paper Mode"}</span>
            </button>
            <Link
              href="/visuals/brand-lab"
              className="px-3.5 py-1.5 rounded-lg bg-[var(--sl-gold,#c9a15c)] text-black text-xs font-semibold hover:bg-[var(--sl-gold-bright,#f0c87e)] transition-micro"
            >
              Brand Lab →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-16">
        {/* Metric Cards Summary */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)] space-y-1">
            <span className="text-[11px] font-mono text-[var(--sl-gold,#c9a15c)] uppercase">Ledger Ingestion</span>
            <div className="text-2xl font-bold text-[var(--sl-fg,#ede6d8)]">3,858 / 3,858</div>
            <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">100% indexed in vis.sqlite (0 unindexed)</p>
          </div>

          <div className="p-5 rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)] space-y-1">
            <span className="text-[11px] font-mono text-[var(--sl-companion,#82d8e6)] uppercase">Brand Attribution</span>
            <div className="text-2xl font-bold text-[var(--sl-fg,#ede6d8)]">0 Unknown</div>
            <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">Deterministic path & edge classification</p>
          </div>

          <div className="p-5 rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)] space-y-1">
            <span className="text-[11px] font-mono text-emerald-400 uppercase">First-Party Rights</span>
            <div className="text-2xl font-bold text-[var(--sl-fg,#ede6d8)]">2,027+ Owned</div>
            <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">Verified generated-owned prompt receipts</p>
          </div>

          <div className="p-5 rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)] space-y-1">
            <span className="text-[11px] font-mono text-[var(--sl-gold,#c9a15c)] uppercase">Ship-Ready Assets</span>
            <div className="text-2xl font-bold text-[var(--sl-fg,#ede6d8)]">1,190 Pass Gate</div>
            <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)]">113 Hero (&ge;28) · 1,077 Approved (26-27)</p>
          </div>
        </section>

        {/* 30-Point Rubric Explanation */}
        <section className="rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)] p-8">
          <div className="mb-6">
            <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] uppercase">Evaluation Standards</span>
            <h2 className="text-xl font-semibold text-[var(--sl-fg,#ede6d8)] mt-1">
              The 6-Dimension 30-Point Quality Gate Rubric
            </h2>
            <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)] mt-1">
              Evaluated by independent model families (cross-family verifier) to prevent self-scoring bias.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-white/5 bg-black/30">
              <span className="font-mono text-[var(--sl-gold,#c9a15c)] block mb-1">1. Brand Canon Fit (0–5)</span>
              <p className="text-slate-300 leading-relaxed">
                Adherence to Starlight brand packs, celestial aesthetic metaphor, and sovereign philosophy.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-black/30">
              <span className="font-mono text-[var(--sl-gold,#c9a15c)] block mb-1">2. Craft & Composition (0–5)</span>
              <p className="text-slate-300 leading-relaxed">
                Optical balance, clean focal hierarchy, photographic lighting restraint, and lack of visual clutter.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-black/30">
              <span className="font-mono text-[var(--sl-gold,#c9a15c)] block mb-1">3. Typography Cleanliness (0–5)</span>
              <p className="text-slate-300 leading-relaxed">
                Strict zero-tolerance for hallucinated, garbled pseudo-English in raster images. Overlay text must be HTML.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-black/30">
              <span className="font-mono text-[var(--sl-gold,#c9a15c)] block mb-1">4. Material Restraint (0–5)</span>
              <p className="text-slate-300 leading-relaxed">
                Ivory porcelain, brushed brass, velvet night void. Rejection of radioactive neon cyan-purple gradients.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-black/30">
              <span className="font-mono text-[var(--sl-gold,#c9a15c)] block mb-1">5. Surface Role Utility (0–5)</span>
              <p className="text-slate-300 leading-relaxed">
                Whether the asset performs a clear job in UI: Hero identity, card plate, study specimen, or motion backdrop.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-black/30">
              <span className="font-mono text-[var(--sl-gold,#c9a15c)] block mb-1">6. Accessibility & Artifacts (0–5)</span>
              <p className="text-slate-300 leading-relaxed">
                Lack of compression artifacts, verified SHA-256 hash, and machine-readable .vis.provenance.json sidecar.
              </p>
            </div>
          </div>
        </section>

        {/* Live Ledger Table */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] uppercase">Live Ledger Inspector</span>
              <h2 className="text-2xl font-semibold text-[var(--sl-fg,#ede6d8)] mt-0.5">
                Evaluated Asset Ledger ({filtered.length} shown)
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-48">
                <SearchIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--sl-fg-muted,#8b93a1)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search assets..."
                  className="w-full rounded-md border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)] pl-8 pr-2 py-1 text-xs text-[var(--sl-fg,#ede6d8)] outline-none font-mono"
                />
              </div>

              <div className="flex rounded-md border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)] p-0.5 text-xs font-mono">
                {["All", "Hero", "Approved", "Study"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTierFilter(t)}
                    className={`px-2.5 py-1 rounded transition-micro ${
                      tierFilter === t
                        ? "bg-[var(--sl-accent-fill,#c9a15c)] text-[var(--sl-on-accent,#070a10)] font-semibold"
                        : "text-[var(--sl-fg-muted,#8b93a1)] hover:text-[var(--sl-fg,#ede6d8)]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.14))] bg-[var(--sl-surface-1,#0d1119)]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/10 bg-black/20 text-[var(--sl-fg-muted,#8b93a1)]">
                <tr>
                  <th className="p-3">Asset Title / File</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Tier</th>
                  <th className="p-3">Rights Status</th>
                  <th className="p-3">Prompt Hash</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[var(--sl-fg,#ede6d8)]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold text-[var(--sl-fg,#ede6d8)]">
                      <div>{item.title}</div>
                      <span className="text-[10px] text-[var(--sl-fg-muted,#8b93a1)] font-normal">{item.filename}</span>
                    </td>
                    <td className="p-3 text-[var(--sl-fg,#ede6d8)]">{item.role}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.vis_score >= 28
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : item.vis_score >= 26
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        }`}
                      >
                        {item.vis_score} / 30
                      </span>
                    </td>
                    <td className="p-3 text-[var(--sl-fg,#ede6d8)]">{item.tier}</td>
                    <td className="p-3 text-emerald-400">{item.rights_status}</td>
                    <td className="p-3 text-[var(--sl-fg-muted,#8b93a1)] font-mono text-[11px]">{item.prompt_hash}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="text-[var(--sl-gold,#c9a15c)] hover:underline cursor-pointer"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modal for item inspection */}
        {selectedItem && (
          <ModalDialog
            labelledBy="provenance-modal-title"
            maxWidthClass="max-w-lg"
            onClose={() => setSelectedItem(null)}
          >
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label="Close modal"
                className="absolute right-4 top-4 text-[var(--sl-fg-muted,#8b93a1)] hover:text-[var(--sl-fg,#ede6d8)]"
              >
                <CloseIcon size={18} />
              </button>

              <h3 id="provenance-modal-title" className="text-lg font-semibold text-[var(--sl-fg,#ede6d8)] mb-1">
                {selectedItem.title}
              </h3>
              <p className="text-xs font-mono text-[var(--sl-gold,#c9a15c)] mb-4">
                Score: {selectedItem.vis_score} / 30 PTS · {selectedItem.tier}
              </p>

              <div className="space-y-3 text-xs font-mono text-[var(--sl-fg,#ede6d8)] mb-4">
                <p>Filename: {selectedItem.filename}</p>
                <p>Role: {selectedItem.role}</p>
                <p>Model: {selectedItem.model}</p>
                <p>Prompt Hash: {selectedItem.prompt_hash}</p>
                <p>Rights Status: <span className="text-emerald-400">{selectedItem.rights_status}</span></p>
              </div>

              {selectedItem.critique_notes && (
                <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-xs text-[var(--sl-fg,#ede6d8)] mb-4">
                  <span className="text-[10px] font-mono text-[var(--sl-gold,#c9a15c)] uppercase block mb-1">
                    Independent Assessment
                  </span>
                  {selectedItem.critique_notes}
                </div>
              )}

              <EvidenceDisclosure summary="Machine Provenance JSON">
                <pre className="text-[10px] font-mono p-3 rounded bg-black/60 overflow-x-auto text-[var(--sl-fg,#ede6d8)]">
                  {JSON.stringify(selectedItem, null, 2)}
                </pre>
              </EvidenceDisclosure>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-1.5 rounded-lg bg-[var(--sl-accent-fill,#c9a15c)] text-[var(--sl-on-accent,#070a10)] text-xs font-semibold hover:opacity-90"
                >
                  Close
                </button>
              </div>
          </ModalDialog>
        )}
      </main>
    </div>
  );
}
