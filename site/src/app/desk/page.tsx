import type { Metadata } from "next";
import { DeskConsole } from "./DeskConsole";

export const metadata: Metadata = {
  title: "The Desk",
  description:
    "One question, four stages, a cited brief and a signed receipt. Small model where the work is mechanical, large model where the work is judgment, a different family as judge.",
};

const EXAMPLES = [
  "What changed in open reasoning models this quarter?",
  "Is prompt caching worth it for a weekly research loop?",
];

export default function DeskPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-20 md:pt-28">
      <p className="text-[11px] font-medium uppercase tracking-widest text-violet-400">Desk</p>
      <h1 className="mt-4 text-[34px] font-semibold leading-[1.15] tracking-tight text-white md:text-[44px]">
        One question in. A cited brief and a receipt out.
      </h1>
      <p className="mt-6 max-w-xl text-[15px] leading-[1.8] text-slate-400">
        Four stages run in the open: retrieval finds the sources, a small model extracts claims that quote them, a large model
        writes the brief with every fact cited, and a model from another family scores the result. The receipt records what each
        stage cost, how long it took, and which sources survived, so the numbers on screen are the run&apos;s own.
      </p>
      <div className="mt-12">
        <DeskConsole examples={EXAMPLES} />
      </div>
    </div>
  );
}
