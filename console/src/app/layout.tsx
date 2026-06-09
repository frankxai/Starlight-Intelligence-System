import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * Vellum & Voltage typography lockup.
 *
 * Fraunces — display: serif with optical-size variability, used for titles
 *   and vault labels. The serif gives "manuscript" weight against the
 *   electric voltage palette.
 * Inter — body: technical neutrality where it matters.
 * JetBrains Mono — technical labels: counts, coordinates, system status.
 *
 * Loaded as CSS variables (--font-display, --font-body, --font-mono) so the
 * Tailwind theme can map them to font-display / font-sans / font-mono.
 */
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Starlight Console — Substrate Visualization",
    template: "%s — Starlight Console",
  },
  description:
    "A navigable 3D space for the Starlight Intelligence System. Six vaults orbit a luminous core; ten verticals trace the outer ring.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="bg-[#0a0a14] font-sans text-[color:var(--ink-0)] antialiased">
        {children}
      </body>
    </html>
  );
}
