"use client";

import { useTerminal } from "./TerminalProvider";

export function TerminalButton() {
  const { toggle } = useTerminal();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Open terminal"
      title="Open terminal (or press `)"
      className="term-glint font-mono text-xs text-muted hover:text-accent transition-colors border border-border rounded px-2 py-1 touch-manipulation"
    >
      &gt;_
    </button>
  );
}
