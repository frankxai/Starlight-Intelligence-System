import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-lg font-semibold tracking-tight text-white">
            Starlight Intelligence
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/vaults"
            className="text-slate-400 transition-colors hover:text-white"
          >
            Vaults
          </Link>
          <Link
            href="/docs"
            className="text-slate-400 transition-colors hover:text-white"
          >
            Docs
          </Link>
          <a
            href="https://github.com/frankxai/Starlight-Intelligence-System"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 transition-colors hover:text-white"
          >
            GitHub
          </a>
          <a
            href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffrankxai%2FStarlight-Intelligence-System&root-directory=site"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-200"
          >
            Deploy Your Own
          </a>
        </div>
      </nav>
    </header>
  );
}
