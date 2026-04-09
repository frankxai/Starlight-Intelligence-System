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
          className="flex items-center gap-2 transition-micro hover:opacity-80"
        >
          <span className="text-[15px] font-semibold tracking-tight text-white">
            Starlight
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <NavLink href="/vaults">Vaults</NavLink>
          <NavLink href="/docs">Docs</NavLink>
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
    "rounded-md px-3 py-1.5 text-[13px] text-slate-400 transition-micro hover:text-white hover:bg-white/[0.04]";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
      >
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
