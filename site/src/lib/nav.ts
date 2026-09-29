/**
 * Curated public navigation for the Starlight narrative and developer path.
 * Both the Header and Footer consume these groups. Legacy experiments keep
 * their direct URLs and contextual links without competing for primary IA.
 */

import type { CinematicStill } from "@/lib/cinematic";
import { NAV_GROUP_STILLS } from "@/lib/cinematic";

export type NavItem = { href: string; label: string; desc: string };
export type NavGroup = {
  label: string;
  visual: CinematicStill;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Explore",
    visual: NAV_GROUP_STILLS.Explore,
    items: [
      { href: "/story", label: "Story", desc: "The thesis in seven chapters" },
      { href: "/notes", label: "Starlight Notes", desc: "Curated public knowledge with exportable records" },
      { href: "/constitution", label: "Constitution", desc: "Mission, values, and long horizon" },
      { href: "/cosmos", label: "Cosmos", desc: "An exploration of the universe as orientation" },
      { href: "/field-notes", label: "Field Notes", desc: "Research and working ideas" },
    ],
  },
  {
    label: "Build",
    visual: NAV_GROUP_STILLS.Build,
    items: [
      { href: "/deploy", label: "Deploy Explorer", desc: "Own the public Starlight interface" },
      { href: "/architecture", label: "Architecture", desc: "How the pieces fit together" },
      { href: "/quickstart", label: "Quickstart", desc: "Run the local system" },
      { href: "/download", label: "Source & Modules", desc: "Build SIP source or get modules" },
      { href: "/docs", label: "Documentation", desc: "Reference docs and developer details" },
    ],
  },
  {
    label: "Learn",
    visual: NAV_GROUP_STILLS.Learn,
    items: [
      { href: "/proof", label: "Proof", desc: "Current code, tests, status, and claim limits" },
      { href: "/protocol", label: "Protocol", desc: "The open SIP substrate spec" },
      { href: "/verify", label: "Verify", desc: "Check this system's own signed receipt" },
      { href: "/changelog", label: "Changelog", desc: "What shipped, and when" },
    ],
  },
];

export const GITHUB_URL = "https://github.com/frankxai/Starlight-Intelligence-System";
export const ARCANEA_URL = "https://arcanea.ai";
export { DEPLOY_PAGE_URL as DEPLOY_URL } from "@/lib/deployment";

/** External + newcomer links — Footer "Connect" column. */
export const CONNECT_LINKS: { href: string; label: string; external?: boolean }[] = [
  { href: GITHUB_URL, label: "GitHub", external: true },
  { href: ARCANEA_URL, label: "Arcanea", external: true },
  {
    href: "https://github.com/frankxai/Starlight-Intelligence-System/tree/main/integrations/starter-packs/friend-starter",
    label: "Friend Starter",
    external: true,
  },
  {
    href: "https://github.com/frankxai/Starlight-Intelligence-System/blob/main/ONBOARDING.md",
    label: "Welcome guide",
    external: true,
  },
  { href: "/api/vaults", label: "Vault API", external: true },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}
