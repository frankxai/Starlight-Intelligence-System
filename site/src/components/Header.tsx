"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_GROUPS, GITHUB_URL, DEPLOY_URL, isActive } from "@/lib/nav";

export function Header() {
  const pathname = usePathname();
  return <HeaderContent key={pathname} pathname={pathname} />;
}

function HeaderContent({ pathname }: { pathname: string }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Escape closes; outside-click closes desktop dropdowns (touch + keyboard safe).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    }
    function onClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060609]/80 backdrop-blur-xl">
      <nav
        ref={navRef}
        className="mx-auto flex h-14 max-w-[88rem] items-center justify-between px-6"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="Starlight Intelligence — home"
          className="flex items-center gap-2.5 transition-micro hover:opacity-80"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="3" fill="#a78bfa" opacity="0.8" />
            <circle cx="9" cy="9" r="7" stroke="#a78bfa" strokeWidth="0.5" opacity="0.3" />
            <circle cx="9" cy="9" r="9" stroke="#a78bfa" strokeWidth="0.3" opacity="0.15" />
          </svg>
          <span className="text-[15px] font-semibold tracking-tight text-white">Starlight</span>
        </Link>

        {/* Desktop grouped nav */}
        <div className="hidden items-center gap-0.5 md:flex">
          {NAV_GROUPS.map((group) => {
            const open = openMenu === group.label;
            const groupActive = group.items.some((it) => isActive(pathname, it.href));
            const panelId = `nav-panel-${group.label.toLowerCase()}`;
            return (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => setOpenMenu(group.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenMenu(open ? null : group.label)}
                  className={`inline-flex min-h-11 items-center gap-1 rounded-md px-3 py-2 text-[13px] transition-micro hover:bg-white/[0.06] ${
                    groupActive || open ? "text-white" : "text-slate-300 hover:text-white"
                  }`}
                >
                  {group.label}
                  <span
                    className={`text-[9px] text-slate-500 transition-micro ${open ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </button>

                {/* Dropdown panel. pt-2 bridges the trigger→panel gap so hover
                    doesn't drop while crossing it. */}
                <div
                  id={panelId}
                  className={`absolute left-0 top-full z-50 w-72 pt-2 transition-micro ${
                    open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  <div className="flex flex-col gap-0.5 rounded-xl border border-white/[0.10] bg-[#0c0c12]/95 p-2 shadow-2xl backdrop-blur-xl">
                    {group.items.map((it) => {
                      const itemActive = isActive(pathname, it.href);
                      return (
                        <Link
                          key={it.href}
                          href={it.href}
                          className={`flex flex-col gap-0.5 rounded-lg px-3 py-2 transition-micro hover:bg-white/[0.05] ${
                            itemActive ? "bg-white/[0.04]" : ""
                          }`}
                        >
                          <span
                            className={`text-[13px] font-medium ${
                              itemActive ? "text-[#c4b5fd]" : "text-slate-100"
                            }`}
                          >
                            {it.label}
                          </span>
                          <span className="text-[11px] leading-snug text-slate-500">{it.desc}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          <span className="mx-1.5 h-4 w-px bg-white/[0.08]" aria-hidden="true" />

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2.5 py-2 text-[13px] text-slate-300 transition-micro hover:bg-white/[0.06] hover:text-white"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>
          <a
            href={DEPLOY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 rounded-full bg-white px-4 py-1.5 text-[13px] font-medium text-[#060609] transition-micro hover:bg-white/90"
          >
            Deploy
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-slate-300 transition-micro hover:bg-white/[0.06] hover:text-white md:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            {mobileOpen ? (
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <>
                <path d="M3 6h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 10h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile panel — grouped disclosure, all routes reachable */}
      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-white/[0.06] bg-[#0a0a0f] md:hidden">
          <div className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto px-6 py-5">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="mb-6">
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  {group.label}
                </p>
                <div className="flex flex-col">
                  {group.items.map((it) => {
                    const itemActive = isActive(pathname, it.href);
                    return (
                      <Link
                        key={it.href}
                        href={it.href}
                        className={`flex min-h-11 items-center rounded-lg px-2 text-[14px] transition-micro hover:bg-white/[0.05] hover:text-white ${
                          itemActive ? "text-[#c4b5fd]" : "text-slate-200"
                        }`}
                      >
                        {it.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 border-t border-white/[0.06] pt-5">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg border border-white/[0.10] px-4 py-2.5 text-center text-[14px] text-slate-200 transition-micro hover:bg-white/[0.05]"
              >
                GitHub
              </a>
              <a
                href={DEPLOY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg bg-white px-4 py-2.5 text-center text-[14px] font-medium text-[#060609] transition-micro hover:bg-white/90"
              >
                Deploy
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
