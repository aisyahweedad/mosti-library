import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import { BasePathFetch } from "@/components/base-path-fetch";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "Perpustakaan Digital MOSTI",
    template: "%s · Perpustakaan Digital MOSTI",
  },
  description:
    "Terbitan digital kebangsaan berkuasa AI. Imbas, OCR dan carian teks penuh serta soal-jawab dalam Bahasa Malaysia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jakarta.variable} min-h-screen font-sans antialiased`}
      >
        <Providers>
          <BasePathFetch />
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
