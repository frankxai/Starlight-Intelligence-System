import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Fraunces } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://starlightintelligence.org"),
  title: {
    default:
      "Starlight Intelligence — Persistent context for AI agents · Built on SIP",
    template: "%s — Starlight Intelligence",
  },
  description:
    "A persistent context and memory architecture for AI agents. 10 intelligence systems, 35 agents, 70+ commands, 3 reference Domain Sub-Stack verticals. Built on the Starlight Intelligence Protocol. Local-first. Forkable. Free.",
  alternates: { canonical: "/" },
  openGraph: {
    title:
      "Starlight Intelligence — Persistent context for AI agents · Built on SIP",
    description:
      "10 intelligence systems, 35 agents, 70+ commands, 3 reference verticals. Built on SIP. Local-first. Forkable. Free.",
    url: "https://starlightintelligence.org",
    siteName: "Starlight Intelligence",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Starlight Intelligence — Persistent context for AI agents · Built on SIP",
    description:
      "10 intelligence systems, 35 agents, 70+ commands, 3 reference verticals. Built on SIP. Local-first. Forkable. Free.",
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
        "A persistent context and memory architecture for AI agents. Sovereign by architecture, local-first, forkable.",
    },
    {
      "@type": "WebSite",
      "@id": SITE_ID,
      url: "https://starlightintelligence.org",
      name: "Starlight Intelligence",
      publisher: { "@id": ORG_ID },
      description:
        "Persistent context for AI agents, built on the Starlight Intelligence Protocol.",
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
      softwareVersion: "7.6.0",
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
    <html lang="en" className={`${inter.variable} ${jbMono.variable} ${fraunces.variable}`}>
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
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
