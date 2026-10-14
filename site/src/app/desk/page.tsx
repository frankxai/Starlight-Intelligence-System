import type { Metadata } from "next";
import { DeskConsole } from "./DeskConsole";

export const metadata: Metadata = {
  title: "The Desk",
  description:
    "One question in, a cited brief and a receipt out. Claims are kept only when their quote is found in the source they name, and the receipt shows each stage's time, tokens and any cost it could not count.",
};

const EXAMPLES = [
  "What changed in open reasoning models this quarter?",
  "Is prompt caching worth it for a weekly research loop?",
];

export default function DeskPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-20 md:pt-28">
      <p className="text-[13px] font-medium text-violet-400">Desk</p>
      <h1 className="mt-4 text-[34px] font-semibold leading-[1.15] tracking-tight text-white md:text-[44px]">
        One question in. A cited brief and a receipt out.
      </h1>
      <div className="mt-6 max-w-xl space-y-4 text-[15px] leading-[1.8] text-slate-400">
        <p>
          The page shows every stage and what it produced. Retrieval finds the sources. A small model pulls out claims, and a claim is kept only
          when it is a quote found word for word in the source it names. A large model writes the brief and cites those claims
          by number, and a model from another family scores it against a rubric.
        </p>
        <p>
          A citation shows which checked quote a sentence relies on. It does not prove the sentence follows from that quote.
        </p>
        <p>
          The receipt lists each stage&apos;s time and token counts. Where a stage has no checked price, or its provider did not
          report usage, the receipt names the gap, gives only a subtotal, and stays an unsigned draft.
        </p>
        <p>
          Memory is for the operator. A run made through the API with the operator&apos;s access token, on a deployment with a
          durable vault, also recalls claims from earlier runs, flags the ones it now contradicts, and writes its own claims
          back. Runs from this page on the public site neither recall nor store claims.
        </p>
      </div>
      <div className="mt-12">
        <DeskConsole examples={EXAMPLES} />
      </div>
    </div>
  );
}
