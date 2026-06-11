"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Post } from "@/content/writing";

/**
 * Owns the Quake-style terminal's open/close state and the global ` / ~
 * hotkey. The Terminal itself is dynamically imported on first open so it
 * adds zero weight to first paint and nothing to crawled HTML.
 */

const Terminal = dynamic(
  () => import("./Terminal").then((m) => m.Terminal),
  { ssr: false }
);

type TerminalContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const TerminalContext = createContext<TerminalContextValue | null>(null);

export function useTerminal(): TerminalContextValue {
  const ctx = useContext(TerminalContext);
  if (!ctx) throw new Error("useTerminal must be used within TerminalProvider");
  return ctx;
}

export function TerminalProvider({
  children,
  posts = [],
}: {
  children: React.ReactNode;
  /** Blog posts fetched server-side (RSS) so the terminal can list them. */
  posts?: Post[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  // Once loaded, the terminal stays mounted (hidden) so session state —
  // history, cwd, output — survives open/close.
  const [hasLoaded, setHasLoaded] = useState(false);
  const pathname = usePathname();

  const open = useCallback(() => {
    setHasLoaded(true);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => {
    setHasLoaded(true);
    setIsOpen((v) => !v);
  }, []);

  // /terminal — shareable route that lands with the terminal already down.
  // State adjustment during render (not an effect) per React's guidance.
  const [autoOpened, setAutoOpened] = useState(false);
  if (pathname === "/terminal" && !autoOpened) {
    setAutoOpened(true);
    setHasLoaded(true);
    setIsOpen(true);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (!isOpen) return;
        // Matrix rain consumes the first keypress itself.
        if (document.querySelector("[data-terminal] canvas")) return;
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "`" && e.key !== "~") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const inTerminal = !!target?.closest("[data-terminal]");
      const editable =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      // Don't hijack backtick while typing in a normal form field,
      // but inside the terminal it toggles (closes) as in Quake.
      if (editable && !inTerminal) return;
      e.preventDefault();
      toggle();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle, isOpen, close]);

  return (
    <TerminalContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
      {hasLoaded && <Terminal isOpen={isOpen} onClose={close} posts={posts} />}
    </TerminalContext.Provider>
  );
}
