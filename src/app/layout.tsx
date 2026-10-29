import type { Metadata } from "next";
import { Figtree, Fraunces, IBM_Plex_Mono } from "next/font/google";

import { SiteFooter, SiteHeader } from "@/components/site-header";
import { ProgressProvider } from "@/components/use-progress";
import { progressIndex } from "@/content";
import "@/content/check-lab-files";

import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex",
});

export const metadata: Metadata = {
  title: {
    default: "Drillbook",
    template: "%s · Drillbook",
  },
  description: "Hands-on undergraduate labs for Git, Docker, and AWS EC2 and S3.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${fraunces.variable} ${plex.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-card focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <ProgressProvider index={progressIndex}>
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-y-0 left-0 z-40 hidden w-9 border-r border-stamp/35 md:block"
          />
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </ProgressProvider>
      </body>
    </html>
  );
}
