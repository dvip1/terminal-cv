"use client";

import { useSyncExternalStore } from "react";

/* WM mode mirrors the theme mechanism: a data attribute on <html> set
   pre-paint by the inline script in layout.tsx, persisted to
   localStorage, broadcast via a custom event. All visual gating lives
   in CSS ([data-wm="on"] inside a desktop media query), so this module
   only owns the state bit. */

const WM_EVENT = "wmchange";

function subscribe(cb: () => void) {
  window.addEventListener(WM_EVENT, cb);
  return () => window.removeEventListener(WM_EVENT, cb);
}

export function getWm(): boolean {
  return document.documentElement.dataset.wm === "on";
}

export function setWm(on: boolean) {
  if (on) {
    document.documentElement.dataset.wm = "on";
  } else {
    delete document.documentElement.dataset.wm;
  }
  try {
    localStorage.setItem("wm", on ? "on" : "off");
  } catch {}
  window.dispatchEvent(new Event(WM_EVENT));
}

export function toggleWm(): boolean {
  const next = !getWm();
  setWm(next);
  return next;
}

/** null on the server — the real state is only knowable client-side. */
export function useWmMode(): boolean | null {
  return useSyncExternalStore(subscribe, getWm, () => null);
}
