import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://starlightintelligence.org"),
  title: {
    default:
      "Starlight Intelligence — Persistent context for AI agents · Built on SIP",
    template: "%s — Starlight Intelligence",
  },
  description:
    "A persistent context and memory architecture for AI agents. 9 intelligence layers, 35 agents, 70+ commands, 3 reference Domain Sub-Stack verticals. Built on the Starlight Intelligence Protocol. Local-first. Forkable. Free.",
  openGraph: {
    title:
      "Starlight Intelligence — Persistent context for AI agents · Built on SIP",
    description:
      "9 intelligence layers, 35 agents, 70+ commands, 3 reference verticals. Built on SIP. Local-first. Forkable. Free.",
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
      "9 intelligence layers, 35 agents, 70+ commands, 3 reference verticals. Built on SIP. Local-first. Forkable. Free.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jbMono.variable}`}>
      <body className="flex min-h-dvh flex-col bg-[#060609] font-sans text-slate-200 antialiased">
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
