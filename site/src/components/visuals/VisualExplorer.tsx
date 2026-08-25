"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { VISUAL_BATCHES, VAULT_PLATES, ALL_AGENTS } from "@/lib/constellation-data";
import {
  ADVANCED_INFOGRAPHICS,
  TECHNICAL_ASSETS,
  EXPANDED_SWARM_FIELDS,
  QUEEN_NARRATIVES,
} from "@/lib/queen-visuals";
import {
  Search,
  Sparkles,
  Layers,
  Shield,
  Download,
  Copy,
  Check,
  Maximize2,
  X,
  ExternalLink,
  Tag,
  SlidersHorizontal,
} from "lucide-react";

export interface VisualItem {
  id: string;
  title: string;
  category: string;
  batchId?: number;
  batchName?: string;
  aspectRatio: "16:9" | "4:3" | "1:1" | "16:10";
  src: string;
  description: string;
  provenance: string;
  promptSnippet?: string;
  tags: string[];
}

export function VisualExplorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeItem, setActiveItem] = useState<VisualItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Compile all visual assets into a unified indexed dataset
  const allVisuals: VisualItem[] = useMemo(() => {
    const items: VisualItem[] = [];

    // 1. All 12 Visual Batches
    VISUAL_BATCHES.forEach((batch) => {
      batch.sampleImages.forEach((img, i) => {
        items.push({
          id: `batch-${batch.id}-${i}`,
          title: img.title,
          category: `Batch ${String(batch.id).padStart(2, "0")}`,
          batchId: batch.id,
          batchName: batch.title,
          aspectRatio: "16:9",
          src: img.src,
          description: img.desc,
          provenance: "Synthesized via Starlight Visual Engine · EU AI Act Art. 50 Attested",
          promptSnippet: `Starlight aesthetic porcelain and obsidian mineral plate representing ${img.title}, cinematic negative space, 8k render, hyper-detailed architectural lighting.`,
          tags: ["batch", batch.title.toLowerCase(), ...batch.focus.toLowerCase().split(" ")],
        });
      });
    });

    // 2. 6 Semantic Vault Plates
    Object.entries(VAULT_PLATES).forEach(([key, v]) => {
      items.push({
        id: `vault-${key}`,
        title: v.name,
        category: "Semantic Vaults",
        aspectRatio: "16:10",
        src: v.plateUrl,
        description: v.description,
        provenance: "Official Chamber Architecture Plate · Starlight Memory Substrate v1.1",
        promptSnippet: `Architectural memory chamber for ${v.name}, sacred geometry, basalt and luminescent violet filaments, obsidian archive pedestals.`,
        tags: ["vault", key, "memory", "substrate", "chamber"],
      });
    });

    // 3. Advanced Topologies & Infographics
    const infoTitles: Record<number, string> = {
      171: "Domain Sub-Stack Topology",
      172: "The Proving Ground Execution Flow",
      173: "The Veil Gateway & Sanitization",
      174: "144-Agent Total Swarm Blueprint",
      125: "Attestation Seal Geometric Logo",
      126: "Memory Palace Isometric Architecture",
      127: "Swarm Routing Constellation",
      128: "System Architecture Stack Cover",
    };

    [...ADVANCED_INFOGRAPHICS, 125, 126, 127, 128].forEach((id) => {
      const isJpg = [171, 172, 173, 174].includes(id);
      items.push({
        id: `topology-${id}`,
        title: infoTitles[id] || `System Topology ${id}`,
        category: "System Topology",
        aspectRatio: "16:9",
        src: `/assets/visuals/queen-premium/${id}.${isJpg ? "jpg" : "png"}`,
        description: "Official Starlight Infrastructure & Multi-Agent Swarm Topology Diagram",
        provenance: "Cryptographically Attested Technical Topology · SIP Layer 2",
        promptSnippet: `Technical infographic blueprint for ${infoTitles[id] || "Starlight Systems"}, precision HUD overlays, cybernetic architectural schema.`,
        tags: ["topology", "diagram", "infographic", "architecture"],
      });
    });

    // 4. Queen Narratives
    QUEEN_NARRATIVES.forEach((id) => {
      items.push({
        id: `queen-${id}`,
        title: `Queen Narrative Horizon ${id}`,
        category: "Queen Swarm",
        aspectRatio: "16:9",
        src: `/assets/visuals/queen-premium/${id}.jpg`,
        description: "Queen Orchestrator presiding over swarm consensus and synthesis",
        provenance: "Queen Swarm Narrative Series · Starlight Studio",
        promptSnippet: "The Queen Orchestrator in an obsidian command sanctum conducting parallel agent flows with luminescent cyan filaments.",
        tags: ["queen", "orchestrator", "narrative", "synthesis"],
      });
    });

    return items;
  }, []);

  // Filtered visuals based on query and category
  const filteredVisuals = useMemo(() => {
    return allVisuals.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" ||
        (selectedCategory === "batches" && item.category.startsWith("Batch")) ||
        (selectedCategory === "vaults" && item.category === "Semantic Vaults") ||
        (selectedCategory === "topology" && item.category === "System Topology") ||
        (selectedCategory === "queen" && item.category === "Queen Swarm");

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === "" ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.tags.some((t) => t.includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [allVisuals, selectedCategory, searchQuery]);

  const copyMarkdownSnippet = (item: VisualItem) => {
    const md = `![${item.title}](${item.src})\n*Source: Starlight Intelligence Protocol (${item.category})*`;
    navigator.clipboard.writeText(md);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      {/* Search & Filter Control Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-[#0c0c16] p-4 shadow-xl md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search visual plates, batches, vaults, prompts, or tags..."
            className="w-full rounded-xl border border-white/10 bg-black/50 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1">
          {[
            { id: "all", label: `All (${allVisuals.length})` },
            { id: "batches", label: "12 Encyclopedia Batches" },
            { id: "vaults", label: "Semantic Vaults (6)" },
            { id: "topology", label: "Technical Topologies" },
            { id: "queen", label: "Queen Series" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? "bg-violet-600 text-white shadow-[0_0_15px_rgba(167,139,250,0.3)]"
                  : "bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Cards Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredVisuals.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c14] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:bg-[#11111c]"
          >
            <div>
              {/* Media Thumbnail */}
              <div
                onClick={() => setActiveItem(item)}
                className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-xl bg-black/40 border border-white/[0.06]"
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 flex items-end p-3">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-white drop-shadow">
                    <Maximize2 className="h-3.5 w-3.5" /> Inspect Full Plate
                  </span>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="rounded-md bg-black/70 px-2 py-0.5 font-mono text-[9px] font-bold text-violet-300 border border-white/10 backdrop-blur-md">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <h4
                onClick={() => setActiveItem(item)}
                className="mt-3 cursor-pointer text-sm font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1"
              >
                {item.title}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-400 line-clamp-2">
                {item.description}
              </p>
            </div>

            {/* Card Footer Actions */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <button
                onClick={() => copyMarkdownSnippet(item)}
                className="flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-1 text-[10px] font-mono text-slate-300 hover:bg-white/[0.1] hover:text-white transition"
              >
                {copiedId === item.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copiedId === item.id ? "Copied!" : "Copy MD"}
              </button>

              <button
                onClick={() => setActiveItem(item)}
                className="text-[11px] font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1 transition"
              >
                Dossier &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredVisuals.length === 0 && (
        <div className="mt-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
          <p className="text-slate-400">No visual plates found matching &ldquo;{searchQuery}&rdquo;.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="mt-3 text-xs font-semibold text-violet-400 hover:underline"
          >
            Reset all filters
          </button>
        </div>
      )}

      {/* Fullscreen Lightbox & Provenance Inspector Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-entrance">
          <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-[#0d0d18] shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <span className="font-mono text-xs font-bold text-violet-400 uppercase tracking-wider">
                  {activeItem.category}
                </span>
                <h3 className="text-xl font-bold text-white">{activeItem.title}</h3>
              </div>

              <button
                onClick={() => setActiveItem(null)}
                className="rounded-full bg-white/10 p-2 text-slate-400 hover:bg-white/20 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 md:grid-cols-[1.2fr_0.8fr]">
              {/* Media Preview */}
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-white/10 flex items-center justify-center">
                <Image src={activeItem.src} alt={activeItem.title} fill className="object-contain" />
              </div>

              {/* Metadata Dossier */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-mono text-xs font-semibold uppercase text-slate-400">Description</h4>
                  <p className="mt-1 text-sm text-slate-300 leading-relaxed">{activeItem.description}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                  <h4 className="font-mono text-xs font-semibold uppercase text-cyan-400 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" /> Provenance Declaration
                  </h4>
                  <p className="mt-1 font-mono text-xs text-slate-300">{activeItem.provenance}</p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Complies with European Union Artificial Intelligence Act (EU AI Act) Article 50 disclosure standards.
                  </p>
                </div>

                {activeItem.promptSnippet && (
                  <div>
                    <h4 className="font-mono text-xs font-semibold uppercase text-violet-400">
                      Prompt Engineering Spec
                    </h4>
                    <pre className="mt-1 overflow-x-auto rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-[11px] leading-relaxed text-slate-300">
                      <code>{activeItem.promptSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* Quick Copy Action */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => copyMarkdownSnippet(activeItem)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white shadow-[0_0_20px_rgba(167,139,250,0.3)] transition hover:bg-violet-500"
                  >
                    {copiedId === activeItem.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copiedId === activeItem.id ? "Markdown Snippet Copied!" : "Copy Markdown Embed"}
                  </button>

                  <a
                    href={activeItem.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.08] hover:text-white transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open Raw High-Res Asset
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
