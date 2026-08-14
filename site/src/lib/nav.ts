/**
 * Single source of truth for the site's information architecture.
 * Both the Header (grouped mega-menu) and the Footer consume these groups so
 * navigation can never drift between them again. Every route lives in exactly
 * one group; the Footer adds a Connect column for external + newcomer links.
 */

export type NavItem = { href: string; label: string; desc: string };
export type NavGroup = { label: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Explore",
    items: [
      { href: "/cosmos", label: "Cosmos", desc: "Visual map of the knowledge library" },
      { href: "/palace", label: "Memory Palace", desc: "Walk the vaults in space" },
      { href: "/knowledge-tree", label: "Knowledge Tree", desc: "The system, branch by branch" },
      { href: "/vaults", label: "Public Vaults", desc: "Six semantic memory vaults" },
      { href: "/queen", label: "Queen", desc: "The visual intelligence loop" },
      { href: "/visuals/brand-lab", label: "Brand Lab", desc: "The visual identity system" },
      { href: "/verticals", label: "Verticals", desc: "Domain sub-stacks" },
    ],
  },
  {
    label: "Build",
    items: [
      { href: "/quickstart", label: "Quickstart", desc: "Five minutes to first context" },
      { href: "/download", label: "Download", desc: "Fork the SIP Starter" },
      { href: "/cockpit", label: "Cockpit", desc: "The spec-trace console" },
      { href: "/architecture", label: "Architecture", desc: "How the pieces fit together" },
    ],
  },
  {
    label: "Learn",
    items: [
      { href: "/constitution", label: "Constitution", desc: "Intelligence in service of life" },
      { href: "/protocol", label: "Protocol", desc: "The open SIP substrate spec" },
      { href: "/research", label: "Research", desc: "Substrate research surface" },
      { href: "/explainer", label: "Explainer", desc: "Plain-language overview" },
      { href: "/docs", label: "Documentation", desc: "Reference docs" },
      { href: "/changelog", label: "Changelog", desc: "What shipped, and when" },
    ],
  },
];

export const GITHUB_URL = "https://github.com/frankxai/Starlight-Intelligence-System";
export const ARCANEA_URL = "https://arcanea.ai";
export const DEPLOY_URL =
  "https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffrankxai%2FStarlight-Intelligence-System&root-directory=site";

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
