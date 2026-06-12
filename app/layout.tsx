import type { Metadata } from "next";
import { Fraunces, Geist, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConsoleBanner } from "@/components/ConsoleBanner";
import { CursorCaret } from "@/components/CursorCaret";
import { TerminalProvider } from "@/components/terminal/TerminalProvider";
import { WmHotkeys } from "@/components/wm/WmHotkeys";
import { getLatestPosts } from "@/lib/blog";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.thesis,
  openGraph: {
    siteName: site.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

/* Runs before paint: resolve theme from localStorage, else system.
   Also restores WM mode (desktop-only window-manager presentation —
   the attribute is harmless below the CSS breakpoint). */
const themeInit = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t;if(localStorage.getItem("wm")==="on")document.documentElement.dataset.wm="on"}catch(e){}})()`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const posts = await getLatestPosts(10);
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${geistSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      {/* suppressHydrationWarning: browser extensions inject classes into
          <body> before React hydrates (e.g. "vc-init"); only this element's
          attributes are suppressed, children are still checked. */}
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <TerminalProvider posts={posts}>
          <WmHotkeys />
          <Header />
          <main className="flex-1 w-full max-w-2xl mx-auto px-6">
            {children}
          </main>
          <Footer />
        </TerminalProvider>
        <ConsoleBanner />
        <CursorCaret />
      </body>
    </html>
  );
}
