import Link from "next/link";
import { NAV_GROUPS, CONNECT_LINKS } from "@/lib/nav";
import { StarlightMark } from "@/components/StarlightMark";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-16">
      <div className="mx-auto max-w-[88rem]">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-4">
            <Link
              href="/"
              aria-label="Starlight Intelligence — home"
              className="inline-flex items-center gap-2.5 transition-micro hover:opacity-80"
            >
              <StarlightMark size={18} />
              <span className="text-[15px] font-semibold tracking-tight text-white">Starlight</span>
              <span className="font-serif text-[13px] italic tracking-wide text-slate-400">
                Intelligence
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-slate-400">
              Persistent context for AI agents. Built on the Starlight Intelligence
              Protocol. Local-first. Forkable. Free forever.
            </p>
          </div>

          {/* Mirror the nav's Explore / Build / Learn groups */}
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="lg:col-span-2">
              <p className="font-serif text-[14px] italic tracking-wide text-slate-400">
                {group.label}
              </p>
              <nav className="mt-3 flex flex-col gap-2" aria-label={`${group.label} navigation`}>
                {group.items.map((it) => (
                  <FooterLink key={it.href} href={it.href}>
                    {it.label}
                  </FooterLink>
                ))}
              </nav>
            </div>
          ))}

          {/* Connect — external + newcomer */}
          <div className="lg:col-span-2">
            <p className="font-serif text-[14px] italic tracking-wide text-slate-400">Connect</p>
            <nav className="mt-3 flex flex-col gap-2" aria-label="Connect navigation">
              {CONNECT_LINKS.map((l) => (
                <FooterLink key={l.href} href={l.href} external={l.external}>
                  {l.label}
                </FooterLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-2 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-slate-500">
            Built on the Starlight Intelligence Protocol · MIT
          </p>
          <p className="font-serif text-[13px] italic text-slate-500">Sovereign by architecture.</p>
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
  const cls = "text-[13px] text-slate-400 transition-micro hover:text-white";
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
