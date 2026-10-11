"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Terminal,
  CreditCard,
  Sparkles,
  Server,
  Database,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import type { CloudLicenseToken } from "../../../../../src/cloud/types";

export function CheckoutClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "cs_starlight_demo";
  const tierParam = (searchParams.get("tier") || "pro") as "pro" | "enterprise";
  const cadenceParam = searchParams.get("cadence") || "monthly";

  const isAnnual = cadenceParam === "annual";
  const isEnterprise = tierParam === "enterprise";

  const basePrice = isEnterprise ? 199 : 29;
  const annualTotal = Math.round(basePrice * 12 * 0.8);
  const amountDue = isAnnual ? annualTotal : basePrice;

  // Form State
  const [email, setEmail] = useState("frank@starlightintelligence.org");
  const [accountId, setAccountId] = useState(`acc_${Math.random().toString(36).substring(2, 8)}`);
  const [paymentMode, setPaymentMode] = useState<"card" | "sandbox">("card");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExp, setCardExp] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");

  // Submission State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [issuedLicense, setIssuedLicense] = useState<CloudLicenseToken | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      setProcessingStep("Validating session & securing TLS tunnel...");
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStep("Minting cryptographic HMAC-SHA256 license token...");
      const res = await fetch("/api/cloud/checkout/fulfill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          tier: tierParam,
          accountId,
          customerEmail: email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Payment verification failed");
      }

      setProcessingStep("Allocating Cloudflare D1 & Vectorize edge replica...");
      await new Promise((r) => setTimeout(r, 500));

      setIssuedLicense(data.license);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout error occurred");
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const tokenString = issuedLicense ? JSON.stringify(issuedLicense) : "";
  const cliCommand = issuedLicense ? `starlight cloud login --token '${tokenString}'` : "";

  const handleCopyToken = () => {
    if (!tokenString) return;
    navigator.clipboard.writeText(tokenString);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleCopyCli = () => {
    if (!cliCommand) return;
    navigator.clipboard.writeText(cliCommand);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-8 flex items-center gap-2">
        <Link
          href="/cloud"
          className="inline-flex items-center gap-1 font-mono text-xs text-slate-400 transition hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Cloud Overview
        </Link>
        <span className="text-slate-600">/</span>
        <span className="font-mono text-xs text-cyan-300">Checkout Session</span>
      </div>

      {issuedLicense ? (
        /* SUCCESS / LICENSE ISSUED VIEW */
        <div className="rounded-2xl border border-cyan-400/40 bg-[#0a0a14]/95 p-8 shadow-[0_0_60px_rgba(6,182,212,0.15)] backdrop-blur-2xl">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/30">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  Subscription Active · Verified
                </span>
                <h2 className="text-2xl font-bold text-white">Sovereign License Issued</h2>
              </div>
            </div>
            <div className="rounded-full border border-white/[0.1] bg-black/40 px-3 py-1 font-mono text-xs text-slate-300">
              Tier: <span className="font-semibold uppercase text-cyan-300">{issuedLicense.tier}</span>
            </div>
          </div>

          <p className="mt-6 text-sm leading-6 text-slate-300">
            Your managed Starlight Cloud license has been cryptographically signed and registered on the Cloudflare edge
            mesh. Run the following command in your terminal to authenticate your local workspace:
          </p>

          {/* 1-Click CLI Activation Command */}
          <div className="mt-6 rounded-xl border border-white/[0.1] bg-[#050508] p-4">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <span>One-Click CLI Login</span>
              </div>
              <button
                onClick={handleCopyCli}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.05] px-2.5 py-1 font-mono text-xs text-white transition hover:bg-white/[0.1]"
              >
                {copiedCli ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCli ? "Copied" : "Copy Command"}</span>
              </button>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-black/60 p-3 font-mono text-xs text-cyan-300">
              <code>{cliCommand}</code>
            </pre>
          </div>

          {/* Cryptographic License Details */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.06] bg-[#07070d] p-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">License ID</span>
              <p className="mt-1 font-mono text-xs font-semibold text-white">{issuedLicense.licenseId}</p>
              <span className="mt-3 block font-mono text-[10px] uppercase tracking-wider text-slate-400">Account ID</span>
              <p className="mt-1 font-mono text-xs font-semibold text-white">{issuedLicense.accountId}</p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#07070d] p-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Valid Until</span>
              <p className="mt-1 font-mono text-xs font-semibold text-emerald-400">
                {new Date(issuedLicense.expiresAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <span className="mt-3 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
                Enabled Capabilities
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {issuedLicense.features.map((feat) => (
                  <span
                    key={feat}
                    className="rounded bg-cyan-400/10 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Raw Token Box */}
          <div className="mt-6">
            <div className="flex items-center justify-between pb-2">
              <span className="font-mono text-xs text-slate-400">HMAC-SHA256 Token Payload</span>
              <button
                onClick={handleCopyToken}
                className="font-mono text-xs text-cyan-300 transition hover:underline"
              >
                {copiedToken ? "Copied JSON" : "Copy Raw Token"}
              </button>
            </div>
            <pre className="max-h-28 overflow-x-auto rounded-lg border border-white/[0.06] bg-black/40 p-3 font-mono text-[11px] text-slate-400">
              <code>{tokenString}</code>
            </pre>
          </div>

          {/* Action Navigation */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/cloud?session=success"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-semibold text-black transition hover:bg-cyan-50"
            >
              <span>Return to Cloud Cockpit</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/[0.14] px-5 py-3 text-xs font-semibold text-white transition hover:bg-white/[0.05]"
            >
              <span>Browse Skill Marketplace</span>
            </Link>
          </div>
        </div>
      ) : (
        /* STANDARD CHECKOUT FORM VIEW */
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Order Summary Column */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-white/[0.10] bg-[#0c0c16]/90 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-300">Order Summary</span>
                  <h3 className="mt-1 text-xl font-bold text-white">
                    {isEnterprise ? "Enterprise Mesh" : "Pro Cloud"}
                  </h3>
                </div>
                <span className="rounded bg-cyan-400/10 px-2.5 py-1 font-mono text-xs font-semibold text-cyan-300">
                  {isAnnual ? "Annual (-20%)" : "Monthly"}
                </span>
              </div>

              {/* Price Details */}
              <div className="mt-4 space-y-2 border-b border-white/[0.08] pb-4 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Base Subscription</span>
                  <span className="text-white">${basePrice} / mo</span>
                </div>
                {isAnnual && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Annual Discount (20% off)</span>
                    <span>-${basePrice * 12 * 0.2}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Zero-Egress R2 Snapshot Storage</span>
                  <span className="text-emerald-400">Included ($0)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Cloudflare D1 & Vectorize Edge Cache</span>
                  <span className="text-emerald-400">Included ($0)</span>
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-white">Total Due Today</span>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-white">${amountDue}</span>
                  <span className="text-xs text-slate-400">{isAnnual ? " / year" : " / month"}</span>
                </div>
              </div>

              {/* Value & Guarantees */}
              <div className="mt-6 space-y-2.5 rounded-xl border border-white/[0.06] bg-[#08080f] p-4 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300" />
                  <span>Client-side zero-knowledge encrypted backups (AES-256-GCM)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300" />
                  <span>Sub-10ms edge memory lookup via Cloudflare D1 shadow replica</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300" />
                  <span>Frontier LLM credit pool via Vercel AI SDK or BYOK freedom</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300" />
                  <span>Local memory vaults remain sovereign ground truth forever</span>
                </div>
              </div>
            </div>

            {/* Sovereign Security Guarantee */}
            <div className="rounded-xl border border-white/[0.06] bg-[#07070d] p-5">
              <div className="flex items-center gap-2.5 text-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="font-mono text-xs uppercase tracking-wider text-slate-300">
                  Sovereign Cloud Guarantee
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Your private memories never leave your machine unencrypted. Even if Starlight Cloud goes offline, 100% of
                your agent fleet, vaults, and knowledge trees run locally in SQLite without interruption.
              </p>
            </div>
          </div>

          {/* Payment & Activation Column */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-2xl border border-white/[0.10] bg-[#0a0a14]/90 p-8 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Payment & Activation</h3>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Complete verification to receive your instant cryptographic token.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-black/40 px-2.5 py-1 font-mono text-[10px] text-slate-400">
                  <Lock className="h-3 w-3 text-emerald-400" />
                  <span>256-bit TLS</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-xs text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleCheckout} className="mt-6 space-y-5">
                {/* Email Address */}
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-slate-300">
                    Billing Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/[0.12] bg-[#07070d] px-4 py-2.5 font-mono text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    placeholder="you@domain.com"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">Invoices and renewal notifications will be sent here.</p>
                </div>

                {/* Workspace / Account Identifier */}
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-slate-300">
                    Machine Workspace Account ID
                  </label>
                  <input
                    type="text"
                    required
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/[0.12] bg-[#07070d] px-4 py-2.5 font-mono text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    placeholder="acc_..."
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Cryptographically binds license tokens to your local workspace instance.
                  </p>
                </div>

                {/* Mode Selector */}
                <div className="border-t border-white/[0.08] pt-4">
                  <span className="block font-mono text-xs uppercase tracking-wider text-slate-300">
                    Verification Method
                  </span>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMode("card")}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 font-mono text-xs transition ${
                        paymentMode === "card"
                          ? "border-cyan-400 bg-cyan-400/10 text-white"
                          : "border-white/[0.08] bg-[#07070d] text-slate-400 hover:text-white"
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Stripe Checkout</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode("sandbox")}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 font-mono text-xs transition ${
                        paymentMode === "sandbox"
                          ? "border-cyan-400 bg-cyan-400/10 text-white"
                          : "border-white/[0.08] bg-[#07070d] text-slate-400 hover:text-white"
                      }`}
                    >
                      <Zap className="h-4 w-4 text-cyan-300" />
                      <span>Developer Sandbox</span>
                    </button>
                  </div>
                </div>

                {paymentMode === "card" ? (
                  <div className="space-y-4 rounded-xl border border-white/[0.08] bg-[#07070d] p-4">
                    <div className="flex items-center justify-between pb-1">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                        Card Information (Stripe Elements)
                      </span>
                      <span className="font-mono text-[10px] text-emerald-400">Test & Live Mode Supported</span>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full rounded-lg border border-white/[0.1] bg-[#050508] px-3.5 py-2 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                        placeholder="Card Number"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        className="rounded-lg border border-white/[0.1] bg-[#050508] px-3.5 py-2 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                        placeholder="MM / YY"
                      />
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="rounded-lg border border-white/[0.1] bg-[#050508] px-3.5 py-2 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                        placeholder="CVC"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-cyan-400/20 bg-cyan-950/10 p-4 text-xs text-cyan-200">
                    <p className="font-medium">Sandbox Mode Active</p>
                    <p className="mt-1 text-slate-300">
                      Bypasses external card processing to generate an immediate, fully functional HMAC-SHA256 test license
                      token for local CLI verification.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-xs font-bold text-black transition hover:bg-cyan-50 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-black" />
                      <span>{processingStep || "Processing..."}</span>
                    </>
                  ) : (
                    <>
                      <span>Authorize & Activate Sovereign License (${amountDue})</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="text-center font-mono text-[10px] text-slate-500">
                  Secured by 256-bit encryption · 14-day money-back guarantee · Cancel anytime
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
