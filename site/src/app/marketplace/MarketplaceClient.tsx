"use client";

import { useState, useMemo } from "react";
import {
  Boxes,
  Cpu,
  Layers,
  ShieldCheck,
  Terminal,
  Search,
  Check,
  Copy,
  Info,
  X,
  ExternalLink,
  Workflow,
  Sparkles,
} from "lucide-react";

export interface MarketplaceCard {
  id: string;
  name: string;
  version: string;
  kind: "Skill pack" | "MCP server" | "Harness profile" | "Cloud service" | "Vertical stack";
  category: string;
  author: string;
  description: string;
  pricing: "Free" | "Freemium" | "Pro" | "Enterprise";
  featured?: boolean;
  installCommand: string;
  tags: string[];
  capabilities: string[];
  permissions: string[];
}

interface MarketplaceClientProps {
  items: MarketplaceCard[];
}

export function MarketplaceClient({ items }: MarketplaceClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKind, setSelectedKind] = useState<string>("All");
  const [selectedPricing, setSelectedPricing] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inspectItem, setInspectItem] = useState<MarketplaceCard | null>(null);

  const kinds = useMemo(() => {
    return [
      "All",
      "Skill pack",
      "MCP server",
      "Harness profile",
      "Cloud service",
      "Vertical stack",
    ];
  }, []);

  const pricingTiers = ["All", "Free", "Freemium", "Pro", "Enterprise"];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedKind !== "All" && item.kind !== selectedKind) {
        return false;
      }
      if (selectedPricing !== "All" && item.pricing !== selectedPricing) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesTag = item.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCap = item.capabilities.some((c) => c.toLowerCase().includes(q));
        const matchesCategory = item.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesId && !matchesTag && !matchesCap && !matchesCategory) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedKind, selectedPricing, searchQuery]);

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-[#0b0b14]/90 p-4 shadow-xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skill packs, MCP servers, harnesses, capabilities..."
            className="w-full rounded-lg border border-white/[0.08] bg-[#07070d] py-2.5 pl-10 pr-9 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Tier:</span>
          {pricingTiers.map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedPricing(tier)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                selectedPricing === tier
                  ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400/40"
                  : "bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08]"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Kind Categories Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/[0.08] pb-4">
        {kinds.map((kind) => {
          const count = kind === "All" ? items.length : items.filter((i) => i.kind === kind).length;
          return (
            <button
              key={kind}
              onClick={() => setSelectedKind(kind)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition ${
                selectedKind === kind
                  ? "border border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                  : "border border-transparent bg-white/[0.02] text-slate-400 hover:border-white/[0.06] hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <span>{kind === "All" ? "All Ecosystem Artifacts" : kind + "s"}</span>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
                  selectedKind === kind ? "bg-cyan-400/20 text-cyan-200" : "bg-white/[0.06] text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results Count & Active Status */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Showing <strong className="text-white">{filteredItems.length}</strong> of{" "}
          <strong className="text-white">{items.length}</strong> artifacts
        </span>
        {(searchQuery || selectedKind !== "All" || selectedPricing !== "All") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedKind("All");
              setSelectedPricing("All");
            }}
            className="text-[11px] text-cyan-300 underline hover:text-cyan-200"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Grid of Cards */}
      {filteredItems.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#0b0b14]/50 py-16 text-center backdrop-blur-xl">
          <Search className="mx-auto h-8 w-8 text-slate-600" />
          <p className="mt-3 text-sm font-medium text-white">No ecosystem items match your filters</p>
          <p className="mt-1 text-xs text-slate-400">Try loosening your search query or switching category tabs.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between border border-white/[0.08] bg-[#0b0b12]/90 p-6 shadow-lg backdrop-blur-xl transition hover:border-cyan-500/40"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-300">
                        {item.kind}
                      </span>
                      <span className="rounded bg-cyan-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cyan-300">
                        {item.pricing}
                      </span>
                      {item.featured && (
                        <span className="rounded bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-300">
                          ★ Featured
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-xl font-medium text-white">{item.name}</h3>
                    <p className="font-mono text-xs text-slate-500">
                      v{item.version} · by {item.author} · {item.category}
                    </p>
                  </div>

                  <button
                    onClick={() => setInspectItem(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                    title="Inspect manifest & architecture details"
                    aria-label={`Inspect ${item.name}`}
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-300">{item.description}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      onClick={() => setSearchQuery(t)}
                      className="cursor-pointer rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-0.5 text-[11px] text-slate-400 hover:border-cyan-400/30 hover:text-cyan-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="mt-5 border-t border-white/[0.06] pt-4">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Capabilities:</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.capabilities.map((c) => (
                      <span key={c} className="font-mono text-[11px] text-slate-400">
                        {c} ·
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-white/[0.06] pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Install snippet</span>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                    <ShieldCheck className="h-3 w-3" /> SIP verified
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 rounded border border-white/[0.06] bg-[#07070c] px-3 py-2 font-mono text-xs text-cyan-200">
                  <span className="truncate">{item.installCommand}</span>
                  <button
                    onClick={() => handleCopy(item.id, item.installCommand)}
                    className="flex shrink-0 items-center gap-1 rounded bg-white/[0.08] px-2 py-1 text-[10px] font-sans text-slate-300 transition hover:bg-white/20 hover:text-white"
                    aria-label={`Copy command for ${item.name}`}
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Item Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.12] bg-[#0d0d18] p-6 shadow-2xl">
            <button
              onClick={() => setInspectItem(null)}
              className="absolute right-4 top-4 rounded-full border border-white/[0.1] bg-white/[0.05] p-1.5 text-slate-400 hover:bg-white/[0.1] hover:text-white"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="rounded bg-white/[0.06] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-300">
                {inspectItem.kind}
              </span>
              <span className="rounded bg-cyan-400/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cyan-300">
                {inspectItem.pricing}
              </span>
            </div>

            <h3 className="mt-3 text-2xl font-semibold text-white">{inspectItem.name}</h3>
            <p className="font-mono text-xs text-slate-400">
              id: <code className="text-cyan-300">{inspectItem.id}</code> · version: {inspectItem.version} · category:{" "}
              {inspectItem.category} · author: {inspectItem.author}
            </p>

            <div className="mt-4 border-t border-white/[0.08] pt-4">
              <p className="text-sm leading-6 text-slate-300">{inspectItem.description}</p>
            </div>

            <div className="mt-4 border-t border-white/[0.08] pt-4">
              <p className="font-mono text-xs uppercase tracking-wider text-slate-400">Declared Capabilities:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {inspectItem.capabilities.map((c) => (
                  <span
                    key={c}
                    className="rounded border border-cyan-400/20 bg-cyan-400/[0.05] px-2 py-1 font-mono text-xs text-cyan-200"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 border-t border-white/[0.08] pt-4">
              <p className="font-mono text-xs uppercase tracking-wider text-slate-400">Permissions Required:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {inspectItem.permissions.length > 0 ? (
                  inspectItem.permissions.map((p) => (
                    <span
                      key={p}
                      className="rounded border border-amber-400/20 bg-amber-400/[0.05] px-2 py-1 font-mono text-xs text-amber-200"
                    >
                      {p}
                    </span>
                  ))
                ) : (
                  <span className="font-mono text-xs text-emerald-400">None (Pure Sandboxed)</span>
                )}
              </div>
            </div>

            <div className="mt-4 border-t border-white/[0.08] pt-4">
              <p className="font-mono text-xs uppercase tracking-wider text-slate-400">Installation Command:</p>
              <div className="mt-2 flex items-center justify-between rounded-lg border border-white/[0.1] bg-[#07070f] p-3 font-mono text-xs text-cyan-300">
                <span className="truncate">{inspectItem.installCommand}</span>
                <button
                  onClick={() => handleCopy(inspectItem.id, inspectItem.installCommand)}
                  className="flex items-center gap-1 rounded bg-white/[0.08] px-2.5 py-1 text-xs font-sans text-white hover:bg-white/[0.15]"
                >
                  {copiedId === inspectItem.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedId === inspectItem.id ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setInspectItem(null)}
                className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-cyan-50"
              >
                Close inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
