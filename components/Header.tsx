import Link from "next/link";
import { nav, site } from "@/content/site";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TerminalButton } from "@/components/terminal/TerminalButton";

export function Header() {
  /* Mobile: name + buttons share the top row, links get a full row below.
     ≥sm: one row — name left; links, then buttons (order-last), right. */
  return (
    <header className="w-full max-w-2xl mx-auto px-6 pt-8 pb-10 sm:pb-12 flex flex-wrap items-baseline justify-between gap-y-3">
      <Link
        href="/"
        className="whitespace-nowrap font-serif text-lg font-semibold tracking-tight hover:text-accent transition-colors"
      >
        {site.header_name}
      </Link>
      <div className="flex items-baseline gap-3 sm:order-last sm:ml-5">
        <TerminalButton />
        <ThemeToggle />
      </div>
      <nav
        aria-label="Main"
        className="w-full sm:w-auto sm:ml-auto flex items-baseline gap-x-5 text-sm"
      >
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="link-grow text-muted hover:text-accent"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
