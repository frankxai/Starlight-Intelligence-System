import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060609]/80 backdrop-blur-xl">
      <nav
        className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          aria-label="Starlight Intelligence — home"
          className="flex items-center gap-2.5 transition-micro hover:opacity-80"
        >
          {/* Starlight mark */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="9" cy="9" r="3" fill="#a78bfa" opacity="0.8" />
            <circle cx="9" cy="9" r="7" stroke="#a78bfa" strokeWidth="0.5" opacity="0.3" />
            <circle cx="9" cy="9" r="9" stroke="#a78bfa" strokeWidth="0.3" opacity="0.15" />
          </svg>
          <span className="text-[15px] font-semibold tracking-tight text-white">
            Starlight
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 lg:flex">
          <NavLink href="/verticals">Verticals</NavLink>
          <NavLink href="/cockpit">Cockpit</NavLink>
          <NavLink href="/architecture">Architecture</NavLink>
          <NavLink href="/protocol">Protocol</NavLink>
          <NavLink href="/quickstart">Quickstart</NavLink>
          <NavLink href="/explainer">Explainer</NavLink>
          <NavLink href="/vaults">Vaults</NavLink>
          <NavLink
            href="https://github.com/frankxai/Starlight-Intelligence-System"
            external
          >
            GitHub
          </NavLink>
          <a
            href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffrankxai%2FStarlight-Intelligence-System&root-directory=site"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#060609] transition-micro hover:bg-white/90"
          >
            Deploy
          </a>
        </div>

        {/* Tablet nav — condensed */}
        <div className="hidden items-center gap-1 sm:flex lg:hidden">
          <NavLink href="/verticals">Verticals</NavLink>
          <NavLink href="/cockpit">Cockpit</NavLink>
          <NavLink href="/quickstart">Quickstart</NavLink>
          <NavLink href="/architecture">Architecture</NavLink>
          <NavLink
            href="https://github.com/frankxai/Starlight-Intelligence-System"
            external
          >
            GitHub
          </NavLink>
        </div>

        {/* Mobile nav — disclosure exposing all routes (no JS, keyboard-accessible) */}
        <details className="group relative sm:hidden">
          <summary
            aria-label="Open navigation menu"
            className="flex cursor-pointer list-none items-center gap-1.5 rounded-md px-2.5 py-2 text-[13px] text-slate-300 transition-micro hover:bg-white/[0.04] [&::-webkit-details-marker]:hidden"
          >
            Menu
            <span className="text-slate-500 transition-micro group-open:rotate-180" aria-hidden="true">↓</span>
          </summary>
          <nav
            aria-label="Mobile navigation"
            className="absolute right-0 top-full z-50 mt-2 flex w-48 flex-col gap-0.5 rounded-lg border border-white/[0.10] bg-[#0c0c12] p-2 shadow-2xl"
          >
            <NavLink href="/verticals">Verticals</NavLink>
            <NavLink href="/cockpit">Cockpit</NavLink>
            <NavLink href="/architecture">Architecture</NavLink>
            <NavLink href="/protocol">Protocol</NavLink>
            <NavLink href="/quickstart">Quickstart</NavLink>
            <NavLink href="/explainer">Explainer</NavLink>
            <NavLink href="/vaults">Vaults</NavLink>
            <NavLink href="/docs">Docs</NavLink>
            <NavLink href="https://github.com/frankxai/Starlight-Intelligence-System" external>GitHub</NavLink>
          </nav>
        </details>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const cls =
    "rounded-md px-3 py-2.5 text-[13px] text-slate-300 transition-micro hover:text-white hover:bg-white/[0.06]";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
