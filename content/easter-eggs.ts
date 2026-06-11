/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  EASTER EGGS — edit this file to add your own.                    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Each entry is plain data: what the user types → what the terminal prints.
 * The terminal picks these up automatically; no other code changes needed.
 *
 *   input    — exact command the user types (matched after trimming and
 *              collapsing whitespace, case-insensitive).
 *   aliases  — optional extra inputs that trigger the same egg.
 *   output   — lines to print. A plain string is one line. Use
 *              { text, kind } for color: kind is "accent" | "error" | "dim".
 *   navigate — optional route to push after printing (closes the terminal).
 *   download — optional file path to download after printing.
 *   hidden   — if true, the command is excluded from `help` and tab
 *              completion (still works when typed). Defaults to true.
 *
 * Example — add a new egg by appending:
 *
 *   {
 *     input: "make coffee",
 *     output: ["☕ brewing...", { text: "418 I'm a teapot", kind: "error" }],
 *   },
 *
 * Eggs that need real behavior (vim trap, rm -rf glitch, matrix rain) are
 * implemented as interactive commands in components/terminal/commands.ts —
 * this file is for simple input → output pairs.
 */

export type EggLine = string | { text: string; kind: "accent" | "error" | "dim" };

export type EasterEgg = {
  input: string;
  aliases?: string[];
  output: EggLine[];
  navigate?: string;
  download?: string;
  hidden?: boolean;
};

export const easterEggs: EasterEgg[] = [
  {
    input: "hire-me",
    aliases: ["hire me"],
    output: [
      { text: "verifying credentials... done.", kind: "dim" },
      { text: "Permission granted.", kind: "accent" },
      "Routing you to the contact page...",
    ],
    navigate: "/contact",
  },
  {
    input: "pacman -S job",
    output: [
      "resolving dependencies...",
      "looking for conflicting packages...",
      "",
      "Packages (4)  motivation-9.1.0  caffeine-3.2.1  low-latency-websockets-0.0.1  job-1.0.0",
      "",
      "Total Installed Size:  100.00 MiB",
      "",
      ":: Proceed with installation? [Y/n] y",
      { text: "(1/4) installing motivation", kind: "dim" },
      { text: "(2/4) installing caffeine", kind: "dim" },
      { text: "(3/4) installing low-latency-websockets", kind: "dim" },
      { text: "(4/4) installing job", kind: "dim" },
      { text: "error: job: signature is unknown trust — hire me to sign it.", kind: "error" },
    ],
  },
  // ── add your own below ─────────────────────────────────────────────
];
