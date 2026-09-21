"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_GROUPS, GITHUB_URL, DEPLOY_URL, isActive } from "@/lib/nav";
import { CINEMATIC_STILLS } from "@/lib/cinematic";
import { StarlightMark } from "@/components/StarlightMark";

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
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060609]/72 backdrop-blur-xl">
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
          <StarlightMark size={19} />
          <span className="text-[15px] font-semibold tracking-tight text-white">Starlight</span>
        </Link>

        {/* Desktop grouped nav */}
        <div className="hidden items-center gap-0.5 md:flex">
          {NAV_GROUPS.map((group, groupIndex) => {
            const open = openMenu === group.label;
            const groupActive = group.items.some((it) => isActive(pathname, it.href));
            const panelId = `nav-panel-${group.label.toLowerCase()}`;
            const alignPanelRight = groupIndex === NAV_GROUPS.length - 1;
            const visual = CINEMATIC_STILLS[group.visual];
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
                  className={`absolute top-full z-50 w-[22.5rem] pt-2 transition-micro ${
                    alignPanelRight ? "right-0" : "left-0"
                  } ${
                    open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  <div className="overflow-hidden rounded-xl border border-white/[0.10] bg-[#0c0c12]/95 shadow-2xl backdrop-blur-xl">
                    <div className="relative h-[5.75rem] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={visual}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c12] via-[#0c0c12]/25 to-transparent" />
                      <p className="absolute bottom-2.5 left-3 font-serif text-[17px] font-semibold tracking-tight text-white">
                        {group.label}
                      </p>
                    </div>
                    <div className="flex flex-col gap-0.5 p-2">
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
          <Link
            href={DEPLOY_URL}
            className="ml-1 whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-[13px] font-medium text-[#060609] transition-micro hover:bg-white/90"
          >
            Deploy Explorer
          </Link>
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
          <div className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto px-5 py-4">
            {NAV_GROUPS.map((group) => {
              const visual = CINEMATIC_STILLS[group.visual];
              return (
                <div key={group.label} className="mb-5">
                  <div className="relative mb-2 h-14 overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={visual} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/80 via-[#0a0a0f]/40 to-transparent" />
                    <p className="absolute inset-y-0 left-3 flex items-center font-serif text-[16px] font-semibold text-white">
                      {group.label}
                    </p>
                  </div>
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
              );
            })}
            <div className="flex items-center gap-3 border-t border-white/[0.06] pt-5">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg border border-white/[0.10] px-4 py-2.5 text-center text-[14px] text-slate-200 transition-micro hover:bg-white/[0.05]"
              >
                GitHub
              </a>
              <Link
                href={DEPLOY_URL}
                className="flex-1 rounded-lg bg-white px-4 py-2.5 text-center text-[14px] font-medium text-[#060609] transition-micro hover:bg-white/90"
              >
                Deploy Explorer
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
