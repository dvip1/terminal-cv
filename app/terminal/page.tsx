import type { Metadata } from "next";
import { HomeContent } from "@/components/HomeContent";

/**
 * Shareable route that lands with the terminal already dropped down
 * (TerminalProvider auto-opens on this pathname). Renders the homepage
 * underneath; canonical content lives on the editorial pages — noindex.
 */
export const metadata: Metadata = {
  title: "Terminal",
  description: "The developer terminal view of dvippatel.in. Press ` anywhere.",
  robots: { index: false, follow: false },
};

export default function TerminalPage() {
  return <HomeContent />;
}
