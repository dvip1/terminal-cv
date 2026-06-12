import Link from "next/link";
import { nav, site } from "@/content/site";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TerminalButton } from "@/components/terminal/TerminalButton";
import { WmToggle } from "@/components/wm/WmToggle";
import { WorkspaceLink } from "@/components/wm/WorkspaceLink";

export function Header() {
  /* Mobile: name + buttons share the top row, links get a full row below.
     ≥sm: one row — name left; links, then buttons (order-last), right.
     WM mode (desktop, opt-in): the same DOM restyles into a waybar via
     [data-wm="on"] CSS — identity swaps to dvip@arch and nav links grow
     workspace numbers. */
  return (
    <header className="site-header w-full max-w-2xl mx-auto px-6 pt-8 pb-10 sm:pb-12 flex flex-wrap items-baseline justify-between gap-y-3">
      <Link
        href="/"
        className="wm-identity whitespace-nowrap font-serif text-lg font-semibold tracking-tight hover:text-accent transition-colors"
      >
        <span className="wm-hide" aria-label={site.header_name}>
          {site.header_name}
        </span>
        <span className="wm-show font-mono text-sm font-medium">dvip@arch</span>
      </Link>
      <div className="wm-modules flex items-baseline gap-3 sm:order-last sm:ml-5">
        <TerminalButton />
        <ThemeToggle />
        <WmToggle />
      </div>
      <nav
        aria-label="Main"
        className="w-full sm:w-auto sm:ml-auto flex items-baseline gap-x-5 text-sm"
      >
        {nav.map((item, i) => (
          <WorkspaceLink
            key={item.href}
            href={item.href}
            ws={i + 1}
            label={item.label}
          />
        ))}
      </nav>
    </header>
  );
}
