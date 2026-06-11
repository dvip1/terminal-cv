"use client";

import { useEffect } from "react";

const banner = String.raw`
     _       _                       _       _
  __| |_   _(_)_ __   __ _ _ __ ___ | |__   (_)_ __
 / _' \ \ / / | '_ \ / _' | '__/ __|| '_ \  | | '_ \
| (_| |\ V /| | |_) | (_| | | | (__ | | | |_| | | | |
 \__,_| \_/ |_| .__/ \__,_|_|  \___||_| |_(_)_|_| |_|
              |_|
`;

export function ConsoleBanner() {
  useEffect(() => {
    if (window.sessionStorage.getItem("banner-shown")) return;
    try {
      sessionStorage.setItem("banner-shown", "1");
    } catch {}
    // Reward for opening devtools: tell them about the terminal.
    console.log(
      `%c${banner}%c\n  you found the console. there's a better one — press \` on the page.\n`,
      "color:#58b7e8;font-family:monospace",
      "color:inherit"
    );
  }, []);

  return null;
}
