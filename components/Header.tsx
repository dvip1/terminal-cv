import Link from "next/link";
import { nav, site } from "@/content/site";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TerminalButton } from "@/components/terminal/TerminalButton";

export function Header() {
  return (
    <header className="w-full max-w-2xl mx-auto px-6 pt-8 pb-10 sm:pb-12 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
      <Link
        href="/"
        className="whitespace-nowrap font-serif text-lg font-semibold tracking-tight hover:text-accent transition-colors"
      >
        {site.header_name}
      </Link>
      <nav
        aria-label="Main"
        className="flex flex-wrap items-baseline gap-x-4 gap-y-2 sm:gap-x-5 text-sm"
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
        <TerminalButton />
        <ThemeToggle />
      </nav>
    </header>
  );
}
