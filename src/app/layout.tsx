import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { MobileNav } from "@/components/layout/MobileNav";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";
import { PwaElements } from "@/components/PwaElements";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export const metadata: Metadata = {
  title: "AllIndia Accountable",
  description: "Citizen-first civic accountability platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AllIndia",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased selection:bg-primary/20`}>
        <div className="flex flex-col min-h-[100dvh] max-w-md mx-auto relative bg-background shadow-2xl overflow-hidden ring-1 ring-border/20">
          <Header />
          <main className="flex-1 overflow-y-auto pb-20 pt-2">
            {children}
          </main>
          <MobileNav />
        </div>
        <Toaster />
        <PwaElements />
      </body>
    </html>
  );
}
