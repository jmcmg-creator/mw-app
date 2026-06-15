import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

// UI font — Synapse spec: weights 400/500/600/700 + tabular-nums on numbers.
const plexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Logo-only display face (SYNAPSE wordmark).
const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Patrimoine — Suivi de portefeuille",
  description:
    "Suivi de portefeuille d'investissements : bourse, produits structurés, immobilier.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0F16",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      // Synapse-spec default: dark theme.
      className={`dark ${plexSans.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
