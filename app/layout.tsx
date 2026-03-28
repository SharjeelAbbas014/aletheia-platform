import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { RootProvider } from "fumadocs-ui/provider/next";
import "fumadocs-ui/style.css";

import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"]
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "700"]
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aletheia.dev"),
  title: {
    default: "Aletheia | Memory Infrastructure for Agents",
    template: "%s | Aletheia"
  },
  description:
    "Ship a memory system with hybrid retrieval, time-aware ranking, fact supersession, local-first binaries, and cloud APIs.",
  openGraph: {
    title: "Aletheia",
    description:
      "Modern memory infrastructure for agents and applications that need durable recall.",
    siteName: "Aletheia"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
