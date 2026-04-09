export default function VaultsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-white/[0.04]" />
      <div className="mt-2 h-4 w-72 animate-pulse rounded bg-white/[0.03]" />
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl border border-white/[0.04] bg-white/[0.02]"
          />
        ))}
      </div>
    </div>
  );
}
