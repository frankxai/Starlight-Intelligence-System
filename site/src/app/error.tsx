"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-32 text-center">
      <p className="text-[13px] font-medium text-rose-400">
        Something went wrong
      </p>
      <h1 className="mt-2 text-2xl font-bold text-white">
        Failed to load vault data
      </h1>
      <p className="mt-2 max-w-sm text-[14px] text-slate-500">
        This usually means the GitHub API rate limit was hit. Try again in a
        moment.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-full border border-white/[0.1] px-4 py-2 text-[13px] text-white transition-micro hover:bg-white/[0.04]"
      >
        Try again
      </button>
    </div>
  );
}
