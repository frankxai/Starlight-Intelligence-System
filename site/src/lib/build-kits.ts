import { PLUGIN_ADOPTION, PLUGIN_MODULES_RELEASE_URL } from "./plugin-starter-download";

export type BuildKit = {
  id: string;
  number: string;
  audience: string;
  title: string;
  description: string;
  outcome: string;
  includes: readonly string[];
  requires: string;
  boundary: string;
  status: "Public source" | "Published local modules";
  href: string;
  action: string;
  sourceHref: string;
};

// Public, source-backed journeys only. This is not an account plugin inventory,
// a connected-service catalog, a paid offer, or proof of directory publication.
export const BUILD_KITS: readonly BuildKit[] = [
  {
    id: "workflow",
    number: "01",
    audience: "For builders",
    title: "Make a workflow you can reuse.",
    description: "Give one repeated task a clear input, a useful output and a way to check the work.",
    outcome: "An inspectable skill or agent brief with acceptance and recovery steps.",
    includes: ["Foundry skill source", "Agent Designer source", "First-task prompts and adoption guide"],
    requires: "Your task, a sample input and a compatible AI host. Host costs and permissions are yours to manage.",
    boundary: "Instruction packages do not enforce permissions or establish a public ChatGPT listing.",
    status: "Public source",
    href: "/download#plugin-adoption",
    action: "Choose a workflow starter",
    sourceHref: PLUGIN_ADOPTION.candidates[0].sourceUrl,
  },
  {
    id: "product",
    number: "02",
    audience: "For creators and founders",
    title: "Turn useful work into a clear offer.",
    description: "Connect the buyer, the files you can deliver and the evidence someone needs before trying them.",
    outcome: "An offer brief, delivery checklist, economics worksheet and bounded launch test.",
    includes: ["Editable launch workbook", "Complete fictional worked example", "Links to Creator Product and Revenue Engine modules"],
    requires: "One real workflow or original asset you may distribute. A text editor; a spreadsheet app for the CSV.",
    boundary: "No checkout, traffic, customer demand or revenue is created by downloading the pack.",
    status: "Published local modules",
    href: "#launch-workbook",
    action: "Open the launch workbook",
    sourceHref: PLUGIN_MODULES_RELEASE_URL,
  },
  {
    id: "system",
    number: "03",
    audience: "For technical explorers",
    title: "Carry your context into the next session.",
    description: "Explore Starlight’s public source and set up a local system around your own work.",
    outcome: "A local starting point you can inspect, adapt and check against the quickstart.",
    includes: ["Current system source", "Local quickstart", "Protocol and architecture references"],
    requires: "A development environment and the prerequisites listed in the quickstart. Model or hosting use may cost extra.",
    boundary: "This path does not include a hosted account, a managed service or an operational guarantee.",
    status: "Public source",
    href: "/quickstart",
    action: "Follow the quickstart",
    sourceHref: "https://github.com/frankxai/Starlight-Intelligence-System",
  },
];

export const LAUNCH_WORKBOOK = {
  id: "launch-workbook",
  version: "1.0.0",
  license: "MIT",
  price: "Free",
  directory: "/downloads/launch-workbook-v1",
  archive: "/downloads/starlight-launch-workbook-v1.zip",
  source: "https://github.com/frankxai/Starlight-Intelligence-System/tree/main/site/public/downloads/launch-workbook-v1",
  files: [
    { name: "README.md", label: "Start here", detail: "Inputs, first session and boundaries" },
    { name: "offer-brief.md", label: "Offer brief", detail: "Buyer, result, proof and delivery" },
    { name: "worked-example.md", label: "Worked example", detail: "A complete fictional handoff product" },
    { name: "delivery-checklist.md", label: "Delivery checklist", detail: "Content, first use and release evidence" },
    { name: "economics.csv", label: "Economics worksheet", detail: "Costs, contribution and unknown inputs" },
    { name: "distribution-plan.md", label: "Distribution plan", detail: "A bounded test and campaign links" },
    { name: "LICENSE", label: "MIT license", detail: "Use, modify and redistribute with notice" },
  ],
} as const;
