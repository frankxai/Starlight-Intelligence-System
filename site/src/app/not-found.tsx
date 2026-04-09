import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-32 text-center">
      <p className="font-mono text-6xl font-bold text-white/[0.06]">404</p>
      <h1 className="mt-4 text-xl font-semibold text-white">
        Vault not found
      </h1>
      <p className="mt-2 text-[14px] text-slate-500">
        This page doesn{"'"}t exist yet.
      </p>
      <Link
        href="/vaults"
        className="mt-6 rounded-full border border-white/[0.1] px-4 py-2 text-[13px] text-white transition-micro hover:bg-white/[0.04]"
      >
        Browse public vaults
      </Link>
    </div>
  );
}
