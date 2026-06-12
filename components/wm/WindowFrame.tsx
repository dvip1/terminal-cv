"use client";

import { usePathname, useRouter } from "next/navigation";
import { setWm } from "./wm-mode";

/* Frames every page as a single focused Hyprland-style window. Mounted
   from app/template.tsx, so it remounts per navigation and the CSS
   pop-in replays each route change. In editorial mode (and below the
   desktop breakpoint) the titlebar is display:none and the wrappers are
   unstyled — the page renders exactly as before. */
export function WindowFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const title = isHome ? "~" : `~${pathname}`;

  function closeWindow() {
    if (isHome) {
      // closing the last window ends the session
      setWm(false);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="wm-window">
      <div className="wm-titlebar">
        <span className="wm-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="wm-title font-mono">{title}</span>
        <button
          type="button"
          className="wm-close font-mono"
          onClick={closeWindow}
          aria-label={isHome ? "Exit window manager mode" : "Close window (back to home)"}
          title={isHome ? "exit hyprland mode" : "close window"}
        >
          ✕
        </button>
      </div>
      <div className="wm-window-body">{children}</div>
    </div>
  );
}
