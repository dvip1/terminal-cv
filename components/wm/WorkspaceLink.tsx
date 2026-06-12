"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* A nav link that doubles as a waybar workspace in WM mode. Editorial
   mode renders it exactly like the previous plain <Link>; the workspace
   number prefix ("2:") and active highlight are pure CSS keyed off the
   data attributes. */
export function WorkspaceLink({
  href,
  ws,
  label,
  className,
}: {
  href: string;
  ws: number;
  label: string;
  className?: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  return (
    <Link
      href={href}
      data-ws={ws}
      data-active={active || undefined}
      className={className ?? "link-grow text-muted hover:text-accent"}
    >
      {label}
    </Link>
  );
}
