"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Copy, FileCode2 } from "lucide-react";
import { PLUGIN_ADOPTION } from "@/lib/plugin-starter-download";

export function PluginAdoption() {
  const [copied, setCopied] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const assessedDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${PLUGIN_ADOPTION.assessedAt}T00:00:00Z`));

  async function copyPrompt(id: string, prompt: string) {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(id);
      setNotice("Prompt copied. Paste it into your chosen host with the skill loaded.");
    } catch {
      setCopied(null);
      setNotice("Copy is unavailable here. Select the prompt text and copy it manually.");
    }
  }

  return (
    <section id="plugin-adoption" aria-labelledby="plugin-adoption-title" className="scroll-mt-24 border-b border-white/10 bg-[#080c13] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div>
            <p className="font-mono text-xs tracking-wider text-cyan-300">Choose where you work</p>
            <h2 id="plugin-adoption-title" className="mt-4 max-w-lg font-serif text-4xl leading-tight text-white md:text-5xl">Take one useful<br className="hidden sm:block" /> workflow with you.</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-slate-300">Start with inspectable source. The local packages below have their own host requirements; access to a private ChatGPT plugin is a separate step.</p>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-700/70 md:grid-cols-3">
          {PLUGIN_ADOPTION.paths.map((path, index) => (
            <div key={path.id} className="bg-[#0c121c] p-6">
              <div className="flex items-center justify-between gap-2 font-mono text-xs text-slate-400"><span>0{index + 1}</span><span>{path.host}</span></div>
              <h3 className="mt-6 text-xl font-medium text-white">{path.label}</h3>
              <p className="mt-2 text-xs font-medium text-cyan-200">{path.status}</p>
              <p className="mt-4 text-sm leading-6 text-slate-300">{path.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-xl font-medium text-white">Two places to start</h3>
            <p className="mt-2 text-sm text-slate-400">Free MIT source · skill instructions · your host and tools</p>
          </div>
          <span className="rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-300">ChatGPT directory: unverified</span>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {PLUGIN_ADOPTION.candidates.map((candidate) => (
            <article key={candidate.id} className="flex flex-col rounded-2xl border border-slate-700/70 bg-[#101722] p-6 sm:p-7">
              <FileCode2 aria-hidden="true" className="h-6 w-6 text-cyan-300" strokeWidth={1.5} />
              <h4 className="mt-5 text-2xl font-medium tracking-tight text-white">{candidate.name}</h4>
              <p className="mt-3 text-sm leading-7 text-slate-300">{candidate.description}</p>
              <a href={candidate.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 self-start text-sm font-medium text-cyan-200 underline decoration-cyan-200/40 underline-offset-4 hover:text-white focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
                Inspect source <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </a>
              <details className="mt-5 border-t border-slate-700/70 pt-5">
                <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">Try a first task</summary>
                <label htmlFor={`prompt-${candidate.id}`} className="mt-4 block text-xs leading-5 text-slate-400">Load the skill in a compatible host, then use this prompt. Copying starts no work.</label>
                <textarea id={`prompt-${candidate.id}`} readOnly rows={7} value={candidate.prompt} className="mt-3 w-full resize-y rounded-xl border border-slate-600 bg-slate-950 p-4 text-sm leading-6 text-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300" />
                <button type="button" onClick={() => copyPrompt(candidate.id, candidate.prompt)} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-500 px-4 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
                  {copied === candidate.id ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
                  {copied === candidate.id ? "Copied" : "Copy prompt"}
                </button>
              </details>
            </article>
          ))}
        </div>
        <p role="status" aria-live="polite" className="mt-3 min-h-6 text-sm text-cyan-200">{notice}</p>
        <div className="mt-5 flex flex-col justify-between gap-5 border-t border-slate-700/70 pt-6 sm:flex-row">
          <p className="max-w-lg text-xs leading-6 text-slate-400">Source availability, private access and public review are separate states. No public ChatGPT listing is verified here as of {assessedDate}. A hosted service, account connection or paid plan would need its own verified terms and availability.</p>
          <div className="flex shrink-0 flex-col gap-1">
            {PLUGIN_ADOPTION.officialDocs.map((doc) => <a key={doc.href} href={doc.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-xs text-slate-200 underline underline-offset-4 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">OpenAI: {doc.label} <ArrowUpRight aria-hidden="true" className="h-3 w-3" /></a>)}
          </div>
        </div>
      </div>
    </section>
  );
}
