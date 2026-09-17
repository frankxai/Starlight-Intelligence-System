import type { Metadata } from "next";
import Link from "next/link";

import {
  listClaims,
  readProfile,
  readReceipt,
  traceClaim,
  type GraphNode,
  type TracedNode,
  type Visibility,
} from "@/lib/sip-graph";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Protocol explorer — SIP graph v0.1.0",
  description:
    "Trace a claim from source through policy, memory, artifact, evaluation and attestation, and see the same chain as a public reader sees it. Open contract, conformance checker and fixtures included.",
  alternates: { canonical: "/protocol/graph" },
  openGraph: {
    title: "Protocol explorer — SIP graph v0.1.0",
    description:
      "Trace a claim from source to attestation, and see what a public projection withholds.",
    type: "article",
  },
};

const GITHUB_DIR =
  "https://github.com/frankxai/Starlight-Intelligence-System/tree/main/protocol";

// Institutional light surface. One ink, one paper, one rule, one accent.
const INK = "#17171c";
const MUTED = "#5f6068";
const FAINT = "#8a8b93";
const PAPER = "#fbfaf7";
const CARD = "#ffffff";
const RULE = "#e4e2db";
const ACCENT = "#3d3486";

const VIS_LABEL: Record<Visibility, string> = {
  public: "public",
  alliance: "alliance",
  private: "private",
  secret: "secret",
};

function isWithheld(node: TracedNode): node is { id: string; type: GraphNode["type"]; withheld: true } {
  return (node as { withheld?: boolean }).withheld === true;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 text-[12.5px] leading-[1.7]">
      <span
        className="w-[100px] shrink-0 font-mono text-[10px] uppercase tracking-[0.12em]"
        style={{ color: FAINT }}
      >
        {label}
      </span>
      <span style={{ color: MUTED }}>{children}</span>
    </div>
  );
}

function NodeCard({ node, withheld }: { node: TracedNode; withheld: boolean }) {
  if (withheld || isWithheld(node)) {
    return (
      <div
        className="rounded-sm border border-dashed px-4 py-3"
        style={{ borderColor: RULE, background: "transparent" }}
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-[12px]" style={{ color: FAINT }}>
            {node.id}
          </span>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.12em]"
            style={{ color: FAINT }}
          >
            {node.type}
          </span>
        </div>
        <p className="mt-1.5 text-[12.5px] leading-[1.7]" style={{ color: MUTED }}>
          Withheld from this audience. The link is declared, so the chain reads as truncated
          rather than complete — projection rule P2.
        </p>
      </div>
    );
  }

  const full = node as GraphNode;
  const result = full.evaluation?.result;

  return (
    <div
      className="rounded-sm border px-4 py-3.5"
      style={{ borderColor: RULE, background: CARD }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-[14px] font-medium" style={{ color: INK }}>
          {full.label ?? full.id}
        </span>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.12em]"
          style={{ color: full.visibility === "public" ? FAINT : ACCENT }}
        >
          {VIS_LABEL[full.visibility]}
        </span>
      </div>
      <div className="mt-1 font-mono text-[11.5px]" style={{ color: FAINT }}>
        {full.id} · v{full.version}
      </div>

      <div className="mt-3 space-y-1">
        <Field label="Owner">
          <span className="font-mono text-[11.5px]">{full.owner}</span>
        </Field>
        <Field label="Provenance">
          {full.provenance.origin}
          {full.provenance.method ? ` · ${full.provenance.method}` : ""} · {full.provenance.at}
        </Field>
        <Field label="Evaluated by">
          <span className="font-mono text-[11.5px]">{full.evaluation.rule}</span>
          {result ? ` · ${result}` : ""}
        </Field>
        {typeof full.body?.statement === "string" && (
          <Field label="Statement">{full.body.statement as string}</Field>
        )}
        {typeof full.body?.rule === "string" && (
          <Field label="Rule">{full.body.rule as string}</Field>
        )}
        {typeof full.body?.locator === "string" && (
          <Field label="Locator">
            <span className="font-mono text-[11.5px] break-all">
              {full.body.locator as string}
            </span>
          </Field>
        )}
        {typeof full.body?.method === "string" && (
          <Field label="Method">
            {full.body.method as string}
            {typeof full.body?.observed === "string" ? ` · ${full.body.observed}` : ""}
          </Field>
        )}
        {typeof full.body?.contentRef === "string" && (
          <Field label="Content">
            <span className="font-mono text-[11.5px]">{full.body.contentRef as string}</span>
            {typeof full.body?.retention === "string"
              ? ` · retention ${full.body.retention as string}`
              : ""}
          </Field>
        )}
        {typeof full.body?.statementType === "string" && (
          <Field label="Statement">
            {full.body.statementType as string}
            {typeof full.body?.signatureRef === "string" ? " · signed" : " · unsigned"}
          </Field>
        )}
      </div>
    </div>
  );
}

