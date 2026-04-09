export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-24">
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/[0.04]" />
        <div className="h-4 w-80 animate-pulse rounded bg-white/[0.03]" />
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-white/[0.04] bg-white/[0.02]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
