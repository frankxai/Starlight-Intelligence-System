import type { Metadata } from "next";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import receiptFile from "@/lib/generated/sis-receipt.json";

// Static page. The receipt is recomputed from protocol/profiles/sis.json by
// site/scripts/sync-sis-receipt.mjs (drift-checked in CI) — nothing is fetched
// at build or request time, so there is no loading or remote-error state.

const DESCRIPTION =
  "The Starlight Intelligence System's own signed SIP receipt: what it claims, what was checked, who signed it, and the commands to verify it yourself.";

export const metadata: Metadata = {
  title: "Verify",
  description: DESCRIPTION,
  openGraph: {
    title: "Verify — Starlight Intelligence",
    description: DESCRIPTION,
    type: "article",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Starlight Intelligence — Verify" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verify — Starlight Intelligence",
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

type Rule = { id: string; title: string; status: string; findings: string[] };
type ReceiptFile = {
  source: { path: string; url: string; rawUrl: string };
  profile: { id: string | null; subject: string | null; declaredBy: string | null; declaredByLabel: string | null };
  attestation: { statementType: string | null; signatureRef: string | null; signer: string | null } | null;
  claims: Array<{
    id: string;
    label: string;
    statement: string | null;
    sources: Array<{ id: string; label: string; locator: string | null; commit: string | null }>;
  }>;
  receipt: {
    tool: string;
    sipGraphVersion: string;
    declaredGraphVersion: string | null;
    profileSha256: string;
    checkedAt: string | null;
    counts: { nodes?: number; edges?: number; projections?: number };
    verdict: string;
    rules: Rule[];
  };
};

const data = receiptFile as unknown as ReceiptFile;
const { receipt } = data;

const REPO = "frankxai/Starlight-Intelligence-System";
const REPO_URL = `https://github.com/${REPO}`;
const SIGNER_WORKFLOW = ".github/workflows/sip-self-receipt.yml";
const PREDICATE_TYPE =
  data.attestation?.statementType ?? "https://starlightintelligence.org/protocol/receipt/v0.1.0";

const FETCH_CMD = `curl -sSLo sis.json ${data.source.rawUrl}
sha256sum sis.json    # macOS: shasum -a 256 sis.json`;

const VERIFY_CMD = `gh attestation verify sis.json \\
  --repo ${REPO} \\
  --predicate-type ${PREDICATE_TYPE} \\
  --signer-workflow ${REPO}/${SIGNER_WORKFLOW} \\
  --source-ref refs/heads/main`;

const RECHECK_CMD = `git clone --depth 1 ${REPO_URL}.git
cd Starlight-Intelligence-System
node protocol/conform.mjs ${data.source.path}`;

type ReceiptState = "signed" | "unsigned-preview" | "unverifiable" | "empty";

function receiptState(): ReceiptState {
  if (!receipt || !Array.isArray(receipt.rules) || (receipt.counts?.nodes ?? 0) === 0) return "empty";
  if (receipt.verdict !== "PASS") return "unverifiable";
  // Only pushes to main are signed. Production deploys build from main; every
  // other build (Vercel preview, local) may show bytes that are not signed yet.
  return process.env.VERCEL_ENV === "production" ? "signed" : "unsigned-preview";
}

const STATE_COPY: Record<ReceiptState, { chip: string; tone: string; body: string }> = {
  signed: {
    chip: "Pass · signed on main",
    tone: "border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-300",
    body: "This page was built from main. CI signs these exact bytes whenever the profile or the checker changes on main. The verify command below confirms the signature without trusting this site.",
  },
  "unsigned-preview": {
    chip: "Pass · preview, may be unsigned",
    tone: "border-amber-400/30 bg-amber-400/[0.08] text-amber-300",
    body: "This is a preview or local build. CI signs only on pushes to main, so the bytes shown here may not have a signature yet. The verify command fails until they do.",
  },
  unverifiable: {
    chip: "Fail · nothing to verify",
    tone: "border-rose-400/30 bg-rose-400/[0.08] text-rose-300",
    body: "The profile did not pass the check. CI signs only passing receipts, so there is no signature for these bytes. The failing rules are listed below.",
  },
  empty: {
    chip: "Empty profile",
    tone: "border-white/[0.12] bg-white/[0.03] text-slate-300",
    body: "The profile declares no nodes, so it makes no claims and there is nothing to check or sign.",
  },
};

function formatUtc(iso: string | null) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(iso)) return null;
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
}

