import Link from "next/link";
import { nav, site } from "@/content/site";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TerminalButton } from "@/components/terminal/TerminalButton";

export function Header() {
  return (
    <header className="w-full max-w-2xl mx-auto px-6 pt-8 pb-12 flex items-baseline justify-between gap-4">
      <Link
        href="/"
        className="font-serif text-lg font-semibold tracking-tight hover:text-accent transition-colors"
      >
        {site.header_name}
      </Link>
      <nav aria-label="Main" className="flex items-baseline gap-5 text-sm">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-muted hover:text-accent transition-colors"
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
