import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="text-[13px] font-medium text-white">Starlight Intelligence</p>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
              A memory system for humans and agents.
              Local-first. Forkable. Free forever.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-600">
              Navigate
            </p>
            <nav className="mt-3 flex flex-col gap-2" aria-label="Footer navigation">
              <FooterLink href="/vaults">Public Vaults</FooterLink>
              <FooterLink href="/docs">Documentation</FooterLink>
              <FooterLink href="/api/vaults" external>API</FooterLink>
            </nav>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-600">
              Connect
            </p>
            <nav className="mt-3 flex flex-col gap-2">
              <FooterLink
                href="https://github.com/frankxai/Starlight-Intelligence-System"
                external
              >
                GitHub
              </FooterLink>
              <FooterLink href="https://arcanea.ai" external>
                Arcanea
              </FooterLink>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[13px] text-slate-500 transition-micro hover:text-white"
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className="text-[13px] text-slate-500 transition-micro hover:text-white"
    >
      {children}
    </Link>
  );
}