export default async function ProtocolGraphPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; claim?: string }>;
}) {
  const params = await searchParams;
  const audience = params.view === "public" ? "public" : "owner";

  const [profile, receipt] = await Promise.all([readProfile(), readReceipt()]);
  const claims = listClaims(profile);
  const claimId = claims.find((c) => c.id === params.claim)?.id ?? claims[0]?.id;
  const trace = claimId ? traceClaim(profile, claimId, audience) : null;

  const withheldCount =
    trace?.stages.reduce((n, s) => n + s.nodes.filter((x) => x.withheld).length, 0) ?? 0;

  const failed = receipt.rules.filter((r) => r.status === "fail");

  const viewHref = (view: "owner" | "public") =>
    `/protocol/graph?view=${view}${claimId ? `&claim=${encodeURIComponent(claimId)}` : ""}`;

  return (
    <main className="min-h-screen" style={{ background: PAPER, color: INK }}>
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        {/* ── Masthead ── */}
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: FAINT }}
        >
          SIP graph v{profile.sipGraphVersion} · extends SIP v1.1.1
        </p>
        <h1
          className="mt-4 text-[34px] leading-[1.15] font-normal tracking-[-0.015em] md:text-[42px]"
          style={{ color: INK }}
        >
          Protocol explorer
        </h1>
        <p className="mt-5 max-w-[62ch] text-[15px] leading-[1.8]" style={{ color: MUTED }}>
          A claim is only worth what its chain is worth. This traces one claim from the source it
          was checked against, through the policy that governed it, the memory it rests on, the
          artifact it produced, the evaluation that tested it, and the attestation that signed for
          it. Switch the audience to see the same chain as a public reader sees it — including
          which links are withheld.
        </p>

        {/* ── Audience switch ── */}
        <div className="mt-9 flex flex-wrap items-center gap-2">
          <span
            className="mr-2 font-mono text-[10px] uppercase tracking-[0.12em]"
            style={{ color: FAINT }}
          >
            Audience
          </span>
          {(["owner", "public"] as const).map((view) => {
            const active = audience === view;
            return (
              <Link
                key={view}
                href={viewHref(view)}
                className="rounded-sm border px-3 py-1.5 text-[12.5px] transition-std"
                style={{
                  borderColor: active ? INK : RULE,
                  background: active ? INK : "transparent",
                  color: active ? PAPER : MUTED,
                }}
              >
                {view === "owner" ? "Owner view" : "Public projection"}
              </Link>
            );
          })}
          {audience === "public" && (
            <span className="ml-1 text-[12.5px]" style={{ color: MUTED }}>
              {withheldCount === 0
                ? "Nothing in this chain is withheld."
                : `${withheldCount} link${withheldCount === 1 ? "" : "s"} withheld.`}
            </span>
          )}
        </div>

        {/* ── The claim ── */}
        {trace ? (
          <>
            <section className="mt-12">
              <h2
                className="font-mono text-[10px] uppercase tracking-[0.14em]"
                style={{ color: FAINT }}
              >
                The claim
              </h2>
              <p
                className="mt-3 text-[19px] leading-[1.55] font-normal"
                style={{ color: INK }}
              >
                {trace.claim.body.statement as string}
              </p>
              <div className="mt-3 space-y-1">
                <Field label="Id">
                  <span className="font-mono text-[11.5px]">{trace.claim.id}</span>
                </Field>
                <Field label="Asserted by">
                  {!trace.assertedBy ? (
                    "no agent declared"
                  ) : isWithheld(trace.assertedBy.node) ? (
                    <>
                      Withheld from this audience{" "}
                      <span className="font-mono text-[11.5px]">
                        ({trace.assertedBy.node.id})
                      </span>
                    </>
                  ) : (
                    <>
                      {(trace.assertedBy.node as GraphNode).label ?? trace.assertedBy.node.id}{" "}
                      <span className="font-mono text-[11.5px]">
                        ({trace.assertedBy.node.id})
                      </span>
                    </>
                  )}
                </Field>
                <Field label="Owner">
                  <span className="font-mono text-[11.5px]">{trace.claim.owner}</span>
                </Field>
              </div>
              {trace.claimWithheld && (
                <p className="mt-3 text-[12.5px] leading-[1.7]" style={{ color: ACCENT }}>
                  This claim is not carried by the public projection. A public reader would not
                  see it at all — what follows is the owner&rsquo;s view of a chain that is not
                  published.
                </p>
              )}
              {claims.length > 1 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {claims.map((c) => (
                    <Link
                      key={c.id}
                      href={`/protocol/graph?view=${audience}&claim=${encodeURIComponent(c.id)}`}
                      className="font-mono text-[11.5px] underline underline-offset-4"
                      style={{ color: c.id === trace.claim.id ? INK : ACCENT }}
                    >
                      {c.id}
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* ── The chain ── */}
            <section className="mt-14">
              <h2
                className="font-mono text-[10px] uppercase tracking-[0.14em]"
                style={{ color: FAINT }}
              >
                The chain
              </h2>
              <ol className="mt-6">
                {trace.stages.map((stage, i) => (
                  <li key={stage.key} className="grid grid-cols-[38px_1fr] gap-x-4">
                    <div className="relative flex flex-col items-center">
                      <span
                        className="font-mono text-[11px] tabular-nums"
                        style={{ color: FAINT }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {i < trace.stages.length - 1 && (
                        <span
                          className="mt-2 w-px flex-1"
                          style={{ background: RULE }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div className="pb-9">
                      <h3 className="text-[15px] font-medium" style={{ color: INK }}>
                        {stage.label}
                      </h3>
                      <p className="mt-0.5 text-[12.5px]" style={{ color: FAINT }}>
                        {stage.question}
                      </p>
                      <div className="mt-3 space-y-2">
                        {stage.nodes.length === 0 ? (
                          <p className="text-[12.5px]" style={{ color: MUTED }}>
                            Nothing declared at this stage. An empty stage is a gap in the
                            evidence, not a formatting artefact.
                          </p>
                        ) : (
                          stage.nodes.map(({ node, withheld }) => (
                            <NodeCard key={node.id} node={node} withheld={withheld} />
                          ))
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </>
        ) : (
          <p className="mt-12 text-[15px]" style={{ color: MUTED }}>
            The published profile declares no claims.
          </p>
        )}

        {/* ── Receipt ── */}
        <section className="mt-6">
          <h2
            className="font-mono text-[10px] uppercase tracking-[0.14em]"
            style={{ color: FAINT }}
          >
            Conformance receipt
          </h2>
          <p className="mt-3 max-w-[62ch] text-[14px] leading-[1.8]" style={{ color: MUTED }}>
            The profile above is not asserted to be well formed — it is checked. This receipt was
            produced by the same zero-dependency checker an adopter runs, over the exact bytes
            served here.
          </p>
          <div
            className="mt-5 rounded-sm border"
            style={{ borderColor: RULE, background: CARD }}
          >
            <div
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b px-4 py-3"
              style={{ borderColor: RULE }}
            >
              <span className="text-[14px] font-medium" style={{ color: INK }}>
                {receipt.verdict === "PASS" ? "Passed" : "Failed"} ·{" "}
                {receipt.rules.length - failed.length}/{receipt.rules.length} rules
              </span>
              <span className="font-mono text-[11px]" style={{ color: FAINT }}>
                {receipt.tool} · {receipt.checkedAt}
              </span>
            </div>
            <div className="space-y-1 px-4 py-3">
              <Field label="Subject">{receipt.subject ?? "undeclared"}</Field>
              <Field label="sha256">
                <span className="font-mono text-[11px] break-all">{receipt.profileSha256}</span>
              </Field>
              <Field label="Graph">
                {receipt.counts.nodes} nodes · {receipt.counts.edges} edges ·{" "}
                {receipt.counts.projections} projection
                {receipt.counts.projections === 1 ? "" : "s"}
              </Field>
            </div>
            <ul className="border-t px-4 py-3" style={{ borderColor: RULE }}>
              {receipt.rules.map((rule) => (
                <li key={rule.id} className="flex gap-3 py-[3px] text-[12.5px]">
                  <span
                    className="w-[46px] shrink-0 font-mono text-[10px] uppercase tracking-[0.12em]"
                    style={{ color: rule.status === "pass" ? FAINT : ACCENT }}
                  >
                    {rule.status}
                  </span>
                  <span className="w-[34px] shrink-0 font-mono text-[11.5px]" style={{ color: FAINT }}>
                    {rule.id}
                  </span>
                  <span style={{ color: MUTED }}>
                    {rule.title}
                    {rule.findings.map((f) => (
                      <span key={f} className="mt-1 block" style={{ color: ACCENT }}>
                        {f}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Adopt ── */}
        <section className="mt-14 border-t pt-9" style={{ borderColor: RULE }}>
          <h2 className="text-[19px] font-normal" style={{ color: INK }}>
            Run this against your own repository
          </h2>
          <p className="mt-3 max-w-[62ch] text-[14px] leading-[1.8]" style={{ color: MUTED }}>
            Two files, no dependencies, no account, nothing sent anywhere. Copy the checker, write
            a profile, and gate it in CI. Nothing is registered with Starlight and there is no
            badge that means more than the receipt you generated yourself.
          </p>
          <pre
            className="mt-5 overflow-x-auto rounded-sm border px-4 py-3.5 font-mono text-[12.5px] leading-[1.9]"
            style={{ borderColor: RULE, background: CARD, color: INK }}
          >
{`node protocol/conform.mjs sip-profile.json --json sip-receipt.json
node --test protocol/test/conform.test.mjs`}
          </pre>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
            {[
              ["Contract and fixtures", GITHUB_DIR],
              ["Install path", `${GITHUB_DIR}/INSTALL.md`],
              ["Compatibility rules", `${GITHUB_DIR}/COMPATIBILITY.md`],
              ["Projection rules", `${GITHUB_DIR}/PROJECTION.md`],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 transition-std"
                style={{ color: ACCENT }}
              >
                {label}
              </a>
            ))}
            <Link
              href="/protocol"
              className="underline underline-offset-4 transition-std"
              style={{ color: ACCENT }}
            >
              SIP v1.1.1
            </Link>
          </div>
          <p className="mt-8 text-[12.5px] leading-[1.8]" style={{ color: FAINT }}>
            v0.1.0 is a first published contract, not a ratified standard. The profile traced above
            is the reference fixture: every value in it is synthetic, and it has no external
            adopters. MIT.
          </p>
        </section>
      </div>
    </main>
  );
}
