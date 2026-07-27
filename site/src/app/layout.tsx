import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StarlightTrail } from "@/components/StarlightTrail";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jbMono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  display: "swap",
});

// Editorial serif for display headlines. Variable weight, so existing
// `font-serif font-semibold` headings keep real weight rather than a
// synthesised bold.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://starlightintelligence.org"),
  title: {
    default:
      "Starlight Intelligence — Multi-agent architecture for humans and their agents · Built on SIP",
    template: "%s — Starlight Intelligence",
  },
  description:
    "A multi-agent design and architecture system: named agents, skills, orchestration, durable memory, governance, and an open protocol. Founders and their agent fleets share one substrate — the human holds the keys.",
  alternates: { canonical: "/" },
  openGraph: {
    title:
      "Starlight Intelligence — Multi-agent architecture for humans and their agents · Built on SIP",
    description:
      "Agent design, orchestration, durable memory, governance, evals, and an open protocol. One substrate for founders and their agent fleets — the human holds the keys.",
    url: "https://starlightintelligence.org",
    siteName: "Starlight Intelligence",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Starlight Intelligence — Multi-agent architecture for humans and their agents · Built on SIP",
    description:
      "Agent design, orchestration, durable memory, governance, evals, and an open protocol. One substrate for founders and their agent fleets — the human holds the keys.",
  },
  robots: { index: true, follow: true },
};

const ORG_ID = "https://starlightintelligence.org/#organization";
const SITE_ID = "https://starlightintelligence.org/#website";

const SCHEMA_GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "Starlight Intelligence",
      url: "https://starlightintelligence.org",
      sameAs: [
        "https://github.com/frankxai/Starlight-Intelligence-System",
        "https://www.npmjs.com/package/@arcanea/starlight-intelligence-system",
      ],
      description:
        "A multi-agent architecture for people and their agents: orchestration, durable memory, governance, and inspectable proof.",
    },
    {
      "@type": "WebSite",
      "@id": SITE_ID,
      url: "https://starlightintelligence.org",
      name: "Starlight Intelligence",
      publisher: { "@id": ORG_ID },
      description:
        "Multi-agent architecture for humans and their agents, built on the Starlight Intelligence Protocol.",
      inLanguage: "en",
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": "https://starlightintelligence.org/#source",
      name: "Starlight Intelligence System",
      codeRepository: "https://github.com/frankxai/Starlight-Intelligence-System",
      programmingLanguage: "TypeScript",
      runtimePlatform: "Model Context Protocol",
      license: "https://opensource.org/licenses/MIT",
      author: { "@id": ORG_ID },
      softwareVersion: "8.3.0",
      description:
        "Substrate (SIP protocol + attestation) + reference operational layer (semantic vaults, hybrid retrieval, MCP server, platform adapters).",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jbMono.variable} ${newsreader.variable}`}>
      <body className="flex min-h-dvh flex-col bg-[#060609] font-sans text-slate-200 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_GRAPH) }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-[13px] focus:font-semibold focus:text-[#060609]"
        >
          Skip to content
        </a>
        <StarlightTrail />
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
