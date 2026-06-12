import type { Post } from "@/content/writing";
import type { TermTheme } from "./themes";

export type LineKind = "plain" | "accent" | "error" | "dim" | "green";

export type TermLine = {
  text: string;
  kind?: LineKind;
  /** When set, the line renders as a link. */
  href?: string;
  /** Optional multi-color segments; overrides text/kind for rendering. */
  spans?: { text: string; kind?: LineKind }[];
};

export type TermAction =
  | { type: "navigate"; to: string } // internal route — closes terminal
  | { type: "open-external"; url: string } // new tab
  | { type: "clear" }
  | { type: "download"; href: string }
  | { type: "matrix" }
  | { type: "selfdestruct" } // rm -rf / sequence, handled by the component
  | { type: "theme"; theme: TermTheme } // swap terminal colors
  | { type: "pacman"; op: "install" | "upgrade"; packages: string[] } // animated fake package manager
  | { type: "exit" } // close the terminal
  | { type: "wm-toggle" }; // flip the Hyprland window-manager presentation

export type CommandResult = {
  lines?: TermLine[];
  action?: TermAction;
};

export type TermState = {
  /** Normalized absolute path, e.g. "/", "/projects". */
  cwd: string;
  whoamiCount: number;
  mode: "shell" | "vim";
};

export type CommandContext = {
  state: TermState;
  posts: Post[];
  /** Raw input as typed (after trimming). */
  raw: string;
};

export type Command = {
  name: string;
  /** Shown by `help`. */
  description: string;
  usage?: string;
  /** Hidden commands work but are excluded from help and tab completion. */
  hidden?: boolean;
  run: (args: string[], ctx: CommandContext) => CommandResult | Promise<CommandResult>;
};

export type EngineOptions = {
  posts: Post[];
  /**
   * FUTURE LLM HOOK — called when input matches no command and no easter
   * egg. Return a CommandResult to answer dynamically (e.g. stream an LLM
   * response in via an API route), or null to fall through to the default
   * "command not found". The engine is fully async, so this can take its
   * time; the UI shows output whenever it resolves.
   */
  onUnknown?: (input: string, ctx: CommandContext) => Promise<CommandResult | null>;
};
