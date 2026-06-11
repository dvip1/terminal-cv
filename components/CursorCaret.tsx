"use client";

import { useEffect, useRef } from "react";

/**
 * The terminal's block cursor, escaped into the page: a small accent
 * caret chases the pointer with a slight lag, blinks when you pause,
 * and flattens into an underscore over anything clickable. The native
 * cursor is untouched — this is an echo, not a replacement. Renders
 * nothing useful on touch devices or under prefers-reduced-motion
 * (hidden via CSS, and the effect bails before attaching listeners).
 */
export function CursorCaret() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (
      !el ||
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let x = -100;
    let y = -100;
    let tx = -100;
    let ty = -100;
    let seen = false;
    let idleTimer = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!seen) {
        // first sighting: snap to the pointer instead of gliding in
        seen = true;
        x = tx;
        y = ty;
      }
      el.style.opacity = "";
      el.classList.remove("cursor-caret-idle");
      const interactive = (e.target as Element | null)?.closest?.(
        "a, button, [role='button'], input, textarea, select, label, summary"
      );
      el.classList.toggle("cursor-caret-active", Boolean(interactive));
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(
        () => el.classList.add("cursor-caret-idle"),
        900
      );
    };

    const onLeave = () => {
      seen = false;
      el.style.opacity = "0";
    };

    const tick = () => {
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      // trail below-right of the pointer tip, clear of what it points at
      el.style.transform = `translate3d(${x + 11}px, ${y + 13}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(idleTimer);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // starts hidden (inline opacity) until the first real mouse move
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="cursor-caret"
      style={{ opacity: 0, transform: "translate3d(-100px, -100px, 0)" }}
    />
  );
}