const CODE =
  "rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-violet-300 [overflow-wrap:anywhere]";
const LINK = "text-violet-300 underline decoration-violet-400/40 underline-offset-4 transition-micro hover:text-white hover:decoration-white/60";

export default function VerifyPage() {
  const state = receiptState();
  const stateCopy = STATE_COPY[state];
  const rules = Array.isArray(receipt?.rules) ? receipt.rules : [];
  const failed = rules.filter((r) => r.status !== "pass");
  const passed = rules.length - failed.length;
  const checkedAt = formatUtc(receipt?.checkedAt ?? null);
  const counts = receipt?.counts ?? {};

  return (
    <div>
      {/* ── Intro ── */}
      <section className="border-b border-white/[0.08]">
        <div className="mx-auto max-w-3xl px-6 pb-12 pt-20 md:pt-28">
          <p className="text-[11px] font-medium uppercase tracking-widest text-violet-400">Verify</p>
          <h1 className="mt-3 font-serif text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.08] tracking-tight text-white">
            Check what this system says about itself
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-[1.8] text-slate-400">
            The Starlight Intelligence System publishes a small profile about itself, runs an open checker
            on it, and signs the result in CI. Below is that receipt: what is claimed, what was checked, who
            signed it, and how to check it yourself without trusting this site.
          </p>
          <p className="mt-6 max-w-xl border-l-2 border-amber-400/40 pl-4 text-[14px] leading-[1.75] text-slate-300">
            <strong className="font-semibold text-white">This receipt is self-attested.</strong> The
            repository checks and signs its own profile. It is not third-party certification, and it says
            nothing about adoption or users.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        {/* ── The receipt ── */}
        <article
          aria-labelledby="receipt-heading"
          className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#0c0c12]"
        >
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
            <h2 id="receipt-heading" className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
              Receipt · {receipt?.tool ?? "sip-conform"}
            </h2>
            <span className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-widest ${stateCopy.tone}`}>
              {stateCopy.chip}
            </span>
          </header>

          <p className="border-b border-white/[0.06] px-5 py-4 text-[13px] leading-[1.7] text-slate-300">
            {stateCopy.body}
          </p>

          <dl className="divide-y divide-white/[0.06]">
            <Row term="Artifact">
              <a href={data.source.url} className={LINK} target="_blank" rel="noopener noreferrer">
                {data.source.path}
              </a>
              <p className="mt-1 text-slate-400">
                {counts.nodes ?? 0} nodes, {counts.edges ?? 0} edges, {counts.projections ?? 0} projection
                {(counts.projections ?? 0) === 1 ? "" : "s"}, all public. Declared by{" "}
                {data.profile.declaredByLabel ?? data.profile.declaredBy ?? "an undeclared identity"}.
              </p>
              <div className="mt-3 flex items-start gap-3">
                <p className="min-w-0 flex-1">
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-slate-400">sha256</span>
                  <code className="mt-1 block select-all break-all font-mono text-[12px] leading-[1.6] text-slate-200">
                    {receipt?.profileSha256 ?? "(not computed)"}
                  </code>
                </p>
                {receipt?.profileSha256 ? <CopyButton value={receipt.profileSha256} label="sha256 digest" /> : null}
              </div>
            </Row>

            <Row term="Check that ran">
              <code className={CODE}>{receipt?.tool ?? "sip-conform"}</code> against SIP graph v
              {receipt?.sipGraphVersion ?? "?"} (profile declares v{receipt?.declaredGraphVersion ?? "?"}).{" "}
              {rules.length} rules on graph structure, version compatibility, and what a public projection may
              show. The same check runs in{" "}
              <a href={`${REPO_URL}/blob/main/${SIGNER_WORKFLOW}`} className={LINK} target="_blank" rel="noopener noreferrer">
                sip-self-receipt.yml
              </a>{" "}
              before anything is signed.
            </Row>

            <Row term="Verdict">
              <span
                className={`font-mono text-[13px] font-semibold ${
                  receipt?.verdict === "PASS" ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {receipt?.verdict ?? "NONE"}
              </span>{" "}
              <span className="text-slate-400">
                · {passed} of {rules.length} rules passed
              </span>
            </Row>

            <Row term="Signer">
              GitHub Actions workflow <code className={CODE}>{SIGNER_WORKFLOW}</code> on{" "}
              <code className={CODE}>refs/heads/main</code>, signing keyless through Sigstore with a GitHub
              OIDC identity. No long-lived key is involved. The signature covers the file&apos;s sha256; the
              receipt is the signed payload.
            </Row>

            <Row term="Timestamp">
              {checkedAt ? (
                <>
                  Receipt recomputed <time dateTime={receipt?.checkedAt ?? undefined}>{checkedAt}</time> when this
                  page&apos;s copy was generated.
                </>
              ) : (
                <>No computation time recorded for this copy.</>
              )}{" "}
              <span className="text-slate-400">
                The signing time is in the public Rekor transparency log; the verify command prints it with{" "}
                <code className={CODE}>--format json</code>.
              </span>
            </Row>

            <Row term="Verify it yourself">
              <Command label="verify command" value={VERIFY_CMD} />
              <p className="mt-3 text-slate-400">
                Run it on a copy of the file (step 1 below). Exit code 0 means the signature is valid, the
                signer is that workflow on main, and the digest matches.
              </p>
            </Row>
          </dl>
        </article>

        {/* ── What is claimed ── */}
        <Section id="claims" eyebrow="01" heading="What is claimed">
          <p className="text-[15px] leading-[1.85] text-slate-300">
            The profile makes {data.claims.length === 0 ? "no" : data.claims.length} claim
            {data.claims.length === 1 ? "" : "s"}. Each one points to a source pinned to a commit, so you can
            check it by reading one file.
          </p>
          {data.claims.length === 0 ? (
            <p className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-[14px] text-slate-400">
              No claims in this profile.
            </p>
          ) : (
            <ol className="mt-6 space-y-4">
              {data.claims.map((claim) => (
                <li key={claim.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <h3 className="text-[15px] font-semibold text-white">{claim.label}</h3>
                  {claim.statement ? (
                    <p className="mt-2 text-[14px] leading-[1.7] text-slate-300">{claim.statement}</p>
                  ) : null}
                  <p className="mt-3 text-[13px] text-slate-400">
                    {claim.sources.length === 0 ? (
                      "No source declared."
                    ) : (
                      <>
                        Check against{" "}
                        {claim.sources.map((s, i) => (
                          <span key={s.id}>
                            {i > 0 ? ", " : null}
                            {s.locator ? (
                              <a href={s.locator} className={LINK} target="_blank" rel="noopener noreferrer">
                                {s.label}
                              </a>
                            ) : (
                              s.label
                            )}
                            {s.commit ? (
                              <span className="font-mono text-[12px] text-slate-500"> @ {s.commit.slice(0, 12)}</span>
                            ) : null}
                          </span>
                        ))}
                      </>
                    )}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </Section>

        {/* ── What was checked ── */}
        <Section id="rules" eyebrow="02" heading="What was checked">
          <p className="text-[15px] leading-[1.85] text-slate-300">
            The checker tests the profile&apos;s structure. Whether the claims are true is checked against
            their sources. These are the rules and their results for the bytes above.
          </p>
          <ul className="mt-6 divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c12]">
            {rules.map((rule) => (
              <li key={rule.id} className="flex gap-3 px-4 py-3 text-[13px]">
                <span
                  className={`w-10 shrink-0 font-mono text-[11px] font-semibold uppercase ${
                    rule.status === "pass" ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  {rule.status === "pass" ? "Pass" : "Fail"}
                </span>
                <span className="w-9 shrink-0 font-mono text-[12px] text-slate-500">{rule.id}</span>
                <div className="min-w-0 text-slate-300">
                  {rule.title}
                  {rule.findings.length > 0 ? (
                    <ul className="mt-1 space-y-1 text-[12px] text-rose-200/80 [overflow-wrap:anywhere]">
                      {rule.findings.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Section>

        {/* ── Verify it yourself ── */}
        <Section id="steps" eyebrow="03" heading="Verify it yourself">
          <ol className="space-y-10">
            <Step n={1} title="Get the file and hash it">
              <Command label="download command" value={FETCH_CMD} />
              <p className="mt-3">
                The hash should equal the sha256 in the receipt above. If the profile changed on main after this
                page was built, the hash differs and the new bytes get their own signature.
              </p>
            </Step>
            <Step n={2} title="Check the signature">
              <Command label="verify command" value={VERIFY_CMD} />
              <p className="mt-3">
                Needs the{" "}
                <a href="https://cli.github.com/" className={LINK} target="_blank" rel="noopener noreferrer">
                  GitHub CLI
                </a>
                . Add <code className={CODE}>--format json</code> to see the signed receipt and the transparency
                log entry. All attestations for the repository are listed on{" "}
                <a href={data.attestation?.signatureRef ?? `${REPO_URL}/attestations`} className={LINK} target="_blank" rel="noopener noreferrer">
                  its attestations page
                </a>
                .
              </p>
            </Step>
            <Step n={3} title="Re-run the check">
              <Command label="re-check commands" value={RECHECK_CMD} />
              <p className="mt-3">
                Node 18 or later, nothing to install. The checker prints the same verdict, and the sha256 it
                prints equals the signature&apos;s subject digest.
              </p>
            </Step>
            <Step n={4} title="Read the sources">
              <p>
                The signature and the check say nothing about whether the claims are true. Open each source
                listed under <a href="#claims" className={LINK}>What is claimed</a> at its pinned commit.
              </p>
            </Step>
          </ol>
        </Section>

        {/* ── Scope ── */}
        <Section id="scope" eyebrow="04" heading="What this proves, and what it does not">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="text-[13px] font-semibold text-white">A valid signature proves</h3>
              <ul className="mt-3 space-y-2 text-[14px] leading-[1.7] text-slate-300">
                <li>These exact bytes were checked by this repository&apos;s CI on main and passed.</li>
                <li>The signed receipt is recorded in a public transparency log.</li>
                <li>Anyone can re-run the same check offline.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="text-[13px] font-semibold text-white">It does not prove</h3>
              <ul className="mt-3 space-y-2 text-[14px] leading-[1.7] text-slate-300">
                <li>That the claims are true. The sources are for that.</li>
                <li>Review by anyone outside this repository.</li>
                <li>Adoption, users, or use by other projects.</li>
              </ul>
            </div>
          </div>
          <p className="mt-8 text-[14px] leading-[1.85] text-slate-400">
            Background: the <Link href="/protocol" className={LINK}>protocol page</Link> and the{" "}
            <a href={`${REPO_URL}/blob/main/protocol/profiles/README.md`} className={LINK} target="_blank" rel="noopener noreferrer">
              profile README
            </a>
            , which describes how the attestation is made.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 px-5 py-4 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-4">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-slate-400 sm:pt-[3px]">{term}</dt>
      <dd className="min-w-0 text-[14px] leading-[1.7] text-slate-200">{children}</dd>
    </div>
  );
}

function Command({ label, value }: { label: string; value: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-[#08080d]">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pl-4 pr-1">
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">{label}</span>
        <CopyButton value={value} label={label} />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-[1.7] text-slate-200">
        <code className="select-all">{value}</code>
      </pre>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-violet-500/[0.25] bg-violet-500/[0.08] font-mono text-[12px] text-violet-300"
      >
        {n}
      </span>
      <div className="min-w-0 flex-1 text-[14px] leading-[1.75] text-slate-400">
        <h3 className="mb-3 text-[15px] font-semibold text-white">
          <span className="sr-only">Step {n}: </span>
          {title}
        </h3>
        {children}
      </div>
    </li>
  );
}

function Section({
  id,
  eyebrow,
  heading,
  children,
}: {
  id: string;
  eyebrow: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mt-16 scroll-mt-24">
      <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">{eyebrow}</p>
      <h2 id={`${id}-heading`} className="mt-3 text-2xl font-semibold text-white md:text-3xl">
        {heading}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}
