"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { nav } from "@/content/site";
import { useTerminal } from "@/components/terminal/TerminalProvider";

/* WM-mode keyboard layer: 1–N jump to the waybar workspaces (the
   numbers shown next to the nav labels), t opens the terminal tile.
   Active only when WM mode is on at desktop width, and never while
   typing in a field — inside the terminal, keys are just keys. */
export function WmHotkeys() {
  const router = useRouter();
  const { open } = useTerminal();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (document.documentElement.dataset.wm !== "on") return;
      if (!window.matchMedia("(min-width: 64rem)").matches) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const editable =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if (editable) return;

      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        open();
        return;
      }
      if (e.key === "0") {
        e.preventDefault();
        router.push("/");
        return;
      }
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= nav.length) {
        e.preventDefault();
        router.push(nav[n - 1].href);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, router]);

  return null;
}
