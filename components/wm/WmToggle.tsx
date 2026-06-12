"use client";

import { toggleWm, useWmMode } from "./wm-mode";

/* Header button that flips the Hyprland-style WM presentation. Only
   rendered for desktop viewports (lg:) — the mode is meaningless on
   small screens. Active styling comes from [data-wm="on"] CSS. */
export function WmToggle() {
  // null on the server — same neutral-first-paint trick as ThemeToggle.
  const wm = useWmMode();

  return (
    <button
      type="button"
      onClick={toggleWm}
      aria-label={wm ? "Exit window manager mode" : "Enable window manager mode"}
      aria-pressed={wm === true}
      title={wm ? "back to the quiet site" : "tile it (hyprland mode)"}
      className="wm-toggle hidden lg:inline-flex items-center justify-center text-muted hover:text-accent transition-colors w-9 -mx-2 py-1.5 -my-1.5"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="5" height="12" rx="1" />
        <rect x="8" y="1" width="5" height="5.5" rx="1" />
        <rect x="8" y="8.5" width="5" height="4.5" rx="1" />
      </svg>
    </button>
  );
}
