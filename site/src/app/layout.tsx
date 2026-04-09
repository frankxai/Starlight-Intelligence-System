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
    default: "Starlight Intelligence",
    template: "%s — Starlight Intelligence",
  },
  description:
    "The memory layer for humans and AI agents. Six semantic vaults that compound your intelligence over time. Local-first. Forkable. Free.",
  openGraph: {
    title: "Starlight Intelligence",
    description:
      "Six vaults. Your insights. Readable by agents. Compounding forever.",
    url: "https://starlightintelligence.org",
    siteName: "Starlight Intelligence",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Starlight Intelligence",
    description:
      "Six vaults. Your insights. Readable by agents. Compounding forever.",
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
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
